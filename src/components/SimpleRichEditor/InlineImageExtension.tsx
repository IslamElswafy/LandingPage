import React, { useCallback, useEffect, useRef, useState } from "react";
import { Box, Button, IconButton, InputAdornment, Popover, Slider, TextField, Typography } from "@mui/material";
import { FormatAlignCenter, FormatAlignLeft, FormatAlignRight, Layers, Lock, LockOpen, OpenWith, PhotoSizeSelectActual } from "@mui/icons-material";
import Image from "@tiptap/extension-image";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
const generateAnchorId = () =>
  `anchor-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// Inline Image Component with Word-like Text Wrapping and Drag-Drop
const InlineImageComponent: React.FC<{
  node: any;
  updateAttributes: (attrs: any) => void;
  selected: boolean;
}> = ({ node, updateAttributes, selected }) => {
  const {
    src,
    alt,
    title,
    width,
    height,
    float,
    opacity,
    anchorId,
    anchorOffset,
  } = node.attrs;

  // Ensure anchor metadata exists for this image node
  useEffect(() => {
    if (!anchorId) {
      updateAttributes({
        anchorId: generateAnchorId(),
        anchorOffset: typeof anchorOffset === "number" ? anchorOffset : 0,
      });
    } else if (typeof anchorOffset !== "number") {
      updateAttributes({ anchorOffset: 0 });
    }
  }, [anchorId, anchorOffset, updateAttributes]);
  const [showControls, setShowControls] = useState(false);
  const [aspectRatioLocked, setAspectRatioLocked] = useState(true);
  const [naturalDimensions, setNaturalDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [currentDimensions, setCurrentDimensions] = useState({
    width: width || "auto",
    height: height || "auto",
  });
  const [floatState, setFloatState] = useState<"left" | "right" | "none">(
    float || "none"
  ); // Text wrapping position
  const [imageOpacity, setImageOpacity] = useState(opacity || 100); // 0-100
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [controlsAnchorEl, setControlsAnchorEl] = useState<HTMLElement | null>(
    null
  );
  const [controlsAnchorPosition, setControlsAnchorPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate aspect ratio
  const aspectRatio = naturalDimensions.width / naturalDimensions.height;

  // Load natural dimensions when image loads
  const handleImageLoad = useCallback(() => {
    if (imageRef.current) {
      const { naturalWidth, naturalHeight } = imageRef.current;
      setNaturalDimensions({ width: naturalWidth, height: naturalHeight });

      if (
        currentDimensions.width === "auto" ||
        currentDimensions.height === "auto"
      ) {
        setCurrentDimensions({
          width: naturalWidth > 400 ? 400 : naturalWidth,
          height: naturalHeight > 300 ? 300 : naturalHeight,
        });
      }
    }
  }, [currentDimensions]);

  // Handle width change with aspect ratio lock
  const handleWidthChange = useCallback(
    (newWidth: number) => {
      const width = Math.max(50, newWidth);
      const height =
        aspectRatioLocked && aspectRatio
          ? Math.round(width / aspectRatio)
          : currentDimensions.height;

      const updatedDimensions = {
        width,
        height: aspectRatioLocked ? height : currentDimensions.height,
      };
      setCurrentDimensions(updatedDimensions);
      updateAttributes({
        ...updatedDimensions,
        float: floatState,
        opacity: imageOpacity,
      });
    },
    [
      aspectRatioLocked,
      aspectRatio,
      currentDimensions.height,
      floatState,
      imageOpacity,
      updateAttributes,
    ]
  );

  // Handle height change with aspect ratio lock
  const handleHeightChange = useCallback(
    (newHeight: number) => {
      const height = Math.max(50, newHeight);
      const width =
        aspectRatioLocked && aspectRatio
          ? Math.round(height * aspectRatio)
          : currentDimensions.width;

      const updatedDimensions = {
        height,
        width: aspectRatioLocked ? width : currentDimensions.width,
      };
      setCurrentDimensions(updatedDimensions);
      updateAttributes({
        ...updatedDimensions,
        float: floatState,
        opacity: imageOpacity,
      });
    },
    [
      aspectRatioLocked,
      aspectRatio,
      currentDimensions.width,
      floatState,
      imageOpacity,
      updateAttributes,
    ]
  );

  // Toggle float position (text wrapping)
  const toggleFloat = useCallback(() => {
    const floatCycle: Array<"none" | "left" | "right"> = [
      "none",
      "left",
      "right",
    ];
    const currentIndex = floatCycle.indexOf(floatState);
    const nextFloat = floatCycle[(currentIndex + 1) % floatCycle.length];
    setFloatState(nextFloat);
    updateAttributes({
      width: currentDimensions.width,
      height: currentDimensions.height,
      float: nextFloat,
      opacity: imageOpacity,
    });
  }, [floatState, currentDimensions, imageOpacity, updateAttributes]);

  // Reset to original size
  const handleResetSize = useCallback(() => {
    const resetDimensions = {
      width: naturalDimensions.width > 400 ? 400 : naturalDimensions.width,
      height: naturalDimensions.height > 300 ? 300 : naturalDimensions.height,
    };
    setCurrentDimensions(resetDimensions);
    updateAttributes({
      ...resetDimensions,
      float: floatState,
      opacity: imageOpacity,
    });
  }, [naturalDimensions, floatState, imageOpacity, updateAttributes]);

  // Toggle aspect ratio lock
  const toggleAspectRatioLock = useCallback(() => {
    setAspectRatioLocked((prev) => {
      const newLocked = !prev;

      // If locking aspect ratio, immediately sync width based on current height
      if (newLocked && aspectRatio && currentDimensions.height !== "auto") {
        const syncedWidth = Math.round(currentDimensions.height * aspectRatio);
        const updatedDimensions = {
          width: syncedWidth,
          height: currentDimensions.height,
        };
        setCurrentDimensions(updatedDimensions);
        updateAttributes({
          ...updatedDimensions,
          float: floatState,
          opacity: imageOpacity,
        });
      }

      return newLocked;
    });
  }, [
    aspectRatio,
    currentDimensions,
    floatState,
    imageOpacity,
    updateAttributes,
  ]);

  // Handle opacity change
  const handleOpacityChange = useCallback(
    (newOpacity: number) => {
      const opacity = Math.min(100, Math.max(0, newOpacity));
      setImageOpacity(opacity);
      updateAttributes({
        width: currentDimensions.width,
        height: currentDimensions.height,
        float: floatState,
        opacity: opacity,
      });
    },
    [currentDimensions, floatState, updateAttributes]
  );

  // Show controls
  const handleShowControls = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      event.stopPropagation();

      const rect = event.currentTarget.getBoundingClientRect();
      const viewportLeft = window.scrollX;
      const viewportRight = viewportLeft + window.innerWidth;
      const desiredLeft = rect.right + window.scrollX + 24;
      const popoverWidth = 360;
      const left = Math.max(
        viewportLeft + 16,
        Math.min(desiredLeft, viewportRight - popoverWidth)
      );

      const viewportTop = window.scrollY;
      const viewportBottom = viewportTop + window.innerHeight;
      const desiredTop = rect.top + window.scrollY - 16;
      const popoverHeight = 480;
      const top = Math.max(
        viewportTop + 16,
        Math.min(desiredTop, viewportBottom - popoverHeight)
      );

      setControlsAnchorPosition({ top, left });
      setControlsAnchorEl(event.currentTarget);
      setShowControls(true);
    },
    []
  );

  // Hide controls
  const handleHideControls = useCallback(() => {
    setControlsAnchorEl(null);
    setControlsAnchorPosition(null);
    setShowControls(false);
  }, []);

  // Handle resize start
  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width:
          typeof currentDimensions.width === "number"
            ? currentDimensions.width
            : 0,
        height:
          typeof currentDimensions.height === "number"
            ? currentDimensions.height
            : 0,
      });
    },
    [currentDimensions]
  );

  // Handle resize
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeStart.x;
      const newWidth = Math.max(50, resizeStart.width + deltaX);

      if (aspectRatioLocked && aspectRatio) {
        const newHeight = Math.round(newWidth / aspectRatio);
        setCurrentDimensions({ width: newWidth, height: newHeight });
        updateAttributes({
          width: newWidth,
          height: newHeight,
          float: floatState,
          opacity: imageOpacity,
        });
      } else {
        const deltaY = e.clientY - resizeStart.y;
        const newHeight = Math.max(50, resizeStart.height + deltaY);
        setCurrentDimensions({ width: newWidth, height: newHeight });
        updateAttributes({
          width: newWidth,
          height: newHeight,
          float: floatState,
          opacity: imageOpacity,
        });
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isResizing,
    resizeStart,
    aspectRatioLocked,
    aspectRatio,
    floatState,
    imageOpacity,
    updateAttributes,
  ]);

  const widthValue =
    currentDimensions.width === "auto"
      ? "auto"
      : `${currentDimensions.width}px`;
  const heightValue =
    currentDimensions.height === "auto"
      ? "auto"
      : `${currentDimensions.height}px`;

  const wrapperStyle = {
    display: "inline-block",
    float: floatState,
    margin:
      floatState === "left"
        ? "0 16px 8px 0"
        : floatState === "right"
        ? "0 0 8px 16px"
        : "8px auto",
    position: "relative",
    border: selected ? "2px solid #1976d2" : "2px solid transparent",
    borderRadius: "4px",
    cursor: isResizing ? "se-resize" : "default",
    opacity: imageOpacity / 100,
    maxWidth: "100%",
    width: widthValue,
    height: heightValue,
    "--inline-image-width": widthValue,
    "--inline-image-max-width":
      currentDimensions.width === "auto" ? "100%" : widthValue,
    "--inline-image-height": heightValue,
  } as React.CSSProperties & {
    "--inline-image-width"?: string;
    "--inline-image-max-width"?: string;
    "--inline-image-height"?: string;
  };

  return (
    <NodeViewWrapper
      ref={containerRef}
      className="inline-image-wrapper"
      style={wrapperStyle}
      contentEditable={false}
    >
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        title={title}
        onLoad={handleImageLoad}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "4px",
          display: "block",
          userSelect: "none",
          pointerEvents: "none",
          objectFit: "contain",
        }}
        draggable={false}
      />

      {/* Drag Handle - Must have data-drag-handle */}
      {selected && (
        <Box
          data-drag-handle
          sx={{
            position: "absolute",
            top: "-15px",
            left: "-15px",
            backgroundColor: "#4caf50",
            color: "white",
            width: 24,
            height: 24,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "grab",
            boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
            zIndex: 10,
            "&:hover": {
              backgroundColor: "#45a049",
              transform: "scale(1.1)",
            },
            "&:active": {
              cursor: "grabbing",
            },
          }}
          title="Drag this handle to move image"
        >
          <OpenWith sx={{ fontSize: 14 }} />
        </Box>
      )}

      {/* Resize Handle */}
      {selected && (
        <Box
          onMouseDown={handleResizeStart}
          sx={{
            position: "absolute",
            bottom: "-15px",
            right: "-15px",
            backgroundColor: "#1976d2",
            color: "white",
            width: 20,
            height: 20,
            borderRadius: "2px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "se-resize",
            boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
            "&:hover": {
              backgroundColor: "#1565c0",
              transform: "scale(1.1)",
            },
          }}
        >
          <PhotoSizeSelectActual sx={{ fontSize: 12 }} />
        </Box>
      )}

      {/* Float/Wrap Toggle Button */}
      {selected && (
        <IconButton
          size="small"
          onClick={toggleFloat}
          sx={{
            position: "absolute",
            top: "-20px",
            right: "16px",
            backgroundColor:
              floatState === "left"
                ? "#ff9800"
                : floatState === "right"
                ? "#4caf50"
                : "#1976d2",
            color: "white",
            width: 24,
            height: 24,
            "&:hover": {
              backgroundColor:
                floatState === "left"
                  ? "#f57c00"
                  : floatState === "right"
                  ? "#45a049"
                  : "#1565c0",
            },
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
          title={
            floatState === "none"
              ? "No wrapping (inline)"
              : floatState === "left"
              ? "Wrap right (float left)"
              : "Wrap left (float right)"
          }
        >
          {floatState === "none" ? (
            <FormatAlignCenter fontSize="inherit" />
          ) : floatState === "left" ? (
            <FormatAlignLeft fontSize="inherit" />
          ) : (
            <FormatAlignRight fontSize="inherit" />
          )}
        </IconButton>
      )}

      {/* Photoshop-like Control Button */}
      {selected && (
        <IconButton
          size="small"
          onClick={handleShowControls}
          sx={{
            position: "absolute",
            top: "-15px",
            right: "-15px",
            backgroundColor: "#1976d2",
            color: "white",
            width: 24,
            height: 24,
            "&:hover": {
              backgroundColor: "#1565c0",
            },
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
        >
          <PhotoSizeSelectActual fontSize="small" />
        </IconButton>
      )}

      {/* Photoshop-like Controls Popover */}
      <Popover
        open={showControls}
        anchorEl={controlsAnchorEl}
        anchorReference={controlsAnchorPosition ? "anchorPosition" : "anchorEl"}
        anchorPosition={controlsAnchorPosition ?? undefined}
        onClose={handleHideControls}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        PaperProps={{
          sx: {
            p: 2,
            backgroundColor: "#2b2b2b",
            color: "white",
            minWidth: 320,
            border: "1px solid #555",
          },
        }}
      >
        <Box>
          <Typography
            variant="subtitle2"
            sx={{ mb: 2, color: "#ffffff", fontWeight: "bold" }}
          >
            Image Properties
          </Typography>

          {/* Size Controls */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <TextField
              label="Width"
              type="number"
              value={
                currentDimensions.width === "auto"
                  ? ""
                  : currentDimensions.width
              }
              onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
              size="small"
              sx={{
                flex: 1,
                "& .MuiInputLabel-root": { color: "#ccc" },
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": { borderColor: "#555" },
                  "&:hover fieldset": { borderColor: "#777" },
                  "&.Mui-focused fieldset": { borderColor: "#1976d2" },
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end" sx={{ color: "#ccc" }}>
                    px
                  </InputAdornment>
                ),
              }}
            />

            <IconButton
              onClick={toggleAspectRatioLock}
              sx={{
                color: aspectRatioLocked ? "#1976d2" : "#666",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              {aspectRatioLocked ? <Lock /> : <LockOpen />}
            </IconButton>

            <TextField
              label="Height"
              type="number"
              value={
                currentDimensions.height === "auto"
                  ? ""
                  : currentDimensions.height
              }
              onChange={(e) =>
                handleHeightChange(parseInt(e.target.value) || 0)
              }
              size="small"
              sx={{
                flex: 1,
                "& .MuiInputLabel-root": { color: "#ccc" },
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": { borderColor: "#555" },
                  "&:hover fieldset": { borderColor: "#777" },
                  "&.Mui-focused fieldset": { borderColor: "#1976d2" },
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end" sx={{ color: "#ccc" }}>
                    px
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Additional Info */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="caption" sx={{ color: "#ccc" }}>
              Original: {naturalDimensions.width} Ã— {naturalDimensions.height}
            </Typography>
            {aspectRatio && (
              <Typography variant="caption" sx={{ color: "#ccc" }}>
                Ratio: {aspectRatio.toFixed(2)}:1
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="caption" sx={{ color: "#ccc" }}>
              Size: {currentDimensions.width} Ã— {currentDimensions.height}
            </Typography>
            <Typography variant="caption" sx={{ color: "#ccc" }}>
              Wrap:{" "}
              {floatState === "none"
                ? "None"
                : floatState === "left"
                ? "Right"
                : "Left"}
            </Typography>
          </Box>

          {/* Text Wrapping Control */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 2,
              p: 1,
              backgroundColor: "rgba(255,255,255,0.05)",
              borderRadius: 1,
            }}
          >
            <Layers sx={{ color: "#ccc", fontSize: 16 }} />
            <Typography variant="body2" sx={{ color: "#ccc", flex: 1 }}>
              Text Wrapping:
            </Typography>
            <Button
              variant={floatState === "none" ? "contained" : "outlined"}
              size="small"
              onClick={toggleFloat}
              sx={{
                minWidth: 80,
                backgroundColor:
                  floatState === "left"
                    ? "#ff9800"
                    : floatState === "right"
                    ? "#4caf50"
                    : "#1976d2",
                color: "white",
                borderColor: "#1976d2",
                "&:hover": {
                  backgroundColor:
                    floatState === "left"
                      ? "#f57c00"
                      : floatState === "right"
                      ? "#45a049"
                      : "#1565c0",
                },
              }}
            >
              {floatState === "none"
                ? "None"
                : floatState === "left"
                ? "Right"
                : "Left"}
            </Button>
          </Box>

          {/* Opacity Control */}
          <Box
            sx={{
              mb: 2,
              p: 1,
              backgroundColor: "rgba(255,255,255,0.05)",
              borderRadius: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Typography variant="body2" sx={{ color: "#ccc", minWidth: 60 }}>
                Opacity:
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "#1976d2", fontWeight: "bold", minWidth: 35 }}
              >
                {imageOpacity}%
              </Typography>
            </Box>
            <Slider
              value={imageOpacity}
              onChange={(_, value) => handleOpacityChange(value as number)}
              min={0}
              max={100}
              step={1}
              sx={{
                color: "#1976d2",
                "& .MuiSlider-thumb": {
                  backgroundColor: "#1976d2",
                },
                "& .MuiSlider-track": {
                  backgroundColor: "#1976d2",
                },
                "& .MuiSlider-rail": {
                  backgroundColor: "rgba(255,255,255,0.3)",
                },
              }}
            />
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleResetSize}
              sx={{
                color: "white",
                borderColor: "#555",
                "&:hover": {
                  borderColor: "#777",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                },
              }}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={handleHideControls}
              sx={{
                backgroundColor: "#1976d2",
                "&:hover": {
                  backgroundColor: "#1565c0",
                },
              }}
            >
              Apply
            </Button>
          </Box>
        </Box>
      </Popover>
    </NodeViewWrapper>
  );
};

// Custom Inline Image Extension with Text Wrapping
const InlineImage = Image.extend({
  name: "inlineImage",

  addAttributes() {
    return {
      ...((this as any).parent?.() || {}),
      width: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute("width"),
        renderHTML: (attributes: { width?: string | number }) => {
          if (!attributes.width) return {};
          return { width: attributes.width };
        },
      },
      height: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute("height"),
        renderHTML: (attributes: { height?: string | number }) => {
          if (!attributes.height) return {};
          return { height: attributes.height };
        },
      },
      float: {
        default: "none",
        parseHTML: (element: HTMLElement) =>
          element.getAttribute("data-float") || "none",
        renderHTML: (attributes: { float?: string }) => {
          if (!attributes.float) return {};
          return { "data-float": attributes.float };
        },
      },
      anchorId: {
        default: null,
        parseHTML: (element: HTMLElement) =>
          element.getAttribute("data-anchor-id"),
        renderHTML: (attributes: { anchorId?: string | null }) => {
          if (!attributes.anchorId) return {};
          return { "data-anchor-id": attributes.anchorId };
        },
      },
      anchorOffset: {
        default: 0,
        parseHTML: (element: HTMLElement) => {
          const value = element.getAttribute("data-anchor-offset");
          if (value === null) return 0;
          const parsed = parseFloat(value);
          return Number.isFinite(parsed) ? parsed : 0;
        },
        renderHTML: (attributes: { anchorOffset?: number }) => {
          if (typeof attributes.anchorOffset !== "number") return {};
          return { "data-anchor-offset": String(attributes.anchorOffset) };
        },
      },
      opacity: {
        default: 100,
        parseHTML: (element: HTMLElement) =>
          parseInt(element.getAttribute("data-opacity") || "100"),
        renderHTML: (attributes: { opacity?: number }) => {
          if (!attributes.opacity && attributes.opacity !== 0) return {};
          return { "data-opacity": attributes.opacity };
        },
      },
    };
  },

  addCommands() {
    return {
      ...((this as any).parent?.() || {}),
      setInlineImage:
        (attributes: any = {}) =>
        ({ commands }: { commands: any }) => {
          const normalizedAttributes = {
            ...attributes,
            anchorId:
              typeof attributes?.anchorId === "string" && attributes.anchorId
                ? attributes.anchorId
                : generateAnchorId(),
            anchorOffset:
              typeof attributes?.anchorOffset === "number"
                ? attributes.anchorOffset
                : 0,
          };

          return commands.insertContent({
            type: this.name,
            attrs: normalizedAttributes,
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(InlineImageComponent, {
      contentDOMElementTag: "div",
    });
  },

  inline: false,
  group: "block",
  draggable: true,
  atom: false,
});

export { InlineImageComponent, generateAnchorId };
export default InlineImage;




