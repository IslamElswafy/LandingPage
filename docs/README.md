# SimpleRichEditor Documentation

Welcome to the SimpleRichEditor documentation! This directory contains comprehensive guides for understanding and working with the editor's table system.

---

## Documentation Index

### 📘 [Table Implementation Guide](./table-implementation-guide.md)
**Complete technical documentation** covering:
- How tables work internally
- Custom attributes system
- Row resize functionality
- Border customization system
- Cell background customization
- Why you can't freely modify tables (ProseMirror constraints)
- Adding new table attributes (step-by-step)
- Common issues and solutions
- Code snippets and examples

**For:** Developers who want to understand the implementation, modify the system, or troubleshoot issues.

**Difficulty:** Advanced

---

### 🚀 [Table Quick Reference](./table-quick-reference.md)
**Quick reference guide** covering:
- Common operations (insert, format, modify)
- Code examples
- Troubleshooting checklist
- API reference
- Custom attributes
- CSS custom properties
- Keyboard shortcuts
- Best practices

**For:** Developers who need quick answers and code snippets.

**Difficulty:** Beginner to Intermediate

---

### 📊 [Table Architecture Diagram](./table-architecture-diagram.md)
**Visual documentation** covering:
- System architecture diagram
- Data flow diagrams (insert, border change, cell background, row resize)
- Component interaction diagram
- State synchronization
- Extension loading order

**For:** Developers who prefer visual learning and need to understand the big picture.

**Difficulty:** Intermediate

---

### ✨ [Table Features](./table-features.md)
**Feature overview** covering:
- List of all table features
- Basic usage examples
- Feature descriptions

**For:** Users and developers who want a quick overview of what's possible.

**Difficulty:** Beginner

---

### 🔒 [Why Tables Are Restricted](./why-tables-are-restricted.md)
**Simplified explanation** covering:
- Why you can't freely modify tables
- ProseMirror architecture explained with analogies
- The three layers of state (React, ProseMirror, DOM)
- What happens when you modify DOM directly
- What you CAN and CANNOT do
- Benefits of the command-based approach

**For:** Developers wondering why tables can't be freely modified like regular HTML.

**Difficulty:** Beginner to Intermediate

---

## Quick Navigation

### By Task

**I want to...**

