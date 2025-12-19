export type ToggleMode = "list-to-table" | "table-to-list";

export interface BlockRange {
  startLine: number;
  endLine: number;
  lines: string[];
  baseIndent: string;
}

function isBlank(line: string): boolean {
  return line.trim().length === 0;
}

function leadingWhitespace(line: string): string {
  const match = line.match(/^\s*/);
  return match ? match[0] : "";
}

export function findBlock(
  lines: string[],
  cursorLine: number
): BlockRange | null {
  if (cursorLine < 0 || cursorLine >= lines.length) {
    return null;
  }
  if (isBlank(lines[cursorLine])) {
    return null;
  }
  let start = cursorLine;
  while (start > 0 && !isBlank(lines[start - 1])) {
    start -= 1;
  }
  let end = cursorLine;
  while (end < lines.length - 1 && !isBlank(lines[end + 1])) {
    end += 1;
  }
  const blockLines = lines.slice(start, end + 1);
  let baseIndent = "";
  for (const line of blockLines) {
    if (isBlank(line)) {
      continue;
    }
    const indent = leadingWhitespace(line);
    if (baseIndent === "" || indent.length < baseIndent.length) {
      baseIndent = indent;
    }
  }
  return {
    startLine: start,
    endLine: end,
    lines: blockLines,
    baseIndent,
  };
}

export function detectMode(lines: string[]): ToggleMode | null {
  let tableCount = 0;
  let listCount = 0;
  for (const line of lines) {
    if (/^\s*\|/.test(line)) {
      tableCount += 1;
    }
    if (/^\s*(?:-|\*|\d+\.)\s+/.test(line)) {
      listCount += 1;
    }
  }
  if (tableCount > listCount) {
    return "table-to-list";
  }
  if (listCount > tableCount) {
    return "list-to-table";
  }
  for (const line of lines) {
    if (/^\s*\|/.test(line)) {
      return "table-to-list";
    }
    if (/^\s*(?:-|\*|\d+\.)\s+/.test(line)) {
      return "list-to-table";
    }
  }
  return null;
}
