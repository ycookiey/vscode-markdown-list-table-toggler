import * as vscode from "vscode";
import { findBlock } from "../core/block";
import {
  findKeyOccurrencesInBlock,
  getKeyRangeInLine,
} from "../core/listKeys";

export class ListKeyHighlightProvider implements vscode.DocumentHighlightProvider {
  provideDocumentHighlights(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.DocumentHighlight[] {
    const lineText = document.lineAt(position.line).text;
    const keyRange = getKeyRangeInLine(lineText);
    if (!keyRange) {
      return [];
    }
    if (
      position.character < keyRange.start ||
      position.character > keyRange.end
    ) {
      return [];
    }
    const lines = Array.from({ length: document.lineCount }, (_, index) =>
      document.lineAt(index).text
    );
    const block = findBlock(lines, position.line);
    if (!block) {
      return [];
    }
    const occurrences = findKeyOccurrencesInBlock(block.lines, keyRange.key);
    return occurrences.map((occurrence) => {
      const lineIndex = block.startLine + occurrence.line;
      const range = new vscode.Range(
        lineIndex,
        occurrence.start,
        lineIndex,
        occurrence.end
      );
      return new vscode.DocumentHighlight(
        range,
        vscode.DocumentHighlightKind.Read
      );
    });
  }
}
