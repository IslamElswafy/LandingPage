# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **React + TypeScript + Vite** landing page builder with a dynamic block-based UI system. It features a customizable masonry grid layout, rich text editing with TipTap, i18n support (English/Arabic with RTL), and an admin interface for managing blocks, navigation, footer, and page settings.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview

# Deploy to GitHub Pages
npm run deploy


## Project Architecture

### State Management Pattern
- **No external state library** - uses React hooks (`useState`, `useEffect`, `useCallback`)
- **Main state hub**: `App.tsx` contains all application state and passes handlers down to child components
- **Custom hooks**: `useNotifications`, `useMasonryGrid` for reusable logic

### Component Architecture

**App.tsx** - Central orchestrator containing:
- Block state management (`BlockData[]`)
- Style settings (global + per-block)
- Navbar, Footer, and Page background settings
- Notification system integration
- Drag-and-drop and resize state
- View routing (home/about/contact)
- Edit vs Live view modes

**Key Component Categories**:
1. **Landing Page Components** (`src/components/landing-page/`)
   - `DynamicBlock.tsx` - Individual block with drag/resize/edit capabilities
   - `HeroCarousel.tsx` - Auto-rotating hero image carousel
   - `BrandsSlider.tsx` - Animated brand logos slider
   - Control popups: `AdminControlsPopup`, `NavbarControlsPopup`, `FooterControlsPopup`, `PageBackgroundControlsPopup`
   - Modals: `BlockContentViewModal`, `ReplyModal`
   - Admin views: `ContactMessagesAdmin`, `VisitorStatistics`

2. **Rich Text Editor** (`src/components/SimpleRichEditor/`)
   - `SimpleRichEditor.tsx` - Main editor component using TipTap
   - `EditorToolbar.tsx` - Formatting controls
   - Custom extensions: `InlineImageExtension`, `CustomTable`, `CustomTableCell`, `CustomTableHeader`
   - Dialogs: `ImageDialog`, `LinkDialog`, `TableDialog`, `EmojiPicker`
   - Uses TipTap v3 with extensive extensions (see package.json)

3. **Notification System**
   - `NotificationCenter.tsx` - Slide-in panel for persistent notifications
   - `ToastNotification.tsx` - Temporary pop-up messages
   - `useNotifications.ts` - Hook managing notification/toast state

### Masonry Grid System

The project uses a **custom CSS Grid masonry layout** with automatic gap filling:

- **Hook**: `useMasonryGrid(rowHeight, gap)` in `src/hooks/useMasonryGrid.ts`
- Uses `ResizeObserver` to detect card height changes and recalculate `grid-row-end: span X`
- Cards maintain source order (top-to-bottom, left-to-right)
- Manually resized cards can span multiple columns
- Attach ref to grid container: `<section className="grid" ref={masonryGridRef}>`

**How it works**:
1. Grid uses `grid-auto-rows: 10px` (or custom rowHeight)
2. Each card's height is measured via ResizeObserver
3. Hook calculates: `rowSpan = ceil((cardHeight + gap) / (rowHeight + gap))`
4. Sets `card.style.gridRowEnd = span ${rowSpan}`
5. Automatically recalculates when cards resize or new cards added

### Internationalization (i18n)

- **Library**: `i18next` + `react-i18next`
- **Languages**: English (en), Arabic (ar)
- **RTL Support**: Auto-switches document direction via `src/i18n.ts`
- **Translation files**: `src/locales/en.json`, `src/locales/ar.json`
- Access in components: `const { t, i18n } = useTranslation()`

### Type System

All TypeScript types are centralized in `src/types/`:
- `app.ts` - Block, style, navbar, footer, page background, navigation types
- `notifications.ts` - Notification and toast types

### Drag & Resize System

**Drag-and-drop**:
- Handled in `App.tsx` via HTML5 drag events
- State: `draggedElement`, `dragOverElement`
- Reorders blocks array on drop

