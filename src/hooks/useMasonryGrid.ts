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
      const cards = Array.from(
        grid.querySelectorAll<HTMLElement>('.card')
      );
      const gridStyles = window.getComputedStyle(grid);
      const gridTemplateColumns = gridStyles.gridTemplateColumns;
      const parsedColumns = gridTemplateColumns
        .split(' ')
        .map(value => parseFloat(value))
        .filter(value => Number.isFinite(value) && value > 0);
      let columnWidth = parsedColumns[0];

      // Get grid gap from computed styles
      const computedGap = parseFloat(gridStyles.columnGap || gridStyles.gap || `${gap}`) || gap;

      if (!columnWidth || !Number.isFinite(columnWidth)) {
        const referenceCard =
          cards.find(
            card =>
              !card.classList.contains('full-width') &&
              !card.classList.contains('manually-resized')
          ) ??
          cards.find(card => !card.classList.contains('full-width'));

        if (referenceCard) {
          columnWidth = referenceCard.getBoundingClientRect().width;
        }
      }

      if (!columnWidth || !Number.isFinite(columnWidth)) {
        columnWidth = 220;
      }

      console.log('[MasonryGrid] Layout calculation:', {
        columnWidth,
        gap: computedGap,
        rowHeight,
        totalCards: cards.length
      });

      cards.forEach(card => {
        const cardRect = card.getBoundingClientRect();
        let cardHeight = cardRect.height;
        const cardWidth = cardRect.width;
        const isFullWidth = card.classList.contains('full-width');
        const isManuallyResized = card.classList.contains('manually-resized');

        // For manually resized cards with explicit height, use that for calculation
        // This ensures cards with same explicit height get same row span
        let explicitHeight = 0;
        if (isManuallyResized && card.style.height) {
          explicitHeight = parseFloat(card.style.height);
          if (!isNaN(explicitHeight) && explicitHeight > 0) {
            cardHeight = explicitHeight;
          }
        }

        // Calculate row span: ceil(card height / (row height + gap))
        // This ensures cards align to grid row boundaries consistently
        // Add small epsilon to avoid rounding issues
        const rowSpan = Math.ceil((cardHeight + 0.5) / (rowHeight + computedGap));
        card.style.gridRowEnd = `span ${rowSpan}`;

        // Ensure the card height matches the row span exactly to prevent gaps
        if (isManuallyResized && explicitHeight > 0) {
          const calculatedHeight = rowSpan * (rowHeight + computedGap) - computedGap;
          // Only adjust if difference is significant (more than 2px)
          if (Math.abs(explicitHeight - calculatedHeight) > 2) {
            console.log('[MasonryGrid] Height mismatch detected, adjusting:', {
              explicitHeight,
              calculatedHeight,
              difference: explicitHeight - calculatedHeight,
              rowSpan
            });
            // Don't adjust - let the explicit height win
          }
        }

        if (isFullWidth) {
          card.style.gridColumnStart = '1';
          card.style.gridColumnEnd = '-1';
          console.log('[MasonryGrid] Full-width card:', {
            cardHeight,
            rowSpan
          });
          return;
        }

        // For manually resized cards, calculate column span based on actual width
        // Don't touch gridColumnStart - let CSS Grid auto-place it
        if (isManuallyResized) {
          // Get the explicit width set via inline style
          const explicitWidth = card.style.width ? parseFloat(card.style.width) : cardWidth;

          // Calculate how many columns this width should span
          // Use the explicit width to determine column span
          const calculatedSpan = Math.max(
            1,
            Math.round(explicitWidth / (columnWidth + computedGap))
          );

          // Clamp to reasonable bounds (1 to max columns in grid)
          const maxColumns = Math.floor(
            (grid.clientWidth + computedGap) / (columnWidth + computedGap)
          );
          const columnSpan = Math.min(calculatedSpan, maxColumns);

          // Set column span - CSS Grid will handle the gaps automatically
          card.style.gridColumnEnd = `span ${columnSpan}`;

          console.log('[MasonryGrid] Manually-resized card:', {
            explicitWidth,
            cardWidth,
            cardHeight,
            explicitHeight: card.style.height,
            columnWidth,
            gap: computedGap,
            calculatedSpan,
            finalColumnSpan: columnSpan,
            rowSpan,
            rowHeight,
            maxColumns
          });
        } else {
          // Default: auto-placement with 1 column span
          card.style.gridColumnStart = '';
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
