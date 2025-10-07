import React from "react";
import type { CSSProperties } from "react";

type BorderSide = "top" | "right" | "bottom" | "left";
type CornerSide = "top-left" | "top-right" | "bottom-right" | "bottom-left";

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
  styleSettings?: StyleSettings;
  content?: string;
  contentImage?: string;
  contentType?: "text" | "image" | "both";
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
  cornerSides?: CornerSide[];
  opacity?: number;
  elevation: string;
  border: string;
  background: string;
  borderSides?: BorderSide[];
  borderColor?: string;
  borderWidth?: number;
}

const DEFAULT_BORDER_SIDES: BorderSide[] = ["top", "right", "bottom", "left"];
const BORDER_SIDE_PROPERTIES: Record<BorderSide, keyof CSSProperties> = {
  top: "borderTop",
  right: "borderRight",
  bottom: "borderBottom",
  left: "borderLeft",
};
const DEFAULT_CORNER_SIDES: CornerSide[] = [
  "top-left",
  "top-right",
  "bottom-right",
  "bottom-left",
];
const CORNER_SIDE_PROPERTIES: Record<CornerSide, keyof CSSProperties> = {
  "top-left": "borderTopLeftRadius",
  "top-right": "borderTopRightRadius",
  "bottom-right": "borderBottomRightRadius",
  "bottom-left": "borderBottomLeftRadius",
};

