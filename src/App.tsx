import { useState, useEffect, useRef } from "react";
import "./App.css";

// Types
interface BlockData {
  id: string;
  title: string;
  tag: string;
  backgroundImage?: string;
  backgroundColor?: string;
  isGradient?: boolean;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  isManuallyResized?: boolean;
}

interface CarouselImage {
  src: string;
  alt: string;
}

interface StyleSettings {
  stylePreset: string;
  animation: string;
  corners: string;
  elevation: string;
  border: string;
  background: string;
}

interface ResizeState {
  isResizing: boolean;
  currentBlockId: string | null;
  direction: string;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  startLeft: number;
  startTop: number;
}

// Hero Carousel Component
const HeroCarousel = ({ autoRotate }: { autoRotate: boolean }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const images: CarouselImage[] = [
    {
      src: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop",
      alt: "Golden liquid drop creating ripples",
    },
    {
      src: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1600&auto=format&fit=crop",
      alt: "Forest river winding through landscape",
    },
    {
      src: "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=1600&auto=format&fit=crop",
      alt: "Golden liquid drop creating ripples",
    },
    {
      src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600&auto=format&fit=crop",
      alt: "Forest river from above",
    },
    {
      src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop",
      alt: "Forest landscape",
    },
  ];

  useEffect(() => {
    if (!autoRotate) return;
    
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [autoRotate, images.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section className="hero rounded shadow" aria-label="Hero gallery">
      <div className="slides" role="region">
        {images.map((image, index) => (
          <img
            key={index}
            src={image.src}
            alt={image.alt}
            className={index === currentSlide ? "active" : ""}
          />
        ))}
      </div>
      <button
        className="ctrl prev"
        aria-label="Previous slide"
        onClick={prevSlide}
      >
        ‹
      </button>
      <button className="ctrl next" aria-label="Next slide" onClick={nextSlide}>
        ›
      </button>
      <div className="dots" aria-label="Slide navigation">
        {images.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === currentSlide ? "active" : ""}`}
            aria-label={`Go to slide ${index + 1}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </section>
  );
};

// Dynamic Block Component
const DynamicBlock = ({
  block,
  styleSettings,
  showHandles,
  enableDrag,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onDragEnter,
  onDragLeave,
  onDoubleClick,
  onResizeStart,
}: {
  block: BlockData;
  styleSettings: StyleSettings;
  showHandles: boolean;
  enableDrag: boolean;
  onDragStart: (e: React.DragEvent, blockId: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, blockId: string) => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDoubleClick: (blockId: string) => void;
  onResizeStart: (
    e: React.MouseEvent,
    blockId: string,
    direction: string
  ) => void;
}) => {
  const blockRef = useRef<HTMLElement>(null);
  const getStyleClasses = () => {
    const classes = ["card", "resizable", "draggable"];

    if (block.isManuallyResized) classes.push("manually-resized");
    if (styleSettings.stylePreset) classes.push(styleSettings.stylePreset);
    if (styleSettings.animation) classes.push(styleSettings.animation);
    if (styleSettings.corners) classes.push(styleSettings.corners);
    if (styleSettings.elevation) classes.push(styleSettings.elevation);
    if (styleSettings.border) classes.push(styleSettings.border);
    if (styleSettings.background) classes.push(styleSettings.background);

    return classes.join(" ");
  };

  const getBlockStyle = () => {
    const baseStyle = getBackgroundStyle();

    if (block.isManuallyResized) {
      return {
        ...baseStyle,
        width: block.width ? `${block.width}px` : "auto",
        height: block.height ? `${block.height}px` : "auto",
        position: "relative" as const,
        zIndex: 10,
      };
    }

    return baseStyle;
  };

  const getBackgroundStyle = () => {
    if (styleSettings.background === "bg-image" && block.backgroundImage) {
      return { backgroundImage: `url('${block.backgroundImage}')` };
    } else if (styleSettings.background === "bg-gradient" && block.isGradient) {
      return {
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      };
    } else if (styleSettings.background === "bg-solid") {
      return { backgroundColor: block.backgroundColor || "#111" };
    }
    return {};
  };

  return (
    <article
      ref={blockRef}
      className={getStyleClasses()}
      style={getBlockStyle()}
      draggable={enableDrag}
      onDragStart={(e) => onDragStart(e, block.id)}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, block.id)}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDoubleClick={() => onDoubleClick(block.id)}
    >
      <span className="tag">{block.tag}</span>
      <a href="#" className="cta">
        Read More
      </a>

      {/* Resize handles */}
      {showHandles && (
        <>
          <div
            className="resize-handle se"
            onMouseDown={(e) => onResizeStart(e, block.id, "se")}
          ></div>
          <div
            className="resize-handle sw"
            onMouseDown={(e) => onResizeStart(e, block.id, "sw")}
          ></div>
          <div
            className="resize-handle ne"
            onMouseDown={(e) => onResizeStart(e, block.id, "ne")}
          ></div>
          <div
            className="resize-handle nw"
            onMouseDown={(e) => onResizeStart(e, block.id, "nw")}
          ></div>
          <div
            className="resize-handle e"
            onMouseDown={(e) => onResizeStart(e, block.id, "e")}
          ></div>
          <div
            className="resize-handle w"
            onMouseDown={(e) => onResizeStart(e, block.id, "w")}
          ></div>
          <div
            className="resize-handle n"
            onMouseDown={(e) => onResizeStart(e, block.id, "n")}
          ></div>
          <div
            className="resize-handle s"
            onMouseDown={(e) => onResizeStart(e, block.id, "s")}
          ></div>
        </>
      )}
    </article>
  );
};

