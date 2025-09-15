import React from "react";

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
  elevation: string;
  border: string;
  background: string;
}

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
    const styleSettings = block.styleSettings || defaultStyleSettings;
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
