# Table Implementation Guide - SimpleRichEditor

## Overview

The SimpleRichEditor implements a fully-featured, customizable table system using **TipTap v3** with custom extensions. This guide explains how tables work, why certain modifications are restricted, and how to work with the implementation.

---

## Table Architecture

### Core Components

The table system consists of 4 main files:

1. **CustomTable.ts** - Main table extension with row resize functionality
2. **CustomTableCell.ts** - Cell extension with border and background attributes
3. **CustomTableHeader.ts** - Header cell extension (similar to CustomTableCell)
4. **TableDialog.tsx** - UI dialog for inserting new tables
5. **EditorToolbar.tsx** - Toolbar with table manipulation controls
6. **EditorStyles.tsx** - CSS styles for table rendering

---

## How Tables Work

### 1. Table Insertion Flow

**Location:** `SimpleRichEditor.tsx:248-341` (`insertTable` function)

```typescript
const insertTable = useCallback(() => {
  // 1. Insert table with specified rows/cols
  editor.chain().focus().insertTable({
    rows: state.tableRows,
    cols: state.tableCols,
    withHeaderRow: true,
  }).run();

  // 2. Apply border attributes to the table node
  editor.chain().focus().updateAttributes("table", {
    borderColor: state.tableBorderColor,
    borderWidth: borderWidthPx,
    borderStyle: state.tableBorderStyle,
  }).run();

  // 3. Sync DOM CSS custom properties
  syncActiveTableDom({
    borderColor: state.tableBorderColor,
    borderWidth: borderWidthPx,
    borderStyle: state.tableBorderStyle,
  });

  // 4. Apply CSS class and styles after DOM renders
  setTimeout(() => {
    const lastTable = editor.view.dom.querySelectorAll("table:last-child");
    // Set CSS class and custom properties
  }, 100);
}, [...dependencies]);
```

**Key Points:**
- Tables are created with TipTap's `insertTable` command
- Border attributes are stored in the ProseMirror node
- CSS custom properties (`--table-border-color`, etc.) are applied to the DOM
- A 100ms delay ensures DOM is ready before applying styles

---

### 2. Custom Attributes System

**Location:** `CustomTable.ts:118-135`

```typescript
addAttributes() {
  return {
    ...this.parent?.(),
    borderColor: {
      default: null,
      parseHTML: (element) =>
        getStyleProperty(element, "--table-border-color"),
    },
    borderWidth: {
      default: null,
      parseHTML: (element) =>
        getStyleProperty(element, "--table-border-width"),
    },
    borderStyle: {
      default: null,
      parseHTML: (element) =>
        getStyleProperty(element, "--table-border-style"),
    },
  };
}
```

**Why CSS Custom Properties?**
- CSS custom properties (`--table-border-color`) are used instead of inline styles
- This allows cascading: table properties cascade to cells
- ProseMirror stores these as node attributes
- The `renderHTML` method converts attributes to CSS custom properties

**Cell Attributes:**
`CustomTableCell.ts` and `CustomTableHeader.ts` have additional attributes:
- `backgroundColor` - Direct inline style for cell backgrounds
- `borderColor`, `borderWidth`, `borderStyle` - Inherited or overridden from table

---

### 3. Row Resize Functionality

**Location:** `CustomTable.ts:16-116` (`createRowResizePlugin`)

```typescript
const createRowResizePlugin = () => {
  let resizingRow: HTMLTableRowElement | null = null;
  let startY = 0;
  let startHeight = 0;

  const addResizeHandles = (view: any) => {
    // Find all tables
    const tables = view.dom.querySelectorAll("table.editor-table");

    tables.forEach((table: HTMLTableElement) => {
      const rows = table.querySelectorAll("tr");

      rows.forEach((row: HTMLTableRowElement, index: number) => {
        // Skip last row (no handle needed)
        if (index === rows.length - 1) return;

        // Create resize handle
        const handle = document.createElement("div");
        handle.className = "table-row-resize-handle";

        // Position at bottom of row
        handle.style.position = "absolute";
        handle.style.bottom = "-4px";
        handle.style.height = "8px";
        handle.style.cursor = "row-resize";

        // Add mousedown listener
        handle.addEventListener("mousedown", (e: MouseEvent) => {
          e.preventDefault();
          resizingRow = row;
          startY = e.clientY;
          startHeight = row.offsetHeight;

          document.addEventListener("mousemove", handleMouseMove);
          document.addEventListener("mouseup", handleMouseUp);
        });

        row.appendChild(handle);
      });
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!resizingRow) return;
    const deltaY = e.clientY - startY;
    const newHeight = Math.max(30, startHeight + deltaY);

    // Apply to row and all cells
    resizingRow.style.height = `${newHeight}px`;
  };

  return new Plugin({
    key: rowResizePluginKey,
    view(editorView) {
      setTimeout(() => addResizeHandles(editorView), 100);
      return {
        update(view, prevState) {
          setTimeout(() => addResizeHandles(view), 100);
        }
      };
    }
  });
};
```

