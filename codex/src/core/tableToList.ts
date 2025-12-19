import { ExtensionConfig } from "../config";
import { parseTable } from "./tableParser";
import {
  applyValueEscape,
  listMarkerForStyle,
  normalizeBrTags,
  restoreLineBreaks,
  unescapeKeySegment,
} from "./utils";

function prepareValue(value: string, config: ExtensionConfig): string {
  const unescaped = value.replace(/\\\|/g, "|");
  const normalized = normalizeBrTags(unescaped);
  return applyValueEscape(normalized, config.valueEscapeStyle);
}

function normalizeRowLength(row: string[], length: number): string[] {
  const normalized = row.slice(0, length);
  while (normalized.length < length) {
    normalized.push("");
  }
  return normalized;
}

export function tableToList(
  lines: string[],
  config: ExtensionConfig,
  baseIndent: string
): string[] {
  const table = parseTable(lines);
  if (!table) {
    return lines;
  }
  const headers = table.headers.map((header) => unescapeKeySegment(header));
  const rows = table.rows.map((row) => normalizeRowLength(row, headers.length));
  const marker = listMarkerForStyle(config.listMarkerStyle);
  const rootContinuationIndent = `${baseIndent}${" ".repeat(marker.length + 1)}`;
  const nestedIndent = `${baseIndent}  `;
  const nestedContinuationIndent = `${nestedIndent}${" ".repeat(
    marker.length + 1
  )}`;

  const output: string[] = [];
  for (const row of rows) {
    const rootValue = prepareValue(row[0] ?? "", config);
    const rootLines = restoreLineBreaks(rootValue, rootContinuationIndent);
    output.push(`${baseIndent}${marker} ${rootLines[0]}`);
    if (rootLines.length > 1) {
      output.push(...rootLines.slice(1));
    }
    for (let i = 1; i < headers.length; i += 1) {
      const cellRaw = row[i] ?? "";
      if (!config.outputEmptyKeys && cellRaw.trim().length === 0) {
        continue;
      }
      const key = headers[i];
      const value = prepareValue(cellRaw, config);
      const valueLines = restoreLineBreaks(value, nestedContinuationIndent);
      output.push(`${nestedIndent}${marker} ${key}: ${valueLines[0]}`);
      if (valueLines.length > 1) {
        output.push(...valueLines.slice(1));
      }
    }
  }
  return output;
}
