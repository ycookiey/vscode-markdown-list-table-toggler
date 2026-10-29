export interface TableData {
  headers: string[];
  rows: string[][];
}

function splitByUnescapedPipe(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let escaped = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (escaped) {
      current += ch;
      escaped = false;
      continue;
    }
    if (ch === "\\") {
      escaped = true;
      current += ch;
      continue;
    }
    if (ch === "|") {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  cells.push(current.trim());
  return cells;
}

function normalizeTableLine(line: string): string | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|")) {
    return null;
  }
  let normalized = trimmed;
  if (normalized.startsWith("|")) {
    normalized = normalized.slice(1);
  }
  if (normalized.endsWith("|")) {
    normalized = normalized.slice(0, -1);
  }
  return normalized;
}

function isSeparatorRow(cells: string[]): boolean {
  if (cells.length === 0) {
    return false;
  }
  return cells.every((cell) => /^:?-{3,}:?$/.test(cell.trim()));
}

export function parseTable(lines: string[]): TableData | null {
  const tableLines = lines
    .map((line) => normalizeTableLine(line))
    .filter((line): line is string => line !== null);
  if (tableLines.length === 0) {
    return null;
  }
  const headerCells = splitByUnescapedPipe(tableLines[0]);
  let rowStart = 1;
  if (tableLines.length > 1) {
    const secondRow = splitByUnescapedPipe(tableLines[1]);
    if (isSeparatorRow(secondRow)) {
      rowStart = 2;
    }
  }
  const rows: string[][] = [];
  for (let i = rowStart; i < tableLines.length; i += 1) {
    rows.push(splitByUnescapedPipe(tableLines[i]));
  }
  return {
    headers: headerCells,
    rows,
  };
}