**How it works:**
1. Plugin adds invisible resize handles to each row (except last)
2. Handles are positioned absolutely at the bottom of rows
3. On mousedown, drag handler tracks mouse Y position
4. On mousemove, row height is adjusted in real-time
5. Minimum height is enforced (30px)

**Visual Indicators:** (`EditorStyles.tsx:107-148`)
- Transparent by default
- Blue highlight on hover
- Blue line indicator when active

---

### 4. Border Customization System

**Location:** `SimpleRichEditor.tsx:668-777`

Three functions handle border attributes:

#### A. Border Color (`setTableBorderColor`)
```typescript
const setTableBorderColor = useCallback((color: string) => {
  const normalized = color.trim();

  // Validate color
  if (!normalized) {
    updateState({ notification: "Please provide a valid CSS color value." });
    return;
  }

  // Apply to active table
  if (!applyTableAttributes({ borderColor: normalized })) {
    return;
  }

  // Update state
  updateState({
    tableBorderColor: normalized,
    notification: "Table border color updated successfully!",
  });
}, [applyTableAttributes, updateState]);
```

#### B. Border Width (`setTableBorderWidth`)
```typescript
const setTableBorderWidth = useCallback((widthValue: string) => {
  const sanitized = widthValue.replace(/px$/i, "").trim();
  const parsed = parseFloat(sanitized);

  // Validate: must be non-negative, max 12px
  if (isNaN(parsed) || parsed < 0) {
    updateState({ notification: "Border width must be a non-negative number." });
    return;
  }

  const clamped = Math.min(12, parsed);
  const pixelWidth = `${clamped}px`;

  applyTableAttributes({ borderWidth: pixelWidth });
}, [...]);
```

#### C. Border Style (`setTableBorderStyle`)
```typescript
const setTableBorderStyle = useCallback((styleValue: string) => {
  const allowedStyles = new Set([
    "solid", "dashed", "dotted", "double",
    "groove", "ridge", "none"
  ]);

  const lower = styleValue.toLowerCase();
  const finalStyle = allowedStyles.has(lower) ? lower : styleValue;

  applyTableAttributes({ borderStyle: finalStyle });
}, [...]);
```

**Shared Logic:** `applyTableAttributes` (lines 612-666)
```typescript
const applyTableAttributes = useCallback((attributes: {
  borderColor?: string;
  borderWidth?: string;
  borderStyle?: string;
}) => {
  if (!editor) return false;

  // Check if cursor is inside a table
  if (!editor.isActive("table")) {
    updateState({
      notification: "Place the cursor inside a table to adjust its borders."
    });
    return false;
  }

  // Build attributes object
  const tableAttributes: Record<string, string> = {};
  if (attributes.borderColor !== undefined) {
    tableAttributes.borderColor = attributes.borderColor;
  }
  // ... same for width and style

  // Update ProseMirror node
  const success = editor
    .chain()
    .focus()
    .updateAttributes("table", tableAttributes)
    .run();

  // Sync DOM CSS custom properties
  if (success) {
    syncActiveTableDom(attributes);
  }

  return success;
}, [...]);
```

---

### 5. Cell Background Customization

**Location:** `SimpleRichEditor.tsx:779-857`

