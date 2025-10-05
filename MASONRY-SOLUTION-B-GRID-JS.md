# Option B: CSS Grid Masonry with ResizeObserver

This solution uses CSS Grid with auto-flow dense and JavaScript to calculate row spans dynamically. Cards maintain source order and flow into vertical gaps.

## Installation

No external dependencies needed - uses native browser APIs.

## Step 1: Create the Masonry Hook

Create `src/hooks/useMasonryGrid.ts`:

```typescript
import { useEffect, useRef } from 'react';

/**
 * Masonry grid hook using CSS Grid + ResizeObserver
 * - Cards maintain source order (top-to-bottom, left-to-right)
 * - Automatically fills vertical gaps when cards resize
 * - Uses ResizeObserver to detect height changes
 */
export function useMasonryGrid(
  rowHeight: number = 10, // Base row height in pixels
  gap: number = 16 // Gap between cards
) {
  const gridRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    /**
     * Calculate how many rows each card should span
     * based on its current height
     */
    const resizeGridItems = () => {
      const cards = grid.querySelectorAll<HTMLElement>('.card');

      cards.forEach(card => {
        const cardHeight = card.getBoundingClientRect().height;
        // Calculate row span: (card height + gap) / (row height + gap)
        const rowSpan = Math.ceil((cardHeight + gap) / (rowHeight + gap));
        // Apply the row span
        card.style.gridRowEnd = `span ${rowSpan}`;
      });
    };

    // Initial calculation
    resizeGridItems();

    // Create ResizeObserver to watch for card height changes
    const resizeObserver = new ResizeObserver(entries => {
      // Debounce to avoid excessive recalculations
      requestAnimationFrame(() => {
        resizeGridItems();
      });
    });

    // Observe all cards
    const cards = grid.querySelectorAll('.card');
    cards.forEach(card => resizeObserver.observe(card));

    // Watch for new cards being added/removed
    const mutationObserver = new MutationObserver(() => {
      // Disconnect old observations
      resizeObserver.disconnect();

      // Re-observe all cards
      const currentCards = grid.querySelectorAll('.card');
      currentCards.forEach(card => resizeObserver.observe(card));

      // Recalculate layout
      resizeGridItems();
    });

    mutationObserver.observe(grid, {
      childList: true,
      subtree: false
    });

    // Cleanup
    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [rowHeight, gap]);

  return gridRef;
}
```

## Step 2: Update CSS

Add this to your `src/index.css` (replace the existing `.grid` styles):

```css
/* ============================================
   OPTION B: CSS GRID MASONRY LAYOUT
   ============================================ */

.grid {
  margin-top: 28px;
  display: grid;

  /* Auto-fill columns that are at least 220px wide */
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));

  /* Dense packing to fill gaps */
  grid-auto-flow: dense;

  /* Small base row height - JS calculates spans */
  grid-auto-rows: 10px;

  /* Gap between cards */
  gap: 16px;

  /* Align items to start of their grid area */
  align-items: start;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 12px;
    grid-auto-rows: 10px;
  }
}

@media (max-width: 480px) {
  .grid {
    /* Single column on small mobile */
    grid-template-columns: 1fr;
    gap: 12px;
    grid-auto-rows: 10px;
  }
}

.card {
  /* Grid item properties - row span set by JS */
  position: relative;

  /* Card visual styles */
  min-height: 120px;
  padding: 14px;
  color: #fff;
  background: #111;
  border: 1px solid transparent;
  background-size: cover;
  background-position: center;
  cursor: pointer;
  box-sizing: border-box;
  border-radius: 14px;

  /* Display flex to align content at bottom */
  display: flex;
  flex-direction: column;
  justify-content: flex-end;

  /* Smooth transitions */
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    border-color 0.15s,
    height 0.25s cubic-bezier(0.4, 0, 0.2, 1); /* Smooth height changes */
}

/* Manually resized cards */
.card.manually-resized {
  border: 2px dashed rgba(59, 130, 246, 0.5) !important;
  /* Height set by React - ResizeObserver will detect and update row-span */
}

/* Full-width cards */
.card.full-width {
  /* Span all columns */
  grid-column: 1 / -1;
}

/* Hover effects */
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

/* Focus styles for accessibility */
.card:focus-visible {
  outline: 2px solid rgba(59, 130, 246, 0.8);
  outline-offset: 2px;
}
```

## Step 3: Update App.tsx

Integrate the masonry hook into your grid section:

```tsx
import { useMasonryGrid } from './hooks/useMasonryGrid';

function App() {
  // ... existing state and handlers ...

  // Initialize masonry grid hook
  const masonryRef = useMasonryGrid(10, 16); // 10px rows, 16px gap

  // ... rest of your component ...

  return (
    <div className="container" style={getPageBackgroundStyle()}>
      {/* ... navbar and other content ... */}

      {currentView === "home" && !isLiveView && (
        <>
          <HeroCarousel {...heroProps} />

          {/* Add ref to the grid section */}
          <section
            className="grid"
            id="grid"
            ref={masonryRef as React.RefObject<HTMLElement>}
          >
            {blocks.map((block) => (
              <DynamicBlock
                key={block.id}
                block={block}
                // ... rest of props ...
              />
            ))}
          </section>

          {/* ... admin controls ... */}
        </>
      )}

      {/* ... rest of your app ... */}
    </div>
  );
}
```

## How It Works

1. **CSS Grid**: Uses `grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))` for responsive columns
2. **Small Row Units**: `grid-auto-rows: 10px` creates small row units
3. **ResizeObserver**: JavaScript watches each card for height changes
4. **Dynamic Row Span**: Calculates `grid-row-end: span X` based on card height
5. **Dense Packing**: `grid-auto-flow: dense` fills gaps with smaller cards
6. **Source Order**: Cards maintain their DOM order (top→bottom, left→right)

## Features

✅ **True Masonry**: Cards flow horizontally into vertical gaps
✅ **Source Order**: Maintains left-to-right, top-to-bottom flow
✅ **Responsive**: Auto-adjusts columns based on screen width
✅ **Dynamic Resize**: Automatically reflows when cards change height
✅ **Smooth Transitions**: CSS transitions for height changes
✅ **Accessible**: Maintains keyboard navigation and focus order
✅ **Performant**: Uses `requestAnimationFrame` to batch updates

## Responsive Breakpoints

- **Desktop (>768px)**: 16px gap, min 220px column width
- **Tablet (481-768px)**: 12px gap, min 180px column width
- **Mobile (≤480px)**: 12px gap, single column

## Performance Notes

- ResizeObserver runs on the main thread but is debounced with `requestAnimationFrame`
- Layout calculations happen only when cards actually resize
- MutationObserver watches for cards being added/removed
- Minimal JavaScript - CSS Grid does the heavy lifting

## When to Use

✅ Use this if:
- You need strict source order maintained
- You want cards to flow into vertical gaps
- You need smooth reflow on dynamic height changes
- You can use modern browsers (ResizeObserver support)

❌ Don't use if:
- You need to support IE11 (no ResizeObserver)
- You want zero JavaScript
- You have thousands of cards (use virtualization instead)
