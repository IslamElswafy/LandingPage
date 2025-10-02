import TableHeader from "@tiptap/extension-table-header";

const getStyleProperty = (element: HTMLElement, name: string): string | null => {
  if (!element || !element.style) {
    return null;
  }
  const value = element.style.getPropertyValue(name);
  return value ? value.trim() : null;
};

const getDirectStyle = (element: HTMLElement, name: string): string | null => {
  if (!element || !element.style) {
    return null;
  }
  const value = (element.style as CSSStyleDeclaration)[name as keyof CSSStyleDeclaration] as string | undefined;
  return value && value.trim().length > 0 ? value.trim() : null;
};

const CustomTableHeader = TableHeader.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      borderColor: {
        default: null,
        parseHTML: (element) =>
          getStyleProperty(element as HTMLElement, "--cell-border-color") ||
          getDirectStyle(element as HTMLElement, "borderColor"),
      },
      borderWidth: {
        default: null,
        parseHTML: (element) =>
          getStyleProperty(element as HTMLElement, "--cell-border-width") ||
          getDirectStyle(element as HTMLElement, "borderWidth"),
      },
      borderStyle: {
        default: null,
        parseHTML: (element) =>
          getStyleProperty(element as HTMLElement, "--cell-border-style") ||
          getDirectStyle(element as HTMLElement, "borderStyle"),
      },
      backgroundColor: {
        default: null,
        parseHTML: (element) => getDirectStyle(element as HTMLElement, "backgroundColor"),
      },
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    const attributes = { ...HTMLAttributes };
    const styleSegments: string[] = [];

    if (node.attrs.borderColor) {
      styleSegments.push(`--cell-border-color: ${node.attrs.borderColor}`);
    }
    if (node.attrs.borderWidth) {
      styleSegments.push(`--cell-border-width: ${node.attrs.borderWidth}`);
    }
    if (node.attrs.borderStyle) {
      styleSegments.push(`--cell-border-style: ${node.attrs.borderStyle}`);
    }
    if (node.attrs.backgroundColor) {
      styleSegments.push(`background-color: ${node.attrs.backgroundColor}`);
    }

    if (styleSegments.length > 0) {
      const existingStyle = attributes.style ? [attributes.style] : [];
      attributes.style = [...existingStyle, ...styleSegments].join("; ");
    }

    return ["th", attributes, 0];
  },
});

export default CustomTableHeader;
