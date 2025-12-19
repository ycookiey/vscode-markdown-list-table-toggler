import { ListMarkerStyle, ValueEscapeStyle } from "../config";

export interface KeyValue {
  key: string;
  value: string;
}

export function splitKeyValue(text: string): KeyValue | null {
  const index = text.indexOf(": ");
  if (index === -1) {
    return null;
  }
  return {
    key: text.slice(0, index),
    value: text.slice(index + 2),
  };
}

export function escapeKeySegment(key: string): string {
  return key.replace(/\./g, "\\.");
}

export function unescapeKeySegment(key: string): string {
  return key.replace(/\\\./g, ".");
}

export function listMarkerForStyle(style: ListMarkerStyle): string {
  switch (style) {
    case "ordered":
      return "1.";
    case "asterisk":
      return "*";
    case "bullet":
    default:
      return "-";
  }
}

export function normalizeLineEndings(value: string): string {
  return value.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function escapePipesOutsideInlineCode(line: string): string {
  let result = "";
  let inCode = false;
  let fence = "";
  let i = 0;
  while (i < line.length) {
    if (line[i] === "`") {
      let run = 1;
      while (i + run < line.length && line[i + run] === "`") {
        run += 1;
      }
      const ticks = "`".repeat(run);
      if (!inCode) {
        inCode = true;
        fence = ticks;
      } else if (run >= fence.length) {
        inCode = false;
        fence = "";
      }
      result += ticks;
      i += run;
      continue;
    }
    if (!inCode && line[i] === "|") {
      result += "\\|";
    } else {
      result += line[i];
    }
    i += 1;
  }
  return result;
}

export function escapePipes(value: string, smart: boolean): string {
  if (!smart) {
    return value.replace(/\|/g, "\\|");
  }
  const lines = normalizeLineEndings(value).split("\n");
  let inFence = false;
  let fenceMarker = "";
  const escaped = lines.map((line) => {
    const fenceMatch = line.match(/^\s*(```+|~~~+)/);
    if (fenceMatch) {
      const marker = fenceMatch[1];
      if (!inFence) {
        inFence = true;
        fenceMarker = marker;
      } else if (marker[0] === fenceMarker[0] && marker.length >= fenceMarker.length) {
        inFence = false;
        fenceMarker = "";
      }
      return line;
    }
    if (inFence) {
      return line;
    }
    return escapePipesOutsideInlineCode(line);
  });
  return escaped.join("\n");
}

export function replaceLineBreaksWithBr(value: string): string {
  return normalizeLineEndings(value).replace(/\n/g, "<br>");
}

export function normalizeBrTags(value: string): string {
  return value.replace(/<br\s*\/?>/gi, "<br>");
}

export function restoreLineBreaks(
  value: string,
  continuationIndent: string
): string[] {
  const normalized = normalizeBrTags(value);
  const parts = normalized.split("<br>");
  if (parts.length === 0) {
    return [""];
  }
  const lines = [parts[0]];
  for (let i = 1; i < parts.length; i += 1) {
    lines.push(`${continuationIndent}${parts[i]}`);
  }
  return lines;
}

export function applyValueEscape(
  value: string,
  style: ValueEscapeStyle
): string {
  if (style === "none") {
    return value;
  }
  const escaped = value.replace(/"/g, '\\"');
  if (style === "always") {
    return `"${escaped}"`;
  }
  const needsQuote =
    /^\s/.test(value) ||
    /\s$/.test(value) ||
    value.includes('"') ||
    value.includes("<br>") ||
    value.includes("\n");
  return needsQuote ? `"${escaped}"` : value;
}
