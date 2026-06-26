function normalizeText(text) {
  return text.replace(/\r\n?/g, "\n");
}

function slugifyHeading(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[`"'()[\]{}]+/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseFrontmatterBlock(text) {
  const normalized = normalizeText(text);
  if (!normalized.startsWith("---\n")) {
    return {
      frontmatter: {},
      body: normalized
    };
  }

  const lines = normalized.split("\n");
  const data = {};
  let closingIndex = -1;
  for (let index = 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.trim() === "---") {
      closingIndex = index;
      break;
    }

    const match = /^([A-Za-z0-9_-]+):\s*(.+)$/.exec(line);
    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;
    data[key] = rawValue.replace(/^["']|["']$/g, "").trim();
  }

  return {
    frontmatter: data,
    body: closingIndex >= 0 ? lines.slice(closingIndex + 1).join("\n") : normalized
  };
}

export function parseFrontmatter(text) {
  return parseFrontmatterBlock(text).frontmatter;
}

export function parseCatalogDocument(text) {
  const { frontmatter, body } = parseFrontmatterBlock(text);
  const lines = body.split("\n");
  const sections = [];
  const headingPath = [];
  let title = null;
  let currentSection = null;
  let summaryLocked = false;
  const summaryLines = [];

  function flushSection() {
    if (!currentSection) {
      return;
    }

    const content = currentSection.contentLines.join("\n").trim();
    const items = currentSection.contentLines
      .map((line) => /^\s*[-*]\s+(.+?)\s*$/.exec(line)?.[1]?.trim() ?? null)
      .filter(Boolean);
    sections.push({
      title: currentSection.title,
      slug: currentSection.slug,
      depth: currentSection.depth,
      path: [...currentSection.path],
      content,
      items
    });
    currentSection = null;
  }

  for (const rawLine of lines) {
    const headingMatch = /^(#{1,6})\s+(.+?)\s*$/.exec(rawLine);
    if (headingMatch) {
      const depth = headingMatch[1].length;
      const headingTitle = headingMatch[2].trim();
      if (depth === 1 && title === null) {
        flushSection();
        title = headingTitle;
        headingPath.length = 0;
        headingPath[0] = headingTitle;
        continue;
      }

      flushSection();
      summaryLocked = true;
      headingPath.length = Math.max(depth - 1, 0);
      headingPath[depth - 1] = headingTitle;
      const path = headingPath.filter(Boolean);
      currentSection = {
        title: headingTitle,
        depth,
        path,
        slug: path.map(slugifyHeading).filter(Boolean).join("--"),
        contentLines: []
      };
      continue;
    }

    if (currentSection) {
      currentSection.contentLines.push(rawLine);
      continue;
    }

    if (title && !summaryLocked) {
      summaryLines.push(rawLine);
    }
  }

  flushSection();

  const summary = summaryLines.join("\n").trim() || null;
  const itemCount = sections.reduce((total, section) => total + section.items.length, 0);
  const totalLines = lines.filter((line) => line.trim().length > 0).length;

  return {
    title,
    summary,
    frontmatter,
    counts: {
      totalLines,
      totalSections: sections.length,
      totalItems: itemCount,
      frontmatterFields: Object.keys(frontmatter).length
    },
    sections
  };
}