- **Insert a table** → [Quick Reference - Insert Table](./table-quick-reference.md#insert-a-table)
- **Change border color** → [Quick Reference - Customize Borders](./table-quick-reference.md#customize-table-borders)
- **Add/remove rows/columns** → [Quick Reference - Row/Column Operations](./table-quick-reference.md#row-operations)
- **Apply cell backgrounds** → [Quick Reference - Cell Operations](./table-quick-reference.md#cell-operations)
- **Resize rows** → [Implementation Guide - Row Resize](./table-implementation-guide.md#3-row-resize-functionality)
- **Understand why modifications fail** → [Implementation Guide - Why You Can't Freely Modify](./table-implementation-guide.md#why-you-cant-freely-modify-tables)
- **Add a new table attribute** → [Implementation Guide - How to Add New Attribute](./table-implementation-guide.md#how-to-add-a-new-table-attribute)
- **Debug table issues** → [Implementation Guide - Common Issues](./table-implementation-guide.md#common-issues-and-solutions)
- **See visual diagrams** → [Architecture Diagram](./table-architecture-diagram.md)

### By Role

**Frontend Developer (New to Project)**
1. Start with [Table Features](./table-features.md) to see what's available
2. Read [Quick Reference](./table-quick-reference.md) for code examples
3. Check [Architecture Diagram](./table-architecture-diagram.md) for system overview

**Senior Developer (Modifying System)**
1. Read [Implementation Guide](./table-implementation-guide.md) thoroughly
2. Refer to [Architecture Diagram](./table-architecture-diagram.md) for data flow
3. Keep [Quick Reference](./table-quick-reference.md) handy for API details

**Technical Writer / Documentation**
1. [Table Features](./table-features.md) for user-facing documentation
2. [Quick Reference](./table-quick-reference.md) for API documentation
3. [Implementation Guide](./table-implementation-guide.md) for technical details

**QA / Tester**
1. [Table Features](./table-features.md) for test cases
2. [Quick Reference - Troubleshooting](./table-quick-reference.md#troubleshooting) for known issues
3. [Implementation Guide - Common Issues](./table-implementation-guide.md#common-issues-and-solutions)

---

## Key Concepts

### TipTap & ProseMirror

The editor is built on **TipTap v3**, which is a wrapper around **ProseMirror**. Understanding this is crucial:

- **ProseMirror** is a document editor framework with a strict schema
- **TipTap** provides a more user-friendly API and extension system
- Tables must follow the ProseMirror schema: `table → tableRow → tableCell/tableHeader`

### Custom Attributes

Tables and cells support custom attributes stored in ProseMirror nodes:

- **Table attributes:** `borderColor`, `borderWidth`, `borderStyle`
- **Cell attributes:** `borderColor`, `borderWidth`, `borderStyle`, `backgroundColor`

These attributes are converted to CSS custom properties for rendering.

### CSS Custom Properties

The system uses CSS custom properties (CSS variables) for styling:

```css
.editor-table {
  --table-border-color: #e0e0e0;
  --table-border-width: 2px;
  --table-border-style: solid;
}

.editor-table td {
  border-color: var(--cell-border-color, var(--table-border-color));
}
```

This allows:
- Table-wide defaults
- Per-cell overrides
- Cascading from table to cells

### State Synchronization

Three layers of state must stay in sync:
1. **React State** - Component state in `SimpleRichEditor.tsx`
2. **ProseMirror State** - Document JSON in TipTap editor
3. **DOM State** - Actual HTML with CSS custom properties

Always use TipTap commands to modify state, then sync DOM if needed.

---

## File Structure

```
src/components/SimpleRichEditor/
├── SimpleRichEditor.tsx          # Main editor component
├── CustomTable.ts                # Custom table extension
├── CustomTableCell.ts            # Custom cell extension
├── CustomTableHeader.ts          # Custom header extension
├── TableDialog.tsx               # Table insertion UI
├── EditorToolbar.tsx             # Editor toolbar with table controls
├── EditorStyles.tsx              # CSS styles for tables
├── extensions.ts                 # Extension configuration
├── hooks.ts                      # Custom React hooks
└── types.ts                      # TypeScript types
```

---

## API Quick Links

### TipTap Commands

| Command | Description |
|---------|-------------|
| `insertTable({ rows, cols, withHeaderRow })` | Insert new table |
| `addRowBefore()` / `addRowAfter()` | Add row |
| `addColumnBefore()` / `addColumnAfter()` | Add column |
| `deleteRow()` / `deleteColumn()` | Delete row/column |
| `deleteTable()` | Delete entire table |
| `mergeCells()` | Merge selected cells |
| `splitCell()` | Split merged cell |
| `setCellAttribute(name, value)` | Set cell attribute |
| `updateAttributes("table", attrs)` | Update table attributes |

### Custom Functions

| Function | Location | Description |
|----------|----------|-------------|
| `insertTable()` | SimpleRichEditor.tsx:248 | Insert table with borders |
| `getActiveTableElement()` | SimpleRichEditor.tsx:511 | Get active table DOM element |
| `syncActiveTableDom()` | SimpleRichEditor.tsx:552 | Sync DOM CSS properties |
| `applyTableAttributes()` | SimpleRichEditor.tsx:612 | Apply attributes to active table |
| `setTableBorderColor()` | SimpleRichEditor.tsx:668 | Set table border color |
| `setTableBorderWidth()` | SimpleRichEditor.tsx:692 | Set table border width |
| `setTableBorderStyle()` | SimpleRichEditor.tsx:729 | Set table border style |
| `setRowBackground()` | SimpleRichEditor.tsx:779 | Set row/cell background |
| `setColumnBackground()` | SimpleRichEditor.tsx:819 | Set column/cell background |

---

## Best Practices

### ✅ Do

- Use TipTap commands for all table modifications
- Check `editor.can().operation()` before executing
- Place cursor in table before applying border changes
- Select cells before applying background colors
- Use CSS custom properties for styling
- Keep state synchronized (React → ProseMirror → DOM)

### ❌ Don't

- Directly manipulate table DOM elements
- Modify table structure outside TipTap commands
- Assume operations will succeed without checking
- Use inline styles instead of CSS custom properties
- Try to delete the last row/column (delete table instead)
- Skip state synchronization steps

---

## Common Questions

### Why can't I freely modify the table DOM?

Because TipTap uses ProseMirror, which maintains a strict document schema. Direct DOM manipulation breaks:
- Undo/redo functionality
- Content serialization
- State synchronization
- Selection management

**Solution:** Always use TipTap commands to modify tables.

### Why do border changes not apply?

You need to place the cursor inside a table cell first. The editor checks `editor.isActive("table")` before applying changes.

### Why don't cell backgrounds work?

You need to select cells first (click and drag). The `setCellAttribute` command only works on selected cells.

### How do I add a new table attribute?

Follow the step-by-step guide in [Implementation Guide - How to Add New Attribute](./table-implementation-guide.md#how-to-add-a-new-table-attribute).

### Can I add column resizing?

Yes! Follow the same pattern as row resizing in `CustomTable.ts:16-116`. Create vertical resize handles between columns.

---

## Troubleshooting

**Table not appearing after insertion**
1. Check console for errors
2. Verify editor is not in read-only mode
3. Ensure cursor is focused

**Border controls not working**
1. Click inside a table cell
2. Check `editor.isActive("table")` returns true

**Cell backgrounds not applying**
1. Select cells (click and drag)
2. Check `setCellAttribute` returns true

**Row resize handles missing**
1. Check `EditorStyles.tsx` is imported
2. Verify plugin is registered
3. Look for `.table-row-resize-handle` in DOM

**Attributes not persisting**
1. Check `renderHTML` outputs CSS custom properties
2. Verify `parseHTML` reads CSS custom properties
3. Ensure HTML includes style attributes

---

## Contributing

When adding features or fixing bugs:

1. **Understand the architecture** - Read the Implementation Guide
2. **Follow the patterns** - Use existing code as examples
3. **Test thoroughly** - Verify all three state layers sync
4. **Update documentation** - Keep these docs up-to-date
5. **Check edge cases** - Test with min/max values, empty tables, etc.

---

## External Resources

- [TipTap Documentation](https://tiptap.dev/)
- [TipTap Table Extension](https://tiptap.dev/api/nodes/table)
- [ProseMirror Guide](https://prosemirror.net/docs/guide/)
- [ProseMirror Schema](https://prosemirror.net/docs/guide/#schema)
- [CSS Custom Properties (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [React Hooks](https://react.dev/reference/react)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-10-13 | Initial documentation |

---

## Support

For questions or issues:
1. Check the [Troubleshooting](#troubleshooting) section
2. Search in [Common Issues](./table-implementation-guide.md#common-issues-and-solutions)
3. Review [Architecture Diagrams](./table-architecture-diagram.md)
4. Consult the [Implementation Guide](./table-implementation-guide.md)

---

**Happy coding!** 🚀
