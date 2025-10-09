# Bento Grid Enhancement Plan

## 📋 Overview

Transform the current masonry grid layout into a **Bento Grid-like system** that maintains the existing dynamic flexibility while adding neat organization, symmetry, and intentional visual hierarchy.

---

## 🎯 Goals

### Primary Goals
1. **Maintain Dynamic Flexibility** - Keep the ability to add/remove/resize blocks dynamically
2. **Add Visual Organization** - Implement neat, symmetrical layouts with clear visual hierarchy
3. **Preserve Existing Features** - Keep drag-and-drop, resize, and all current functionality
4. **Enhance User Experience** - Make the grid more visually appealing and organized

### Secondary Goals
1. Enable preset Bento layouts (templates)
2. Smart auto-arrangement when adding new blocks
3. Responsive Bento patterns for different screen sizes
4. Visual grid guidelines in edit mode

---

## 🏗️ Architecture Plan

### Current System
```
Masonry Grid (Auto-flow)
├── useMasonryGrid hook
│   ├── ResizeObserver (height tracking)
│   ├── Dynamic row spanning
│   └── Auto-fill columns
├── Manual resize system
└── Drag-and-drop reordering
```

### Enhanced System (Bento-like)
```
Hybrid Bento Grid
├── Grid Layout Manager
│   ├── Layout Templates (presets)
│   ├── Smart positioning algorithm
│   └── Symmetry enforcement
├── useMasonryGrid hook (enhanced)
│   ├── Row AND column spanning
│   ├── Alignment helpers
│   └── Grid snapping
├── Manual resize system (enhanced)
│   ├── Snap-to-grid
│   ├── Symmetry suggestions
│   └── Layout preservation
└── Drag-and-drop (enhanced)
    ├── Smart drop zones
    ├── Layout templates
    └── Auto-reflow
```

---

## 📐 Design Specifications

### Grid System

#### Base Grid
- **12-column system** (industry standard, highly flexible)
- **Base unit**: 10px row height (keep existing)
- **Gap**: 16px (keep existing)
- **Breakpoints**:
  - Desktop: 12 columns
  - Tablet: 6 columns
  - Mobile: 2 columns

#### Block Size Patterns
```
Small:    1 column × 1 row unit (220px × ~150px)
Medium:   2 columns × 1 row unit (456px × ~150px)
Large:    2 columns × 2 row units (456px × ~310px)
Wide:     3 columns × 1 row unit (692px × ~150px)
Hero:     4 columns × 2 row units (928px × ~310px)
Full:     12 columns × 1+ row units (100% width)
```

### Symmetry Rules

#### Horizontal Symmetry
- Blocks align on column boundaries
- Row heights align across the grid
- Equal gaps maintained

#### Visual Balance
- Heavy blocks (hero/large) distributed evenly
- Small blocks fill gaps without cluttering
- Maximum 2 hero blocks per viewport

#### Alignment Patterns
```
Pattern 1: Centered Hero
┌──────────────────────────────────┐
│ ┌──────────┐  ┌────┐  ┌────┐    │
│ │   HERO   │  │ S1 │  │ S2 │    │
│ │          │  ├────┤  ├────┤    │
│ └──────────┘  │ S3 │  │ S4 │    │
│ ┌────┬────┬────┴────┴────┴────┐  │
│ │ M1 │ M2 │       WIDE        │  │
│ └────┴────┴───────────────────┘  │
└──────────────────────────────────┘

Pattern 2: Sidebar Layout
┌──────────────────────────────────┐
│ ┌────┐  ┌──────────────────────┐ │
│ │ S1 │  │                      │ │
│ ├────┤  │       HERO           │ │
│ │ S2 │  │                      │ │
│ ├────┤  └──────────────────────┘ │
│ │ S3 │  ┌─────────┬──────────┐  │
│ ├────┤  │  MED 1  │  MED 2   │  │
│ │ S4 │  └─────────┴──────────┘  │
│ └────┘                           │
└──────────────────────────────────┘

Pattern 3: Alternating Grid
┌──────────────────────────────────┐
│ ┌─────────┬─────────┬─────────┐  │
│ │  MED 1  │  MED 2  │  MED 3  │  │
│ └─────────┴─────────┴─────────┘  │
│ ┌──────────┬────┬────┬─────────┐ │
│ │   HERO   │ S1 │ S2 │  LARGE  │ │
│ │          ├────┼────┤         │ │
│ └──────────┘ S3 │ S4 └─────────┘ │
│ ┌──────────────────────────────┐ │
│ │          FULL WIDTH          │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

---

## 🛠️ Implementation Tasks

### Phase 1: Foundation (Essential)

#### Task 1.1: Enhanced Block Type System
- [ ] Add `blockSize` property to `BlockData` type
  - Options: `'small' | 'medium' | 'large' | 'wide' | 'hero' | 'full'`
- [ ] Add `gridPosition` property: `{ column: number, row: number, colSpan: number, rowSpan: number }`
- [ ] Add `layoutPattern` to app state: `'auto' | 'centered' | 'sidebar' | 'alternating' | 'custom'`
- [ ] Update TypeScript types in `src/types/app.ts`

**File**: `src/types/app.ts`
```typescript
export type BlockSize = 'small' | 'medium' | 'large' | 'wide' | 'hero' | 'full';

