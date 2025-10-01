import { useRef } from "react";
import { useTranslation } from "react-i18next";
import type { ChangeEvent, DragEvent, MouseEvent } from "react";
import type { BlockData, StyleSettings } from "../../types/app";
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
  onBlockClick,
  isSelected,
  onReadMore,
  onDeleteBlock,
}: {
  block: BlockData;
  defaultStyleSettings: StyleSettings;
  showHandles: boolean;
  enableDrag: boolean;
  onDragStart: (e: DragEvent, blockId: string) => void;
  onDragEnd: (e: DragEvent) => void;
  onDragOver: (e: DragEvent) => void;
  onDrop: (e: DragEvent, blockId: string) => void;
  onDragEnter: (e: DragEvent) => void;
  onDragLeave: (e: DragEvent) => void;
  onDoubleClick: (blockId: string) => void;
  onResizeStart: (
    e: MouseEvent,
    blockId: string,
    direction: string
  ) => void;
  onImageUpload: (blockId: string, imageUrl: string) => void;
  onImageDelete: (blockId: string) => void;
  onBlockSelect: (blockId: string) => void;
  onBlockClick: (blockId: string) => void;
  isSelected: boolean;
  onReadMore: (blockId: string) => void;
  onDeleteBlock: (blockId: string) => void;
}) => {
  const { t } = useTranslation();
  const blockRef = useRef<HTMLElement>(null);

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
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
    if (block.isFullWidth) classes.push("full-width");
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
    const styleSettings = block.styleSettings || defaultStyleSettings;
    const opacity =
      styleSettings.opacity !== undefined ? styleSettings.opacity / 100 : 1;

    if (block.isManuallyResized) {
      return {
        ...baseStyle,
        width: block.width ? `${block.width}px` : "auto",
        height: block.height ? `${block.height}px` : "auto",
        position: "relative" as const,
        zIndex: 10,
        opacity: opacity,
      };
    }

    return {
      ...baseStyle,
      opacity: opacity,
    };
  };

  const getBackgroundStyle = () => {
    const styleSettings = block.styleSettings || defaultStyleSettings;
    if (styleSettings.background === "bg-image" && block.backgroundImage) {
      return { backgroundImage: `url('${block.backgroundImage}')` };
    } else if (styleSettings.background === "bg-gradient") {
      const colors = block.gradientColors || ["#667eea", "#764ba2"];
      const direction = block.gradientDirection || "135deg";
      const gradientStyle = `linear-gradient(${direction}, ${colors.join(
        ", "
      )})`;
      console.log("Applying gradient:", gradientStyle, "for block:", block.id);
      return {
        background: gradientStyle,
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
      onClick={() => onBlockClick(block.id)}
    >
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
            title={t("style.deleteBackgroundImage")}
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
          title={t("blocks.deleteBlock")}
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

export default DynamicBlock;

