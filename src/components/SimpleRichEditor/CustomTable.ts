import { Table } from "@tiptap/extension-table";

const getStyleProperty = (element: HTMLElement, name: string): string | null => {
  if (!element || !element.style) {
    return null;
  }
  const value = element.style.getPropertyValue(name);
  return value ? value.trim() : null;
};

const CustomTable = Table.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      borderColor: {
        default: null,
        parseHTML: (element) => getStyleProperty(element as HTMLElement, "--table-border-color"),
      },
      borderWidth: {
        default: null,
        parseHTML: (element) => getStyleProperty(element as HTMLElement, "--table-border-width"),
      },
      borderStyle: {
        default: null,
        parseHTML: (element) => getStyleProperty(element as HTMLElement, "--table-border-style"),
      },
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    const attributes = { ...HTMLAttributes };
    const styleSegments: string[] = [];

    if (node.attrs.borderColor) {
      styleSegments.push(`--table-border-color: ${node.attrs.borderColor}`);
    }
    if (node.attrs.borderWidth) {
      styleSegments.push(`--table-border-width: ${node.attrs.borderWidth}`);
    }
    if (node.attrs.borderStyle) {
      styleSegments.push(`--table-border-style: ${node.attrs.borderStyle}`);
    }

    if (styleSegments.length > 0) {
      const existingStyle = attributes.style ? [attributes.style] : [];
      attributes.style = [...existingStyle, ...styleSegments].join("; ");
    }

    return ["table", attributes, 0];
  },
});

export default CustomTable;
