import { ExtensionConfig } from "../config";
import { parseListNodes, ListNode } from "./listParser";
import { renderTable } from "./tableFormat";
import {
  escapeKeySegment,
  escapePipes,
  normalizeLineEndings,
  replaceLineBreaksWithBr,
  splitKeyValue,
} from "./utils";

interface RowData {
  rootValue: string;
  keyValues: Map<string, string>;
  valueColumns: string[];
}

function addKeyValue(row: RowData, key: string, value: string): void {
  const existing = row.keyValues.get(key);
  if (existing === undefined) {
    row.keyValues.set(key, value);
    return;
  }
  if (existing.length === 0) {
    row.keyValues.set(key, value);
    return;
  }
  row.keyValues.set(key, `${existing}\n${value}`);
}

function serializeChildren(nodes: ListNode[], depth: number): string {
  const lines: string[] = [];
  for (const node of nodes) {
    const prefix = " ".repeat(depth * 2);
    lines.push(`${prefix}${node.text}`);
    if (node.children.length > 0) {
      const nested = serializeChildren(node.children, depth + 1);
      if (nested.length > 0) {
        lines.push(nested);
      }
    }
  }
  return lines.join("\n");
}

function collectChildren(
  nodes: ListNode[],
  pathPrefix: string,
  row: RowData,
  config: ExtensionConfig,
  recordKey: (key: string) => void
): boolean {
  let addedKey = false;
  for (const node of nodes) {
    const kv = splitKeyValue(node.text);
    if (kv) {
      const keySegment = escapeKeySegment(kv.key.trim());
      const fullKey = pathPrefix ? `${pathPrefix}.${keySegment}` : keySegment;
      const value = kv.value;
      const hasValue = value.length > 0;
      if (hasValue || node.children.length === 0) {
        addKeyValue(row, fullKey, value);
        recordKey(fullKey);
        addedKey = true;
      }
      if (node.children.length > 0) {
        if (config.flattenNestedKeys) {
          const childAdded = collectChildren(
            node.children,
            fullKey,
            row,
            config,
            recordKey
          );
          if (!childAdded && !hasValue) {
            const nestedText = serializeChildren(node.children, 0);
            if (nestedText.length > 0) {
              addKeyValue(row, fullKey, nestedText);
              recordKey(fullKey);
              addedKey = true;
            }
          } else if (childAdded) {
            addedKey = true;
          }
        } else {
          const nestedText = serializeChildren(node.children, 0);
          const combined = hasValue ? `${value}\n${nestedText}` : nestedText;
          addKeyValue(row, fullKey, combined);
          recordKey(fullKey);
          addedKey = true;
        }
      }
      continue;
    }

    const valueText = node.children.length
      ? `${node.text}\n${serializeChildren(node.children, 0)}`
      : node.text;
    if (pathPrefix) {
      addKeyValue(row, pathPrefix, valueText);
      recordKey(pathPrefix);
      addedKey = true;
    } else {
      row.valueColumns.push(valueText);
    }
  }
  return addedKey;
}

function normalizeCell(value: string, config: ExtensionConfig): string {
  const normalized = normalizeLineEndings(value ?? "");
  const escaped = escapePipes(normalized, config.smartPipeEscape);
  return replaceLineBreaksWithBr(escaped);
}

export function listToTable(
  lines: string[],
  config: ExtensionConfig,
  baseIndent: string
): string[] {
  const nodes = parseListNodes(lines);
  const rows: RowData[] = [];
  const keyOrder: string[] = [];
  const keySet = new Set<string>();
  const recordKey = (key: string) => {
    if (keySet.has(key)) {
      return;
    }
    keySet.add(key);
    keyOrder.push(key);
  };

  let maxValueColumns = 0;
  for (const node of nodes) {
    const row: RowData = {
      rootValue: node.text,
      keyValues: new Map(),
      valueColumns: [],
    };
    collectChildren(node.children, "", row, config, recordKey);
    rows.push(row);
    maxValueColumns = Math.max(maxValueColumns, row.valueColumns.length);
  }

  const valueHeaders = Array.from({ length: maxValueColumns }, (_, index) => {
    return `Col${index + 1}`;
  });
  const headers = [config.rootHeaderName, ...keyOrder, ...valueHeaders];
  const rowCells = rows.map((row) => {
    const cells = [row.rootValue];
    for (const key of keyOrder) {
      cells.push(row.keyValues.get(key) ?? "");
    }
    for (let i = 0; i < maxValueColumns; i += 1) {
      cells.push(row.valueColumns[i] ?? "");
    }
    return cells.map((cell) => normalizeCell(cell, config));
  });

  const normalizedHeaders = headers.map((header) => normalizeCell(header, config));
  return renderTable(normalizedHeaders, rowCells, config.formatTable, baseIndent);
}