// Admin Controls Component
const AdminControls = ({
  styleSettings,
  onStyleChange,
  autoRotate,
  onAutoRotateChange,
  showHandles,
  onShowHandlesChange,
  enableDrag,
  onEnableDragChange,
  onResetAllCards,
}: {
  styleSettings: StyleSettings;
  onStyleChange: (key: keyof StyleSettings, value: string) => void;
  autoRotate: boolean;
  onAutoRotateChange: (value: boolean) => void;
  showHandles: boolean;
  onShowHandlesChange: (value: boolean) => void;
  enableDrag: boolean;
  onEnableDragChange: (value: boolean) => void;
  onResetAllCards: () => void;
}) => {
  return (
    <div className="panel">
      <h3>Dynamic Block Controls</h3>
      <p>These blocks must be dynamic and auto-resize - a small challenge!</p>

      <div className="control-group">
        <label>Style Preset:</label>
        <select
          value={styleSettings.stylePreset}
          onChange={(e) => onStyleChange("stylePreset", e.target.value)}
        >
          <option value="">Default</option>
          <option value="style-modern">Modern</option>
          <option value="style-minimal">Minimal</option>
          <option value="style-glass">Glass</option>
          <option value="style-neon">Neon</option>
          <option value="style-gradient">Gradient</option>
          <option value="style-dark">Dark</option>
        </select>

        <label>Animation:</label>
        <select
          value={styleSettings.animation}
          onChange={(e) => onStyleChange("animation", e.target.value)}
        >
          <option value="">None</option>
          <option value="animate-bounce">Bounce</option>
          <option value="animate-pulse">Pulse</option>
          <option value="animate-rotate">Rotate</option>
        </select>

        <label>Corners:</label>
        <select
          value={styleSettings.corners}
          onChange={(e) => onStyleChange("corners", e.target.value)}
        >
          <option value="rounded">Rounded</option>
          <option value="">Square</option>
        </select>

        <label>Elevation:</label>
        <select
          value={styleSettings.elevation}
          onChange={(e) => onStyleChange("elevation", e.target.value)}
        >
          <option value="shadow">Shadow</option>
          <option value="flat">Flat</option>
        </select>
      </div>

      <div className="control-group">
        <label>Border:</label>
        <select
          value={styleSettings.border}
          onChange={(e) => onStyleChange("border", e.target.value)}
        >
          <option value="no-border">No border</option>
          <option value="with-border">With border</option>
        </select>

        <label>Background:</label>
        <select
          value={styleSettings.background}
          onChange={(e) => onStyleChange("background", e.target.value)}
        >
          <option value="bg-image">Image</option>
          <option value="bg-solid">Solid</option>
          <option value="bg-gradient">Gradient</option>
        </select>

        <label>
          <input
            type="checkbox"
            checked={autoRotate}
            onChange={(e) => onAutoRotateChange(e.target.checked)}
          />
          Auto-rotate hero
        </label>

        <label>
          <input
            type="checkbox"
            checked={showHandles}
            onChange={(e) => onShowHandlesChange(e.target.checked)}
          />
          Show resize handles
        </label>

        <label>
          <input
            type="checkbox"
            checked={enableDrag}
            onChange={(e) => onEnableDragChange(e.target.checked)}
          />
          Enable drag & drop
        </label>

        <button type="button" onClick={onResetAllCards}>
          Reset All Cards
        </button>
      </div>

      <p>
        <strong>Admin Note:</strong> Can add pictures background or flat or
        solid color or gradient other things as admin and these can be
        discussed.
        <strong>Tip:</strong> Double-click any card to reset its size to auto.
      </p>
    </div>
  );
};

