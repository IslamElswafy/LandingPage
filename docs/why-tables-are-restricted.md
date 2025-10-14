# Why Tables Are Restricted in SimpleRichEditor

A simplified explanation of table limitations and the underlying architecture.

---

## The Short Answer

**You cannot freely modify tables** because the editor uses **ProseMirror**, a document editor framework that enforces a strict document structure. Think of it like a form with predefined fields - you can fill them in, but you can't add new fields without following the rules.

---

## The Analogy

### Building with LEGO vs. Clay

**Clay (Free-form DOM manipulation):**
```
❌ Direct DOM: document.querySelector("table").style.color = "red"

Like molding clay:
- You can shape it however you want
- No rules or constraints
- But it breaks easily
- Hard to rebuild exactly the same way
```

**LEGO (ProseMirror/TipTap):**
```
✅ TipTap API: editor.chain().focus().updateAttributes("table", {...}).run()

Like building with LEGO:
- You have specific pieces (nodes)
- Each piece fits in specific ways (schema)
- You must follow the instructions (commands)
- But you get undo/redo, save/load, and consistency
```

---

## What is ProseMirror?

**ProseMirror** is the foundation of TipTap. It's like the operating system, while TipTap is the user interface.

### Key Concepts:

1. **Document Schema** - A blueprint that defines what nodes can exist and how they connect
2. **Immutable State** - The document never changes directly; you create new versions
3. **Transformation System** - Changes are made through "transactions" that can be undone
4. **Node Tree** - Content is structured as a tree (like HTML), not flat text

### The Table Schema:

```
table (must contain tableRow children)
  └── tableRow (must contain tableCell/tableHeader children)
        ├── tableHeader (first row, must contain inline content)
        └── tableCell (must contain inline content)
```

