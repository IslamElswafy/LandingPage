import { useState, useEffect, useRef } from "react";
import "./App.css";
import SimpleRichEditor from "./components/SimpleRichEditor";
import CleanLandingPage from "./components/CleanLandingPage";

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

interface ContactMessage {
  id: number;
  country: string;
  type: string;
  name: string;
  email: string;
  mobile: string;
  subject: string;
  message: string;
  date: string;
  status: "pending" | "approved" | "replied" | "deleted";
}

interface VisitorData {
  id: string;
  timestamp: string;
  source: string;
  userAgent: string;
  country: string;
  ip: string;
  page: string;
}

interface VisitorStats {
  totalVisitors: number;
  todayVisitors: number;
  uniqueVisitors: number;
  topSources: { source: string; count: number }[];
  topCountries: { country: string; count: number }[];
  visitorsData: VisitorData[];
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
  images: propImages,
  onImagesChange,
}: {
  autoRotate: boolean;
  isVisible: boolean;
  onToggleVisibility: () => void;
  images?: CarouselImage[];
  onImagesChange?: (images: CarouselImage[]) => void;
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [pendingImage, setPendingImage] = useState<CarouselImage | null>(null);
  const [linkInputValue, setLinkInputValue] = useState("");
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(
    null
  );
  const [images, setImages] = useState<CarouselImage[]>(propImages || []);

  // Sync with propImages
  useEffect(() => {
    if (propImages) {
      setImages(propImages);
    }
  }, [propImages]);

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
        const newImages = images.map((img, index) =>
          index === editingImageIndex ? imageWithLink : img
        );
        setImages(newImages);
        onImagesChange?.(newImages);
        setEditingImageIndex(null);
      } else {
        const newImages = [...images, imageWithLink];
        setImages(newImages);
        onImagesChange?.(newImages);
      }

      setPendingImage(null);
      setShowLinkInput(false);
      setLinkInputValue("");
    }
  };

  const handleLinkCancel = () => {
    if (editingImageIndex === null && pendingImage) {
      const newImages = [...images, pendingImage];
      setImages(newImages);
      onImagesChange?.(newImages);
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
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesChange?.(newImages);
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
  defaultStyleSettings,
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
  onImageUpload,
  onImageDelete,
  onBlockSelect,
  isSelected,
  onReadMore,
  onDeleteBlock,
}: {
  block: BlockData;
  defaultStyleSettings: StyleSettings;
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
  onImageUpload: (blockId: string, imageUrl: string) => void;
  onImageDelete: (blockId: string) => void;
  onBlockSelect: (blockId: string) => void;
  isSelected: boolean;
  onReadMore: (blockId: string) => void;
  onDeleteBlock: (blockId: string) => void;
}) => {
  const blockRef = useRef<HTMLElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        onImageUpload(block.id, imageUrl);
      };
      reader.readAsDataURL(file);
    }
    event.target.value = "";
  };

  const handleImageDelete = () => {
    onImageDelete(block.id);
  };

  const getStyleClasses = () => {
    const classes = ["card", "resizable", "draggable"];
    const styleSettings = block.styleSettings || defaultStyleSettings;

    if (block.isManuallyResized) classes.push("manually-resized");
    if (isSelected) classes.push("selected");
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
      onClick={() => onBlockSelect(block.id)}
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

      {/* Block Image Controls */}
      <div className="block-image-controls">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: "none" }}
          id={`image-upload-${block.id}`}
        />
        <label
          htmlFor={`image-upload-${block.id}`}
          className="upload-btn-block"
        >
          📷
        </label>
        {block.backgroundImage && (
          <button
            className="delete-btn-block"
            onClick={handleImageDelete}
            title="Delete background image"
          >
            🗑️
          </button>
        )}
        <button
          className="delete-block-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteBlock(block.id);
          }}
          title="Delete this block"
        >
          ❌
        </button>
      </div>

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

