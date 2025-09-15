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
  link?: string;
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
const HeroCarousel = ({
  autoRotate,
  isVisible,
  onToggleVisibility,
}: {
  autoRotate: boolean;
  isVisible: boolean;
  onToggleVisibility: () => void;
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [pendingImage, setPendingImage] = useState<CarouselImage | null>(null);
  const [linkInputValue, setLinkInputValue] = useState("");
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(
    null
  );
  const [images, setImages] = useState<CarouselImage[]>([
    {
      src: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop",
      alt: "Golden liquid drop creating ripples",
      link: "https://unsplash.com/photos/golden-liquid-drop-creating-ripples",
    },
    {
      src: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1600&auto=format&fit=crop",
      alt: "Forest river winding through landscape",
      link: "https://unsplash.com/photos/forest-river-winding-through-landscape",
    },
    {
      src: "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=1600&auto=format&fit=crop",
      alt: "Golden liquid drop creating ripples",
      link: "https://unsplash.com/photos/another-golden-liquid-drop",
    },
    {
      src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600&auto=format&fit=crop",
      alt: "Forest river from above",
      link: "https://unsplash.com/photos/forest-river-from-above",
    },
    {
      src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop",
      alt: "Forest landscape",
      link: "https://unsplash.com/photos/forest-landscape",
    },
  ]);

  useEffect(() => {
    if (!autoRotate) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        const newImage: CarouselImage = {
          src: imageUrl,
          alt: file.name.split(".")[0] || "Uploaded image",
        };
        setPendingImage(newImage);
        setShowLinkInput(true);
        setLinkInputValue("");
      };
      reader.readAsDataURL(file);
    }
    event.target.value = "";
  };

  const handleLinkSubmit = () => {
    if (pendingImage) {
      const imageWithLink = {
        ...pendingImage,
        link: linkInputValue || undefined,
      };

      if (editingImageIndex !== null) {
        setImages((prev) =>
          prev.map((img, index) =>
            index === editingImageIndex ? imageWithLink : img
          )
        );
        setEditingImageIndex(null);
      } else {
        setImages((prev) => [...prev, imageWithLink]);
      }

      setPendingImage(null);
      setShowLinkInput(false);
      setLinkInputValue("");
    }
  };

  const handleLinkCancel = () => {
    if (editingImageIndex === null && pendingImage) {
      setImages((prev) => [...prev, pendingImage]);
    }
    setPendingImage(null);
    setShowLinkInput(false);
    setLinkInputValue("");
    setEditingImageIndex(null);
  };

  const handleEditLink = (index: number) => {
    const image = images[index];
    setPendingImage(image);
    setLinkInputValue(image.link || "");
    setEditingImageIndex(index);
    setShowLinkInput(true);
  };

  const deleteImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (currentSlide >= images.length - 1) {
      setCurrentSlide(Math.max(0, images.length - 2));
    }
  };

  if (!isVisible) {
    return (
      <section className="hero-hidden" aria-label="Hero gallery hidden">
        <button
          className="show-hero-btn"
          onClick={onToggleVisibility}
          aria-label="Show hero carousel"
          title="Show hero carousel"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span>Show Hero Carousel</span>
        </button>
      </section>
    );
  }

  return (
    <section className="hero rounded shadow" aria-label="Hero gallery">
      <button
        className="hide-hero-btn"
        onClick={onToggleVisibility}
        aria-label="Hide hero carousel"
        title="Hide hero carousel"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      </button>
      <div className="slides" role="region">
        {images.map((image, index) => (
          <div
            key={index}
            className={`slide ${index === currentSlide ? "active" : ""}`}
          >
            {image.link ? (
              <a
                href={image.link}
                target="_blank"
                rel="noopener noreferrer"
                className="image-link"
              >
                <img src={image.src} alt={image.alt} className="slide-image" />
              </a>
            ) : (
              <img src={image.src} alt={image.alt} className="slide-image" />
            )}
            <div className="slide-controls">
              <button
                className="edit-link-btn"
                aria-label={`Edit link for image ${index + 1}`}
                onClick={() => handleEditLink(index)}
                title="Edit link"
              >
                🔗
              </button>
              <button
                className="delete-btn"
                aria-label={`Delete image ${index + 1}`}
                onClick={() => deleteImage(index)}
                title="Delete this image"
              >
                ×
              </button>
            </div>
          </div>
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
      <div className="carousel-controls">
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
        <div className="upload-controls">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: "none" }}
            id="image-upload"
          />
          <label htmlFor="image-upload" className="upload-btn">
            + Add Image
          </label>
        </div>
      </div>

      {showLinkInput && (
        <div className="link-input-overlay">
          <div className="link-input-dialog">
            <h3>{editingImageIndex !== null ? "Edit Link" : "Add Link"}</h3>
            <p>Enter a URL for this image (optional):</p>
            <input
              type="url"
              value={linkInputValue}
              onChange={(e) => setLinkInputValue(e.target.value)}
              placeholder="https://example.com"
              className="link-input"
              autoFocus
            />
            <div className="dialog-buttons">
              <button onClick={handleLinkSubmit} className="submit-btn">
                {editingImageIndex !== null ? "Update" : "Add Image"}
              </button>
              <button onClick={handleLinkCancel} className="cancel-btn">
                {editingImageIndex !== null ? "Cancel" : "Skip Link"}
              </button>
            </div>
          </div>
        </div>
      )}
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
  const [heroVisible, setHeroVisible] = useState(true);
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
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === blockId
          ? {
              ...block,
              isManuallyResized: false,
              width: undefined,
              height: undefined,
            }
          : block
      )
    );
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
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === blockId ? { ...block, isManuallyResized: true } : block
      )
    );
  };

  const handleStyleChange = (key: keyof StyleSettings, value: string) => {
    setStyleSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleResetAllCards = () => {
    setBlocks((prev) =>
      prev.map((block) => ({
        ...block,
        isManuallyResized: false,
        width: undefined,
        height: undefined,
      }))
    );
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
        case "e":
          newWidth = Math.max(100, resizeState.startWidth + deltaX);
          break;
        case "w":
          newWidth = Math.max(100, resizeState.startWidth - deltaX);
          break;
        case "s":
          newHeight = Math.max(100, resizeState.startHeight + deltaY);
          break;
        case "n":
          newHeight = Math.max(100, resizeState.startHeight - deltaY);
          break;
        case "se":
          newWidth = Math.max(100, resizeState.startWidth + deltaX);
          newHeight = Math.max(100, resizeState.startHeight + deltaY);
          break;
        case "sw":
          newWidth = Math.max(100, resizeState.startWidth - deltaX);
          newHeight = Math.max(100, resizeState.startHeight + deltaY);
          break;
        case "ne":
          newWidth = Math.max(100, resizeState.startWidth + deltaX);
          newHeight = Math.max(100, resizeState.startHeight - deltaY);
          break;
        case "nw":
          newWidth = Math.max(100, resizeState.startWidth - deltaX);
          newHeight = Math.max(100, resizeState.startHeight - deltaY);
          break;
      }

      // Update block dimensions
      setBlocks((prev) =>
        prev.map((block) =>
          block.id === resizeState.currentBlockId
            ? { ...block, width: newWidth, height: newHeight }
            : block
        )
      );
    };

    const handleMouseUp = () => {
      if (resizeState.isResizing) {
        setResizeState((prev) => ({ ...prev, isResizing: false }));
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };

    if (resizeState.isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = `${resizeState.direction}-resize`;
      document.body.style.userSelect = "none";

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };
    }
  }, [resizeState]);

  return (
    <div className="container">
      <header className="apple-header">
        <div className="header-content">
          <div className="logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
          </div>
          <nav className="main-nav">
            <a href="#" className="nav-link">
              Home
            </a>

            <a href="#" className="nav-link">
              About
            </a>
            <a href="#" className="nav-link">
              Contact
            </a>
            <a href="#" className="nav-link">
              Contact
            </a>
          </nav>
          <div className="header-actions">
            <button className="search-btn" aria-label="Search">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>
            <button className="cart-btn" aria-label="Shopping bag">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <HeroCarousel
        autoRotate={autoRotate}
        isVisible={heroVisible}
        onToggleVisibility={() => setHeroVisible(!heroVisible)}
      />

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
