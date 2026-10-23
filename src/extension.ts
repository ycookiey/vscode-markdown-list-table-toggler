import * as vscode from "vscode";
import { ExtensionConfig, normalizeConfig } from "./config";
import { toggleBlock } from "./core/toggle";
import { ListKeyCompletionProvider } from "./providers/completionProvider";
import { ListKeyHighlightProvider } from "./providers/highlightProvider";
import { ListKeyRenameProvider } from "./providers/renameProvider";

function readConfig(): ExtensionConfig {
  const config = vscode.workspace.getConfiguration("markdownListTableToggler");
  return normalizeConfig({
    rootHeaderName: config.get<string>("rootHeaderName"),
    outputEmptyKeys: config.get<boolean>("outputEmptyKeys"),
    valueEscapeStyle: config.get("valueEscapeStyle") as ExtensionConfig["valueEscapeStyle"],
    listMarkerStyle: config.get("listMarkerStyle") as ExtensionConfig["listMarkerStyle"],
    formatTable: config.get<boolean>("formatTable"),
    smartPipeEscape: config.get<boolean>("smartPipeEscape"),
    flattenNestedKeys: config.get<boolean>("flattenNestedKeys"),
  });
}

export function activate(context: vscode.ExtensionContext): void {
  const command = vscode.commands.registerCommand(
    "markdownListTableToggler.toggle",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      const document = editor.document;
      const cursorLine = editor.selection.active.line;
      const lines = Array.from({ length: document.lineCount }, (_, index) =>
        document.lineAt(index).text
      );
      const result = toggleBlock(lines, cursorLine, readConfig());
      if (!result) {
        return;
      }
      const eol =
        document.eol === vscode.EndOfLine.LF ? "\n" : "\r\n";
      const replacement = result.replacement.join(eol);
      const endLineRange = document.lineAt(result.endLine).range.end;
      const range = new vscode.Range(
        result.startLine,
        0,
        result.endLine,
        endLineRange.character
      );
      editor.edit((editBuilder) => {
        editBuilder.replace(range, replacement);
      });
    }
  );
  context.subscriptions.push(command);

  const selector: vscode.DocumentSelector = { language: "markdown" };
  context.subscriptions.push(
    vscode.languages.registerRenameProvider(selector, new ListKeyRenameProvider())
  );
  context.subscriptions.push(
    vscode.languages.registerDocumentHighlightProvider(
      selector,
      new ListKeyHighlightProvider()
    )
  );
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      selector,
      new ListKeyCompletionProvider(),
      "-",
      "*",
      "."
    )
  );
}

export function deactivate(): void {}
