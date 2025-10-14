# Table Architecture Diagram - SimpleRichEditor

Visual representation of the table system architecture and data flow.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │ TableDialog  │  │EditorToolbar │  │ SimpleRichEditor     │ │
│  │              │  │              │  │                      │ │
│  │ - Rows/Cols  │  │ - Format     │  │ - insertTable()      │ │
│  │ - Borders    │  │ - Row/Col    │  │ - setTableBorder*()  │ │
│  │ - Preview    │  │ - Cell ops   │  │ - Row/Col ops        │ │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘ │
│         │                 │                     │              │
│         └─────────────────┴─────────────────────┘              │
│                           │                                    │
└───────────────────────────┼────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      TipTap Editor API                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  editor.chain().focus()                                         │
│    ├─ .insertTable({ rows, cols, withHeaderRow })              │
│    ├─ .updateAttributes("table", { borderColor, ... })         │
│    ├─ .setCellAttribute("backgroundColor", color)              │
│    ├─ .addRowBefore() / .addRowAfter()                         │
│    ├─ .addColumnBefore() / .addColumnAfter()                   │
│    ├─ .deleteRow() / .deleteColumn()                           │
│    ├─ .mergeCells() / .splitCell()                             │
│    └─ .deleteTable()                                            │
│  .run()                                                         │
│                                                                 │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ProseMirror Document State                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  {                                                              │
│    type: "doc",                                                 │
│    content: [                                                   │
│      {                                                          │
│        type: "table",                                           │
│        attrs: {                                                 │
│          borderColor: "#ff0000",                                │
│          borderWidth: "2px",                                    │
│          borderStyle: "solid"                                   │
│        },                                                       │
│        content: [                                               │
│          {                                                      │
│            type: "tableRow",                                    │
│            content: [                                           │
│              {                                                  │
│                type: "tableHeader",                             │
│                attrs: { backgroundColor: null, ... },           │
│                content: [...]                                   │
│              },                                                 │
│              ...                                                │
│            ]                                                    │
│          },                                                     │
│          ...                                                    │
│        ]                                                        │
│      }                                                          │
│    ]                                                            │
│  }                                                              │
│                                                                 │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Extension System                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │  CustomTable     │  │ CustomTableCell  │  │CustomTableHdr│ │
│  │                  │  │                  │  │              │ │
│  │ - addAttributes()│  │ - addAttributes()│  │ - addAttrs() │ │
│  │ - renderHTML()   │  │ - renderHTML()   │  │ - renderHTML │ │
│  │ - parseHTML()    │  │ - parseHTML()    │  │ - parseHTML()│ │
│  │ - rowResizePlugin│  │                  │  │              │ │
│  └────────┬─────────┘  └────────┬─────────┘  └──────┬───────┘ │
│           │                     │                    │         │
│           └─────────────────────┴────────────────────┘         │
│                           │                                    │
└───────────────────────────┼────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DOM Rendering                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  <table class="editor-table bordered"                           │
│         style="--table-border-color: #ff0000;                   │
│                --table-border-width: 2px;                       │
│                --table-border-style: solid;">                   │
│    <tr>                                                         │
│      <th style="--cell-border-color: #ff0000;                   │
│                 --cell-border-width: 2px;                       │
│                 background-color: #f5f5f5;">                    │
│        Header 1                                                 │
│        <div class="table-row-resize-handle"></div>              │
│      </th>                                                      │
│      ...                                                        │
│    </tr>                                                        │
│    ...                                                          │
│  </table>                                                       │
│                                                                 │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                         CSS Styling                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  EditorStyles.tsx:                                              │
│                                                                 │
│  .editor-table {                                                │
│    --table-border-color: #e0e0e0;  /* Default */               │
│    --table-border-width: 2px;                                  │
│    --table-border-style: solid;                                │
│  }                                                              │
│                                                                 │
│  .editor-table.bordered td,                                     │
│  .editor-table.bordered th {                                    │
│    border-color: var(--cell-border-color,                       │
│                      var(--table-border-color));               │
│    border-width: var(--cell-border-width,                       │
│                      var(--table-border-width));               │
│    border-style: var(--cell-border-style,                       │
│                      var(--table-border-style));               │
│  }                                                              │
│                                                                 │
│  .table-row-resize-handle {                                     │
│    position: absolute;                                          │
│    cursor: row-resize;                                          │
│  }                                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Inserting a Table

