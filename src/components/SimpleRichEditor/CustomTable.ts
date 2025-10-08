import { Table } from "@tiptap/extension-table";
import { Plugin, PluginKey } from "@tiptap/pm/state";

const getStyleProperty = (element: HTMLElement, name: string): string | null => {
  if (!element || !element.style) {
    return null;
  }
  const value = element.style.getPropertyValue(name);
  return value ? value.trim() : null;
};

// Plugin key for row resize functionality
const rowResizePluginKey = new PluginKey("rowResize");

// Create row resize handles plugin
const createRowResizePlugin = () => {
  let resizingRow: HTMLTableRowElement | null = null;
  let startY = 0;
  let startHeight = 0;

  const addResizeHandles = (view: any) => {
    // Find all tables in the editor
    const tables = view.dom.querySelectorAll("table.editor-table");

    tables.forEach((table: HTMLTableElement) => {
      const rows = table.querySelectorAll("tr");

      rows.forEach((row: HTMLTableRowElement, index: number) => {
        // Don't add handle to the last row
        if (index === rows.length - 1) return;

        // Check if handle already exists
        if (row.querySelector(".table-row-resize-handle")) return;

        // Create resize handle
        const handle = document.createElement("div");
        handle.className = "table-row-resize-handle";
        handle.contentEditable = "false";
        handle.setAttribute("data-row-index", String(index));

        // Position it absolutely at the bottom of the row
        handle.style.position = "absolute";
        handle.style.bottom = "-4px";
        handle.style.left = "0";
        handle.style.right = "0";
        handle.style.height = "8px";
        handle.style.cursor = "row-resize";
        handle.style.zIndex = "10";

        // Make the row position relative to contain the absolute handle
        row.style.position = "relative";

        // Append handle to the row
        row.appendChild(handle);
      });
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!resizingRow) return;

    const deltaY = e.clientY - startY;
    const newHeight = Math.max(30, startHeight + deltaY);

    // Apply height to the row
    resizingRow.style.height = `${newHeight}px`;

    // Apply height to all cells in the row
    const cells = resizingRow.querySelectorAll("td, th");
    cells.forEach((cell) => {
      (cell as HTMLElement).style.height = `${newHeight}px`;
    });
  };

  const handleMouseUp = () => {
    resizingRow = null;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "";
  };

  return new Plugin({
    key: rowResizePluginKey,
    view(editorView) {
      // Add resize handles when view is created
      setTimeout(() => addResizeHandles(editorView), 100);

      return {
        update(view, prevState) {
          // Re-add handles when document changes
          setTimeout(() => addResizeHandles(view), 100);
        },
        destroy() {
          document.removeEventListener("mousemove", handleMouseMove);
          document.removeEventListener("mouseup", handleMouseUp);
        },
      };
    },
    props: {
      handleDOMEvents: {
        mousedown(view, event) {
          const target = event.target as HTMLElement;

          if (target.classList.contains("table-row-resize-handle")) {
            event.preventDefault();
            event.stopPropagation();

            // Find the row being resized
            const row = target.closest("tr") as HTMLTableRowElement;
            if (!row) return false;

            resizingRow = row;
            startY = event.clientY;
            startHeight = row.offsetHeight;

            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
            document.body.style.cursor = "row-resize";

            return true;
          }

          return false;
        },
      },
    },
  });
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

  addProseMirrorPlugins() {
    return [
      ...(this.parent?.() || []),
      createRowResizePlugin(),
    ];
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