export interface GridPosition {
  column: number;      // Starting column (1-12)
  row: number;         // Starting row
  colSpan: number;     // Number of columns to span
  rowSpan: number;     // Number of rows to span
}

export interface BlockData {
  // ... existing properties
  blockSize?: BlockSize;
  gridPosition?: GridPosition;
  autoPosition?: boolean;  // If true, use auto-layout
}

export type LayoutPattern = 'auto' | 'centered' | 'sidebar' | 'alternating' | 'custom';
```

#### Task 1.2: Grid Layout Manager Hook
- [ ] Create `src/hooks/useGridLayoutManager.ts`
- [ ] Implement layout pattern algorithms
- [ ] Add block positioning calculator
- [ ] Add symmetry validation
- [ ] Add layout template presets

**File**: `src/hooks/useGridLayoutManager.ts`
```typescript
export function useGridLayoutManager(
  blocks: BlockData[],
  layoutPattern: LayoutPattern = 'auto'
) {
  // Returns:
  // - calculatePositions(): GridPosition[]
  // - getLayoutTemplate(pattern): Template
  // - validateSymmetry(): boolean
  // - suggestPosition(blockSize): GridPosition
}
```

#### Task 1.3: Enhanced Masonry Hook
- [ ] Update `src/hooks/useMasonryGrid.ts`
- [ ] Add column spanning support (currently only row span)
- [ ] Add grid snapping functionality
- [ ] Add alignment helpers
- [ ] Keep backward compatibility

**Updates**:
- Lines 46-57: Add column span calculation
- Add snap-to-grid option
- Add alignment detection

#### Task 1.4: CSS Grid Enhancements
- [ ] Update `.grid` class in `src/index.css` (line 911)
- [ ] Add grid template areas support
- [ ] Add visual grid guides for edit mode
- [ ] Add size class modifiers (`.card-small`, `.card-hero`, etc.)

**File**: `src/index.css` (starting line 911)
```css
.grid {
  /* Existing properties */
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-auto-rows: 10px;
  gap: var(--gap, 16px);

  /* New: Enable subgrid if needed */
  grid-auto-flow: dense;

  /* Edit mode: show grid guides */
  &.show-grid-guides {
    background-image:
      repeating-linear-gradient(
        to right,
        rgba(59, 130, 246, 0.1) 0,
        rgba(59, 130, 246, 0.1) 1px,
        transparent 1px,
        transparent calc(100% / 12)
      );
  }
}