**You cannot:**
- Add a `<div>` inside a table cell (schema doesn't allow it)
- Create a table without rows (schema requires at least 1 row)
- Have a row without cells (schema requires at least 1 cell)

---

## Why Not Just Use Regular HTML?

**Problem with `contentEditable` (regular HTML editing):**

```html
<div contenteditable="true">
  <table>
    <tr>
      <td>Cell 1</td>
      <td>Cell 2</td>
    </tr>
  </table>
</div>
```

**Issues:**
1. **Inconsistent behavior** across browsers
2. **No undo/redo** - browsers implement it differently
3. **No validation** - users can create invalid HTML
4. **Hard to serialize** - saving/loading is complex
5. **Security risks** - users can inject malicious HTML
6. **No cursor control** - managing selection is difficult

**ProseMirror solves these problems** by:
- Defining a strict schema (only valid structures allowed)
- Implementing consistent undo/redo
- Providing a clean serialization format (JSON)
- Sanitizing content automatically
- Managing cursor/selection precisely

---

## The Three Layers of Truth

In the SimpleRichEditor, there are **three representations** of the table:

```
┌─────────────────────────────────────────────────────────┐
│ Layer 1: React State (UI State)                        │
├─────────────────────────────────────────────────────────┤
│ tableBorderColor: "#ff0000"                             │
│ tableBorderWidth: "2"                                   │
│ tableBorderStyle: "solid"                               │
└─────────────────────────────────────────────────────────┘
                        ▲
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│ Layer 2: ProseMirror State (Document Model)            │
├─────────────────────────────────────────────────────────┤
│ {                                                       │
│   type: "table",                                        │
│   attrs: {                                              │
│     borderColor: "#ff0000",                             │
│     borderWidth: "2px",                                 │
│     borderStyle: "solid"                                │
│   },                                                    │
│   content: [...]                                        │
│ }                                                       │
└─────────────────────────────────────────────────────────┘
                        ▲
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│ Layer 3: DOM (Visual Representation)                   │
├─────────────────────────────────────────────────────────┤
│ <table class="editor-table"                             │
│        style="--table-border-color: #ff0000;           │
│               --table-border-width: 2px;">             │
│   <tr>                                                  │
│     <td>Cell content</td>                              │
│   </tr>                                                 │
│ </table>                                                │
└─────────────────────────────────────────────────────────┘
```

**All three must stay synchronized!**

If you directly modify Layer 3 (DOM):
- Layer 2 (ProseMirror) doesn't know about it
- Next render will overwrite your changes
- Undo/redo won't include your changes
- Save/load will lose your changes

---

## What Happens When You Modify the DOM Directly?

### Example: Changing Border Color

**❌ Wrong Way:**
```javascript
const table = document.querySelector("table");
table.style.borderColor = "red";
```

**What happens:**
1. ✓ DOM changes (you see red border)
2. ✗ ProseMirror state unchanged
3. ✗ React state unchanged
4. User types something...
5. ✗ ProseMirror re-renders from its state
6. ✗ Your red border is gone!

**Diagram:**
```
User modifies DOM directly
         │
         ▼
    DOM changes
         │
         ✗ ProseMirror state unchanged
         │
User types in editor
         │
         ▼
  ProseMirror re-renders
         │
         ▼
   DOM is overwritten
         │
         ✗ Changes lost!
```

---

**✅ Correct Way:**
```javascript
editor.chain().focus().updateAttributes("table", {
  borderColor: "red"
}).run();

syncActiveTableDom({ borderColor: "red" });
```

**What happens:**
1. ✓ ProseMirror state updated
2. ✓ ProseMirror re-renders DOM
3. ✓ DOM has red border
4. ✓ Sync ensures CSS properties match
5. User types something...
6. ✓ ProseMirror re-renders
7. ✓ Red border persists!

**Diagram:**
```
User calls TipTap command
         │
         ▼
ProseMirror state updated
         │
         ▼
   DOM re-rendered
         │
         ▼
  CSS properties synced
         │
User types in editor
         │
         ▼
ProseMirror re-renders
         │
         ✓ Changes persist!
```

---

## Why Commands Are Required

### Commands are Transactions

In ProseMirror, changes are made through **transactions**:

```javascript
// This is what happens internally:
editor.chain().focus().updateAttributes("table", { borderColor: "red" }).run()

Becomes:

1. Start transaction
2. Find table node
3. Create new node with updated attributes
4. Replace old node with new node
5. Update document state
6. Commit transaction
7. Re-render DOM
```

**Benefits:**
- **Undo/Redo:** Each transaction is recorded
- **Validation:** Schema is enforced at each step
- **Consistency:** State is always valid
- **Collaboration:** Transactions can be merged (for real-time editing)

### Direct DOM Modification Bypasses This

```javascript
document.querySelector("table").style.borderColor = "red"

Becomes:

1. Find table element in DOM
2. Set inline style
3. Done

No transaction, no validation, no undo, no persistence.
```

---

## The Schema is Like a Database Schema

**Think of ProseMirror like a database:**

```sql
-- Schema definition
CREATE TABLE tables (
  id INT PRIMARY KEY,
  border_color VARCHAR(20),
  border_width VARCHAR(10),
  border_style VARCHAR(20)
);

CREATE TABLE table_rows (
  id INT PRIMARY KEY,
  table_id INT REFERENCES tables(id)
);

CREATE TABLE table_cells (
  id INT PRIMARY KEY,
  row_id INT REFERENCES table_rows(id),
  background_color VARCHAR(20)
);
```

**Valid operations:**
```sql
-- ✅ Update table attributes
UPDATE tables SET border_color = 'red' WHERE id = 1;

-- ✅ Insert new row
INSERT INTO table_rows (table_id) VALUES (1);

-- ✅ Delete row
DELETE FROM table_rows WHERE id = 5;
```

**Invalid operations:**
```sql
-- ❌ Cannot add column not in schema
UPDATE tables SET new_column = 'value';

-- ❌ Cannot insert row without table reference
INSERT INTO table_rows VALUES (NULL);

-- ❌ Cannot delete table if rows exist (foreign key)
DELETE FROM tables WHERE id = 1;
```

**ProseMirror enforces similar constraints:**
- Tables must contain rows
- Rows must contain cells
- Cells must contain content
- Attributes must be defined in the schema

---

## What You CAN Do

### 1. Use Defined Commands

All operations that follow the schema:

```javascript
// Insert table
editor.chain().focus().insertTable({ rows: 3, cols: 4 }).run();

// Add/remove rows
editor.chain().focus().addRowAfter().run();
editor.chain().focus().deleteRow().run();

// Add/remove columns
editor.chain().focus().addColumnAfter().run();
editor.chain().focus().deleteColumn().run();

// Merge/split cells
editor.chain().focus().mergeCells().run();
editor.chain().focus().splitCell().run();

// Update attributes (defined in schema)
editor.chain().focus().updateAttributes("table", {
  borderColor: "red",
  borderWidth: "3px",
  borderStyle: "dashed"
}).run();

// Set cell attributes
editor.chain().focus().setCellAttribute("backgroundColor", "yellow").run();
```

### 2. Extend the Schema

Add new attributes by modifying the extensions:

**In `CustomTable.ts`:**
```typescript
addAttributes() {
  return {
    ...this.parent?.(),
    borderColor: { default: null, parseHTML: ... },
    borderWidth: { default: null, parseHTML: ... },
    borderStyle: { default: null, parseHTML: ... },
    borderRadius: { default: null, parseHTML: ... },  // NEW
  };
}
```

**Then use it:**
```javascript
editor.chain().focus().updateAttributes("table", {
  borderRadius: "8px"
}).run();
```

### 3. Sync DOM After Updates

For visual changes that need immediate feedback:

```javascript
// Update ProseMirror state
editor.chain().focus().updateAttributes("table", {
  borderColor: "red"
}).run();

// Sync DOM CSS custom properties
syncActiveTableDom({ borderColor: "red" });
```

---

## What You CANNOT Do

### 1. Arbitrary DOM Manipulation

```javascript
// ❌ Don't do this
document.querySelector("table").innerHTML = "<tr><td>Hacked</td></tr>";
document.querySelector("td").style.padding = "50px";
table.appendChild(document.createElement("div"));
```

**Why:** Breaks ProseMirror state synchronization.

### 2. Add Nodes Not in Schema

```javascript
// ❌ Don't do this
const div = document.createElement("div");
tableCell.appendChild(div);
```

**Why:** Schema doesn't allow `div` inside `tableCell`.

### 3. Modify Structure Without Commands

```javascript
// ❌ Don't do this
const row = document.querySelector("tr");
row.remove();
```

**Why:** ProseMirror doesn't know the row was removed.

---

## How to Work Within the System

### Step-by-Step Process:

1. **Understand the schema** - Know what nodes exist and how they connect
2. **Use TipTap commands** - Always go through the API
3. **Check if command is possible** - Use `editor.can().command()`
4. **Execute the command** - Use `editor.chain().focus().command().run()`
5. **Sync DOM if needed** - Call `syncActiveTableDom()` for immediate visual updates
6. **Verify the result** - Check that state is consistent

### Example: Adding Border Radius

**Step 1: Extend the schema**
```typescript
// In CustomTable.ts
addAttributes() {
  return {
    ...this.parent?.(),
    borderRadius: {
      default: null,
      parseHTML: (element) =>
        getStyleProperty(element, "--table-border-radius"),
    },
  };
}
```

**Step 2: Update renderHTML**
```typescript
renderHTML({ node, HTMLAttributes }) {
  const styleSegments: string[] = [];

  if (node.attrs.borderRadius) {
    styleSegments.push(`--table-border-radius: ${node.attrs.borderRadius}`);
  }

  // ... rest of the code
}
```

**Step 3: Add CSS**
```css
/* In EditorStyles.tsx */
.editor-table {
  border-radius: var(--table-border-radius, 0);
}
```

**Step 4: Create setter function**
```typescript
// In SimpleRichEditor.tsx
const setTableBorderRadius = useCallback((radius: string) => {
  const parsed = parseFloat(radius);
  if (isNaN(parsed) || parsed < 0) return;

  const clamped = Math.min(50, parsed);
  const pixelRadius = `${clamped}px`;

  applyTableAttributes({ borderRadius: pixelRadius });
}, [applyTableAttributes]);
```

**Step 5: Add UI control**
```tsx
// In EditorToolbar.tsx
<TextField
  label="Border Radius"
  value={tableBorderRadius}
  onChange={(e) => onSetTableBorderRadius(e.target.value)}
/>
```

**Step 6: Use it**
```typescript
editor.chain().focus().updateAttributes("table", {
  borderRadius: "10px"
}).run();
```

---

## Benefits of This Approach

### 1. Undo/Redo Works Perfectly

```
User creates table
User sets border color to red
User sets border width to 3px
User types content
User presses Undo → border width back to default
User presses Undo → border color back to default
User presses Undo → table deleted
```

**All operations are recorded and reversible.**

### 2. Save/Load is Automatic

```javascript
// Save
const json = editor.getJSON();
localStorage.setItem("content", JSON.stringify(json));

// Load
const json = JSON.parse(localStorage.getItem("content"));
editor.commands.setContent(json);

// All table attributes are preserved!
```

### 3. Content is Always Valid

```javascript
// Try to create invalid structure
editor.chain().focus().insertTable({ rows: 0, cols: 0 }).run();

// ProseMirror prevents it or corrects it
// Result: Table with 1 row, 1 column
```

### 4. Collaboration is Possible

```javascript
// User A: Add row
editor.chain().focus().addRowAfter().run();

// User B: Change border color
editor.chain().focus().updateAttributes("table", {
  borderColor: "blue"
}).run();

// Both changes can be merged without conflicts
```

### 5. Consistent Across Browsers

ProseMirror handles browser differences internally.

---

## Summary

**Why tables are restricted:**
1. ProseMirror enforces a strict document schema
2. Direct DOM manipulation breaks state synchronization
3. Commands ensure consistency, undo/redo, and serialization
4. The schema is like a database schema - only defined operations are allowed

**What you should do:**
1. Use TipTap commands for all table modifications
2. Extend the schema if you need new attributes
3. Sync DOM CSS custom properties after updates
4. Follow the patterns in the codebase

**What you shouldn't do:**
1. Directly manipulate table DOM elements
2. Try to add nodes not defined in the schema
3. Modify structure without using commands
4. Assume operations will succeed without checking

**Think of it like this:**
- ProseMirror is the operating system
- TipTap is the user interface
- Commands are the API
- Extensions are plugins
- Your code is an application running on this platform

You can't hack the OS - you must use the API it provides.

---

## Further Reading

- [Implementation Guide](./table-implementation-guide.md) - Technical details
- [Quick Reference](./table-quick-reference.md) - Code examples
- [Architecture Diagram](./table-architecture-diagram.md) - Visual overview
- [ProseMirror Guide](https://prosemirror.net/docs/guide/) - Official docs

---

**Last Updated:** 2025-10-13
**Version:** 1.0