```typescript
const setRowBackground = useCallback((color: string | null) => {
  if (!editor) return;
  if (!editor.isActive("table")) {
    updateState({ notification: "Select the table cells you want to style" });
    return;
  }

  // Use setCellAttribute to update selected cells
  const success = editor
    .chain()
    .focus()
    .setCellAttribute("backgroundColor", color ?? null)
    .run();

  if (!success) {
    updateState({ notification: "Select the table cells..." });
    return;
  }

  updateState({
    ...(color ? { rowHighlightColor: color } : {}),
    notification: color
      ? "Selected cells background updated."
      : "Cell backgrounds cleared.",
  });
}, [editor, updateState]);
```

**Key Points:**
- Works on selected cells (select cells first, then apply color)
- `setCellAttribute` is a TipTap command for table cells
- Passing `null` clears the background
- Same logic for `setColumnBackground`

---

### 6. Table Operations

**Location:** `SimpleRichEditor.tsx:378-509`

All operations check if the action is possible before executing:

```typescript
const addColumnBefore = useCallback(() => {
  if (!editor) return;

  // Check if action is possible
  if (editor.can().addColumnBefore()) {
    editor.chain().focus().addColumnBefore().run();
    updateState({ notification: "Column added before!" });
  } else {
    updateState({
      notification: "Cannot add column. Make sure cursor is in a table cell."
    });
  }
}, [editor, updateState]);
```

**Available Operations:**
- `addColumnBefore()` / `addColumnAfter()`
- `deleteColumn()`
- `addRowBefore()` / `addRowAfter()`
- `deleteRow()`
- `mergeCells()` - Merge selected cells
- `splitCell()` - Split merged cell
- `deleteTable()` - Delete entire table

**Pattern:**
1. Check if editor exists
2. Use `editor.can().operation()` to validate
3. Execute with `editor.chain().focus().operation().run()`
4. Show notification

---

## Why You Can't Freely Modify Tables

### 1. ProseMirror Schema Constraints

**The Problem:**
TipTap uses ProseMirror, which enforces a strict **document schema**. The table structure is defined as:

```
table
  ├── tableRow
  │   ├── tableCell (or tableHeader)
  │   └── tableCell
  └── tableRow
      └── ...
```

**Consequences:**
- You cannot arbitrarily add/remove cells without following the schema
- Cells must contain valid content (text, inline nodes)
- Row/column operations must maintain table integrity
- Direct DOM manipulation breaks ProseMirror's internal state

### 2. State Synchronization

**The Challenge:**
ProseMirror maintains:
1. **Document State** - JSON representation of content
2. **DOM State** - Actual HTML rendered
3. **Selection State** - Current cursor/selection position

**Why it matters:**
- Modifying the DOM directly without updating ProseMirror state causes:
  - Content loss on re-render
  - Cursor position errors
  - Undo/redo breaking
  - Serialization issues

**Example of what breaks:**
```javascript
// ❌ WRONG - Direct DOM manipulation
const cell = document.querySelector("td");
cell.style.backgroundColor = "red";

// ✅ CORRECT - Use TipTap commands
editor.chain().focus().setCellAttribute("backgroundColor", "red").run();
```

### 3. Custom Attributes Parsing

**Location:** `CustomTable.ts:122-133`

```typescript
borderColor: {
  default: null,
  parseHTML: (element) =>
    getStyleProperty(element as HTMLElement, "--table-border-color"),
}
```

**Why this matters:**
- When loading HTML, ProseMirror calls `parseHTML` to extract attributes
- It expects CSS custom properties (`--table-border-color`)
- Regular inline styles (`style="border-color: red"`) won't be parsed
- This ensures consistency between save/load cycles

### 4. Extension Initialization

**Location:** `extensions.ts:82-90`

```typescript
CustomTable.configure({
  resizable: true,
  HTMLAttributes: {
    class: tableBorders ? "editor-table bordered" : "editor-table",
  },
}),
TableRow,
CustomTableHeader,
CustomTableCell,
```

**Why order matters:**
- Extensions must be registered before editor creation
- `CustomTable` must come before `TableRow`, `CustomTableCell`, `CustomTableHeader`
- Changing order can break table rendering
- The `tableBorders` prop controls the default `bordered` class

### 5. CSS Custom Properties Cascade

**Location:** `EditorStyles.tsx:27-106`

