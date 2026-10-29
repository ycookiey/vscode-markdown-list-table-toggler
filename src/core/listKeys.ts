export interface KeyRange {
  key: string;
  start: number;
  end: number;
}

export interface KeyOccurrence extends KeyRange {
  line: number;
}

export function getKeyRangeInLine(lineText: string): KeyRange | null {
  const match = lineText.match(/^(\s*(?:-|\*|\d+\.)\s+)(.+?)\s*:/);
  if (!match) {
    return null;
  }
  const prefixLength = match[1].length;
  const keyText = match[2];
  return {
    key: keyText,
    start: prefixLength,
    end: prefixLength + keyText.length,
  };
}

export function findKeyOccurrencesInBlock(
  lines: string[],
  key: string
): KeyOccurrence[] {
  const matches: KeyOccurrence[] = [];
  lines.forEach((line, index) => {
    const range = getKeyRangeInLine(line);
    if (!range || range.key !== key) {
      return;
    }
    matches.push({
      line: index,
      key: range.key,
      start: range.start,
      end: range.end,
    });
  });
  return matches;
}
