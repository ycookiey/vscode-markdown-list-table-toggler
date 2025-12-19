import * as vscode from "vscode";
import { splitKeyValue } from "../core/utils";

function indentationWidth(indent: string): number {
  let width = 0;
  for (const ch of indent) {
    width += ch === "\t" ? 4 : 1;
  }
  return width;
}

export class ListKeyCompletionProvider
  implements vscode.CompletionItemProvider
{
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.CompletionItem[] {
    const lineText = document.lineAt(position.line).text;
    const beforeCursor = lineText.slice(0, position.character);
    const markerMatch = beforeCursor.match(/^(\s*)([-*]|\d+\.)\s*$/);
    if (!markerMatch) {
      return [];
    }
    const currentIndent = markerMatch[1];
    const marker = markerMatch[2];

    let prevLineIndex = -1;
    let prevIndentWidth = 0;
    for (let i = position.line - 1; i >= 0; i -= 1) {
      const text = document.lineAt(i).text;
      if (text.trim().length === 0) {
        break;
      }
      const match = text.match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
      if (match) {
        prevLineIndex = i;
        prevIndentWidth = indentationWidth(match[1]);
        break;
      }
    }
    if (prevLineIndex === -1) {
      return [];
    }

    const keys: string[] = [];
    let minChildIndent: number | null = null;
    for (let i = prevLineIndex + 1; i < document.lineCount; i += 1) {
      const text = document.lineAt(i).text;
      if (text.trim().length === 0) {
        break;
      }
      const match = text.match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
      if (!match) {
        continue;
      }
      const indentWidth = indentationWidth(match[1]);
      if (indentWidth <= prevIndentWidth) {
        break;
      }
      if (minChildIndent === null || indentWidth < minChildIndent) {
        minChildIndent = indentWidth;
      }
      if (indentWidth === minChildIndent) {
        const kv = splitKeyValue(match[3]);
        if (kv) {
          const key = kv.key.trim();
          if (key.length > 0 && !keys.includes(key)) {
            keys.push(key);
          }
        }
      }
    }

    if (keys.length === 0) {
      return [];
    }

    const nestedIndent = `${currentIndent}  `;
    const snippetLines: string[] = ["$1"];
    let placeholder = 2;
    for (const key of keys) {
      snippetLines.push(
        `${nestedIndent}${marker} ${key}: $${placeholder}`
      );
      placeholder += 1;
    }
    const snippet = new vscode.SnippetString(snippetLines.join("\n"));
    const item = new vscode.CompletionItem(
      "Repeat keys",
      vscode.CompletionItemKind.Snippet
    );
    item.insertText = snippet;
    item.detail = "Insert keys from previous list item";
    item.sortText = "\u0000";
    return [item];
  }
}