```css
.editor-table {
  --table-border-color: #e0e0e0;
  --table-border-width: 2px;
  --table-border-style: solid;
}

.editor-table td,
.editor-table th {
  border-color: var(--cell-border-color, var(--table-border-color));
  border-width: var(--cell-border-width, var(--table-border-width));
  border-style: var(--cell-border-style, var(--table-border-style));
}
```

**How cascading works:**
- Table sets `--table-border-*` properties
- Cells use `--cell-border-*` if set, otherwise fall back to table properties
- This allows per-cell customization while maintaining table-wide defaults

---

## Working with the Table System

### How to Add a New Table Attribute

**Example:** Adding `borderRadius` to tables

#### Step 1: Add attribute to `CustomTable.ts`

```typescript
addAttributes() {
  return {
    ...this.parent?.(),
    borderColor: { /* existing */ },
    borderWidth: { /* existing */ },
    borderStyle: { /* existing */ },
    borderRadius: {  // NEW
      default: null,
      parseHTML: (element) =>
        getStyleProperty(element as HTMLElement, "--table-border-radius"),
    },
  };
}
```

#### Step 2: Update `renderHTML` in `CustomTable.ts`

```typescript
renderHTML({ node, HTMLAttributes }) {
  const attributes = { ...HTMLAttributes };
  const styleSegments: string[] = [];

  if (node.attrs.borderColor) {
    styleSegments.push(`--table-border-color: ${node.attrs.borderColor}`);
  }
  // ... existing attributes
  if (node.attrs.borderRadius) {  // NEW
    styleSegments.push(`--table-border-radius: ${node.attrs.borderRadius}`);
  }

  if (styleSegments.length > 0) {
    attributes.style = styleSegments.join("; ");
  }

  return ["table", attributes, 0];
}
```

#### Step 3: Add CSS in `EditorStyles.tsx`

```css
.editor-table {
  --table-border-radius: 0px;
  border-radius: var(--table-border-radius);
}
```

#### Step 4: Add state in `hooks.ts`

```typescript
export const useEditorState = (autoSave: boolean) => {
  const [state, setState] = useState({
    // ... existing state
    tableBorderRadius: "0",  // NEW
  });
  // ...
};
```

#### Step 5: Add UI in `TableDialog.tsx`

```tsx
<TextField
  label="Border Radius (px)"
  type="number"
  value={borderRadius}
  onChange={(e) => onBorderRadiusChange(e.target.value)}
  sx={{ width: 160 }}
/>
```

#### Step 6: Add setter in `SimpleRichEditor.tsx`

```typescript
const setTableBorderRadius = useCallback((radius: string) => {
  const parsed = parseFloat(radius);
  if (isNaN(parsed) || parsed < 0) return;

  const clamped = Math.min(50, parsed);
  const pixelRadius = `${clamped}px`;

  applyTableAttributes({ borderRadius: pixelRadius });
  updateState({ tableBorderRadius: String(clamped) });
}, [applyTableAttributes, updateState]);
```

---

### How to Programmatically Modify Tables

#### Insert Table
```typescript
editor.chain().focus().insertTable({
  rows: 3,
  cols: 4,
  withHeaderRow: true
}).run();
```

#### Add Row/Column
```typescript
// Must have cursor in a table cell first
editor.chain().focus().addRowAfter().run();
editor.chain().focus().addColumnBefore().run();
```

#### Update Table Attributes
```typescript
editor.chain().focus().updateAttributes("table", {
  borderColor: "#ff0000",
  borderWidth: "3px",
  borderStyle: "dashed"
}).run();
```

#### Update Cell Attributes
```typescript
// Select cells first, then:
editor.chain().focus().setCellAttribute("backgroundColor", "#ffeb3b").run();
```

#### Delete Table
```typescript
editor.chain().focus().deleteTable().run();
```

---

## CSS Styling System

### Table Structure Classes

**Location:** `EditorStyles.tsx`