// Clean Hero Carousel Component (without admin controls)
const CleanHeroCarousel = ({
  autoRotate,
  isVisible,
  images,
}: {
  autoRotate: boolean;
  isVisible: boolean;
  images: CarouselImage[];
}) => {
  const [currentSlide, setCurrentSlide] = React.useState(0);

  React.useEffect(() => {
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

  if (!isVisible) {
    return null;
  }

  return (
    <section className="hero rounded shadow" aria-label="Hero gallery">
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
      </div>
    </section>
  );
};

// Clean Dynamic Block Component (without admin controls)
const CleanDynamicBlock = ({
  block,
  defaultStyleSettings,
  onReadMore,
}: {
  block: BlockData;
  defaultStyleSettings: StyleSettings;
  onReadMore: (blockId: string) => void;
}) => {
  const getStyleClasses = () => {
    const classes = ["card", "resizable", "draggable"];
    const styleSettings = block.styleSettings || defaultStyleSettings;

    if (block.isManuallyResized) classes.push("manually-resized");
    if (styleSettings.stylePreset) classes.push(styleSettings.stylePreset);
    if (styleSettings.animation) classes.push(styleSettings.animation);
    if (styleSettings.corners) classes.push(styleSettings.corners);
    if (styleSettings.elevation) classes.push(styleSettings.elevation);
    if (styleSettings.border) classes.push(styleSettings.border);
    if (styleSettings.background) classes.push(styleSettings.background);

    return classes.join(" ");
  };

  const getBlockStyle = (): CSSProperties => {
    const styleSettings = block.styleSettings || defaultStyleSettings;
    const baseStyle = getBackgroundStyle(styleSettings);
    const sizeStyle = block.isManuallyResized
      ? {
          width: block.width ? `${block.width}px` : "auto",
          height: block.height ? `${block.height}px` : "auto",
          position: "relative" as const,
          zIndex: 10,
        }
      : {};
    const opacity =
      styleSettings.opacity !== undefined ? styleSettings.opacity / 100 : 1;

    return {
      ...baseStyle,
      ...sizeStyle,
      opacity,
      ...getCornerStyle(styleSettings),
      ...getBorderStyle(styleSettings),
    };
  };

  const getBackgroundStyle = (
    styleSettings: StyleSettings
  ): CSSProperties => {
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

  const getBorderStyle = (styleSettings: StyleSettings): CSSProperties => {
    if (styleSettings.border !== "with-border") {
      return { border: "none" };
    }

    const activeSides =
      styleSettings.borderSides && styleSettings.borderSides.length > 0
        ? styleSettings.borderSides
        : DEFAULT_BORDER_SIDES;
    const borderColor = styleSettings.borderColor || "#111111";
    const borderWidth = styleSettings.borderWidth ?? 1;
    const borderValue = `${borderWidth}px solid ${borderColor}`;

    const styles: CSSProperties = {};
    DEFAULT_BORDER_SIDES.forEach((side) => {
      const prop = BORDER_SIDE_PROPERTIES[side];
      styles[prop] = activeSides.includes(side) ? borderValue : "none";
    });

    return styles;
  };

  const getCornerStyle = (styleSettings: StyleSettings): CSSProperties => {
    if (styleSettings.corners !== "rounded") {
      return { borderRadius: "0" };
    }

    const activeCorners =
      styleSettings.cornerSides && styleSettings.cornerSides.length > 0
        ? styleSettings.cornerSides
        : DEFAULT_CORNER_SIDES;

    const styles: CSSProperties = {};
    DEFAULT_CORNER_SIDES.forEach((corner) => {
      const prop = CORNER_SIDE_PROPERTIES[corner];
      styles[prop] = activeCorners.includes(corner)
        ? "var(--radius)"
        : "0";
    });

    return styles;
  };

  return (
    <article
      className={getStyleClasses()}
      style={getBlockStyle()}
      onClick={() => onReadMore(block.id)}
    >
      <span className="tag">{block.tag}</span>
      <button
        className="cta"
        onClick={(e) => {
          e.stopPropagation();
          onReadMore(block.id);
        }}
      >
        Read More
      </button>
    </article>
  );
};

// Block Content Viewer Modal Component (clean version)
const CleanBlockContentViewModal = ({
  block,
  isOpen,
  onClose,
}: {
  block: BlockData | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen || !block) return null;

  const formatContent = (content: string) => {
    // If content contains HTML tags (from Tiptap), return as is
    if (content.includes("<")) {
      return content;
    }

    // Otherwise, apply basic markdown formatting for backward compatibility
    return content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br/>");
  };

  return (
    <div className="modal-overlay">
      <div className="block-viewer-modal">
        <button className="modal-close" onClick={onClose}>
          ×
        </button>

        <div className="modal-header">
          <h2>{block.tag}</h2>
        </div>

        <div className="content-viewer">
          {!block.content && !block.contentImage ? (
            <div className="no-content">
              <p>No content available for this block.</p>
            </div>
          ) : (
            <>
              {(block.contentType === "image" ||
                block.contentType === "both") &&
                block.contentImage && (
                  <div className="content-image">
                    <img
                      src={block.contentImage}
                      alt={`${block.tag} content`}
                    />
                  </div>
                )}

              {(block.contentType === "text" || block.contentType === "both") &&
                block.content && (
                  <div
                    className="content-text"
                    dangerouslySetInnerHTML={{
                      __html: formatContent(block.content),
                    }}
                  />
                )}
            </>
          )}
        </div>

        <div className="modal-actions">
          <button className="close-btn" onClick={onClose}>
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Clean Landing Page Component
const CleanLandingPage = ({
  blocks,
  styleSettings,
  autoRotate,
  heroVisible,
  heroImages,
  onReadMore,
  onCloseModal,
  selectedBlockForModal,
  blockViewModalOpen,
}: {
  blocks: BlockData[];
  styleSettings: StyleSettings;
  autoRotate: boolean;
  heroVisible: boolean;
  heroImages: CarouselImage[];
  onReadMore: (blockId: string) => void;
  onCloseModal: () => void;
  selectedBlockForModal: BlockData | null;
  blockViewModalOpen: boolean;
}) => {
  return (
    <div className="clean-landing-page">
      <CleanHeroCarousel
        autoRotate={autoRotate}
        isVisible={heroVisible}
        images={heroImages}
      />

      <section className="grid" id="grid">
        {blocks.map((block) => (
          <CleanDynamicBlock
            key={block.id}
            block={block}
            defaultStyleSettings={styleSettings}
            onReadMore={onReadMore}
          />
        ))}
      </section>

      <CleanBlockContentViewModal
        block={selectedBlockForModal}
        isOpen={blockViewModalOpen}
        onClose={onCloseModal}
      />
    </div>
  );
};

export default CleanLandingPage;