```
User clicks "Insert Table"
        │
        ▼
┌───────────────────────────────┐
│ TableDialog opens             │
│ - User sets rows/cols         │
│ - User sets border options    │
│ - User sees live preview      │
└───────────┬───────────────────┘
            │
            ▼ User clicks "Insert"
┌───────────────────────────────┐
│ onInsert() callback           │
│ → insertTable() in            │
│   SimpleRichEditor.tsx:248    │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│ Step 1: Insert table structure│
│ editor.chain().focus()        │
│   .insertTable({              │
│     rows: 3,                  │
│     cols: 4,                  │
│     withHeaderRow: true       │
│   }).run()                    │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│ ProseMirror creates nodes:    │
│ - table node                  │
│   └─ tableRow nodes           │
│       └─ tableHeader/Cell     │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│ Step 2: Update table attrs    │
│ editor.chain().focus()        │
│   .updateAttributes("table", {│
│     borderColor: "#1e88e5",   │
│     borderWidth: "2px",       │
│     borderStyle: "solid"      │
│   }).run()                    │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│ CustomTable.renderHTML()      │
│ converts attrs to CSS props   │
│ - borderColor → --table-border│
│   -color                      │
│ - borderWidth → --table-border│
│   -width                      │
│ - borderStyle → --table-border│
│   -style                      │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│ Step 3: Sync DOM immediately  │
│ syncActiveTableDom({          │
│   borderColor,                │
│   borderWidth,                │
│   borderStyle                 │
│ })                            │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│ Apply CSS custom properties   │
│ to <table> and all <td>/<th>  │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│ Step 4: Apply CSS class       │
│ setTimeout(() => {            │
│   table.className = "editor-  │
│     table bordered"           │
│ }, 100)                       │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│ Step 5: Row resize plugin     │
│ addResizeHandles()            │
│ - Creates resize handle divs  │
│ - Attaches mousedown listeners│
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│ Table rendered with:          │
│ ✓ Correct structure           │
│ ✓ Custom borders              │
│ ✓ Resize handles              │
│ ✓ CSS styling                 │
└───────────────────────────────┘
```

---

## Data Flow: Changing Border Color

```
User clicks inside table cell
        │
        ▼
┌───────────────────────────────┐
│ Cursor is now in table        │
│ editor.isActive("table")      │
│ → true                        │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│ User clicks border color icon │
│ in toolbar                    │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│ Color picker menu opens       │
│ - Shows color swatches        │
│ - Shows color picker          │
│ - Shows hex input             │
└───────────┬───────────────────┘
            │
            ▼ User selects color
┌───────────────────────────────┐
│ onSetTableBorderColor()       │
│ → setTableBorderColor()       │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│ Validate color                │
│ - Must be non-empty           │
│ - Normalize to lowercase      │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│ applyTableAttributes({        │
│   borderColor: "#ff0000"      │
│ })                            │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│ Check if cursor in table      │
│ if (!editor.isActive("table"))│
│   → Show error notification   │
│   → return false              │
└───────────┬───────────────────┘
            │ Cursor is in table
            ▼
┌───────────────────────────────┐
│ editor.chain().focus()        │
│   .updateAttributes("table", {│
│     borderColor: "#ff0000"    │
│   }).run()                    │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│ ProseMirror updates table node│
│ attrs.borderColor = "#ff0000" │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│ syncActiveTableDom({          │
│   borderColor: "#ff0000"      │
│ })                            │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│ Update DOM CSS properties:    │
│ table.style.setProperty(      │
│   "--table-border-color",     │
│   "#ff0000"                   │
│ )                             │
│                               │
│ For each cell:                │
│ cell.style.setProperty(       │
│   "--cell-border-color",      │
│   "#ff0000"                   │
│ )                             │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│ CSS re-renders with new color │
│ border-color: var(            │
│   --cell-border-color         │
│ )                             │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│ User sees color change        │
│ immediately                   │
└───────────────────────────────┘
```

---

## Data Flow: Applying Cell Background