```css
/* Main table container */
.editor-table {
  border-collapse: collapse;
  margin: 16px 0;
  width: 100%;
  table-layout: fixed;
  --table-border-color: #e0e0e0;
  --table-border-width: 2px;
  --table-border-style: solid;
}

/* Bordered variant */
.editor-table.bordered td,
.editor-table.bordered th {
  border-color: var(--cell-border-color, var(--table-border-color));
  border-width: var(--cell-border-width, var(--table-border-width));
  border-style: var(--cell-border-style, var(--table-border-style));
}

/* Non-bordered (transparent borders) */
.editor-table:not(.bordered) td,
.editor-table:not(.bordered) th {
  border-width: 0;
  border-color: transparent;
}
```

### Cell Styling

```css
.editor-table td,
.editor-table th {
  min-width: 1em;
  padding: 8px 12px;
  position: relative;
  vertical-align: top;
  white-space: normal;
  word-break: break-word;
}

/* Header cells */
.editor-table th {
  font-weight: bold;
  text-align: left;
  background-color: #f5f5f5;
}
```

### Merged Cells Indicators

```css
/* Visual feedback for merged cells */
.editor-table td[colspan],
.editor-table th[colspan] {
  background-color: rgba(25, 118, 210, 0.05);
}

/* Arrow indicators */
.editor-table td[colspan]:after {
  content: "↔";  /* Horizontal merge */
  position: absolute;
  top: 2px;
  right: 2px;
  font-size: 10px;
  color: #1976d2;
}

.editor-table td[rowspan]:after {
  content: "↕";  /* Vertical merge */
}

.editor-table td[colspan][rowspan]:after {
  content: "⤡";  /* Both directions */
}
```

### Row Resize Handles

```css
.table-row-resize-handle {
  position: absolute;
  left: 0;
  right: 0;
  height: 8px;
  cursor: row-resize;
  background: transparent;
  transition: background-color 0.2s ease;
}

.table-row-resize-handle:hover {
  background-color: rgba(25, 118, 210, 0.2);
}

/* Blue line indicator */
.table-row-resize-handle::after {
  content: "";
  position: absolute;
  top: 50%;
  height: 2px;
  background-color: #1976d2;
  opacity: 0;
}

.table-row-resize-handle:hover::after {
  opacity: 0.5;
}
```

---

## Common Issues and Solutions

### Issue 1: Border Changes Not Applying

**Symptom:** Clicking border buttons in toolbar has no effect.

**Cause:** Cursor is not inside a table.

**Solution:**
```typescript
// Check in applyTableAttributes (line 621)
if (!editor.isActive("table")) {
  updateState({
    notification: "Place the cursor inside a table to adjust its borders."
  });
  return false;
}
```

**How to fix:**
1. Click inside a table cell
2. Then use border controls in toolbar

---

### Issue 2: Cell Background Not Applying

**Symptom:** Row/column background buttons don't work.

**Cause:** No cells are selected.

**Solution:**
```typescript
// In setRowBackground (line 796)
const success = editor
  .chain()
  .focus()
  .setCellAttribute("backgroundColor", color ?? null)
  .run();

if (!success) {
  updateState({
    notification: "Select the table cells you want to style..."
  });
}
```

**How to fix:**
1. Select one or more cells (click and drag)
2. Then use background color controls

---

### Issue 3: Table Not Saving Attributes

**Symptom:** After reloading, table borders are lost.

**Cause:** Attributes not being serialized to HTML.

**Check:**
1. `renderHTML` in `CustomTable.ts` converts attributes to CSS custom properties
2. `parseHTML` in `CustomTable.ts` reads CSS custom properties back
3. Both must be in sync

**Debug:**
```typescript
// In renderHTML
console.log("Rendering table with attrs:", node.attrs);

// In parseHTML
console.log("Parsing table element:", element);
```

---

### Issue 4: Row Resize Handles Not Appearing

**Symptom:** No blue hover effect on rows.

**Causes:**
1. Plugin not loading
2. CSS not applied
3. Tables rendered before plugin initialized

**Solution:**
```typescript
// In createRowResizePlugin (line 100-107)
return new Plugin({
  view(editorView) {
    // Add 100ms delay to ensure DOM is ready
    setTimeout(() => addResizeHandles(editorView), 100);

    return {
      update(view, prevState) {
        // Re-add handles when content changes
        setTimeout(() => addResizeHandles(view), 100);
      }
    };
  }
});
```

