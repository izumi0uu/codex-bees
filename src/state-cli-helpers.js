import { argv, stderr, stdout, exit } from "node:process";
import { realpathSync } from "node:fs";

function write(text) {
  stdout.write(text);
}

function writeErr(text) {
  stderr.write(text);
}

function readOption(flag) {
  const index = argv.indexOf(flag);
  if (index < 0) {
    return undefined;
  }
  return argv[index + 1];
}

function readOptions(flag) {
  const values = [];
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === flag && argv[index + 1]) {
      values.push(argv[index + 1]);
    }
  }
  return values;
}

function parseListValue(value, separator = ",") {
  if (!value) {
    return undefined;
  }
  return value
    .split(separator)
    .map((item) => item.trim())
    .filter(Boolean);
}

function readListOption(flag, separator = ",") {
  const values = readOptions(flag);
  if (values.length === 0) {
    return undefined;
  }
  return values.flatMap((value) => parseListValue(value, separator) ?? []);
}

function readJsonOption(flag) {
  const value = readOption(flag);
  if (!value) {
    return undefined;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    writeErr(`Invalid JSON for ${flag}: ${error.message}\n`);
    exit(1);
  }
}

function requireOption(flag) {
  const value = readOption(flag);
  if (!value) {
    writeErr(`Missing required option: ${flag}\n`);
    exit(1);
  }
  return value;
}

function readPositiveIntegerOption(flag) {
  const value = readOption(flag);
  if (value === undefined) {
    return undefined;
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    writeErr(`${flag} must be a positive integer\n`);
    exit(1);
  }
  return parsed;
}

export function isCliEntrypoint(modulePath, argvPath = argv[1]) {
  if (!argvPath) {
    return false;
  }

  try {
    return realpathSync(argvPath) === realpathSync(modulePath);
  } catch {
    return false;
  }
}

export {
  argv,
  exit,
  readJsonOption,
  readListOption,
  readOption,
  readOptions,
  readPositiveIntegerOption,
  requireOption,
  write,
  writeErr
};