```
User selects cells
(click and drag)
        │
        ▼
┌───────────────────────────────┐
│ ProseMirror selection state   │
│ contains multiple cells       │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│ User clicks row/column        │
│ background icon in toolbar    │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│ Color picker menu opens       │
│ - Color swatches              │
│ - Color picker                │
│ - "Clear background" button   │
└───────────┬───────────────────┘
            │
            ▼ User picks color
┌───────────────────────────────┐
│ onSetRowBackground(color)     │
│ → setRowBackground(color)     │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│ Check if in table             │
│ if (!editor.isActive("table"))│
│   → Show error                │
│   → return                    │
└───────────┬───────────────────┘
            │ In table
            ▼
┌───────────────────────────────┐
│ editor.chain().focus()        │
│   .setCellAttribute(          │
│     "backgroundColor",        │
│     "#ffeb3b"                 │
│   ).run()                     │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│ TipTap updates selected cells │
│ For each selected cell:       │
│   cell.attrs.backgroundColor  │
│     = "#ffeb3b"               │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│ CustomTableCell.renderHTML()  │
│ if (attrs.backgroundColor) {  │
│   style += "background-color: │
│     " + color + " !important;"│
│ }                             │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│ DOM updated with inline style │
│ <td style="background-color:  │
│   #ffeb3b !important;">       │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│ CSS applies background        │
│ User sees colored cells       │
└───────────────────────────────┘
```

---

## Data Flow: Row Resize

```
Table rendered
        │
        ▼
┌───────────────────────────────┐
│ Row resize plugin initializes │
│ createRowResizePlugin()       │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│ addResizeHandles(view)        │
│ - Find all tables             │
│ - For each row (except last): │
│   - Create handle div         │
│   - Attach mousedown listener │
│   - Append to row             │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│ User hovers over row border   │
│ → Handle shows blue highlight │
└───────────┬───────────────────┘
            │
            ▼ User mousedown
┌───────────────────────────────┐
│ handleMouseDown(e)            │
│ - Store resizing row          │
│ - Store startY = e.clientY    │
│ - Store startHeight           │
│ - Add mousemove listener      │
│ - Add mouseup listener        │
└───────────┬───────────────────┘
            │
            ▼ User drags
┌───────────────────────────────┐
│ handleMouseMove(e)            │
│ - Calculate deltaY            │
│ - newHeight = startHeight +   │
│   deltaY                      │
│ - Enforce minimum (30px)      │
│ - Apply to row:               │
│   row.style.height = newHeight│
│ - Apply to all cells:         │
│   cell.style.height = newHeight
└───────────┬───────────────────┘
            │
            ▼ User releases mouse
┌───────────────────────────────┐
│ handleMouseUp()               │
│ - Clear resizing row          │
│ - Remove mousemove listener   │
│ - Remove mouseup listener     │
│ - Reset cursor                │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│ Row height persisted in DOM   │
│ (not in ProseMirror attrs)    │
└───────────────────────────────┘
```

---

## Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      SimpleRichEditor.tsx                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  State:                                                         │
│  ├─ tableBorderColor                                            │
│  ├─ tableBorderWidth                                            │
│  ├─ tableBorderStyle                                            │
│  ├─ rowHighlightColor                                           │
│  └─ columnHighlightColor                                        │
│                                                                 │
│  Functions:                                                     │
│  ├─ insertTable()                                               │
│  ├─ getActiveTableElement()                                     │
│  ├─ syncActiveTableDom()                                        │
│  ├─ applyTableAttributes()                                      │
│  ├─ setTableBorderColor()                                       │
│  ├─ setTableBorderWidth()                                       │
│  ├─ setTableBorderStyle()                                       │
│  ├─ clearTableBorders()                                         │
│  ├─ setRowBackground()                                          │
│  ├─ setColumnBackground()                                       │
│  └─ Table operation functions                                   │
│                                                                 │
│  Renders:                                                       │
│  ├─ RichTextEditor (mui-tiptap)                                 │
│  ├─ EditorToolbar                                               │
│  ├─ TableDialog                                                 │
│  └─ EditorStyles                                                │
│                                                                 │
└───────┬──────────────────────────┬──────────────────────────────┘
        │                          │
        ▼                          ▼
