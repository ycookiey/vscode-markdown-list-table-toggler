export type ValueEscapeStyle = "none" | "smart" | "always";
export type ListMarkerStyle = "bullet" | "ordered" | "asterisk";

export interface ExtensionConfig {
  rootHeaderName: string;
  outputEmptyKeys: boolean;
  valueEscapeStyle: ValueEscapeStyle;
  listMarkerStyle: ListMarkerStyle;
  formatTable: boolean;
  smartPipeEscape: boolean;
  flattenNestedKeys: boolean;
}

export const defaultConfig: ExtensionConfig = {
  rootHeaderName: "Item",
  outputEmptyKeys: true,
  valueEscapeStyle: "none",
  listMarkerStyle: "bullet",
  formatTable: true,
  smartPipeEscape: true,
  flattenNestedKeys: true,
};

export function normalizeConfig(
  partial?: Partial<ExtensionConfig>
): ExtensionConfig {
  return {
    ...defaultConfig,
    ...(partial ?? {}),
  };
}
