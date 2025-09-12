# Dynamic Blocks System

A React-based dynamic block system with auto-resize functionality, drag & drop, and comprehensive admin controls.

## Features

### 🎨 Dynamic Styling

- **Style Presets**: Modern, Minimal, Glass, Neon, Gradient, Dark
- **Animations**: Bounce, Pulse, Rotate
- **Corners**: Rounded or Square
- **Elevation**: Shadow or Flat
- **Borders**: With or without borders
- **Backgrounds**: Images, Solid colors, Gradients

### 🔧 Interactive Features

- **Hero Carousel**: Auto-rotate, manual navigation, dot indicators
- **Drag & Drop**: Reorder blocks by dragging
- **Resize Handles**: 8-directional manual resizing
- **Double-click Reset**: Reset card size to auto
- **Admin Controls**: Real-time style customization

### 📱 Responsive Design

- **CSS Grid**: Auto-fit with minmax for dynamic sizing
- **Breakpoints**:
  - Desktop: `minmax(220px, 1fr)`
  - Tablet: `minmax(180px, 1fr)`
  - Mobile: `1fr` (single column)

### ♿ Accessibility

- ARIA labels for carousel
- Semantic HTML structure
- Keyboard navigation support
- Screen reader friendly
- Focus management

## Components

### HeroCarousel

- Image slideshow with navigation
- Auto-rotate functionality
- Dot indicators
- Previous/Next buttons

### DynamicBlock

- Individual block component
- Supports multiple background types
- Resize handles (8 directions)
- Drag & drop capability
- Double-click reset

### AdminControls

- Style preset selection
- Animation controls
- Border and elevation options
- Background type selection
- Feature toggles (auto-rotate, resize handles, drag & drop)

## Usage

1. **Start Development Server**:

   ```bash
   npm run dev
   ```

2. **Customize Styles**:

   - Use the admin panel to change style presets
   - Toggle animations, borders, and backgrounds
   - Enable/disable interactive features

3. **Interact with Blocks**:
   - Drag blocks to reorder them
   - Use resize handles to manually resize cards
   - Double-click cards to reset their size
   - Toggle auto-rotate for the hero carousel

## Implementation Details

### State Management

- React hooks for component state
- Centralized style settings
- Block data with unique IDs
- Drag & drop state tracking

### CSS Architecture

- CSS Custom Properties for theming
- CSS Grid for responsive layout
- Flexbox for component alignment
- Media queries for breakpoints

### Performance Optimizations

- Efficient re-rendering with React keys
- CSS transforms for animations
- Debounced event handlers
- Memory leak prevention

## File Structure

```
src/
├── App.tsx              # Main application component
├── App.css              # App-specific styles
├── index.css            # Global styles and CSS variables
├── index.html           # HTML template
└── main.tsx             # React entry point
```

## Browser Support

- Modern browsers with CSS Grid support
- ES6+ JavaScript features
- CSS Custom Properties
- Flexbox support

## Customization

The system is highly customizable through:

1. **CSS Variables**: Modify colors, spacing, and other design tokens
2. **Style Presets**: Add new style combinations
3. **Animation Classes**: Create custom animations
4. **Block Data**: Add/remove blocks and customize content
5. **Admin Controls**: Extend the control panel with new options

## Requirements Met

✅ **Dynamic Blocks**: Auto-resize with CSS Grid  
✅ **Manual Resizing**: 8-directional resize handles  
✅ **Style Options**: Rounded, shadow, flat, borders  
✅ **Background Types**: Images, solid colors, gradients  
✅ **Admin Controls**: Real-time style customization  
✅ **Responsive Design**: Works on all screen sizes  
✅ **Interactive Features**: Drag & drop, resize, reset  
✅ **Hero Carousel**: Auto-rotate and manual navigation

The implementation fully matches the design requirements and provides a flexible, admin-configurable dynamic block system.