┌───────────────────┐    ┌────────────────────┐
│  EditorToolbar    │    │   TableDialog      │
├───────────────────┤    ├────────────────────┤
│                   │    │                    │
│ Props:            │    │ Props:             │
│ - editor          │    │ - rows, cols       │
│ - tableBorder*    │    │ - borderColor      │
│ - rowHighlight*   │    │ - borderWidth      │
│ - columnHighlight*│    │ - borderStyle      │
│ - onSetTable*     │    │ - showBorders      │
│ - onSetRow*       │    │ - onInsert         │
│ - onSetColumn*    │    │ - on*Change        │
│ - onAddRow*       │    │                    │
│ - onAddColumn*    │    │ Renders:           │
│ - onDeleteRow     │    │ - Row/col inputs   │
│ - onDeleteColumn  │    │ - Border controls  │
│ - onDeleteTable   │    │ - Live preview     │
│ - onMergeCells    │    │ - Quick sizes      │
│ - onSplitCell     │    │                    │
│                   │    └────────────────────┘
│ Renders:          │
│ - Format buttons  │
│ - Table buttons   │
│ - Border menus    │
│ - Color pickers   │
│                   │
└───────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         extensions.ts                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ useEditorExtensions(placeholder, tableBorders)                  │
│   Returns array of extensions:                                 │
│   ├─ StarterKit                                                 │
│   ├─ ...                                                        │
│   ├─ CustomTable.configure({                                    │
│   │    resizable: true,                                         │
│   │    HTMLAttributes: {                                        │
│   │      class: tableBorders ?                                  │
│   │        "editor-table bordered" :                            │
│   │        "editor-table"                                       │
│   │    }                                                        │
│   │  })                                                         │
│   ├─ TableRow                                                   │
│   ├─ CustomTableHeader                                          │
│   ├─ CustomTableCell                                            │
│   └─ ...                                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       CustomTable.ts                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ CustomTable = Table.extend({                                    │
│   addAttributes() {                                             │
│     return {                                                    │
│       borderColor, borderWidth, borderStyle                     │
│     }                                                           │
│   },                                                            │
│                                                                 │
│   addProseMirrorPlugins() {                                     │
│     return [                                                    │
│       ...this.parent?.(),                                       │
│       createRowResizePlugin()                                   │
│     ]                                                           │
│   },                                                            │
│                                                                 │
│   renderHTML({ node, HTMLAttributes }) {                        │
│     // Convert attrs to CSS custom properties                   │
│     return ["table", attributes, 0]                             │
│   }                                                             │
│ })                                                              │
│                                                                 │
│ createRowResizePlugin()                                         │
│   └─ Adds resize handles to rows                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                  CustomTableCell.ts                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ CustomTableCell = TableCell.extend({                            │
│   addAttributes() {                                             │
│     return {                                                    │
│       borderColor,                                              │
│       borderWidth,                                              │
│       borderStyle,                                              │
│       backgroundColor  ← Inline style                           │
│     }                                                           │
│   },                                                            │
│                                                                 │
│   renderHTML({ node, HTMLAttributes }) {                        │
│     // Convert attrs to styles                                  │
│     return ["td", attributes, 0]                                │
│   }                                                             │
│ })                                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    EditorStyles.tsx                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ <style>{`                                                       │
│   .editor-table {                                               │
│     --table-border-color: #e0e0e0;                              │
│     --table-border-width: 2px;                                  │
│     --table-border-style: solid;                                │
│   }                                                             │
│                                                                 │
│   .editor-table.bordered td, th {                               │
│     border-color: var(--cell-border-color,                      │
│                       var(--table-border-color));               │
│     border-width: var(--cell-border-width,                      │
│                       var(--table-border-width));               │
│     border-style: var(--cell-border-style,                      │
│                       var(--table-border-style));               │
│   }                                                             │
│                                                                 │
│   .table-row-resize-handle {                                    │
│     /* Resize handle styles */                                  │
│   }                                                             │
│ `}</style>                                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## State Synchronization

