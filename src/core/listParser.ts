export interface ListNode {
  text: string;
  indent: number;
  marker: string;
  children: ListNode[];
}

function indentationWidth(indent: string): number {
  let width = 0;
  for (const ch of indent) {
    width += ch === "\t" ? 4 : 1;
  }
  return width;
}

export function parseListNodes(lines: string[]): ListNode[] {
  const roots: ListNode[] = [];
  const stack: ListNode[] = [];

  for (const line of lines) {
    if (line.trim().length === 0) {
      continue;
    }
    const match = line.match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
    if (!match) {
      if (stack.length > 0) {
        const current = stack[stack.length - 1];
        current.text = `${current.text}\n${line.trim()}`;
      }
      continue;
    }
    const indent = indentationWidth(match[1]);
    const node: ListNode = {
      text: match[3],
      indent,
      marker: match[2],
      children: [],
    };
    while (stack.length > 0 && indent <= stack[stack.length - 1].indent) {
      stack.pop();
    }
    if (stack.length === 0) {
      roots.push(node);
    } else {
      stack[stack.length - 1].children.push(node);
    }
    stack.push(node);
  }
  return roots;
}
