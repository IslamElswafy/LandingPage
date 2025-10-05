import { useEffect, useRef } from 'react';

/**
 * Masonry grid hook using CSS Grid + ResizeObserver
 * - Cards maintain source order (top-to-bottom, left-to-right)
 * - Automatically fills vertical gaps when cards resize
 * - Uses ResizeObserver to detect height changes
 *
 * @param rowHeight - Base row height in pixels (default: 10px)
 * @param gap - Gap between cards in pixels (default: 16px)
 * @returns Ref to attach to your grid container
 *
 * @example
 * const gridRef = useMasonryGrid(10, 16);
 * return <section className="grid" ref={gridRef}>...</section>
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
     * Calculate how many rows and columns each card should span
     * based on its current height and width
     */
    const resizeGridItems = () => {
      const cards = grid.querySelectorAll<HTMLElement>('.card');
      const gridStyles = window.getComputedStyle(grid);
      const gridTemplateColumns = gridStyles.gridTemplateColumns;
      const columnWidths = gridTemplateColumns.split(' ').map(w => parseFloat(w));
      const columnWidth = columnWidths[0] || 220; // First column width or default

      cards.forEach(card => {
        const cardRect = card.getBoundingClientRect();
        const cardHeight = cardRect.height;

        // Calculate row span: (card height + gap) / (row height + gap)
        const rowSpan = Math.ceil((cardHeight + gap) / (rowHeight + gap));
        card.style.gridRowEnd = `span ${rowSpan}`;

        // Calculate column span for manually resized cards with explicit width
        if (card.classList.contains('manually-resized') && card.style.width) {
          const explicitWidth = parseFloat(card.style.width);
          if (!isNaN(explicitWidth)) {
            // Calculate how many columns this width should span
            const columnSpan = Math.max(1, Math.round((explicitWidth + gap) / (columnWidth + gap)));
            card.style.gridColumnEnd = `span ${columnSpan}`;
          }
        } else {
          // Default: span 1 column
          card.style.gridColumnEnd = 'span 1';
        }
      });
    };

    // Initial calculation
    resizeGridItems();

    // Create ResizeObserver to watch for card height changes
    const resizeObserver = new ResizeObserver(() => {
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

    // Recalculate on window resize (for responsive breakpoints)
    const handleResize = () => {
      requestAnimationFrame(() => {
        resizeGridItems();
      });
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [rowHeight, gap]);

  return gridRef;
}