// Main App Component
function App() {
  // State management
  const [blocks, setBlocks] = useState<BlockData[]>([
    {
      id: "1",
      title: "Innovation",
      tag: "Innovation",
      backgroundImage:
        "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop",
      isManuallyResized: false,
    },
    {
      id: "2",
      title: "Automation",
      tag: "Automation",
      backgroundImage:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop",
      isManuallyResized: false,
    },
    {
      id: "3",
      title: "Analytics",
      tag: "Analytics",
      backgroundImage:
        "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop",
      isManuallyResized: false,
    },
    {
      id: "4",
      title: "Analytics",
      tag: "Analytics",
      backgroundImage:
        "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop",
      isManuallyResized: false,
    },
    {
      id: "5",
      title: "Analytics",
      tag: "Analytics",
      backgroundImage:
        "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1200&auto=format&fit=crop",
      isManuallyResized: false,
    },
    {
      id: "6",
      title: "Flat",
      tag: "Flat",
      backgroundColor: "#000",
      isGradient: false,
      isManuallyResized: false,
    },
  ]);

  const [styleSettings, setStyleSettings] = useState<StyleSettings>({
    stylePreset: "",
    animation: "",
    corners: "rounded",
    elevation: "shadow",
    border: "no-border",
    background: "bg-image",
  });

  const [autoRotate, setAutoRotate] = useState(false);
  const [showHandles, setShowHandles] = useState(false);
  const [enableDrag, setEnableDrag] = useState(true);
  const [draggedElement, setDraggedElement] = useState<string | null>(null);
  const [dragOverElement, setDragOverElement] = useState<string | null>(null);
  const [resizeState, setResizeState] = useState<ResizeState>({
    isResizing: false,
    currentBlockId: null,
    direction: "",
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
    startLeft: 0,
    startTop: 0,
  });

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, blockId: string) => {
    setDraggedElement(blockId);
    e.currentTarget.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("dragging");
    setDraggedElement(null);
    if (dragOverElement) {
      setDragOverElement(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetBlockId: string) => {
    e.preventDefault();

    if (draggedElement && draggedElement !== targetBlockId) {
      const draggedIndex = blocks.findIndex(
        (block) => block.id === draggedElement
      );
      const targetIndex = blocks.findIndex(
        (block) => block.id === targetBlockId
      );

      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newBlocks = [...blocks];
        const [draggedBlock] = newBlocks.splice(draggedIndex, 1);
        newBlocks.splice(targetIndex, 0, draggedBlock);
        setBlocks(newBlocks);
      }
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    const blockId = blocks.find(
      (block) =>
        target.classList.contains("card") &&
        target.querySelector(".tag")?.textContent === block.tag
    )?.id;

    if (blockId && blockId !== draggedElement) {
      setDragOverElement(blockId);
      target.classList.add("drag-over");
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.classList.remove("drag-over");
    setDragOverElement(null);
  };

  const handleDoubleClick = (blockId: string) => {
    setBlocks(prev => prev.map(block => 
      block.id === blockId 
        ? { 
            ...block, 
            isManuallyResized: false, 
            width: undefined, 
            height: undefined 
          }
        : block
    ));
  };

  const handleResizeStart = (
    e: React.MouseEvent,
    blockId: string,
    direction: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    
    const element = e.currentTarget.parentElement;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    
    setResizeState({
      isResizing: true,
      currentBlockId: blockId,
      direction,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: rect.width,
      startHeight: rect.height,
      startLeft: rect.left,
      startTop: rect.top,
    });

    // Mark block as manually resized
    setBlocks(prev => prev.map(block => 
      block.id === blockId 
        ? { ...block, isManuallyResized: true }
        : block
    ));
  };

  const handleStyleChange = (key: keyof StyleSettings, value: string) => {
    setStyleSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleResetAllCards = () => {
    setBlocks(prev => prev.map(block => ({
      ...block,
      isManuallyResized: false,
      width: undefined,
      height: undefined,
    })));
  };

  // Mouse event handlers for resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeState.isResizing || !resizeState.currentBlockId) return;

      const deltaX = e.clientX - resizeState.startX;
      const deltaY = e.clientY - resizeState.startY;

      let newWidth = resizeState.startWidth;
      let newHeight = resizeState.startHeight;

      // Calculate new dimensions based on resize direction
      switch (resizeState.direction) {
        case 'e':
          newWidth = Math.max(100, resizeState.startWidth + deltaX);
          break;
        case 'w':
          newWidth = Math.max(100, resizeState.startWidth - deltaX);
          break;
        case 's':
          newHeight = Math.max(100, resizeState.startHeight + deltaY);
          break;
        case 'n':
          newHeight = Math.max(100, resizeState.startHeight - deltaY);
          break;
        case 'se':
          newWidth = Math.max(100, resizeState.startWidth + deltaX);
          newHeight = Math.max(100, resizeState.startHeight + deltaY);
          break;
        case 'sw':
          newWidth = Math.max(100, resizeState.startWidth - deltaX);
          newHeight = Math.max(100, resizeState.startHeight + deltaY);
          break;
        case 'ne':
          newWidth = Math.max(100, resizeState.startWidth + deltaX);
          newHeight = Math.max(100, resizeState.startHeight - deltaY);
          break;
        case 'nw':
          newWidth = Math.max(100, resizeState.startWidth - deltaX);
          newHeight = Math.max(100, resizeState.startHeight - deltaY);
          break;
      }

      // Update block dimensions
      setBlocks(prev => prev.map(block => 
        block.id === resizeState.currentBlockId 
          ? { ...block, width: newWidth, height: newHeight }
          : block
      ));
    };

    const handleMouseUp = () => {
      if (resizeState.isResizing) {
        setResizeState(prev => ({ ...prev, isResizing: false }));
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    if (resizeState.isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = `${resizeState.direction}-resize`;
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [resizeState]);

  return (
    <div className="container">
      <header>
        <nav>
          <a href="#" className="active">
            Home
          </a>
          <a href="#">Products</a>
          <a href="#">About</a>
          <a href="#">Contact</a>
        </nav>
      </header>

      <HeroCarousel autoRotate={autoRotate} />

      <section className="grid" id="grid">
        {blocks.map((block) => (
          <DynamicBlock
            key={block.id}
            block={block}
            styleSettings={styleSettings}
            showHandles={showHandles}
            enableDrag={enableDrag}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDoubleClick={handleDoubleClick}
            onResizeStart={handleResizeStart}
          />
        ))}
      </section>

      <AdminControls
        styleSettings={styleSettings}
        onStyleChange={handleStyleChange}
        autoRotate={autoRotate}
        onAutoRotateChange={setAutoRotate}
        showHandles={showHandles}
        onShowHandlesChange={setShowHandles}
        enableDrag={enableDrag}
        onEnableDragChange={setEnableDrag}
        onResetAllCards={handleResetAllCards}
      />
    </div>
  );
}

export default App;