**Check:**
1. Verify `EditorStyles.tsx` is imported
2. Check console for errors
3. Inspect table rows for `.table-row-resize-handle` divs

---

### Issue 5: Can't Delete Column/Row

**Symptom:** Delete buttons show notification but don't delete.

**Cause:** TipTap's `can()` check returns false.

**Reason:**
- Table must have at least 1 row and 1 column
- Cursor must be in the row/column to delete

**Solution:**
```typescript
const deleteColumn = useCallback(() => {
  if (!editor) return;

  // Check if deletion is possible
  if (editor.can().deleteColumn()) {
    editor.chain().focus().deleteColumn().run();
  } else {
    updateState({
      notification: "Cannot delete column. Make sure cursor is in a table cell."
    });
  }
}, [editor]);
```

**How to fix:**
1. Click inside the column you want to delete
2. Then click delete column button
3. If it's the last column, delete the whole table instead

---

## Code Snippets

### Get Active Table Element

**Location:** `SimpleRichEditor.tsx:511-550`

```typescript
const getActiveTableElement = useCallback((): HTMLTableElement | null => {
  if (!editor) return null;

  const { state, view } = editor;
  const { $from } = state.selection;

  // Traverse up from cursor position
  for (let depth = $from.depth; depth > 0; depth -= 1) {
    const node = $from.node(depth);
    if (node.type.name === "table") {
      const pos = $from.before(depth);
      const dom = view.nodeDOM(pos);
      if (dom instanceof HTMLTableElement) {
        return dom;
      }
      // Sometimes table is wrapped
      if (dom instanceof HTMLElement) {
        const table = dom.querySelector("table.editor-table");
        if (table instanceof HTMLTableElement) {
          return table;
        }
      }
    }
  }

  // Fallback: search from cursor position
  const domContext = view.domAtPos(state.selection.from);
  const contextNode = domContext?.node instanceof Element
    ? domContext.node
    : domContext?.node?.parentElement ?? null;

  if (contextNode) {
    const table = contextNode.closest("table.editor-table");
    if (table instanceof HTMLTableElement) {
      return table;
    }
  }

  return null;
}, [editor]);
```

**Use cases:**
- Apply CSS custom properties to active table
- Read current border settings
- Highlight selected table

---

### Sync DOM with ProseMirror Attributes

**Location:** `SimpleRichEditor.tsx:552-610`

```typescript
const syncActiveTableDom = useCallback((attributes: {
  borderColor?: string;
  borderWidth?: string;
  borderStyle?: string;
}) => {
  const tableElement = getActiveTableElement();
  if (!tableElement) return;

  const setProperty = (
    element: HTMLElement,
    property: string,
    value?: string
  ) => {
    if (value === undefined || value === null) {
      element.style.removeProperty(property);
    } else {
      element.style.setProperty(property, value);
    }
  };

  // Apply to table
  if (attributes.borderColor !== undefined) {
    setProperty(tableElement, "--table-border-color", attributes.borderColor);
  }
  if (attributes.borderWidth !== undefined) {
    setProperty(tableElement, "--table-border-width", attributes.borderWidth);
  }
  if (attributes.borderStyle !== undefined) {
    setProperty(tableElement, "--table-border-style", attributes.borderStyle);
  }

  // Apply to all cells
  tableElement.querySelectorAll<HTMLElement>("th, td").forEach((cell) => {
    if (attributes.borderColor !== undefined) {
      setProperty(cell, "--cell-border-color", attributes.borderColor);
    }
    if (attributes.borderWidth !== undefined) {
      setProperty(cell, "--cell-border-width", attributes.borderWidth);
    }
    if (attributes.borderStyle !== undefined) {
      setProperty(cell, "--cell-border-style", attributes.borderStyle);
    }
  });
}, [getActiveTableElement]);
```

**Why this is needed:**
- ProseMirror updates nodes asynchronously
- DOM may not reflect new attributes immediately
- This ensures visual changes happen instantly

---

### Apply Table Attributes

**Location:** `SimpleRichEditor.tsx:612-666`

