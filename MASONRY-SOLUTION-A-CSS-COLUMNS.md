# Option A: Pure CSS Masonry (CSS Columns)

This solution uses CSS multi-column layout for a masonry effect. **Caveat**: Column layout flows top-to-bottom within each column, NOT strictly in source order across all columns.

## Installation

No dependencies needed - pure CSS solution.

## CSS Implementation

Add this to your `src/index.css` file (replace the existing `.grid` styles):

```css
/* ============================================
   OPTION A: CSS COLUMNS MASONRY LAYOUT
   ============================================ */

.grid {
  margin-top: 28px;
  /* Use column-count for fixed columns or column-width for responsive */
  column-count: 3; /* Desktop: 3 columns */
  column-gap: 16px;
  /* Prevent columns from breaking awkwardly */
  orphans: 1;
  widows: 1;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .grid {
    column-count: 2; /* Tablet: 2 columns */
    column-gap: 12px;
  }
}

@media (max-width: 480px) {
  .grid {
    column-count: 1; /* Mobile: 1 column */
    column-gap: 12px;
  }
}

.card {
  /* CRITICAL: Prevent cards from breaking across columns */
  break-inside: avoid;
  page-break-inside: avoid;
  -webkit-column-break-inside: avoid;

  /* Vertical spacing between cards */
  margin-bottom: 16px;

  /* Display as block (not flex) for column layout */
  display: block;

  /* Remove flex properties - no longer needed */
  /* flex: none; */
  /* min-width: unset; */
  /* max-width: unset; */

  /* Card visual styles */
  position: relative;
  min-height: 120px;
  padding: 14px;
  color: #fff;
  background: #111;
  border: 1px solid transparent;
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s;
  background-size: cover;
  background-position: center;
  cursor: pointer;
  box-sizing: border-box;
  border-radius: 14px;
  width: 100%; /* Fill column width */
}

/* Mobile spacing */
@media (max-width: 768px) {
  .card {
    margin-bottom: 12px;
  }
}

/* Manually resized cards - height changes dynamically */
.card.manually-resized {
  border: 2px dashed rgba(59, 130, 246, 0.5) !important;
  /* Height will be set via inline styles by React */
}

/* Full-width cards (optional - breaks masonry flow) */
.card.full-width {
  /* Span all columns */
  column-span: all;
  -webkit-column-span: all;
  margin-bottom: 16px;
  width: 100%;
}

/* Smooth transitions when cards change height */
.card {
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    border-color 0.15s,
    height 0.3s ease; /* Smooth height transitions */
}

/* Card inner content should align at bottom */
.card {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
```

## How It Works

1. **Column Layout**: Browser automatically distributes cards across columns
2. **Break Inside Avoid**: Prevents cards from being split across columns
3. **Responsive**: Column count adjusts based on screen width
4. **Dynamic Heights**: When you resize a card, other cards automatically flow to fill gaps
5. **Gap Spacing**: `column-gap` provides consistent spacing (16px desktop, 12px mobile)

## Limitations

- **Source Order**: Cards flow top-to-bottom within each column, then to the next column
- **Not True Masonry**: Cards in column 1 appear before cards in column 2, even if column 2 has space at the top
- **No Horizontal Reflow**: When a card resizes, cards below it in the same column shift, but cards don't move between columns

## When to Use

✅ Use this if:
- You want zero JavaScript
- Column-based flow is acceptable for your design
- You need maximum browser compatibility
- Performance is critical (CSS-only is fastest)

❌ Don't use if:
- You need strict source order (left-to-right, top-to-bottom)
- You need cards to reflow horizontally into gaps
