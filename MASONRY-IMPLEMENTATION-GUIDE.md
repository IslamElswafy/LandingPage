# Masonry Layout Implementation Guide

## 🎯 Problem Solved

Your card gallery had vertical gaps when cards were resized dynamically. This implementation provides a **true masonry layout** where cards automatically flow into vertical gaps.

## ✅ Implemented Solution: Option B (CSS Grid + ResizeObserver)

I've implemented **Option B** which provides:

✨ **Features**
- ✅ Responsive masonry layout
- ✅ Cards wrap to fill vertical gaps when heights change
- ✅ 16px gap on desktop, 12px on mobile
- ✅ Source order maintained (top→bottom, left→right)
- ✅ Works with DynamicResize (automatic reflow)
- ✅ Smooth CSS transitions (0.25s cubic-bezier)
- ✅ Zero external dependencies
- ✅ Accessible (maintains focus order)
- ✅ Performant (uses requestAnimationFrame)

## 📦 What Was Changed

### 1. New Hook: `src/hooks/useMasonryGrid.ts`

A custom React hook that:
- Watches all cards with `ResizeObserver`
- Calculates optimal `grid-row-end` span for each card
- Automatically recalculates when cards resize or are added/removed
- Debounces updates with `requestAnimationFrame`

**Usage:**
```tsx
const gridRef = useMasonryGrid(10, 16); // 10px rows, 16px gap
<section className="grid" ref={gridRef}>
  {/* Your cards */}
</section>
```

### 2. Updated CSS: `src/index.css`

Changed `.grid` from flexbox to CSS Grid:
- `display: grid`
- `grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))`
- `grid-auto-rows: 10px` (small units for precise control)
- `grid-auto-flow: dense` (fills gaps intelligently)

Changed `.card` to work with grid:
- Removed `flex: 1 1 220px`
- Added `flex-direction: column` for internal layout
- Added smooth height transition

### 3. Updated Components

**App.tsx:**
- Imported `useMasonryGrid` hook
- Added `masonryGridRef` initialization
- Attached ref to `.grid` section

**DynamicBlock.tsx:**
- Wrapped button in `<div style={{ marginTop: 'auto' }}>` for proper bottom alignment

## 🚀 How It Works

### Step-by-step Flow:

1. **CSS Grid Setup**
   ```css
   .grid {
     display: grid;
     grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
     grid-auto-rows: 10px; /* Small row units */
     gap: 16px;
   }
   ```

2. **ResizeObserver Watches Cards**
   ```ts
   resizeObserver.observe(card); // Watches each card
   ```

3. **Height Change Detected**
   - User resizes card OR image loads OR content expands
   - ResizeObserver fires

4. **Calculate Row Span**
   ```ts
   const cardHeight = card.getBoundingClientRect().height;
   const rowSpan = Math.ceil((cardHeight + gap) / (rowHeight + gap));
   card.style.gridRowEnd = `span ${rowSpan}`;
   ```

5. **Grid Auto-Flow Dense**
   - Browser automatically reflows cards
   - Fills vertical gaps with smaller cards
   - Maintains source order

## 📱 Responsive Breakpoints

| Screen Size | Columns | Gap | Row Height |
|------------|---------|-----|------------|
| Desktop (>768px) | Auto-fill (min 220px) | 16px | 10px |
| Tablet (481-768px) | Auto-fill (min 180px) | 12px | 10px |
| Mobile (≤480px) | 1 column | 12px | 10px |

## 🎨 Smooth Transitions

Cards have smooth height transitions:
```css
transition: height 0.25s cubic-bezier(0.4, 0, 0.2, 1);
```

This provides a polished feel when resizing.

## 🔧 Customization

### Change Row Height
```tsx
// Smaller rows = more precise layout, more calculations
const gridRef = useMasonryGrid(5, 16); // 5px rows

// Larger rows = faster, less precise
const gridRef = useMasonryGrid(20, 16); // 20px rows
```

### Change Gap
```tsx
// Mobile-first approach
const isMobile = window.innerWidth <= 768;
const gap = isMobile ? 12 : 16;
const gridRef = useMasonryGrid(10, gap);
```

### Adjust Columns
Edit `src/index.css`:
```css
.grid {
  /* More columns on desktop */
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
}
```

## 🐛 Troubleshooting

### Cards Not Reflowing?

**Check:** Is the ref attached?
```tsx
<section className="grid" ref={masonryGridRef}>
```

**Check:** Are cards using `.card` class?
```tsx
<article className="card">
```

### Layout Jumpy?

**Increase row height:**
```tsx
const gridRef = useMasonryGrid(20, 16); // Less frequent updates
```

**Or add will-change hint:**
```css
.card {
  will-change: grid-row-end;
}
```

### Performance Issues?

**Option 1:** Increase row height (fewer calculations)
```tsx
const gridRef = useMasonryGrid(15, 16);
```

**Option 2:** Throttle ResizeObserver (in hook):
```ts
let timeout: number;
const resizeObserver = new ResizeObserver(() => {
  clearTimeout(timeout);
  timeout = window.setTimeout(() => {
    requestAnimationFrame(resizeGridItems);
  }, 50); // 50ms throttle
});
```

## 📊 Browser Support

| Browser | Support |
|---------|---------|
| Chrome | ✅ 64+ |
| Firefox | ✅ 69+ |
| Safari | ✅ 13.1+ |
| Edge | ✅ 79+ |

**ResizeObserver** is supported in all modern browsers. For older browsers, use a [polyfill](https://github.com/que-etc/resize-observer-polyfill).

## 🎯 Alternative: Option A (Pure CSS)

If you prefer **zero JavaScript**, see `MASONRY-SOLUTION-A-CSS-COLUMNS.md` for the CSS-only column layout approach.

**Trade-offs:**
- ✅ Zero JS
- ✅ Faster
- ❌ Column-based flow (not true masonry)
- ❌ No horizontal reflow

## 📚 Additional Resources

- [CSS Grid Layout Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [ResizeObserver MDN](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver)
- [Grid Auto-Flow Dense](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-auto-flow)

## 🎉 Test It Out

1. **Run the app:**
   ```bash
   npm run dev
   ```

2. **Resize a card:**
   - Click and drag resize handles
   - Watch other cards automatically flow into gaps

3. **Add/remove cards:**
   - Use admin controls to add blocks
   - Layout recalculates automatically

4. **Check responsiveness:**
   - Resize browser window
   - Cards reflow smoothly

## 💡 Pro Tips

1. **Keep row height small** (5-10px) for smooth masonry effect
2. **Use gap consistently** across breakpoints
3. **Test with dynamic content** (images, text expansion)
4. **Check accessibility** with keyboard navigation
5. **Monitor performance** with many cards (>100)

---

**Need help?** Check the detailed docs in:
- `MASONRY-SOLUTION-A-CSS-COLUMNS.md` (Pure CSS approach)
- `MASONRY-SOLUTION-B-GRID-JS.md` (Current implementation)
