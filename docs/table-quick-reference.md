# Table Quick Reference - SimpleRichEditor

Quick reference guide for working with tables in the SimpleRichEditor.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Common Operations](#common-operations)
3. [Code Examples](#code-examples)
4. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Insert a Table

```typescript
// Via dialog (user interaction)
<IconButton onClick={onOpenTableDialog}>
  <TableChart />
</IconButton>

// Programmatically
editor.chain().focus().insertTable({
  rows: 3,
  cols: 4,
  withHeaderRow: true
}).run();
```

### Customize Table Borders

**Requirements:**
1. Place cursor inside table cell
2. Use toolbar controls or programmatic API

```typescript
// Update border color
editor.chain().focus().updateAttributes("table", {
  borderColor: "#ff0000"
}).run();

// Update border width
editor.chain().focus().updateAttributes("table", {
  borderWidth: "3px"
}).run();

// Update border style
editor.chain().focus().updateAttributes("table", {
  borderStyle: "dashed"
}).run();
```

---

## Common Operations

### Row Operations

```typescript
// Add row before current
if (editor.can().addRowBefore()) {
  editor.chain().focus().addRowBefore().run();
}

// Add row after current
if (editor.can().addRowAfter()) {
  editor.chain().focus().addRowAfter().run();
}

// Delete current row
if (editor.can().deleteRow()) {
  editor.chain().focus().deleteRow().run();
}

// Resize row height
// Drag the blue handle at the bottom of each row
```

### Column Operations

```typescript
// Add column before current
if (editor.can().addColumnBefore()) {
  editor.chain().focus().addColumnBefore().run();
}

// Add column after current
if (editor.can().addColumnAfter()) {
  editor.chain().focus().addColumnAfter().run();
}

// Delete current column
if (editor.can().deleteColumn()) {
  editor.chain().focus().deleteColumn().run();
}
```

### Cell Operations

```typescript
// Merge selected cells
editor.chain().focus().mergeCells().run();

// Split merged cell
editor.chain().focus().splitCell().run();

// Set cell background (select cells first)
editor.chain().focus().setCellAttribute("backgroundColor", "#ffeb3b").run();

// Clear cell background
editor.chain().focus().setCellAttribute("backgroundColor", null).run();
```

### Table Operations

```typescript
// Delete entire table
editor.chain().focus().deleteTable().run();

// Remove table borders
editor.chain().focus().updateAttributes("table", {
  borderWidth: "0px",
  borderStyle: "none"
}).run();
```

---

## Code Examples

### Example 1: Create Table with Custom Borders

```typescript
// Insert table
editor.chain().focus().insertTable({
  rows: 4,
  cols: 3,
  withHeaderRow: true
}).run();

// Apply custom borders
editor.chain().focus().updateAttributes("table", {
  borderColor: "#2196f3",
  borderWidth: "2px",
  borderStyle: "solid"
}).run();
```

### Example 2: Style Specific Cells

```typescript
// Select cells (user action: click and drag)

// Apply background color
editor.chain().focus().setCellAttribute("backgroundColor", "#e3f2fd").run();
```

### Example 3: Create Zebra-Striped Table

```typescript
// Insert table
editor.chain().focus().insertTable({
  rows: 5,
  cols: 4,
  withHeaderRow: true
}).run();

// Manually select odd rows and apply background
// (This requires user interaction to select cells)

// Alternative: Use CSS (add to EditorStyles.tsx)
// .editor-table tr:nth-child(odd) { background: #f5f5f5; }
```

### Example 4: Get Active Table Element

```typescript
const getActiveTableElement = (): HTMLTableElement | null => {
  if (!editor) return null;

  const { state, view } = editor;
  const { $from } = state.selection;

  for (let depth = $from.depth; depth > 0; depth -= 1) {
    const node = $from.node(depth);
    if (node.type.name === "table") {
      const pos = $from.before(depth);
      const dom = view.nodeDOM(pos);
      if (dom instanceof HTMLTableElement) {
        return dom;
      }
    }
  }

  return null;
};
```

---

## Troubleshooting

### Issue: Border controls don't work

**Solution:** Place cursor inside a table cell first.

```typescript
// Check if cursor is in table
if (editor.isActive("table")) {
  // Apply border changes
}
```

---

### Issue: Cell background not applying

**Solution:** Select cells first (click and drag), then apply color.

```typescript
// Check if operation succeeded
const success = editor
  .chain()
  .focus()
  .setCellAttribute("backgroundColor", "#ffeb3b")
  .run();

if (!success) {
  console.log("Select cells first");
}
```

---

### Issue: Can't delete row/column

**Solution:** Check if operation is allowed.

```typescript
// Check before deleting
if (editor.can().deleteRow()) {
  editor.chain().focus().deleteRow().run();
} else {
  console.log("Cannot delete row - might be the last row");
}
```

---

### Issue: Row resize handles not visible

**Solutions:**
1. Check if `EditorStyles.tsx` is imported
2. Verify table has class `editor-table`
3. Look for `.table-row-resize-handle` divs in DOM inspector

---

### Issue: Table attributes lost after save/load

**Solution:** Ensure HTML includes CSS custom properties.

```html
<!-- Correct format -->
<table class="editor-table" style="--table-border-color: #ff0000; --table-border-width: 2px;">
  ...
</table>
```

---

## File Locations

| Component | File Path |
|-----------|-----------|
| Main Editor | `src/components/SimpleRichEditor/SimpleRichEditor.tsx` |
| Table Extension | `src/components/SimpleRichEditor/CustomTable.ts` |
| Cell Extension | `src/components/SimpleRichEditor/CustomTableCell.ts` |
| Header Extension | `src/components/SimpleRichEditor/CustomTableHeader.ts` |
| Table Dialog | `src/components/SimpleRichEditor/TableDialog.tsx` |
| Toolbar | `src/components/SimpleRichEditor/EditorToolbar.tsx` |
| Styles | `src/components/SimpleRichEditor/EditorStyles.tsx` |
| Extensions Config | `src/components/SimpleRichEditor/extensions.ts` |

---

## API Reference

### TipTap Table Commands

| Command | Description | Requires Selection |
|---------|-------------|-------------------|
| `insertTable({ rows, cols, withHeaderRow })` | Insert new table | No |
| `addRowBefore()` | Add row before current | Yes (in cell) |
| `addRowAfter()` | Add row after current | Yes (in cell) |
| `deleteRow()` | Delete current row | Yes (in cell) |
| `addColumnBefore()` | Add column before current | Yes (in cell) |
| `addColumnAfter()` | Add column after current | Yes (in cell) |
| `deleteColumn()` | Delete current column | Yes (in cell) |
| `deleteTable()` | Delete entire table | Yes (in table) |
| `mergeCells()` | Merge selected cells | Yes (multiple cells) |
| `splitCell()` | Split merged cell | Yes (merged cell) |
| `setCellAttribute(name, value)` | Set cell attribute | Yes (cells) |
| `updateAttributes("table", attrs)` | Update table attributes | Yes (in table) |

---

## Custom Attributes

### Table Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `borderColor` | string | `null` | CSS color for borders |
| `borderWidth` | string | `null` | Border width (e.g., "2px") |
| `borderStyle` | string | `null` | Border style (solid, dashed, etc.) |

### Cell Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `borderColor` | string | `null` | Cell border color |
| `borderWidth` | string | `null` | Cell border width |
| `borderStyle` | string | `null` | Cell border style |
| `backgroundColor` | string | `null` | Cell background color |

---

## CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--table-border-color` | `#e0e0e0` | Table border color |
| `--table-border-width` | `2px` | Table border width |
| `--table-border-style` | `solid` | Table border style |
| `--cell-border-color` | Inherits from table | Cell border color |
| `--cell-border-width` | `0` | Cell border width |
| `--cell-border-style` | Inherits from table | Cell border style |

---

## Keyboard Shortcuts

| Shortcut | Action | Context |
|----------|--------|---------|
| `Tab` | Move to next cell | In table |
| `Shift+Tab` | Move to previous cell | In table |
| `Ctrl+Z` / `Cmd+Z` | Undo | Anywhere |
| `Ctrl+Shift+Z` / `Cmd+Shift+Z` | Redo | Anywhere |

---

## Best Practices

### ✅ Do

- Use TipTap commands for all table modifications
- Check `editor.can().operation()` before executing
- Place cursor in table before applying border changes
- Select cells before applying background colors
- Use CSS custom properties for styling

### ❌ Don't

- Directly manipulate table DOM elements
- Modify table structure outside TipTap commands
- Assume operations will succeed without checking
- Use inline styles instead of CSS custom properties
- Delete the last row/column (delete table instead)

---

## Performance Tips

1. **Batch Operations:** Chain multiple commands together
   ```typescript
   editor
     .chain()
     .focus()
     .addRowAfter()
     .addColumnAfter()
     .run();
   ```

2. **Avoid Unnecessary Re-renders:** Use `useCallback` for handlers

3. **Debounce Rapid Changes:** For user input (border width slider, etc.)

4. **Lazy Load Large Tables:** Consider virtualization for 100+ rows

---

## Security Notes

- Table content is sanitized by TipTap's HTML parser
- User input (colors, widths) is validated before applying
- CSS custom properties prevent CSS injection
- No `dangerouslySetInnerHTML` used

---

## Related Documentation

- [Complete Implementation Guide](./table-implementation-guide.md) - Detailed technical documentation
- [TipTap Table Extension Docs](https://tiptap.dev/api/nodes/table)
- [ProseMirror Schema Guide](https://prosemirror.net/docs/guide/#schema)

---

**Last Updated:** 2025-10-13
**Version:** 1.0