```
┌─────────────────────────────────────────────────────────────────┐
│                    Three Layers of State                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. React Component State (SimpleRichEditor.tsx)                │
│     ┌─────────────────────────────────────────────────────┐    │
│     │ state = {                                           │    │
│     │   tableBorderColor: "#1e88e5",                      │    │
│     │   tableBorderWidth: "2",                            │    │
│     │   tableBorderStyle: "solid",                        │    │
│     │   ...                                               │    │
│     │ }                                                   │    │
│     └─────────────────────────────────────────────────────┘    │
│                      ▲              │                           │
│                      │              │                           │
│                      │              ▼                           │
│  2. ProseMirror Document State                                  │
│     ┌─────────────────────────────────────────────────────┐    │
│     │ doc {                                               │    │
│     │   table {                                           │    │
│     │     attrs: {                                        │    │
│     │       borderColor: "#1e88e5",                       │    │
│     │       borderWidth: "2px",                           │    │
│     │       borderStyle: "solid"                          │    │
│     │     },                                              │    │
│     │     content: [...]                                  │    │
│     │   }                                                 │    │
│     │ }                                                   │    │
│     └─────────────────────────────────────────────────────┘    │
│                      ▲              │                           │
│                      │              │                           │
│                      │              ▼                           │
│  3. DOM State                                                   │
│     ┌─────────────────────────────────────────────────────┐    │
│     │ <table class="editor-table bordered"               │    │
│     │        style="--table-border-color: #1e88e5;       │    │
│     │               --table-border-width: 2px;           │    │
│     │               --table-border-style: solid;">       │    │
│     │   <tr>                                             │    │
│     │     <td style="--cell-border-color: #1e88e5;      │    │
│     │                --cell-border-width: 2px;          │    │
│     │                border-color: var(...);            │    │
│     │                border-width: var(...);            │    │
│     │                border-style: var(...);">          │    │
│     │     </td>                                         │    │
│     │   </tr>                                           │    │
│     │ </table>                                          │    │
│     └─────────────────────────────────────────────────────┘    │
│                                                                 │
│  Synchronization Flow:                                          │
│  1. User action → Update React state                            │
│  2. Call TipTap command → Update ProseMirror state              │
│  3. renderHTML() → Update DOM                                   │
│  4. syncActiveTableDom() → Ensure CSS properties up-to-date     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Why Manual DOM Manipulation Fails

```
❌ Wrong Approach:
┌──────────────────────────────────────────────────────────────┐
│ User modifies DOM directly                                   │
│                                                              │
│ const table = document.querySelector("table");              │
│ table.style.borderColor = "red";                            │
│                                                              │
│ Problem:                                                     │
│ - ProseMirror state not updated                              │
│ - Next render will overwrite changes                         │
│ - Undo/redo won't work                                       │
│ - Content serialization breaks                               │
│                                                              │
└──────────────────────────────────────────────────────────────┘

✅ Correct Approach:
┌──────────────────────────────────────────────────────────────┐
│ User updates through TipTap API                              │
│                                                              │
│ editor.chain().focus()                                       │
│   .updateAttributes("table", { borderColor: "red" })         │
│   .run();                                                    │
│                                                              │
│ Then sync DOM:                                               │
│ syncActiveTableDom({ borderColor: "red" });                  │
│                                                              │
│ Result:                                                      │
│ ✓ ProseMirror state updated                                  │
│ ✓ DOM reflects changes                                       │
│ ✓ Undo/redo works                                            │
│ ✓ Content serialization works                                │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Extension Loading Order

```
extensions.ts → useEditorExtensions() returns:

[
  StarterKit,           ← Must come first (provides basic nodes)
  Underline,
  ...
  CustomTable,          ← Must come before TableRow
  TableRow,             ← Must come before TableCell/Header
  CustomTableHeader,    ← Order matters
  CustomTableCell,      ← Order matters
  ...
]

Why order matters:
1. TipTap registers extensions in order
2. Later extensions can depend on earlier ones
3. CustomTable defines table schema
4. TableRow, TableCell, TableHeader extend that schema
```

---

## Key Concepts Summary

| Concept | Description |
|---------|-------------|
| **ProseMirror Document** | JSON tree representing content structure |
| **TipTap Extensions** | Plugins that add functionality to the editor |
| **Node Attributes** | Custom data stored in ProseMirror nodes |
| **CSS Custom Properties** | CSS variables that cascade from table to cells |
| **renderHTML()** | Converts ProseMirror nodes to DOM |
| **parseHTML()** | Converts DOM back to ProseMirror nodes |
| **Commands** | Functions that modify the editor state |
| **Plugins** | Low-level ProseMirror extensions |

---

**Last Updated:** 2025-10-13
**Version:** 1.0
