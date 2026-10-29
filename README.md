# Markdown List-Table Toggler

A VS Code extension that converts the Markdown list under the cursor into a table, and a table back into a list.

```markdown
- Apple
  - Price: 100
  - Color: Red
- Banana
  - Price: 200
  - Origin: PH
```

becomes (with an extra indent, see [Known issues](#known-issues))

```markdown
| Item   | Price | Color | Origin |
| ------ | ----- | ----- | ------ |
| Apple  | 100   | Red   |        |
| Banana | 200   |       | PH     |
```

## Features

- **Toggle List/Table** command (`Ctrl+Shift+T` in a Markdown editor). The block is the run of non-blank lines around the cursor; the direction is chosen from whether more lines start with `|` or with a list marker.
- Top-level items become rows. Child items written as `Key: Value` become columns; child items without a key go to `Col1`, `Col2`, ... on the right.
- Nested keys are joined with dots (`Spec.Width`), line breaks become `<br>`, `|` in values is escaped, and column widths account for full-width characters.
- Rename (`F2`) and highlight of a list key, limited to the current block.

## Installation

The extension is not on the Marketplace. Build a `.vsix` (see [Build](#build)) and install it:

```sh
code --install-extension markdown-list-table-toggler-0.0.1.vsix
```

or run **Extensions: Install from VSIX...** from the Command Palette.

Requires VS Code 1.80 or later.

## Settings

| Setting (`markdownListTableToggler.`) | Default | Effect |
| --- | --- | --- |
| `rootHeaderName` | `Item` | Header of the first column (list to table) |
| `formatTable` | `true` | Pad cells so the columns line up (list to table) |
| `flattenNestedKeys` | `true` | Turn nested keys into `Parent.Child` columns; when `false`, the nested lines go into one cell (list to table) |
| `smartPipeEscape` | `true` | Leave `\|` inside code spans and fenced code unescaped (list to table) |
| `outputEmptyKeys` | `true` | Write `- Key: ` for empty cells instead of skipping them (table to list) |
| `valueEscapeStyle` | `none` | Quote values: `none`, `smart` (only when needed), or `always` (table to list) |
| `listMarkerStyle` | `bullet` | List marker: `bullet` (`-`), `ordered` (`1.`), or `asterisk` (`*`) (table to list) |

## Known issues

- `Ctrl+Shift+T` replaces Reopen Closed Editor while a Markdown editor has focus on Windows and Linux. Rebind it in Keyboard Shortcuts if needed.
- A key needs a space after the colon. `Key:` at the end of a line is treated as a plain value.
- Converting a table back does not restore nesting: `Spec.Width` stays a single key.
- With `smartPipeEscape` on (the default), a `|` inside a code span stays unescaped. Markdown renderers split the cell there, and converting the table back to a list moves the rest of the value and every cell after it one key to the right, and the last cell of the row is lost. Turn the setting off to keep such values.
- When a list ends with a nested item, the table gets that item's indent (two spaces in the example above).

## Uninstall

```sh
code --uninstall-extension ycookiey.markdown-list-table-toggler
```

## Build

Requires Node.js 22 or later (for `@vscode/vsce`).

```sh
npm install
npm run build
npx @vscode/vsce package
```

## License

[MIT](LICENSE)