/* Block size classes */
.card-small { grid-column: span 1; }
.card-medium { grid-column: span 2; }
.card-large { grid-column: span 2; }
.card-wide { grid-column: span 3; }
.card-hero { grid-column: span 4; }
.card-full { grid-column: span 12; }
```

---

### Phase 2: UI Controls (User Interaction)

#### Task 2.1: Layout Pattern Selector
- [ ] Add layout selector to `AdminControlsPopup`
- [ ] Create visual previews for each pattern
- [ ] Add "Apply Layout" button
- [ ] Show before/after preview

**Location**: `src/components/landing-page/AdminControlsPopup.tsx` (add after line 1168)

#### Task 2.2: Block Size Selector
- [ ] Add size selector to block controls
- [ ] Quick size buttons (S, M, L, W, H, F)
- [ ] Visual size indicators
- [ ] Size preview on hover

#### Task 2.3: Grid Guidelines Toggle
- [ ] Add "Show Grid" checkbox to admin controls
- [ ] Toggle grid guide overlay in edit mode
- [ ] Show column numbers
- [ ] Highlight snap positions

#### Task 2.4: Smart Resize Enhancements
- [ ] Add snap-to-grid while resizing (modify line 1057-1194 in App.tsx)
- [ ] Show size label during resize ("Small → Medium")
- [ ] Suggest symmetrical positions
- [ ] Auto-adjust neighboring blocks

---

### Phase 3: Smart Features (Intelligence)

#### Task 3.1: Auto-Layout Algorithm
- [ ] Implement smart block placement
- [ ] Balance visual weight
- [ ] Maintain symmetry rules
- [ ] Fill gaps intelligently

**Algorithm**:
1. Sort blocks by size (hero → large → medium → small)
2. Place hero blocks first (centered or distributed)
3. Fill medium blocks around heroes
4. Use small blocks to fill remaining gaps
5. Validate symmetry and adjust

#### Task 3.2: Layout Templates
- [ ] Create 5 preset templates
  - Auto (current behavior)
  - Centered (hero in center)
  - Sidebar (small blocks on left)
  - Alternating (zigzag pattern)
  - Magazine (editorial style)
- [ ] Save/load custom templates
- [ ] Template preview thumbnails

#### Task 3.3: Drag-and-Drop Smart Zones
- [ ] Highlight valid drop zones
- [ ] Show layout impact preview
- [ ] Suggest alternative positions
- [ ] Auto-reflow after drop

#### Task 3.4: Responsive Patterns
- [ ] Define mobile/tablet/desktop layouts
- [ ] Auto-adjust block sizes per breakpoint
- [ ] Maintain visual hierarchy
- [ ] Test on all devices

---

### Phase 4: Polish & Optimization

#### Task 4.1: Animations
- [ ] Smooth layout transitions
- [ ] Block movement animations
- [ ] Resize animations
- [ ] Grid guide fade in/out

#### Task 4.2: Performance
- [ ] Optimize position calculations
- [ ] Debounce layout recalculations
- [ ] Lazy render off-screen blocks
- [ ] Memoize layout computations

#### Task 4.3: Accessibility
- [ ] Keyboard navigation for layout patterns
- [ ] Screen reader announcements for layout changes
- [ ] Focus management during reflow
- [ ] Reduced motion support

#### Task 4.4: Documentation
- [ ] Update CLAUDE.md with new features
- [ ] Add layout pattern examples
- [ ] Document block size system
- [ ] Add troubleshooting guide

---

## 🎨 Visual Design Mockups

### Edit Mode with Grid Guides
```
┌────────────────────────────────────────────────────┐
│ Navbar [⚙️ Layout: Centered ▼] [□ Show Grid]      │
├────────────────────────────────────────────────────┤
│  1   2   3   4   5   6   7   8   9  10  11  12    │ ← Column numbers
├───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┤
│   │   │ ┌─────────┐   │   │ ┌───┐ ┌───┐   │   │
│   │   │ │ HERO    │   │   │ │S1 │ │S2 │   │   │
│   │   │ │  [H]    │   │   │ ├───┤ ├───┤   │   │
│   │   │ │ 4×2     │   │   │ │S3 │ │S4 │   │   │
│   │   │ └─────────┘   │   │ └───┘ └───┘   │   │
│   │   │   (centered)  │   │   (small)     │   │
├───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┤
│ └─ Grid guides (only visible in edit mode) ─┘  │
└────────────────────────────────────────────────────┘
```

### Block Size Selector UI
```
┌─────────────────────────────────────┐
│ ✏️ Block Settings                    │
├─────────────────────────────────────┤
│                                     │
│ Block Size:                         │
│  [S] [M] [L] [W] [H] [Full Width]  │
│   ●   ○   ○   ○   ○      ○         │
│                                     │
│ Preview:                            │
│ ┌─────┐                             │
│ │ 1×1 │  Small block                │
│ └─────┘  ~220×150px                 │
│                                     │
│ ✓ Auto-position                     │
│ ⚡ Snap to grid                     │
│                                     │
└─────────────────────────────────────┘
```

---

## 📊 Success Metrics

### Functional Metrics
- [ ] All blocks snap to 12-column grid
- [ ] Layout patterns apply correctly
- [ ] Responsive behavior works on all devices
- [ ] Drag-and-drop maintains layout integrity
- [ ] Resize snaps to grid boundaries

### Visual Metrics
- [ ] Symmetrical appearance achieved
- [ ] Clear visual hierarchy
- [ ] No awkward gaps or overlaps
- [ ] Smooth animations
- [ ] Grid guides visible in edit mode

### Performance Metrics
- [ ] Layout calculation < 16ms (60fps)
- [ ] Smooth resize/drag operations
- [ ] No layout jank or flicker
- [ ] Fast template switching

---

## 🚀 Implementation Priority

### Must Have (MVP)
1. ✅ Enhanced block size types
2. ✅ Grid layout manager hook
3. ✅ Column spanning in masonry
4. ✅ Layout pattern selector
5. ✅ Snap-to-grid resize

### Should Have (V1.1)
6. Grid guide overlay
7. Smart auto-layout
8. Layout templates
9. Size quick-select buttons

### Nice to Have (V1.2)
10. Smart drop zones
11. Layout animations
12. Custom template saving
13. Mobile/tablet patterns

---

## 🧪 Testing Checklist

### Functional Testing
- [ ] Add block → auto-positions correctly
- [ ] Resize block → snaps to grid
- [ ] Drag block → maintains symmetry
- [ ] Change layout pattern → reflows correctly
- [ ] Delete block → remaining blocks adjust
- [ ] Full-width blocks work properly
- [ ] Mixed sizes display correctly

### Visual Testing
- [ ] Desktop: 12-column grid
- [ ] Tablet: 6-column grid
- [ ] Mobile: 2-column grid
- [ ] Grid guides align with blocks
- [ ] Gaps are consistent
- [ ] Symmetry maintained

### Cross-Browser Testing
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (macOS/iOS)
- [ ] Mobile browsers

---

## 📝 Notes & Considerations

### Backward Compatibility
- Existing blocks without `blockSize` default to `'medium'`
- Existing blocks without `gridPosition` use auto-layout
- Current masonry behavior is preserved with `layoutPattern: 'auto'`

### Migration Strategy
```typescript
// Auto-migrate existing blocks
function migrateBlock(block: BlockData): BlockData {
  return {
    ...block,
    blockSize: block.blockSize || 'medium',
    autoPosition: block.gridPosition ? false : true,
    gridPosition: block.gridPosition || calculateAutoPosition(block)
  };
}
```

### Edge Cases
1. **Overlapping blocks**: Validate positions, auto-adjust
2. **Insufficient space**: Reflow to next row
3. **Responsive collapse**: Reduce column spans on mobile
4. **Manual resize breaking pattern**: Option to "Re-apply Layout"

---

## 🔗 Related Files

### Core Files to Modify
- `src/types/app.ts` - Type definitions
- `src/App.tsx` (lines 421-423, 1057-1194) - Grid integration and resize
- `src/hooks/useMasonryGrid.ts` - Enhanced grid hook
- `src/index.css` (line 911+) - Grid styles
- `src/components/landing-page/AdminControlsPopup.tsx` (line 1168) - UI controls

### New Files to Create
- `src/hooks/useGridLayoutManager.ts` - Layout logic
- `src/utils/gridCalculations.ts` - Position calculations
- `src/components/landing-page/LayoutPatternSelector.tsx` - UI component
- `src/components/landing-page/BlockSizeSelector.tsx` - UI component

---

## 📅 Timeline Estimate

- **Phase 1 (Foundation)**: 3-4 hours
- **Phase 2 (UI Controls)**: 2-3 hours
- **Phase 3 (Smart Features)**: 4-5 hours
- **Phase 4 (Polish)**: 2-3 hours

**Total Estimate**: 11-15 hours of development time

---

## 🎯 Next Steps

1. ✅ Review this plan
2. ⏳ Confirm goals and priorities
3. ⏳ Start with Phase 1, Task 1.1
4. ⏳ Iterate and test incrementally

---

**Last Updated**: 2025-10-09
**Status**: 📋 Planning Phase
**Owner**: Development Team