```typescript
const applyTableAttributes = useCallback((attributes: {
  borderColor?: string;
  borderWidth?: string;
  borderStyle?: string;
}) => {
  if (!editor) return false;

  // Validate: cursor must be in a table
  if (!editor.isActive("table")) {
    updateState({
      notification: "Place the cursor inside a table to adjust its borders.",
      showNotification: true,
    });
    return false;
  }

  // Build attributes object
  const tableAttributes: Record<string, string> = {};
  if (attributes.borderColor !== undefined) {
    tableAttributes.borderColor = attributes.borderColor;
  }
  if (attributes.borderWidth !== undefined) {
    tableAttributes.borderWidth = attributes.borderWidth;
  }
  if (attributes.borderStyle !== undefined) {
    tableAttributes.borderStyle = attributes.borderStyle;
  }

  if (Object.keys(tableAttributes).length === 0) {
    return true;
  }

  // Update ProseMirror node
  const success = editor
    .chain()
    .focus()
    .updateAttributes("table", tableAttributes)
    .run();

  if (!success) {
    updateState({
      notification: "Unable to update the table borders. Try selecting the table cell again.",
      showNotification: true,
    });
  }

  // Sync DOM CSS custom properties
  if (success) {
    syncActiveTableDom(attributes);
  }

  return success;
}, [editor, syncActiveTableDom, updateState]);
```

**Pattern:**
1. Validate editor exists and cursor is in table
2. Build attributes object from parameters
3. Call `updateAttributes("table", ...)` command
4. Sync DOM CSS custom properties
5. Return success status

---

## File Structure Summary

```
src/components/SimpleRichEditor/
├── SimpleRichEditor.tsx          # Main editor component
│   ├── insertTable()             # Lines 248-341
│   ├── getActiveTableElement()   # Lines 511-550
│   ├── syncActiveTableDom()      # Lines 552-610
│   ├── applyTableAttributes()    # Lines 612-666
│   ├── setTableBorderColor()     # Lines 668-690
│   ├── setTableBorderWidth()     # Lines 692-727
│   ├── setTableBorderStyle()     # Lines 729-764
│   ├── clearTableBorders()       # Lines 766-777
│   ├── setRowBackground()        # Lines 779-817
│   ├── setColumnBackground()     # Lines 819-857
│   ├── deleteTable()             # Lines 378-387
│   ├── mergeCells()              # Lines 389-398
│   ├── splitCell()               # Lines 400-409
│   ├── addColumnBefore()         # Lines 411-427
│   ├── addColumnAfter()          # Lines 429-445
│   ├── deleteColumn()            # Lines 447-461
│   ├── addRowBefore()            # Lines 463-479
│   ├── addRowAfter()             # Lines 481-494
│   └── deleteRow()               # Lines 496-509
│
├── CustomTable.ts                # Custom table extension
│   ├── getStyleProperty()        # Lines 4-10
│   ├── createRowResizePlugin()   # Lines 16-116
│   ├── addAttributes()           # Lines 119-135
│   ├── addProseMirrorPlugins()   # Lines 137-142
│   └── renderHTML()              # Lines 144-164
│
├── CustomTableCell.ts            # Custom cell extension
│   ├── getStyleProperty()        # Lines 3-9
│   ├── getDirectStyle()          # Lines 11-17
│   ├── addAttributes()           # Lines 20-46
│   └── renderHTML()              # Lines 48-72
│
├── CustomTableHeader.ts          # Custom header extension
│   ├── getStyleProperty()        # Lines 3-9
│   ├── getDirectStyle()          # Lines 11-17
│   ├── addAttributes()           # Lines 20-46
│   └── renderHTML()              # Lines 48-72
│
├── TableDialog.tsx               # Table insertion UI
│   ├── Quick size buttons        # Lines 52-59, 291-308
│   ├── Border color picker       # Lines 136-161
│   ├── Border width slider       # Lines 162-172
│   ├── Border style select       # Lines 173-188
│   ├── Live preview              # Lines 191-278
│   └── Show borders toggle       # Lines 281-289
│
├── EditorToolbar.tsx             # Editor toolbar
│   ├── Table operation buttons   # Lines 445-531
│   ├── Border color menu         # Lines 535-601
│   ├── Border width menu         # Lines 549-624
│   ├── Border style menu         # Lines 558-656
│   ├── Row background menu       # Lines 658-710
│   ├── Column background menu    # Lines 712-764
│   └── Clear borders button      # Lines 766-770
│
├── EditorStyles.tsx              # CSS styles
│   ├── Table structure           # Lines 20-36
│   ├── Cell styles               # Lines 38-106
│   ├── Row resize handles        # Lines 107-148
│   └── Merged cell indicators    # Lines 150-190
│
└── extensions.ts                 # Extension configuration
    └── CustomTable.configure()   # Lines 82-90
```

