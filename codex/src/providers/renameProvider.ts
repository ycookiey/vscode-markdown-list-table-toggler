import * as vscode from "vscode";
import { findBlock } from "../core/block";
import {
  findKeyOccurrencesInBlock,
  getKeyRangeInLine,
} from "../core/listKeys";

export class ListKeyRenameProvider implements vscode.RenameProvider {
  prepareRename(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.Range | null {
    const lineText = document.lineAt(position.line).text;
    const range = getKeyRangeInLine(lineText);
    if (!range) {
      return null;
    }
    if (position.character < range.start || position.character > range.end) {
      return null;
    }
    return new vscode.Range(position.line, range.start, position.line, range.end);
  }

  provideRenameEdits(
    document: vscode.TextDocument,
    position: vscode.Position,
    newName: string
  ): vscode.WorkspaceEdit | null {
    const lineText = document.lineAt(position.line).text;
    const keyRange = getKeyRangeInLine(lineText);
    if (!keyRange) {
      return null;
    }
    if (
      position.character < keyRange.start ||
      position.character > keyRange.end
    ) {
      return null;
    }
    const lines = Array.from({ length: document.lineCount }, (_, index) =>
      document.lineAt(index).text
    );
    const block = findBlock(lines, position.line);
    if (!block) {
      return null;
    }
    const occurrences = findKeyOccurrencesInBlock(block.lines, keyRange.key);
    if (occurrences.length === 0) {
      return null;
    }
    const edit = new vscode.WorkspaceEdit();
    for (const occurrence of occurrences) {
      const lineIndex = block.startLine + occurrence.line;
      const range = new vscode.Range(
        lineIndex,
        occurrence.start,
        lineIndex,
        occurrence.end
      );
      edit.replace(document.uri, range, newName);
    }
    return edit;
  }
}