**Resize**:
- Mouse-based resize using `ResizeState` in `App.tsx`
- 8 resize handles per block (n, s, e, w, ne, nw, se, sw)
- Blocks can be locked to prevent resizing (`isResizeLocked`)
- Manual resize sets `isManuallyResized: true` and explicit `width`/`height`
- Full-width detection: blocks ≥85% of container width become full-width

### Block System

Each block (`BlockData`) can have:
- **Background**: image, solid color, or gradient
- **Content**: text (markdown via TipTap), image, or both
- **Style settings**: opacity, animation, corners, elevation, border
- **Resize state**: manual dimensions, locked, full-width
- Content can be viewed in modal or edited in rich text editor

### View Modes

**Edit Mode** (`isLiveView = false`):
- Shows admin controls, resize handles, drag-and-drop
- Navbar shows: Navbar/Footer/Background buttons, Save & View Live button
- Clicking blocks opens `AdminControlsPopup`

**Live View** (`isLiveView = true`):
- Clean presentation mode via `CleanLandingPage.tsx`
- No admin controls visible
- Navbar shows: Edit Page button

### GitHub Pages Deployment

- **Base path**: `/LandingPage/` (set in `vite.config.ts`)
- Deploy script: `npm run deploy` (uses `gh-pages` package)
- Builds to `dist/` and pushes to `gh-pages` branch

## BMAD-METHOD Integration

This project uses **BMAD-METHOD** for agent-based workflows (see `AGENTS.md`):
- Agents: UX Expert, Scrum Master, QA, Product Owner, Product Manager, Developer, Architect, Business Analyst
- Agent definitions: `.bmad-core/agents/`
- Core config: `.bmad-core/core-config.yaml`
- Activate agents via: "As [agent-id], ..." or "Use [Agent Title] to ..."

## File Structure Highlights

```

src/
├── App.tsx # Main orchestrator (all state, handlers)
├── main.tsx # React root
├── i18n.ts # i18n initialization + RTL logic
├── components/
│ ├── landing-page/ # Landing page UI + admin controls
│ ├── SimpleRichEditor/ # TipTap editor + extensions
│ ├── NotificationCenter.tsx
│ └── ToastNotification.tsx
├── hooks/
│ ├── useNotifications.ts # Notification state management
│ └── useMasonryGrid.ts # Masonry grid layout logic
├── types/
│ ├── app.ts # Core app types
│ └── notifications.ts # Notification types
└── locales/ # Translation files (en.json, ar.json)

````

## Common Patterns

### Adding a New Block
1. Create `BlockData` object with unique ID
2. Set `title`, `tag`, `backgroundImage`/`backgroundColor`
3. Add to `blocks` state via `setBlocks`
4. Block automatically appears in masonry grid

### Customizing Block Styles
- **Global styles**: Modify `styleSettings` in `App.tsx`
- **Per-block styles**: Set `block.styleSettings` (overrides global)
- Style options: opacity, animation, corners, elevation, border, background type

### Working with TipTap Editor
- Import extensions from `src/components/SimpleRichEditor/extensions.ts`
- Custom extensions: `InlineImageExtension`, `CustomTable`, `CustomTableCell`, `CustomTableHeader`
- Font size extension: `tiptap-extension-font-size` (v1.2.0)
- Save content as HTML string in `block.content`

### Managing Notifications
```typescript
const { showSuccess, showError, showWarning, showInfo } = useNotifications();

// Show notification + toast
showSuccess("Title", "Message", { duration: 5000, position: "top-right" });
````

## Technical Constraints

- **Vite base path**: Always use `/LandingPage/` for absolute paths in production
- **Masonry grid ref**: Must attach `masonryGridRef` to grid container for auto-layout
- **i18n direction**: Automatically handled by `i18n.ts` - do not manually set dir attribute
- **Block IDs**: Must be unique strings (currently numeric strings "1", "2", etc.)
- **Drag events**: Require `draggable` attribute and drag event handlers on elements

## MUI Integration

Uses Material-UI (`@mui/material` v7) with Emotion styling:

- Theme customization via `@emotion/react` and `@emotion/styled`
- Components used: Dialogs, Buttons, TextFields, Sliders, etc.
- Custom styled components in individual component files