// Block Content Viewer Modal Component
const BlockContentViewModal = ({
  block,
  isOpen,
  onClose,
  onEdit,
}: {
  block: BlockData | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
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
          <button className="edit-content-btn" onClick={onEdit}>
            ✏️ Edit Content
          </button>
        </div>

        <div className="content-viewer">
          {!block.content && !block.contentImage ? (
            <div className="no-content">
              <p>No content available for this block.</p>
              <button className="add-content-btn" onClick={onEdit}>
                Add Content
              </button>
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

// Block Content Modal Component
const BlockContentModal = ({
  block,
  isOpen,
  onClose,
  onSave,
}: {
  block: BlockData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    blockId: string,
    content: string,
    contentImage: string,
    contentType: "text" | "image" | "both"
  ) => void;
}) => {
  const [content, setContent] = useState("");
  const [contentImage, setContentImage] = useState("");
  const [contentType, setContentType] = useState<"text" | "image" | "both">(
    "text"
  );

  useEffect(() => {
    if (block && isOpen) {
      setContent(block.content || "");
      setContentImage(block.contentImage || "");
      setContentType(block.contentType || "text");
    }
  }, [block, isOpen]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setContentImage(imageUrl);
      };
      reader.readAsDataURL(file);
    }
    event.target.value = "";
  };

  const handleSave = () => {
    if (block) {
      onSave(block.id, content, contentImage, contentType);
      onClose();
    }
  };

  const handleCancel = () => {
    setContent("");
    setContentImage("");
    setContentType("text");
    onClose();
  };

  if (!isOpen || !block) return null;

  return (
    <div className="modal-overlay">
      <div className="block-content-modal">
        <button className="modal-close" onClick={onClose}>
          ×
        </button>

        <div className="modal-header">
          <h2>{block.tag} - Content Editor</h2>
        </div>

        <div className="content-editor">
          <div className="content-type-selector">
            <label>Content Type:</label>
            <select
              value={contentType}
              onChange={(e) =>
                setContentType(e.target.value as "text" | "image" | "both")
              }
              className="content-type-select"
            >
              <option value="text">Text Only</option>
              <option value="image">Image Only</option>
              <option value="both">Text and Image</option>
            </select>
          </div>

          {(contentType === "text" || contentType === "both") && (
            <div className="text-editor-section">
              <label htmlFor="content-text">Content Text:</label>
              <SimpleRichEditor
                content={content}
                onChange={setContent}
                placeholder="Enter your content here..."
                className="content-rich-editor"
              />
            </div>
          )}

          {(contentType === "image" || contentType === "both") && (
            <div className="image-editor-section">
              <label>Content Image:</label>
              <div className="image-upload-area">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                  id="content-image-upload"
                />
                <label
                  htmlFor="content-image-upload"
                  className="image-upload-btn"
                >
                  📷 Upload Image
                </label>
                {contentImage && (
                  <div className="image-preview">
                    <img
                      src={contentImage}
                      alt="Content preview"
                      className="preview-image"
                    />
                    <button
                      onClick={() => setContentImage("")}
                      className="remove-image-btn"
                      title="Remove image"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="save-btn" onClick={handleSave}>
            SAVE CONTENT
          </button>
          <button className="cancel-btn" onClick={handleCancel}>
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
};

// Reply Modal Component
const ReplyModal = ({
  message,
  isOpen,
  onClose,
  onSendReply,
}: {
  message: ContactMessage | null;
  isOpen: boolean;
  onClose: () => void;
  onSendReply: (replyTitle: string, replyBody: string) => void;
}) => {
  const [replyTitle, setReplyTitle] = useState("");
  const [replyBody, setReplyBody] = useState("");

  useEffect(() => {
    if (message && isOpen) {
      setReplyTitle(`Re: ${message.subject}`);
      setReplyBody("");
    }
  }, [message, isOpen]);

  const handleSend = () => {
    if (replyTitle.trim() && replyBody.trim()) {
      onSendReply(replyTitle, replyBody);
      setReplyTitle("");
      setReplyBody("");
      onClose();
    }
  };

  const handleCancel = () => {
    setReplyTitle("");
    setReplyBody("");
    onClose();
  };

  if (!isOpen || !message) return null;

  return (
    <div className="modal-overlay">
      <div className="reply-modal">
        <button className="modal-close" onClick={onClose}>
          ▲
        </button>

        <div className="modal-header">
          <h2>Reply</h2>
        </div>

        <div className="message-details">
          <div className="detail-row">
            <span className="detail-label">Type:</span>
            <span className="type-tag">{message.type}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Name:</span>
            <span className="detail-value">{message.name}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Email:</span>
            <span className="detail-value">{message.email}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Mobile:</span>
            <span className="detail-value">{message.mobile}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Body:</span>
            <span className="detail-value">{message.message}</span>
          </div>
        </div>

        <div className="reply-section">
          <h3>Reply</h3>
          <div className="form-group">
            <label htmlFor="reply-title">Title</label>
            <input
              id="reply-title"
              type="text"
              value={replyTitle}
              onChange={(e) => setReplyTitle(e.target.value)}
              placeholder="Re: ........."
              className="reply-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="reply-body">Body</label>
            <textarea
              id="reply-body"
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              placeholder="Type your reply here..."
              className="reply-textarea"
              rows={6}
            />
          </div>
        </div>

        <div className="modal-actions">
          <button className="send-btn" onClick={handleSend}>
            SEND
          </button>
          <button className="cancel-btn" onClick={handleCancel}>
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
};

// Contact Messages Admin Component
const ContactMessagesAdmin = ({
  messages,
  onDeleteMessage,
  onMarkAsRead,
  onReplyMessage,
  doubleCheckMessages,
}: {
  messages: ContactMessage[];
  onUpdateMessage: (id: number, status: string) => void;
  onDeleteMessage: (id: number) => void;
  onMarkAsRead: (id: number) => void;
  onReplyMessage: (id: number) => void;
  doubleCheckMessages: Set<number>;
}) => {
  const [filterType] = useState("all");
  const [selectedMessages, setSelectedMessages] = useState<number[]>([]);

  const filteredMessages = messages.filter(
    (msg) =>
      filterType === "all" ||
      msg.type.toLowerCase() === filterType.toLowerCase()
  );

  const handleSelectAll = () => {
    if (selectedMessages.length === filteredMessages.length) {
      setSelectedMessages([]);
    } else {
      setSelectedMessages(filteredMessages.map((msg) => msg.id));
    }
  };

  const handleSelectMessage = (id: number) => {
    setSelectedMessages((prev) =>
      prev.includes(id) ? prev.filter((msgId) => msgId !== id) : [...prev, id]
    );
  };

  return (
    <div className="contact-admin">
      <div className="admin-header">
        <div className="breadcrumbs">
          <span>Contact Us</span>
        </div>
      </div>

      <div className="admin-content">
        <div className="tabs">
          <button className="tab active">Messages</button>
        </div>

        <div className="messages-table">
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={
                      selectedMessages.length === filteredMessages.length &&
                      filteredMessages.length > 0
                    }
                    onChange={handleSelectAll}
                  />
                </th>
                <th>ID</th>
                <th>Country</th>
                <th>Type</th>
                <th>Name</th>
                <th>Mobile</th>
                <th>Subject</th>
                <th>Message</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredMessages.map((message) => (
                <tr key={message.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedMessages.includes(message.id)}
                      onChange={() => handleSelectMessage(message.id)}
                    />
                  </td>
                  <td>{message.id}</td>
                  <td>
                    <div className="country-flag">🇸🇦</div>
                  </td>
                  <td>{message.type}</td>
                  <td>{message.name}</td>
                  <td>{message.mobile}</td>
                  <td>{message.subject}</td>
                  <td>{message.message}</td>
                  <td>{message.date}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn delete"
                        onClick={() => onDeleteMessage(message.id)}
                        title="Delete"
                      >
                        🗑
                      </button>
                      <button
                        className="action-btn mark-read"
                        onClick={() => onMarkAsRead(message.id)}
                        title="Mark as Read"
                      >
                        {doubleCheckMessages.has(message.id) ? "✓✓" : "✓"}
                      </button>
                      <button
                        className="action-btn reply"
                        onClick={() => onReplyMessage(message.id)}
                        title="Reply"
                      >
                        ↩
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Visitor Statistics Component
const VisitorStatistics = ({ stats }: { stats: VisitorStats }) => {
  return (
    <div className="visitor-stats">
      <div className="stats-header">
        <h2>إحصائيات الزوار</h2>
        <p>عرض أرقام الزوار ومصادرهم</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalVisitors.toLocaleString()}</h3>
            <p>إجمالي الزوار</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>{stats.todayVisitors.toLocaleString()}</h3>
            <p>زوار اليوم</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🌟</div>
          <div className="stat-content">
            <h3>{stats.uniqueVisitors.toLocaleString()}</h3>
            <p>زوار فريدون</p>
          </div>
        </div>
      </div>

      <div className="sources-section">
        <h3>أهم مصادر الزوار</h3>
        <div className="sources-list">
          {stats.topSources.map((source, index) => (
            <div key={index} className="source-item">
              <div className="source-info">
                <span className="source-name">{source.source}</span>
                <span className="source-count">{source.count} زائر</span>
              </div>
              <div
                className="source-bar"
                style={{
                  width: `${
                    (source.count /
                      Math.max(...stats.topSources.map((s) => s.count))) *
                    100
                  }%`,
                }}
              ></div>
            </div>
          ))}
        </div>
      </div>

      <div className="countries-section">
        <h3>أهم البلدان</h3>
        <div className="countries-list">
          {stats.topCountries.map((country, index) => (
            <div key={index} className="country-item">
              <span className="country-flag">{country.country}</span>
              <span className="country-count">{country.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="recent-visitors">
        <h3>الزوار الحاليون</h3>
        <div className="visitors-table">
          <table>
            <thead>
              <tr>
                <th>الوقت</th>
                <th>المصدر</th>
                <th>البلد</th>
                <th>الصفحة</th>
              </tr>
            </thead>
            <tbody>
              {stats.visitorsData.slice(0, 10).map((visitor) => (
                <tr key={visitor.id}>
                  <td>
                    {new Date(visitor.timestamp).toLocaleTimeString("ar-SA")}
                  </td>
                  <td>{visitor.source}</td>
                  <td>{visitor.country}</td>
                  <td>{visitor.page}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
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
  onDeleteAllBlocks,
  onAddNewBlock,
  selectedBlockId,
  selectedBlock,
  onSelectedBlockStyleChange,
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
  onDeleteAllBlocks: () => void;
  onAddNewBlock: () => void;
  selectedBlockId: string | null;
  selectedBlock: BlockData | null;
  onSelectedBlockStyleChange: (key: keyof StyleSettings, value: string) => void;
}) => {
  const currentSettings = selectedBlock?.styleSettings || styleSettings;
  const isBlockSelected = !!selectedBlock;

  return (
    <div className="panel">
      <h3>Dynamic Block Controls</h3>
      <p>These blocks must be dynamic and auto-resize - a small challenge!</p>

      {!isBlockSelected && (
        <div className="warning-message">
          <p>
            <strong>⚠️ No block selected</strong>
          </p>
          <p>
            Select a block to control its individual styling, or these controls
            will apply as defaults for new blocks.
          </p>
        </div>
      )}

      {isBlockSelected && (
        <div className="selected-block-info">
          <p>
            <strong>✅ Controlling Block:</strong> {selectedBlock.tag} (ID:{" "}
            {selectedBlock.id})
          </p>
        </div>
      )}

      <div className="control-group">
        <label>Style Preset:</label>
        <select
          value={currentSettings.stylePreset}
          onChange={(e) =>
            isBlockSelected
              ? onSelectedBlockStyleChange("stylePreset", e.target.value)
              : onStyleChange("stylePreset", e.target.value)
          }
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
          value={currentSettings.animation}
          onChange={(e) =>
            isBlockSelected
              ? onSelectedBlockStyleChange("animation", e.target.value)
              : onStyleChange("animation", e.target.value)
          }
        >
          <option value="">None</option>
          <option value="animate-bounce">Bounce</option>
          <option value="animate-pulse">Pulse</option>
          <option value="animate-rotate">Rotate</option>
        </select>

        <label>Corners:</label>
        <select
          value={currentSettings.corners}
          onChange={(e) =>
            isBlockSelected
              ? onSelectedBlockStyleChange("corners", e.target.value)
              : onStyleChange("corners", e.target.value)
          }
        >
          <option value="rounded">Rounded</option>
          <option value="">Square</option>
        </select>

        <label>Elevation:</label>
        <select
          value={currentSettings.elevation}
          onChange={(e) =>
            isBlockSelected
              ? onSelectedBlockStyleChange("elevation", e.target.value)
              : onStyleChange("elevation", e.target.value)
          }
        >
          <option value="shadow">Shadow</option>
          <option value="flat">Flat</option>
        </select>
      </div>

      <div className="control-group">
        <label>Border:</label>
        <select
          value={currentSettings.border}
          onChange={(e) =>
            isBlockSelected
              ? onSelectedBlockStyleChange("border", e.target.value)
              : onStyleChange("border", e.target.value)
          }
        >
          <option value="no-border">No border</option>
          <option value="with-border">With border</option>
        </select>

        <label>Background:</label>
        <select
          value={currentSettings.background}
          onChange={(e) =>
            isBlockSelected
              ? onSelectedBlockStyleChange("background", e.target.value)
              : onStyleChange("background", e.target.value)
          }
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

        <button type="button" onClick={onAddNewBlock} className="add-block-btn">
          Add New Block
        </button>

        <button
          type="button"
          onClick={onDeleteAllBlocks}
          className="delete-all-btn"
        >
          Delete All Blocks
        </button>
      </div>

      <div className="control-group">
        <h4>Block Selection</h4>
        {selectedBlockId ? (
          <p>
            <strong>Selected Block:</strong> {selectedBlockId}
            <br />
            <small>
              Click on any block to select it, or click the same block again to
              deselect.
            </small>
          </p>
        ) : (
          <p>
            <em>No block selected</em>
            <br />
            <small>
              Click on any block to select and control it individually.
            </small>
          </p>
        )}
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
      content:
        "**Innovation** is at the heart of everything we do. We constantly push the boundaries of what's possible, bringing you cutting-edge solutions that transform the way you work and live.\n\nOur innovative approach includes:\n- Revolutionary technology\n- User-centered design\n- Sustainable practices\n- Continuous improvement",
      contentType: "text" as const,
    },
    {
      id: "2",
      title: "Automation",
      tag: "Automation",
      backgroundImage:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop",
      isManuallyResized: false,
      content:
        "*Streamline your workflow* with our powerful automation tools. Say goodbye to repetitive tasks and hello to increased productivity and efficiency.",
      contentType: "text" as const,
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
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<"home" | "contact" | "about">(
    "home"
  );
  const [isLiveView, setIsLiveView] = useState(false);
  const [heroImages, setHeroImages] = useState<CarouselImage[]>([
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
  const [visitorStats, setVisitorStats] = useState<VisitorStats>({
    totalVisitors: 12847,
    todayVisitors: 234,
    uniqueVisitors: 8392,
    topSources: [
      { source: "Google", count: 4235 },
      { source: "Facebook", count: 2341 },
      { source: "Direct", count: 1876 },
      { source: "Twitter", count: 943 },
      { source: "LinkedIn", count: 672 },
    ],
    topCountries: [
      { country: "🇸🇦", count: 5432 },
      { country: "🇦🇪", count: 2341 },
      { country: "🇪🇬", count: 1876 },
      { country: "🇯🇴", count: 943 },
      { country: "🇰🇼", count: 672 },
    ],
    visitorsData: [
      {
        id: "1",
        timestamp: new Date().toISOString(),
        source: "Google",
        userAgent: "Chrome/91.0",
        country: "🇸🇦",
        ip: "192.168.1.1",
        page: "/",
      },
      {
        id: "2",
        timestamp: new Date(Date.now() - 300000).toISOString(),
        source: "Facebook",
        userAgent: "Safari/14.0",
        country: "🇦🇪",
        ip: "192.168.1.2",
        page: "/about",
      },
      {
        id: "3",
        timestamp: new Date(Date.now() - 600000).toISOString(),
        source: "Direct",
        userAgent: "Firefox/89.0",
        country: "🇪🇬",
        ip: "192.168.1.3",
        page: "/contact",
      },
    ],
  });
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
    null
  );
  const [doubleCheckMessages, setDoubleCheckMessages] = useState<Set<number>>(
    new Set()
  );
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [blockViewModalOpen, setBlockViewModalOpen] = useState(false);
  const [selectedBlockForModal, setSelectedBlockForModal] =
    useState<BlockData | null>(null);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([
    {
      id: 27,
      country: "🇸🇦",
      type: "Other",
      name: "فهد سعود",
      email: "fahad@wjl.sa",
      mobile: "+966599919866",
      subject: "...",
      message: ".........",
      date: "23 August 2025",
      status: "pending",
    },
    {
      id: 26,
      country: "🇸🇦",
      type: "Other",
      name: "فهد سعود",
      email: "fahad2@wjl.sa",
      mobile: "+966599919866",
      subject: "higigi",
      message: "yyyyuyuyuyuyyuyjyjgjhhj",
      date: "21 August 2025",
      status: "pending",
    },
    {
      id: 25,
      country: "🇸🇦",
      type: "Other",
      name: "فهد سعود",
      email: "fahad3@wjl.sa",
      mobile: "+966599919866",
      subject: "hkgfh",
      message: "vhghfjgfhgvcjgfhhfhhhf",
      date: "21 August 2025",
      status: "pending",
    },
    {
      id: 24,
      country: "🇸🇦",
      type: "Support",
      name: "أحمد محمد",
      email: "ahmed@example.com",
      mobile: "+966501234567",
      subject: "Technical Issue",
      message: "I am experiencing problems with the system",
      date: "20 August 2025",
      status: "pending",
    },
    {
      id: 23,
      country: "🇸🇦",
      type: "Complaint",
      name: "سارة أحمد",
      email: "sara@example.com",
      mobile: "+966509876543",
      subject: "Service Complaint",
      message: "The service was not as expected",
      date: "19 August 2025",
      status: "approved",
    },
  ]);
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

  // Visitor tracking functionality
  const trackVisitor = () => {
    const getRandomSource = () => {
      const sources = [
        "Google",
        "Facebook",
        "Direct",
        "Twitter",
        "LinkedIn",
        "Instagram",
        "YouTube",
      ];
      return sources[Math.floor(Math.random() * sources.length)];
    };

    const getRandomCountry = () => {
      const countries = ["🇸🇦", "🇦🇪", "🇪🇬", "🇯🇴", "🇰🇼", "🇶🇦", "🇧🇭", "🇴🇲"];
      return countries[Math.floor(Math.random() * countries.length)];
    };

    const newVisitor: VisitorData = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      source: getRandomSource(),
      userAgent: navigator.userAgent.split("/")[0] || "Unknown",
      country: getRandomCountry(),
      ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(
        Math.random() * 255
      )}`,
      page: currentView === "home" ? "/" : `/${currentView}`,
    };

    setVisitorStats((prev) => ({
      ...prev,
      totalVisitors: prev.totalVisitors + 1,
      todayVisitors: prev.todayVisitors + 1,
      uniqueVisitors: prev.uniqueVisitors + (Math.random() > 0.3 ? 1 : 0),
      visitorsData: [newVisitor, ...prev.visitorsData.slice(0, 19)],
      topSources: prev.topSources.map((source) =>
        source.source === newVisitor.source
          ? { ...source, count: source.count + 1 }
          : source
      ),
      topCountries: prev.topCountries.map((country) =>
        country.country === newVisitor.country
          ? { ...country, count: country.count + 1 }
          : country
      ),
    }));
  };

  // Auto-track visitors every 10-30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.3) {
        // 70% chance to track a visitor
        trackVisitor();
      }
    }, Math.random() * 20000 + 10000); // Random interval between 10-30 seconds

    return () => clearInterval(interval);
  }, [currentView]);

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

  const handleSelectedBlockStyleChange = (
    key: keyof StyleSettings,
    value: string
  ) => {
    if (!selectedBlockId) return;

    setBlocks((prev) =>
      prev.map((block) => {
        if (block.id === selectedBlockId) {
          return {
            ...block,
            styleSettings: {
              ...block.styleSettings,
              [key]: value as string, // ensure value is string
            },
          } as BlockData;
        }
        return block;
      })
    );
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

  const handleImageUpload = (blockId: string, imageUrl: string) => {
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === blockId ? { ...block, backgroundImage: imageUrl } : block
      )
    );
  };

  const handleImageDelete = (blockId: string) => {
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === blockId ? { ...block, backgroundImage: undefined } : block
      )
    );
  };

  const handleDeleteBlock = (blockId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this block? This action cannot be undone."
      )
    ) {
      setBlocks((prev) => prev.filter((block) => block.id !== blockId));
      if (selectedBlockId === blockId) {
        setSelectedBlockId(null);
      }
    }
  };

  const handleDeleteAllBlocks = () => {
    if (
      confirm(
        "Are you sure you want to delete all blocks? This action cannot be undone."
      )
    ) {
      setBlocks([]);
      setSelectedBlockId(null);
    }
  };

  const handleAddNewBlock = () => {
    const newId = (
      Math.max(...blocks.map((b) => parseInt(b.id)), 0) + 1
    ).toString();
    const newBlock: BlockData = {
      id: newId,
      title: "New Block",
      tag: "New Block",
      backgroundColor: "#333",
      isManuallyResized: false,
    };
    setBlocks((prev) => [...prev, newBlock]);
    setSelectedBlockId(newId);
  };

  const handleBlockSelection = (blockId: string) => {
    setSelectedBlockId(selectedBlockId === blockId ? null : blockId);
  };

  // Contact messages handlers
  const handleUpdateMessage = (id: number, status: string) => {
    setContactMessages((prev) =>
      prev.map((msg) =>
        msg.id === id ? { ...msg, status: status as any } : msg
      )
    );
  };

  const handleDeleteMessage = (id: number) => {
    setContactMessages((prev) => prev.filter((msg) => msg.id !== id));
  };

  const handleMarkAsRead = (id: number) => {
    // Toggle double check state
    setDoubleCheckMessages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id); // Remove from double check (back to single ✓)
      } else {
        newSet.add(id); // Add to double check (show ✓✓)
      }
      return newSet;
    });

    // Mark as approved
    setContactMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, status: "approved" } : msg))
    );

    // Log the action
    console.log(`Message ${id} marked as read - icon toggled!`);
  };

  const handleReplyMessage = (id: number) => {
    const message = contactMessages.find((msg) => msg.id === id);
    if (message) {
      setSelectedMessage(message);
      setReplyModalOpen(true);
    }
  };

  const handleSendReply = (replyTitle: string, replyBody: string) => {
    if (selectedMessage) {
      console.log("Sending reply to message:", selectedMessage.id);
      console.log("Reply title:", replyTitle);
      console.log("Reply body:", replyBody);

      // Update message status to replied
      setContactMessages((prev) =>
        prev.map((msg) =>
          msg.id === selectedMessage.id ? { ...msg, status: "replied" } : msg
        )
      );

      alert(`Reply sent successfully to ${selectedMessage.name}!`);
    }
  };

  const handleCloseModal = () => {
    setReplyModalOpen(false);
    setSelectedMessage(null);
  };

  // Block modal handlers
  const handleReadMore = (blockId: string) => {
    const block = blocks.find((b) => b.id === blockId);
    if (block) {
      setSelectedBlockForModal(block);
      setBlockViewModalOpen(true);
    }
  };

  const handleEditContent = () => {
    setBlockViewModalOpen(false);
    setBlockModalOpen(true);
  };

  const handleBlockContentSave = (
    blockId: string,
    content: string,
    contentImage: string,
    contentType: "text" | "image" | "both"
  ) => {
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === blockId
          ? { ...block, content, contentImage, contentType }
          : block
      )
    );
  };

  const handleCloseBlockModal = () => {
    setBlockModalOpen(false);
    setSelectedBlockForModal(null);
  };

  const handleCloseViewModal = () => {
    setBlockViewModalOpen(false);
    setSelectedBlockForModal(null);
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
            <button
              className={`nav-link ${currentView === "home" ? "active" : ""}`}
              onClick={() => setCurrentView("home")}
            >
              Home
            </button>

            <button
              className={`nav-link ${currentView === "about" ? "active" : ""}`}
              onClick={() => setCurrentView("about")}
            >
              About
            </button>
            <button
              className={`nav-link ${
                currentView === "contact" ? "active" : ""
              }`}
              onClick={() => setCurrentView("contact")}
            >
              Contact
            </button>
          </nav>
          <div className="header-actions">
            {!isLiveView && (
              <button
                className="save-btn"
                onClick={() => setIsLiveView(true)}
                style={{
                  background: "#007AFF",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginRight: "12px",
                }}
              >
                💾 Save & View Live
              </button>
            )}
            {isLiveView && (
              <button
                className="edit-btn"
                onClick={() => setIsLiveView(false)}
                style={{
                  background: "#FF3B30",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginRight: "12px",
                }}
              >
                ✏️ Edit Page
              </button>
            )}
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

      {currentView === "home" ? (
        isLiveView ? (
          <CleanLandingPage
            blocks={blocks}
            styleSettings={styleSettings}
            autoRotate={autoRotate}
            heroVisible={heroVisible}
            heroImages={heroImages}
            onReadMore={handleReadMore}
            onCloseModal={handleCloseViewModal}
            selectedBlockForModal={selectedBlockForModal}
            blockViewModalOpen={blockViewModalOpen}
          />
        ) : (
          <>
            <HeroCarousel
              autoRotate={autoRotate}
              isVisible={heroVisible}
              onToggleVisibility={() => setHeroVisible(!heroVisible)}
              images={heroImages}
              onImagesChange={setHeroImages}
            />

            <section className="grid" id="grid">
              {blocks.map((block) => (
                <DynamicBlock
                  key={block.id}
                  block={block}
                  defaultStyleSettings={styleSettings}
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
                  onImageUpload={handleImageUpload}
                  onImageDelete={handleImageDelete}
                  onBlockSelect={handleBlockSelection}
                  isSelected={selectedBlockId === block.id}
                  onReadMore={handleReadMore}
                  onDeleteBlock={handleDeleteBlock}
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
              onDeleteAllBlocks={handleDeleteAllBlocks}
              onAddNewBlock={handleAddNewBlock}
              selectedBlockId={selectedBlockId}
              selectedBlock={
                blocks.find((b) => b.id === selectedBlockId) || null
              }
              onSelectedBlockStyleChange={handleSelectedBlockStyleChange}
            />
          </>
        )
      ) : currentView === "about" ? (
        <VisitorStatistics stats={visitorStats} />
      ) : (
        <ContactMessagesAdmin
          messages={contactMessages}
          onUpdateMessage={handleUpdateMessage}
          onDeleteMessage={handleDeleteMessage}
          onMarkAsRead={handleMarkAsRead}
          onReplyMessage={handleReplyMessage}
          doubleCheckMessages={doubleCheckMessages}
        />
      )}

      <ReplyModal
        message={selectedMessage}
        isOpen={replyModalOpen}
        onClose={handleCloseModal}
        onSendReply={handleSendReply}
      />

      <BlockContentViewModal
        block={selectedBlockForModal}
        isOpen={blockViewModalOpen}
        onClose={handleCloseViewModal}
        onEdit={handleEditContent}
      />

      <BlockContentModal
        block={selectedBlockForModal}
        isOpen={blockModalOpen}
        onClose={handleCloseBlockModal}
        onSave={handleBlockContentSave}
      />
    </div>
  );
}

export default App;
