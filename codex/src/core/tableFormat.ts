import { stringWidth } from "./width";

function cellLines(cell: string): string[] {
  return cell.split("<br>");
}

function cellWidth(cell: string): number {
  const lines = cellLines(cell);
  let width = 0;
  for (const line of lines) {
    width = Math.max(width, stringWidth(line));
  }
  return width;
}

function padCell(cell: string, width: number): string {
  const current = cellWidth(cell);
  if (current >= width) {
    return cell;
  }
  return `${cell}${" ".repeat(width - current)}`;
}

function normalizeRow(row: string[], width: number): string[] {
  const normalized = row.slice(0, width);
  while (normalized.length < width) {
    normalized.push("");
  }
  return normalized;
}

export function renderTable(
  headers: string[],
  rows: string[][],
  format: boolean,
  baseIndent: string
): string[] {
  const columnCount = Math.max(
    headers.length,
    ...rows.map((row) => row.length)
  );
  const normalizedHeader = normalizeRow(headers, columnCount);
  const normalizedRows = rows.map((row) => normalizeRow(row, columnCount));
  const widths: number[] = new Array(columnCount).fill(3);
  normalizedHeader.forEach((cell, index) => {
    widths[index] = Math.max(widths[index], cellWidth(cell));
  });
  for (const row of normalizedRows) {
    row.forEach((cell, index) => {
      widths[index] = Math.max(widths[index], cellWidth(cell));
    });
  }

  const headerLine = format
    ? `| ${normalizedHeader
        .map((cell, index) => padCell(cell, widths[index]))
        .join(" | ")} |`
    : `| ${normalizedHeader.join(" | ")} |`;
  const separatorLine = format
    ? `| ${widths.map((width) => "-".repeat(Math.max(3, width))).join(" | ")} |`
    : `| ${normalizedHeader.map(() => "---").join(" | ")} |`;
  const renderedRows = normalizedRows.map((row) =>
    format
      ? `| ${row.map((cell, index) => padCell(cell, widths[index])).join(" | ")} |`
      : `| ${row.join(" | ")} |`
  );

  return [headerLine, separatorLine, ...renderedRows].map(
    (line) => `${baseIndent}${line}`
  );
}
