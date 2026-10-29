import { ExtensionConfig } from "../config";
import { detectMode, findBlock } from "./block";
import { listToTable } from "./listToTable";
import { tableToList } from "./tableToList";

export interface ToggleResult {
  startLine: number;
  endLine: number;
  replacement: string[];
}

export function toggleBlock(
  lines: string[],
  cursorLine: number,
  config: ExtensionConfig
): ToggleResult | null {
  const block = findBlock(lines, cursorLine);
  if (!block) {
    return null;
  }
  const mode = detectMode(block.lines);
  if (!mode) {
    return null;
  }
  const replacement =
    mode === "list-to-table"
      ? listToTable(block.lines, config, block.baseIndent)
      : tableToList(block.lines, config, block.baseIndent);
  return {
    startLine: block.startLine,
    endLine: block.endLine,
    replacement,
  };
}