---

## Best Practices

### 1. Always Use TipTap Commands
```typescript
// ❌ BAD
document.querySelector("table").style.borderColor = "red";

// ✅ GOOD
editor.chain().focus().updateAttributes("table", {
  borderColor: "red"
}).run();
```

### 2. Check Before Executing
```typescript
// ❌ BAD
editor.chain().focus().deleteColumn().run();

// ✅ GOOD
if (editor.can().deleteColumn()) {
  editor.chain().focus().deleteColumn().run();
} else {
  console.log("Cannot delete column");
}
```

### 3. Sync DOM After Node Updates
```typescript
// Update ProseMirror node
editor.chain().focus().updateAttributes("table", attrs).run();

// Sync DOM CSS custom properties
syncActiveTableDom(attrs);
```

### 4. Use CSS Custom Properties
```typescript
// ❌ BAD - Direct inline styles
element.style.borderColor = "red";

// ✅ GOOD - CSS custom properties
element.style.setProperty("--table-border-color", "red");
```

### 5. Validate User Input
```typescript
const parsed = parseFloat(widthValue);
if (isNaN(parsed) || parsed < 0) {
  // Show error
  return;
}
const clamped = Math.min(12, parsed); // Enforce max
```

---

## Future Enhancements

### Possible Features to Add

1. **Column Resizing**
   - Similar to row resize plugin
   - Add vertical resize handles between columns
   - Store column widths in table attributes

2. **Cell Borders**
   - Per-cell border customization
   - Independent of table borders
   - Store in cell attributes

3. **Table Presets**
   - Predefined color schemes
   - One-click styling (e.g., "Dark", "Colorful", "Minimal")
   - Save/load custom presets

4. **Export to CSV/Excel**
   - Extract table data
   - Convert to CSV format
   - Generate Excel file

5. **Import from CSV**
   - Parse CSV file
   - Generate table with data
   - Map columns to header cells

6. **Cell Formulas** (Advanced)
   - Basic arithmetic (SUM, AVG, etc.)
   - Cell references (A1, B2)
   - Recalculate on value change

---

## Troubleshooting Checklist

**Table not appearing after insertion:**
- [ ] Check console for errors
- [ ] Verify editor is not in read-only mode
- [ ] Ensure cursor is focused before inserting

**Border controls not working:**
- [ ] Cursor must be inside a table cell
- [ ] Check `editor.isActive("table")` returns true
- [ ] Verify table has class `editor-table`

**Cell backgrounds not applying:**
- [ ] Cells must be selected (click and drag)
- [ ] Check `setCellAttribute` command returns true
- [ ] Verify cell has `backgroundColor` in node attrs

**Row resize handles missing:**
- [ ] Check `EditorStyles.tsx` is imported
- [ ] Verify plugin is registered in `addProseMirrorPlugins()`
- [ ] Look for `.table-row-resize-handle` divs in DOM

**Attributes not persisting after save/load:**
- [ ] Check `renderHTML` outputs CSS custom properties
- [ ] Verify `parseHTML` reads CSS custom properties
- [ ] Ensure HTML serialization includes style attributes

---

## Related Files

- **Main component:** `SimpleRichEditor.tsx`
- **Extensions:** `extensions.ts`
- **Styles:** `EditorStyles.tsx`
- **Types:** `types.ts`
- **State hooks:** `hooks.ts`

---

## References

- [TipTap Documentation](https://tiptap.dev/)
- [ProseMirror Guide](https://prosemirror.net/docs/guide/)
- [TipTap Table Extension](https://tiptap.dev/api/nodes/table)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)

---

**Last Updated:** 2025-10-13
**Version:** 1.0
**Author:** Documentation generated for SimpleRichEditor table implementation
