import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { cwd } from "node:process";

const CODEX_DIR = join(cwd(), ".codex");
const AGENT_DIR = join(CODEX_DIR, "agents");
const SKILL_DIR = join(CODEX_DIR, "skills");

function isFile(path) {
  return existsSync(path) && statSync(path).isFile();
}

function isDirectory(path) {
  return existsSync(path) && statSync(path).isDirectory();
}

function readText(path) {
  return isFile(path) ? readFileSync(path, "utf8") : "";
}

function parseFrontmatter(text) {
  if (!text.startsWith("---\n")) {
    return {};
  }

  const lines = text.split("\n");
  const data = {};
  for (let index = 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.trim() === "---") {
      break;
    }

    const match = /^([A-Za-z0-9_-]+):\s*(.+)$/.exec(line);
    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;
    data[key] = rawValue.replace(/^["']|["']$/g, "").trim();
  }

  return data;
}

export function listAgentCatalog() {
  if (!isDirectory(AGENT_DIR)) {
    return [];
  }

  return readdirSync(AGENT_DIR)
    .filter((name) => name.endsWith(".md"))
    .map((name) => {
      const path = join(AGENT_DIR, name);
      const frontmatter = parseFrontmatter(readText(path));
      const id = name.replace(/\.md$/, "");
      return {
        id,
        name: frontmatter.name ?? id,
        description: frontmatter.description ?? null,
        path: `.codex/agents/${name}`
      };
    })
    .sort((left, right) => left.id.localeCompare(right.id));
}

export function listSkillCatalog() {
  if (!isDirectory(SKILL_DIR)) {
    return [];
  }

  return readdirSync(SKILL_DIR)
    .map((name) => {
      const root = join(SKILL_DIR, name);
      const directFile = join(SKILL_DIR, `${name}.md`);
      const skillFile = isDirectory(root) ? join(root, "SKILL.md") : directFile;
      if (!isFile(skillFile)) {
        return null;
      }

      const frontmatter = parseFrontmatter(readText(skillFile));
      return {
        id: name,
        name: frontmatter.name ?? name,
        description: frontmatter.description ?? null,
        path: skillFile.startsWith(cwd()) ? skillFile.slice(cwd().length + 1) : skillFile
      };
    })
    .filter(Boolean)
    .sort((left, right) => left.id.localeCompare(right.id));
}

export function listAgentRoleIds() {
  return listAgentCatalog().map((agent) => agent.id);
}

export function getRuntimeCatalog() {
  return {
    agents: listAgentCatalog(),
    skills: listSkillCatalog()
  };
}
