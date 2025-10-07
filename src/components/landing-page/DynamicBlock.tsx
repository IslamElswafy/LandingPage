import { useRef } from "react";
import { useTranslation } from "react-i18next";
import type { ChangeEvent, DragEvent, MouseEvent, CSSProperties } from "react";
import type { BlockData, StyleSettings, CornerSide } from "../../types/app";

const DEFAULT_BORDER_SIDES: Array<"top" | "right" | "bottom" | "left"> = [
  "top",
  "right",
  "bottom",
  "left",
];
const DEFAULT_CORNER_SIDES: CornerSide[] = [
  "top-left",
  "top-right",
  "bottom-right",
  "bottom-left",
];
const BORDER_SIDE_PROPERTIES: Record<
  "top" | "right" | "bottom" | "left",
  keyof CSSProperties
> = {
  top: "borderTop",
  right: "borderRight",
  bottom: "borderBottom",
  left: "borderLeft",
};
const CORNER_SIDE_PROPERTIES: Record<CornerSide, keyof CSSProperties> = {
  "top-left": "borderTopLeftRadius",
  "top-right": "borderTopRightRadius",
  "bottom-right": "borderBottomRightRadius",
  "bottom-left": "borderBottomLeftRadius",
};

const ELEVATION_SHADOWS: Record<string, string> = {
  shadow: "0 18px 40px rgba(15, 23, 42, 0.25)",
  flat: "none",
  "shadow-soft": "0 10px 25px rgba(15, 23, 42, 0.18)",
  "shadow-strong": "0 28px 65px rgba(15, 23, 42, 0.35)",
};

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
  onToggleResizeLock,
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
  onResizeStart: (e: MouseEvent, blockId: string, direction: string) => void;
  onImageUpload: (blockId: string, imageUrl: string) => void;
  onImageDelete: (blockId: string) => void;
  onBlockSelect: (blockId: string) => void;
  onBlockClick: (blockId: string) => void;
  onToggleResizeLock: (blockId: string) => void;
  isSelected: boolean;
  onReadMore: (blockId: string) => void;
  onDeleteBlock: (blockId: string) => void;
}) => {
  const { t } = useTranslation();
  const blockRef = useRef<HTMLElement>(null);
  const isResizeLocked = Boolean(block.isResizeLocked);
  const lockTitle = isResizeLocked
    ? t("blocks.unlockResize", { defaultValue: "Unlock resize" })
    : t("blocks.lockResize", { defaultValue: "Lock resize" });
  const lockIcon = isResizeLocked ? "\u{1F512}" : "\u{1F513}";

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
    if (block.isResizeLocked) classes.push("resize-locked");
    if (isSelected) classes.push("selected");
    if (styleSettings.stylePreset) classes.push(styleSettings.stylePreset);
    if (styleSettings.animation) classes.push(styleSettings.animation);
    if (styleSettings.corners) classes.push(styleSettings.corners);
    if (styleSettings.elevation) classes.push(styleSettings.elevation);
    if (styleSettings.border) classes.push(styleSettings.border);
    if (styleSettings.background) classes.push(styleSettings.background);

    return classes.join(" ");
  };

  const getBorderStyle = (styleSettings: StyleSettings): CSSProperties => {
    if (styleSettings.border !== "with-border") {
      return { border: "none" };
    }

    const activeSides =
      styleSettings.borderSides !== undefined
        ? styleSettings.borderSides
        : DEFAULT_BORDER_SIDES;
    const borderColor = styleSettings.borderColor || "#111111";
    const borderWidth = styleSettings.borderWidth ?? 1;
    const borderValue = `${borderWidth}px solid ${borderColor}`;

    const styles: CSSProperties = {};
    DEFAULT_BORDER_SIDES.forEach((side) => {
      const prop = BORDER_SIDE_PROPERTIES[side];
      const value = activeSides.includes(side) ? borderValue : "none";
      Object.assign(styles, {
        [prop]: value,
      });
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
      styles[prop] = activeCorners.includes(corner) ? "var(--radius)" : "0";
    });

    return styles;
  };

  const getElevationStyle = (styleSettings: StyleSettings): CSSProperties => {
    const elevationKey = styleSettings.elevation || "shadow";
    const boxShadow =
      ELEVATION_SHADOWS[elevationKey] ?? ELEVATION_SHADOWS.shadow;

    return {
      boxShadow,
    };
  };

  const getBlockStyle = () => {
    const styleSettings = block.styleSettings || defaultStyleSettings;
    const baseStyle = getBackgroundStyle();
    const opacity =
      styleSettings.opacity !== undefined ? styleSettings.opacity / 100 : 1;

    const sizeStyle: CSSProperties = block.isManuallyResized
      ? {
          width: block.width ? `${block.width}px` : "auto",
          height: block.height ? `${block.height}px` : "auto",
          position: "relative" as const,
          zIndex: 10,
        }
      : {};

    return {
      ...baseStyle,
      ...sizeStyle,
      opacity,
      ...getCornerStyle(styleSettings),
      ...getBorderStyle(styleSettings),
      ...getElevationStyle(styleSettings),
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
      {/* Content area - pushed to bottom via flex */}
      <div style={{ marginTop: 'auto' }}>
        <button
          className="cta"
          onClick={(e) => {
            e.stopPropagation();
            onReadMore(block.id);
          }}
        >
          Read More
        </button>
      </div>

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
          {"\u{1F4F7}"}
        </label>
        {block.backgroundImage && (
          <button
            className="delete-btn-block"
            onClick={handleImageDelete}
            title={t("style.deleteBackgroundImage")}
          >
            {"\u{1F5D1}"}
          </button>
        )}
        <button
          className={`resize-lock-btn${isResizeLocked ? " locked" : ""}`}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleResizeLock(block.id);
          }}
          title={lockTitle}
          aria-label={lockTitle}
          aria-pressed={isResizeLocked}
        >
          {lockIcon}
        </button>
        <button
          className="delete-block-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteBlock(block.id);
          }}
          title={t("blocks.deleteBlock")}
        >
          {"\u{274C}"}
        </button>
      </div>
      {/* Resize handles */}
      {showHandles && !isResizeLocked && (
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
