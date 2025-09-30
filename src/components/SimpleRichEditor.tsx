import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";
import { useDropzone } from "react-dropzone";
import {
  RichTextEditor,
  MenuControlsContainer,
  MenuSelectHeading,
  MenuDivider,
  MenuButtonBold,
  MenuButtonItalic,
  MenuButtonUnderline,
  MenuButtonStrikethrough,
  MenuButtonOrderedList,
  MenuButtonBulletedList,
  MenuButtonTextColor,
  MenuButtonHighlightColor,
  MenuButtonAlignLeft,
  MenuButtonAlignCenter,
  MenuButtonAlignRight,
  MenuButtonUndo,
  MenuButtonRedo,
  MenuSelectFontFamily,
  MenuButtonSubscript,
  MenuButtonSuperscript,
} from "mui-tiptap";
import {
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  Paper,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  InputAdornment,
  Popover,
  Slider,
} from "@mui/material";
import {
  TableChart,
  Image as ImageIcon,
  EmojiEmotions,
  Code,
  FormatQuote,
  CloudUpload,
  Link as LinkIcon,
  Upload,
  Lock,
  LockOpen,
  PhotoSizeSelectActual,
  OpenWith,
  Layers,
  FlipToFront,
  FlipToBack,
  Delete,
  CallMerge,
  CallSplit,
  TableRows,
  ViewColumn,
  AddBox,
  RemoveCircle,
} from "@mui/icons-material";

// Advanced Tiptap Extensions
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import FontFamily from "@tiptap/extension-font-family";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import FontSize from "@tiptap/extension-font-size";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Blockquote from "@tiptap/extension-blockquote";
import Placeholder from "@tiptap/extension-placeholder";
import Dropcursor from "@tiptap/extension-dropcursor";
import Gapcursor from "@tiptap/extension-gapcursor";
import { common, createLowlight } from "lowlight";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";

const lowlight = createLowlight(common);

// Freely Moveable Image Component with Photoshop-like Controls
const ResizableImageComponent: React.FC<{
  node: any;
  updateAttributes: (attrs: any) => void;
  selected: boolean;
}> = ({ node, updateAttributes, selected }) => {
  const { src, alt, title, width, height, x, y, layer, opacity } = node.attrs;
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
  const [position, setPosition] = useState({
    x: x || 0,
    y: y || 0,
  });
  const [layerState, setLayerState] = useState(layer || "behind"); // "overlay" or "behind"
  const [imageOpacity, setImageOpacity] = useState(opacity || 100); // 0-100
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({
    x: 0,
    y: 0,
    imageX: 0,
    imageY: 0,
  });
  const [controlsAnchorEl, setControlsAnchorEl] = useState<HTMLElement | null>(
    null
  );
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
      const width = Math.max(0, newWidth);
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
        x: position.x,
        y: position.y,
        layer: layerState,
        opacity: imageOpacity,
      });
    },
    [
      aspectRatioLocked,
      aspectRatio,
      currentDimensions.height,
      position,
      layerState,
      imageOpacity,
      updateAttributes,
    ]
  );

  // Handle height change with aspect ratio lock
  const handleHeightChange = useCallback(
    (newWidth: number) => {
      const height = Math.max(0, newWidth);
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
        x: position.x,
        y: position.y,
        layer: layerState,
        opacity: imageOpacity,
      });
    },
    [
      aspectRatioLocked,
      aspectRatio,
      currentDimensions.width,
      position,
      layerState,
      imageOpacity,
      updateAttributes,
    ]
  );

  // Handle X position change
  const handleXChange = useCallback(
    (newX: number) => {
      const newPosition = { x: newX, y: position.y };
      setPosition(newPosition);
      updateAttributes({
        width: currentDimensions.width,
        height: currentDimensions.height,
        ...newPosition,
        layer: layerState,
        opacity: imageOpacity,
      });
    },
    [position.y, currentDimensions, layerState, imageOpacity, updateAttributes]
  );

  // Handle Y position change
  const handleYChange = useCallback(
    (newY: number) => {
      const newPosition = { x: position.x, y: newY };
      setPosition(newPosition);
      updateAttributes({
        width: currentDimensions.width,
        height: currentDimensions.height,
        ...newPosition,
        layer: layerState,
        opacity: imageOpacity,
      });
    },
    [position.x, currentDimensions, layerState, imageOpacity, updateAttributes]
  );

  // Reset to original size and center position
  const handleResetSize = useCallback(() => {
    const resetDimensions = {
      width: naturalDimensions.width > 400 ? 400 : naturalDimensions.width,
      height: naturalDimensions.height > 300 ? 300 : naturalDimensions.height,
    };
    const resetPosition = { x: 0, y: 0 };
    setCurrentDimensions(resetDimensions);
    setPosition(resetPosition);
    updateAttributes({
      ...resetDimensions,
      ...resetPosition,
      layer: layerState,
      opacity: imageOpacity,
    });
  }, [naturalDimensions, updateAttributes]);

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
          x: position.x,
          y: position.y,
          layer: layerState,
          opacity: imageOpacity,
        });
      }

      return newLocked;
    });
  }, [aspectRatio, currentDimensions, position, layerState, imageOpacity, updateAttributes]);

  // Toggle layer state (overlay/behind text)
  const toggleLayerState = useCallback(() => {
    const newLayerState = layerState === "overlay" ? "behind" : "overlay";
    setLayerState(newLayerState);
    updateAttributes({
      width: currentDimensions.width,
      height: currentDimensions.height,
      x: position.x,
      y: position.y,
      layer: newLayerState,
      opacity: imageOpacity,
    });
  }, [layerState, currentDimensions, position, imageOpacity, updateAttributes]);

  // Handle opacity change
  const handleOpacityChange = useCallback(
    (newOpacity: number) => {
      const opacity = Math.min(100, Math.max(0, newOpacity));
      setImageOpacity(opacity);
      updateAttributes({
        width: currentDimensions.width,
        height: currentDimensions.height,
        x: position.x,
        y: position.y,
        layer: layerState,
        opacity: opacity,
      });
    },
    [currentDimensions, position, layerState, updateAttributes]
  );

  // Show controls
  const handleShowControls = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      event.stopPropagation();
      setControlsAnchorEl(event.currentTarget);
      setShowControls(true);
    },
    []
  );

  // Hide controls
  const handleHideControls = useCallback(() => {
    setControlsAnchorEl(null);
    setShowControls(false);
  }, []);

  // Handle drag start
  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({
        x: e.clientX,
        y: e.clientY,
        imageX: position.x,
        imageY: position.y,
      });
    },
    [position]
  );

  // Handle drag
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      const newPosition = {
        x: dragStart.imageX + deltaX,
        y: dragStart.imageY + deltaY,
      };

      setPosition(newPosition);
      updateAttributes({
        width: currentDimensions.width,
        height: currentDimensions.height,
        ...newPosition,
        layer: layerState,
        opacity: imageOpacity,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart, currentDimensions, updateAttributes]);

  return (
    <NodeViewWrapper
      ref={containerRef}
      style={{
        position: "absolute",
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: selected
          ? 1000
          : layerState === "overlay"
          ? 100 // Above text - will hide text unless opacity is reduced
          : 1, // Behind text - text appears normally
        border: selected
          ? layerState === "behind"
            ? "2px solid #ff9800"
            : "2px solid #1976d2"
          : layerState === "behind"
          ? "2px dashed rgba(255, 152, 0, 0.3)"
          : "2px solid transparent",
        borderRadius: "4px",
        cursor: isDragging ? "grabbing" : "grab",
        opacity: imageOpacity / 100, // Use manual opacity control
      }}
    >
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        title={title}
        onLoad={handleImageLoad}
        onMouseDown={handleDragStart}
        style={{
          width:
            currentDimensions.width === "auto"
              ? "auto"
              : `${currentDimensions.width}px`,
          height:
            currentDimensions.height === "auto"
              ? "auto"
              : `${currentDimensions.height}px`,
          borderRadius: "4px",
          display: "block",
          userSelect: "none",
          pointerEvents: selected ? "auto" : "none",
        }}
        draggable={false}
      />

      {/* Drag Handle */}
      {selected && (
        <Box
          onMouseDown={handleDragStart}
          sx={{
            position: "absolute",
            top: "-8px",
            left: "-8px",
            backgroundColor: "#1976d2",
            color: "white",
            width: 16,
            height: 16,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "grab",
            boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
            "&:hover": {
              backgroundColor: "#1565c0",
              transform: "scale(1.1)",
            },
            "&:active": {
              cursor: "grabbing",
            },
          }}
        >
          <OpenWith sx={{ fontSize: 10 }} />
        </Box>
      )}

      {/* Layer Toggle Button */}
      {selected && (
        <IconButton
          size="small"
          onClick={toggleLayerState}
          sx={{
            position: "absolute",
            top: "-12px",
            right: "16px",
            backgroundColor: layerState === "overlay" ? "#1976d2" : "#ff9800",
            color: "white",
            width: 24,
            height: 24,
            "&:hover": {
              backgroundColor: layerState === "overlay" ? "#1565c0" : "#f57c00",
            },
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
          title={
            layerState === "overlay"
              ? "Overlay mode (image above text)"
              : "Background mode (image behind text)"
          }
        >
          {layerState === "overlay" ? (
            <FlipToFront fontSize="small" />
          ) : (
            <FlipToBack fontSize="small" />
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
            top: "-12px",
            right: "-12px",
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
        onClose={handleHideControls}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
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

          {/* Position Controls */}
          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <TextField
              label="X Position"
              type="number"
              value={position.x}
              onChange={(e) => handleXChange(parseInt(e.target.value) || 0)}
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

            <TextField
              label="Y Position"
              type="number"
              value={position.y}
              onChange={(e) => handleYChange(parseInt(e.target.value) || 0)}
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
              Original: {naturalDimensions.width} × {naturalDimensions.height}
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
              Position: {position.x}, {position.y}
            </Typography>
            <Typography variant="caption" sx={{ color: "#ccc" }}>
              Size: {currentDimensions.width} × {currentDimensions.height}
            </Typography>
          </Box>

          {/* Layer Control */}
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
              Layer:
            </Typography>
            <Button
              variant={layerState === "overlay" ? "contained" : "outlined"}
              size="small"
              onClick={toggleLayerState}
              startIcon={
                layerState === "overlay" ? <FlipToFront /> : <FlipToBack />
              }
              sx={{
                backgroundColor:
                  layerState === "overlay" ? "#1976d2" : "transparent",
                color: layerState === "overlay" ? "white" : "#1976d2",
                borderColor: "#1976d2",
                "&:hover": {
                  backgroundColor:
                    layerState === "overlay"
                      ? "#1565c0"
                      : "rgba(25, 118, 210, 0.1)",
                },
              }}
            >
              {layerState === "overlay" ? "Overlay" : "Background"}
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

// Custom Resizable Image Extension
const ResizableImage = Image.extend({
  name: "resizableImage",

  addAttributes() {
    return {
      ...this.parent?.() || {},
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
      x: {
        default: 0,
        parseHTML: (element: HTMLElement) =>
          parseInt(element.getAttribute("data-x") || "0"),
        renderHTML: (attributes: { x?: number }) => {
          if (!attributes.x && attributes.x !== 0) return {};
          return { "data-x": attributes.x };
        },
      },
      y: {
        default: 0,
        parseHTML: (element: HTMLElement) =>
          parseInt(element.getAttribute("data-y") || "0"),
        renderHTML: (attributes: { y?: number }) => {
          if (!attributes.y && attributes.y !== 0) return {};
          return { "data-y": attributes.y };
        },
      },
      layer: {
        default: "behind",
        parseHTML: (element: HTMLElement) =>
          element.getAttribute("data-layer") || "behind",
        renderHTML: (attributes: { layer?: string }) => {
          if (!attributes.layer) return {};
          return { "data-layer": attributes.layer };
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
      ...this.parent?.() || {},
      setResizableImage:
        (attributes: any) =>
        ({ commands }: { commands: any }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent);
  },

  atom: true,
  draggable: true,
});

interface SimpleRichEditorProps {
  content: string;
  onChange: (content: string, jsonContent?: any) => void;
  placeholder?: string;
  className?: string;
  autoSave?: boolean;
  maxLength?: number;
  readOnly?: boolean;
  theme?: "light" | "dark";
  onPreviewModeToggle?: () => void;
  isPreviewMode?: boolean;
}

interface EditorState {
  showEmojiPicker: boolean;
  showImageDialog: boolean;
  showTableDialog: boolean;
  showSettingsDialog: boolean;
  showExportDialog: boolean;
  imageUrl: string;
  imageCaption: string;
  selectedImageFile: File | null;
  imageInputMode: "url" | "file";
  fontSize: string;
  tableBorders: boolean;
  tableRows: number;
  tableCols: number;
  emojiCategory: string;
  emojiSearch: string;
  isFullscreen: boolean;
  isPreviewMode: boolean;
  autoSaveEnabled: boolean;
  wordCount: number;
  characterCount: number;
  lastSaved: Date | null;
  notification: string;
  showNotification: boolean;
}

const SimpleRichEditor: React.FC<SimpleRichEditorProps> = ({
  content,
  onChange,
  placeholder = "Start writing something amazing...",
  className = "",
  autoSave = true,
  readOnly = false,
  theme = "light",
  onPreviewModeToggle,
  isPreviewMode: externalPreviewMode,
}) => {
  const [currentEditor, setCurrentEditor] = useState<any>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const [state, setState] = useState<EditorState>({
    showEmojiPicker: false,
    showImageDialog: false,
    showTableDialog: false,
    showSettingsDialog: false,
    showExportDialog: false,
    imageUrl: "",
    imageCaption: "",
    selectedImageFile: null,
    imageInputMode: "url",
    fontSize: "16",
    tableBorders: true,
    tableRows: 3,
    tableCols: 3,
    emojiCategory: "smileys",
    emojiSearch: "",
    isFullscreen: false,
    isPreviewMode: false,
    autoSaveEnabled: autoSave,
    wordCount: 0,
    characterCount: 0,
    lastSaved: null,
    notification: "",
    showNotification: false,
  });

  const updateState = useCallback((updates: Partial<EditorState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Enhanced Emoji Categories with More Emojis
  const emojiCategories = useMemo(
    () => ({
      smileys: [
        "😀",
        "😃",
        "😄",
        "😁",
        "😆",
        "😅",
        "😂",
        "🤣",
        "😊",
        "😇",
        "🙂",
        "🙃",
        "😉",
        "😌",
        "😍",
        "🥰",
        "😘",
        "😗",
        "😙",
        "😚",
        "🤔",
        "🤨",
        "😐",
        "😑",
        "😶",
        "🙄",
        "😏",
        "😣",
        "😥",
        "😮",
        "🤐",
        "😯",
        "😪",
        "😫",
        "🥱",
        "😴",
        "😛",
        "😜",
        "😝",
        "🤤",
      ],
      gestures: [
        "👍",
        "👎",
        "👌",
        "✋",
        "🤚",
        "🖐️",
        "✊",
        "👊",
        "🤛",
        "🤜",
        "👏",
        "🙌",
        "👐",
        "🤲",
        "🤝",
        "🙏",
        "✍️",
        "💪",
        "🦾",
        "🦿",
        "👋",
        "🤟",
        "✌️",
        "🤞",
        "🤘",
        "🤙",
        "👈",
        "👉",
        "👆",
        "👇",
        "☝️",
      ],
      hearts: [
        "❤️",
        "🧡",
        "💛",
        "💚",
        "💙",
        "💜",
        "🖤",
        "🤍",
        "🤎",
        "💔",
        "❣️",
        "💕",
        "💞",
        "💓",
        "💗",
        "💖",
        "💘",
        "💝",
        "💟",
        "♥️",
        "💌",
        "💋",
        "💯",
        "💢",
        "💥",
        "💫",
        "💦",
        "💨",
      ],
      animals: [
        "🐶",
        "🐱",
        "🐭",
        "🐹",
        "🐰",
        "🦊",
        "🐻",
        "🐼",
        "🐨",
        "🐯",
        "🦁",
        "🐮",
        "🐷",
        "🐽",
        "🐸",
        "🐵",
        "🙈",
        "🙉",
        "🙊",
        "🐒",
        "🐔",
        "🐧",
        "🐦",
        "🐤",
        "🐣",
        "🐥",
        "🦆",
        "🦅",
        "🦉",
        "🦇",
      ],
      food: [
        "🍎",
        "🍐",
        "🍊",
        "🍋",
        "🍌",
        "🍉",
        "🍇",
        "🍓",
        "🫐",
        "🍈",
        "🍒",
        "🍑",
        "🥭",
        "🍍",
        "🥥",
        "🥝",
        "🍅",
        "🍆",
        "🥑",
        "🥦",
        "🥬",
        "🥒",
        "🌶️",
        "🫑",
        "🌽",
        "🥕",
        "🫒",
        "🧄",
        "🧅",
        "🥔",
      ],
      activities: [
        "⚽",
        "🏀",
        "🏈",
        "⚾",
        "🥎",
        "🎾",
        "🏐",
        "🏉",
        "🥏",
        "🎱",
        "🪀",
        "🏓",
        "🏸",
        "🏒",
        "🏑",
        "🥍",
        "🏏",
        "🪃",
        "🥅",
        "⛳",
        "🪁",
        "🏹",
        "🎣",
        "🤿",
        "🥊",
        "🥋",
        "🎽",
        "🛹",
        "🛷",
      ],
      objects: [
        "⌚",
        "📱",
        "📲",
        "💻",
        "⌨️",
        "🖥️",
        "🖨️",
        "🖱️",
        "🖲️",
        "🕹️",
        "🗜️",
        "💽",
        "💾",
        "💿",
        "📀",
        "📼",
        "📷",
        "📸",
        "📹",
        "🎥",
        "📽️",
        "🎞️",
        "📞",
        "☎️",
        "📟",
        "📠",
      ],
      travel: [
        "🚗",
        "🚕",
        "🚙",
        "🚌",
        "🚎",
        "🏎️",
        "🚓",
        "🚑",
        "🚒",
        "🚐",
        "🛻",
        "🚚",
        "🚛",
        "🚜",
        "🏍️",
        "🛵",
        "🚲",
        "🛴",
        "🛹",
        "🛼",
        "🚁",
        "🛸",
        "✈️",
        "🛫",
        "🛬",
        "🪂",
        "⛵",
      ],
      symbols: [
        "❤️",
        "💙",
        "💚",
        "💛",
        "🧡",
        "💜",
        "🖤",
        "🤍",
        "🤎",
        "💔",
        "❣️",
        "💕",
        "💞",
        "💓",
        "💗",
        "💖",
        "💘",
        "💝",
        "💟",
        "☮️",
        "✝️",
        "☪️",
        "🕉️",
        "☸️",
        "✡️",
        "🔯",
      ],
    }),
    []
  );

  // Advanced Extensions Configuration
  const extensions = useMemo(
    () => [
      StarterKit,
      Underline,
      Subscript,
      Superscript,
      TextAlign.configure({
        types: ["heading", "paragraph", "resizableImage"],
      }),
      FontFamily.configure({
        types: ["textStyle"],
      }),
      TextStyle,
      FontSize,
      Color.configure({
        types: ["textStyle"],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "editor-link",
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      ResizableImage.configure({
        HTMLAttributes: {
          class: "editor-image",
        },
        allowBase64: true,
        inline: false,
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: state.tableBorders ? "editor-table bordered" : "editor-table",
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: "code-block",
        },
      }),
      Blockquote.configure({
        HTMLAttributes: {
          class: "editor-blockquote",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Dropcursor.configure({
        color: "#ff6b35",
        width: 2,
      }),
      Gapcursor,
    ],
    [placeholder, state.tableBorders]
  );

  // Enhanced Font and Size Options
  const fontFamilyOptions = useMemo(
    () => [
      { label: "Arial", value: "Arial, sans-serif" },
      { label: "Georgia", value: "Georgia, serif" },
      { label: "Times New Roman", value: '"Times New Roman", serif' },
      { label: "Helvetica", value: "Helvetica, sans-serif" },
      { label: "Verdana", value: "Verdana, sans-serif" },
      { label: "Courier New", value: '"Courier New", monospace' },
      { label: "Impact", value: "Impact, sans-serif" },
      { label: "Comic Sans MS", value: '"Comic Sans MS", cursive' },
      { label: "Palatino", value: "Palatino, serif" },
      { label: "Garamond", value: "Garamond, serif" },
      { label: "Trebuchet MS", value: '"Trebuchet MS", sans-serif' },
      { label: "Roboto", value: "Roboto, sans-serif" },
      { label: "Open Sans", value: '"Open Sans", sans-serif' },
      { label: "Lato", value: "Lato, sans-serif" },
      { label: "Montserrat", value: "Montserrat, sans-serif" },
    ],
    []
  );

  const fontSizeOptions = useMemo(
    () => [
      "8",
      "9",
      "10",
      "11",
      "12",
      "14",
      "16",
      "18",
      "20",
      "22",
      "24",
      "28",
      "32",
      "36",
      "42",
      "48",
      "56",
      "64",
      "72",
      "84",
      "96",
    ],
    []
  );

  // Drag and Drop for Images
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp", ".svg"],
    },
    maxFiles: 10,
    maxSize: 10485760, // 10MB
    onDrop: useCallback(
      (acceptedFiles: File[]) => {
        if (!currentEditor) return;

        acceptedFiles.forEach((file) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            // Insert in a paragraph so it can be aligned
            currentEditor
              .chain()
              .focus()
              .setResizableImage({
                src: result,
                alt: file.name,
                title: file.name,
              })
              .run();

            updateState({
              notification: `Image "${file.name}" uploaded successfully!`,
              showNotification: true,
            });
          };
          reader.readAsDataURL(file);
        });
      },
      [currentEditor, updateState]
    ),
  });

  // Word and character count
  useEffect(() => {
    if (currentEditor) {
      const updateCounts = () => {
        const text = currentEditor.getText();
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const characters = text.length;

        updateState({
          wordCount: words,
          characterCount: characters,
        });
      };

      currentEditor.on("update", updateCounts);
      updateCounts(); // Initial count

      return () => {
        currentEditor.off("update", updateCounts);
      };
    }
  }, [currentEditor, updateState]);

  // Use external preview mode if provided, otherwise use internal state
  const isPreviewMode =
    externalPreviewMode !== undefined
      ? externalPreviewMode
      : state.isPreviewMode;


  // Load saved layout state
  const loadSavedState = useCallback(() => {
    const savedJsonContent = localStorage.getItem("editor-content-json");
    console.log("Loading saved JSON content:", savedJsonContent);
    if (savedJsonContent && currentEditor) {
      try {
        const jsonContent = JSON.parse(savedJsonContent);
        console.log("Parsed JSON content:", jsonContent);
        currentEditor.commands.setContent(jsonContent);
        updateState({
          notification: "Saved layout loaded!",
          showNotification: true,
        });
      } catch (error) {
        console.error("Error loading saved state:", error);
      }
    } else {
      console.log("No saved JSON content found or no editor available");
    }
  }, [currentEditor, updateState]);

  // Load saved state when entering preview mode
  useEffect(() => {
    console.log(
      "Preview mode effect triggered:",
      isPreviewMode,
      !!currentEditor
    );
    if (isPreviewMode && currentEditor) {
      loadSavedState();
    }
  }, [isPreviewMode, loadSavedState, currentEditor]);

  // Advanced Functions
  const insertEmoji = useCallback(
    (emoji: string) => {
      if (!currentEditor) return;
      currentEditor.chain().focus().insertContent(emoji).run();
      updateState({ showEmojiPicker: false });
    },
    [currentEditor, updateState]
  );

  const insertImage = useCallback(() => {
    if (!currentEditor) return;

    const handleImageInsertion = (imageSrc: string) => {
      if (state.imageCaption) {
        // Insert with caption using figure
        const imageHtml = `<figure><img src="${imageSrc}" alt="${state.imageCaption}" title="${state.imageCaption}" /><figcaption>${state.imageCaption}</figcaption></figure>`;
        currentEditor.chain().focus().insertContent(imageHtml).run();
      } else {
        // Insert resizable image using the extension command
        currentEditor
          .chain()
          .focus()
          .setResizableImage({ src: imageSrc, alt: "", title: "" })
          .run();
      }
      updateState({
        showImageDialog: false,
        imageUrl: "",
        imageCaption: "",
        selectedImageFile: null,
        imageInputMode: "url",
        notification: "Image inserted successfully!",
        showNotification: true,
      });
    };

    if (state.imageInputMode === "url") {
      if (!state.imageUrl) return;
      handleImageInsertion(state.imageUrl);
    } else if (state.imageInputMode === "file" && state.selectedImageFile) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        handleImageInsertion(result);
      };
      reader.readAsDataURL(state.selectedImageFile);
    }
  }, [
    currentEditor,
    state.imageUrl,
    state.imageCaption,
    state.imageInputMode,
    state.selectedImageFile,
    updateState,
  ]);

  const insertTable = useCallback(() => {
    if (!currentEditor) return;

    try {
      // Use TipTap's table extension to create table
      currentEditor
        .chain()
        .focus()
        .insertTable({
          rows: state.tableRows,
          cols: state.tableCols,
          withHeaderRow: true,
        })
        .run();

      // Apply border class after table creation
      setTimeout(() => {
        const tables = currentEditor.view.dom.querySelectorAll('table:last-child');
        if (tables.length > 0) {
          const lastTable = tables[tables.length - 1];
          lastTable.className = `editor-table${state.tableBorders ? ' bordered' : ''}`;
        }
      }, 100);

      updateState({
        showTableDialog: false,
        notification: `Table ${state.tableRows}×${state.tableCols} inserted successfully!`,
        showNotification: true,
      });
    } catch (error) {
      console.error('Error inserting table:', error);
      updateState({
        notification: 'Failed to insert table. Please try again.',
        showNotification: true,
      });
    }
  }, [currentEditor, state.tableRows, state.tableCols, state.tableBorders, updateState]);

  const applyFontSize = useCallback(
    (size: string) => {
      if (!currentEditor) return;
      currentEditor
        .chain()
        .focus()
        .setFontSize(size + "px")
        .run();
      updateState({ fontSize: size });
    },
    [currentEditor, updateState]
  );

  const insertLink = useCallback(() => {
    if (!currentEditor) return;
    const url = window.prompt("Enter link URL:");
    if (url) {
      currentEditor.chain().focus().setLink({ href: url }).run();
      updateState({
        notification: "Link inserted!",
        showNotification: true,
      });
    }
  }, [currentEditor, updateState]);

  const insertCodeBlock = useCallback(() => {
    if (!currentEditor) return;
    currentEditor.chain().focus().toggleCodeBlock().run();
  }, [currentEditor]);

  const insertBlockquote = useCallback(() => {
    if (!currentEditor) return;
    currentEditor.chain().focus().toggleBlockquote().run();
  }, [currentEditor]);

  const deleteTable = useCallback(() => {
    if (!currentEditor) return;
    currentEditor.chain().focus().deleteTable().run();
    updateState({
      notification: "Table deleted successfully!",
      showNotification: true,
    });
  }, [currentEditor, updateState]);

  // Table manipulation functions
  const mergeCells = useCallback(() => {
    if (!currentEditor) return;
    currentEditor.chain().focus().mergeCells().run();
    updateState({
      notification: "Cells merged successfully!",
      showNotification: true,
    });
  }, [currentEditor, updateState]);

  const splitCell = useCallback(() => {
    if (!currentEditor) return;
    currentEditor.chain().focus().splitCell().run();
    updateState({
      notification: "Cell split successfully!",
      showNotification: true,
    });
  }, [currentEditor, updateState]);

  const addColumnBefore = useCallback(() => {
    if (!currentEditor) return;
    try {
      if (currentEditor.can().addColumnBefore()) {
        currentEditor.chain().focus().addColumnBefore().run();
        updateState({
          notification: "Column added before!",
          showNotification: true,
        });
      } else {
        updateState({
          notification: "Cannot add column. Make sure cursor is in a table cell.",
          showNotification: true,
        });
      }
    } catch (error) {
      console.error('Add column before error:', error);
    }
  }, [currentEditor, updateState]);

  const addColumnAfter = useCallback(() => {
    if (!currentEditor) return;
    try {
      if (currentEditor.can().addColumnAfter()) {
        currentEditor.chain().focus().addColumnAfter().run();
        updateState({
          notification: "Column added after!",
          showNotification: true,
        });
      } else {
        updateState({
          notification: "Cannot add column. Make sure cursor is in a table cell.",
          showNotification: true,
        });
      }
    } catch (error) {
      console.error('Add column after error:', error);
    }
  }, [currentEditor, updateState]);

  const deleteColumn = useCallback(() => {
    if (!currentEditor) return;
    try {
      if (currentEditor.can().deleteColumn()) {
        currentEditor.chain().focus().deleteColumn().run();
        updateState({
          notification: "Column deleted!",
          showNotification: true,
        });
      } else {
        updateState({
          notification: "Cannot delete column. Make sure cursor is in a table cell.",
          showNotification: true,
        });
      }
    } catch (error) {
      console.error('Delete column error:', error);
    }
  }, [currentEditor, updateState]);

  const addRowBefore = useCallback(() => {
    if (!currentEditor) return;
    try {
      if (currentEditor.can().addRowBefore()) {
        currentEditor.chain().focus().addRowBefore().run();
        updateState({
          notification: "Row added before!",
          showNotification: true,
        });
      } else {
        updateState({
          notification: "Cannot add row. Make sure cursor is in a table cell.",
          showNotification: true,
        });
      }
    } catch (error) {
      console.error('Add row before error:', error);
    }
  }, [currentEditor, updateState]);

  const addRowAfter = useCallback(() => {
    if (!currentEditor) return;
    try {
      if (currentEditor.can().addRowAfter()) {
        currentEditor.chain().focus().addRowAfter().run();
        updateState({
          notification: "Row added after!",
          showNotification: true,
        });
      } else {
        updateState({
          notification: "Cannot add row. Make sure cursor is in a table cell.",
          showNotification: true,
        });
      }
    } catch (error) {
      console.error('Add row after error:', error);
    }
  }, [currentEditor, updateState]);

  const deleteRow = useCallback(() => {
    if (!currentEditor) return;
    try {
      if (currentEditor.can().deleteRow()) {
        currentEditor.chain().focus().deleteRow().run();
        updateState({
          notification: "Row deleted!",
          showNotification: true,
        });
      } else {
        updateState({
          notification: "Cannot delete row. Make sure cursor is in a table cell.",
          showNotification: true,
        });
      }
    } catch (error) {
      console.error('Delete row error:', error);
    }
  }, [currentEditor, updateState]);

  // Filtered emojis with search
  const filteredEmojis = useMemo(() => {
    const categoryEmojis =
      emojiCategories[state.emojiCategory as keyof typeof emojiCategories] ||
      [];
    return categoryEmojis.filter(
      (emoji) => state.emojiSearch === "" || emoji.includes(state.emojiSearch)
    );
  }, [emojiCategories, state.emojiCategory, state.emojiSearch]);

  return (
    <Box
      className={`advanced-rich-editor ${
        isPreviewMode ? "preview-mode" : ""
      } ${className}`}
      sx={{
        position: state.isFullscreen ? "fixed" : "relative",
        top: state.isFullscreen ? 0 : "auto",
        left: state.isFullscreen ? 0 : "auto",
        width: state.isFullscreen ? "100vw" : "100%",
        height: state.isFullscreen ? "100vh" : "auto",
        zIndex: state.isFullscreen ? 1300 : "auto",
        bgcolor: theme === "dark" ? "grey.900" : "background.paper",
        borderRadius: state.isFullscreen ? 0 : 2,
        boxShadow: state.isFullscreen ? 0 : 1,
        border: isPreviewMode ? "3px solid #2196f3" : "none",
      }}
      {...(isDragActive && !isPreviewMode ? getRootProps() : {})}
    >
      {/* Preview Mode Indicator */}
      {isPreviewMode && (
        <Box
          sx={{
            position: "absolute",
            top: -3,
            left: -3,
            right: -3,
            height: 30,
            bgcolor: "#2196f3",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            fontWeight: "bold",
            fontSize: "14px",
          }}
        >
          🔍 PREVIEW MODE - Click the preview button to exit
        </Box>
      )}
      {/* Drop Zone Overlay */}
      {isDragActive && !isPreviewMode && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "rgba(25, 118, 210, 0.1)",
            border: "2px dashed #1976d2",
            borderRadius: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <CloudUpload sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
          <Typography variant="h6" color="primary">
            Drop images here to upload
          </Typography>
        </Box>
      )}

      {/* Hidden file input for drag and drop */}
      <input {...getInputProps()} />

      {/* Main Editor */}
      <Box ref={editorRef}>
        <RichTextEditor
          extensions={extensions}
          content={content}
          editable={!readOnly && !isPreviewMode}
          onCreate={({ editor }) => {
            // Ensure controls render immediately on mount
            setCurrentEditor(editor);

            // Load saved JSON content if available (but don't override initial content)
            // This will be handled by the loadSavedState function when entering preview mode
          }}
          onUpdate={({ editor }) => {
            if (!isPreviewMode) {
              // Get both HTML and JSON content
              const htmlContent = editor.getHTML();
              const jsonContent = editor.getJSON();

              console.log("onUpdate - HTML:", htmlContent);
              console.log("onUpdate - JSON:", jsonContent);

              // Store JSON content for image positioning data
              localStorage.setItem(
                "editor-content-json",
                JSON.stringify(jsonContent)
              );

              // Pass both HTML and JSON to parent component
              onChange(htmlContent, jsonContent);
            }
            setCurrentEditor(editor);
          }}
          renderControls={() => {
            // Hide controls in Preview Mode
            if (isPreviewMode) return null;
            // Controls can render immediately; actions will use currentEditor when available
            if (!currentEditor) {
              // Render controls early (without depending on currentEditor)
              // so the toolbar is visible before the first keystroke.
            }
            return (
              <MenuControlsContainer>
                {/* Font Controls */}
                <MenuSelectFontFamily options={fontFamilyOptions} />
                <Select
                  value={state.fontSize}
                  onChange={(e) => applyFontSize(e.target.value)}
                  size="small"
                  sx={{ minWidth: 80, mr: 1 }}
                >
                  {fontSizeOptions.map((size) => (
                    <MenuItem key={size} value={size}>
                      {size}px
                    </MenuItem>
                  ))}
                </Select>
                <MenuDivider />

                {/* Text Formatting */}
                <MenuButtonBold />
                <MenuButtonItalic />
                <MenuButtonUnderline />
                <MenuButtonStrikethrough />
                <MenuButtonSubscript />
                <MenuButtonSuperscript />
                <MenuDivider />

                {/* Colors */}
                <MenuButtonTextColor />
                <MenuButtonHighlightColor />
                <MenuDivider />

                {/* Headings */}
                <MenuSelectHeading />
                <MenuDivider />

                {/* Lists */}
                <MenuButtonBulletedList />
                <MenuButtonOrderedList />
                <MenuDivider />

                {/* Alignment */}
                <MenuButtonAlignLeft />
                <MenuButtonAlignCenter />
                <MenuButtonAlignRight />
                <MenuDivider />

                {/* Advanced Features */}
                <Tooltip title="Insert Link">
                  <IconButton size="small" onClick={insertLink}>
                    <LinkIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Insert Code Block">
                  <IconButton size="small" onClick={insertCodeBlock}>
                    <Code />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Insert Quote">
                  <IconButton size="small" onClick={insertBlockquote}>
                    <FormatQuote />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Insert Image">
                  <IconButton
                    size="small"
                    onClick={() => updateState({ showImageDialog: true })}
                  >
                    <ImageIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Insert Table">
                  <IconButton
                    size="small"
                    onClick={() => updateState({ showTableDialog: true })}
                  >
                    <TableChart />
                  </IconButton>
                </Tooltip>

                {/* Table Controls - Only show when table is selected */}
                {currentEditor?.isActive("table") && (
                  <>
                    <MenuDivider />

                    {/* Cell Merge/Split */}
                    <Tooltip title="Merge Cells">
                      <IconButton size="small" onClick={mergeCells}>
                        <CallMerge />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Split Cell">
                      <IconButton size="small" onClick={splitCell}>
                        <CallSplit />
                      </IconButton>
                    </Tooltip>

                    <MenuDivider />

                    {/* Row Controls */}
                    <Tooltip title="Add Row Before">
                      <IconButton size="small" onClick={addRowBefore}>
                        <AddBox />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Add Row After">
                      <IconButton size="small" onClick={addRowAfter}>
                        <TableRows />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete Row">
                      <IconButton
                        size="small"
                        onClick={deleteRow}
                        sx={{ color: "warning.main" }}
                      >
                        <RemoveCircle />
                      </IconButton>
                    </Tooltip>

                    <MenuDivider />

                    {/* Column Controls */}
                    <Tooltip title="Add Column Before">
                      <IconButton size="small" onClick={addColumnBefore}>
                        <AddBox sx={{ transform: "rotate(90deg)" }} />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Add Column After">
                      <IconButton size="small" onClick={addColumnAfter}>
                        <ViewColumn />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete Column">
                      <IconButton
                        size="small"
                        onClick={deleteColumn}
                        sx={{ color: "warning.main" }}
                      >
                        <RemoveCircle sx={{ transform: "rotate(90deg)" }} />
                      </IconButton>
                    </Tooltip>

                    <MenuDivider />

                    {/* Delete Table */}
                    <Tooltip title="Delete Table">
                      <IconButton
                        size="small"
                        onClick={deleteTable}
                        sx={{
                          color: "error.main",
                          "&:hover": {
                            backgroundColor: "error.light",
                            color: "error.contrastText",
                          },
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </>
                )}

                <Tooltip title="Insert Emoji">
                  <IconButton
                    size="small"
                    onClick={() =>
                      updateState({ showEmojiPicker: !state.showEmojiPicker })
                    }
                  >
                    <EmojiEmotions />
                  </IconButton>
                </Tooltip>

                <MenuDivider />

                {/* Undo/Redo */}
                <MenuButtonUndo />
                <MenuButtonRedo />
              </MenuControlsContainer>
            );
          }}
          editorProps={{
            attributes: {
              style:
                "min-height: 400px; max-height: 400px; overflow-y: auto; scrollbar-gutter: stable both-edges; padding: 16px; outline: none; line-height: 1.6;",
              placeholder: placeholder,
            },
          }}
        />
      </Box>

      {/* Enhanced Emoji Picker */}
      {state.showEmojiPicker && (
        <Paper
          elevation={3}
          sx={{
            position: "absolute",
            top: "120px",
            left: "20px",
            width: 400,
            maxHeight: 450,
            minHeight: 450,
            p: 2,
            zIndex: 1300,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Emoji Picker
          </Typography>

          <TextField
            placeholder="Search emojis..."
            value={state.emojiSearch}
            onChange={(e) => updateState({ emojiSearch: e.target.value })}
            size="small"
            fullWidth
            sx={{ mb: 2 }}
          />

          <Box sx={{ mb: 2 }}>
            {Object.keys(emojiCategories).map((category) => (
              <Chip
                key={category}
                label={category}
                onClick={() => updateState({ emojiCategory: category })}
                color={state.emojiCategory === category ? "primary" : "default"}
                size="small"
                sx={{ mr: 1, mb: 1, textTransform: "capitalize" }}
              />
            ))}
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(8, 1fr)",
              gap: 1,
              maxHeight: 250,
              overflowY: "auto",
            }}
          >
            {filteredEmojis.map((emoji, index) => (
              <Button
                key={index}
                onClick={() => insertEmoji(emoji)}
                sx={{
                  minWidth: "auto",
                  p: 0.5,
                  fontSize: "25px",
                  aspectRatio: "1",
                }}
              >
                {emoji}
              </Button>
            ))}
          </Box>

          <Box sx={{ mt: 2, textAlign: "right" }}>
            <Button onClick={() => updateState({ showEmojiPicker: false })}>
              Close
            </Button>
          </Box>
        </Paper>
      )}

      {/* Image Insert Dialog */}
      <Dialog
        open={state.showImageDialog}
        onClose={() => updateState({ showImageDialog: false })}
        maxWidth="sm"
        fullWidth
        sx={{ zIndex: 1400 }}
        PaperProps={{
          sx: { zIndex: 1400 },
        }}
      >
        <DialogTitle>Insert Image</DialogTitle>
        <DialogContent>
          <Tabs
            value={state.imageInputMode}
            onChange={(_, newValue) =>
              updateState({ imageInputMode: newValue })
            }
            sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}
          >
            <Tab
              icon={<LinkIcon />}
              label="URL"
              value="url"
              iconPosition="start"
            />
            <Tab
              icon={<Upload />}
              label="Upload File"
              value="file"
              iconPosition="start"
            />
          </Tabs>

          {state.imageInputMode === "url" && (
            <TextField
              autoFocus
              margin="dense"
              label="Image URL"
              fullWidth
              variant="outlined"
              value={state.imageUrl}
              onChange={(e) => updateState({ imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
              sx={{ mb: 2 }}
            />
          )}

          {state.imageInputMode === "file" && (
            <Box sx={{ mb: 2 }}>
              <input
                accept="image/*"
                style={{ display: "none" }}
                id="image-file-input"
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  updateState({ selectedImageFile: file });
                }}
              />
              <label htmlFor="image-file-input">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUpload />}
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  Choose Image File
                </Button>
              </label>
              {state.selectedImageFile && (
                <Typography variant="body2" color="text.secondary">
                  Selected: {state.selectedImageFile.name}
                </Typography>
              )}
            </Box>
          )}

          <TextField
            margin="dense"
            label="Caption (optional)"
            fullWidth
            variant="outlined"
            value={state.imageCaption}
            onChange={(e) => updateState({ imageCaption: e.target.value })}
            placeholder="Enter image caption..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => updateState({ showImageDialog: false })}>
            Cancel
          </Button>
          <Button
            onClick={insertImage}
            variant="contained"
            disabled={
              (state.imageInputMode === "url" && !state.imageUrl) ||
              (state.imageInputMode === "file" && !state.selectedImageFile)
            }
          >
            Insert Image
          </Button>
        </DialogActions>
      </Dialog>

      {/* Table Insert Dialog */}
      <Dialog
        open={state.showTableDialog}
        onClose={() => updateState({ showTableDialog: false })}
        maxWidth="md"
        fullWidth
        sx={{ zIndex: 1400 }}
        PaperProps={{
          sx: { zIndex: 1400 },
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TableChart color="primary" />
            Insert Table
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            {/* Size Controls */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField
                label="Rows"
                type="number"
                value={state.tableRows}
                onChange={(e) =>
                  updateState({ tableRows: Math.max(1, Math.min(20, Number(e.target.value) || 1)) })
                }
                inputProps={{ min: 1, max: 20 }}
                sx={{ width: 120 }}
                size="small"
              />
              <TextField
                label="Columns"
                type="number"
                value={state.tableCols}
                onChange={(e) =>
                  updateState({ tableCols: Math.max(1, Math.min(10, Number(e.target.value) || 1)) })
                }
                inputProps={{ min: 1, max: 10 }}
                sx={{ width: 120 }}
                size="small"
              />
            </Box>

            {/* Visual Preview */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Preview ({state.tableRows} × {state.tableCols})
              </Typography>
              <Box
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  p: 2,
                  backgroundColor: '#fafafa',
                  overflow: 'auto',
                  maxHeight: 200,
                }}
              >
                <table
                  style={{
                    borderCollapse: 'collapse',
                    width: '100%',
                    fontSize: '12px',
                  }}
                >
                  <tbody>
                    {Array.from({ length: Math.min(state.tableRows, 6) }, (_, rowIndex) => (
                      <tr key={rowIndex}>
                        {Array.from({ length: Math.min(state.tableCols, 8) }, (_, colIndex) => (
                          rowIndex === 0 ? (
                            <th
                              key={colIndex}
                              style={{
                                border: state.tableBorders ? '1px solid #ccc' : '1px solid transparent',
                                padding: '4px 8px',
                                backgroundColor: '#f5f5f5',
                                fontWeight: 'bold',
                                minWidth: '60px',
                                textAlign: 'left',
                              }}
                            >
                              H{colIndex + 1}
                            </th>
                          ) : (
                            <td
                              key={colIndex}
                              style={{
                                border: state.tableBorders ? '1px solid #ccc' : '1px solid transparent',
                                padding: '4px 8px',
                                minWidth: '60px',
                              }}
                            >
                              {rowIndex},{colIndex + 1}
                            </td>
                          )
                        ))}
                        {state.tableCols > 8 && (
                          <td style={{ padding: '4px 8px', fontStyle: 'italic', color: '#666' }}>
                            +{state.tableCols - 8} more
                          </td>
                        )}
                      </tr>
                    ))}
                    {state.tableRows > 6 && (
                      <tr>
                        <td
                          colSpan={Math.min(state.tableCols, 8) + (state.tableCols > 8 ? 1 : 0)}
                          style={{ padding: '4px 8px', fontStyle: 'italic', color: '#666', textAlign: 'center' }}
                        >
                          +{state.tableRows - 6} more rows
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </Box>
            </Box>

            {/* Options */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={state.tableBorders}
                    onChange={(e) => {
                      const newBorderState = e.target.checked;
                      updateState({ tableBorders: newBorderState });

                      // Toggle borders on all existing tables immediately
                      if (currentEditor) {
                        const tables = currentEditor.view.dom.querySelectorAll('table.editor-table');
                        tables.forEach((table: Element) => {
                          if (newBorderState) {
                            table.classList.add('bordered');
                          } else {
                            table.classList.remove('bordered');
                          }
                        });
                      }
                    }}
                  />
                }
                label="Show table borders"
              />

              {/* Quick Size Buttons */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Quick Sizes:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {[
                    [2, 2], [3, 3], [3, 4], [4, 4], [5, 3], [6, 4]
                  ].map(([rows, cols]) => (
                    <Button
                      key={`${rows}x${cols}`}
                      variant={state.tableRows === rows && state.tableCols === cols ? "contained" : "outlined"}
                      size="small"
                      onClick={() => updateState({ tableRows: rows, tableCols: cols })}
                      sx={{ minWidth: 'auto', px: 1 }}
                    >
                      {rows}×{cols}
                    </Button>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => updateState({ showTableDialog: false })}>
            Cancel
          </Button>
          <Button
            onClick={insertTable}
            variant="contained"
            startIcon={<TableChart />}
            disabled={state.tableRows < 1 || state.tableCols < 1}
          >
            Insert Table ({state.tableRows}×{state.tableCols})
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Snackbar
        open={state.showNotification}
        autoHideDuration={3000}
        onClose={() => updateState({ showNotification: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity="success"
          onClose={() => updateState({ showNotification: false })}
        >
          {state.notification}
        </Alert>
      </Snackbar>

      {/* Click outside to close emoji picker */}
      {state.showEmojiPicker && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 999,
          }}
          onClick={() => updateState({ showEmojiPicker: false })}
        />
      )}

      {/* Enhanced Styles */}
      <style>{`
        .advanced-rich-editor .ProseMirror {
          outline: none;
          /* Ensure scrolling behavior and visible scrollbar styling */
          max-height: 400px;
          overflow-y: auto;
          scrollbar-gutter: stable both-edges;
          /* Enable relative positioning for absolutely positioned images */
          position: relative;
        }

        /* WebKit scrollbar styling */
        .advanced-rich-editor .ProseMirror::-webkit-scrollbar {
          width: 10px;
        }
        .advanced-rich-editor .ProseMirror::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 8px;
        }
        .advanced-rich-editor .ProseMirror::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 8px;
        }
        .advanced-rich-editor .ProseMirror::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        /* Firefox scrollbar styling */
        .advanced-rich-editor .ProseMirror {
          scrollbar-width: thin;
          scrollbar-color: #c1c1c1 #f1f1f1;
        }

        .advanced-rich-editor .editor-table {
          border-collapse: collapse;
          margin: 16px 0;
          overflow: hidden;
          table-layout: fixed;
          width: 100%;
        }

        .advanced-rich-editor .editor-table.bordered td,
        .advanced-rich-editor .editor-table.bordered th {
          border: 2px solid #e0e0e0;
          box-sizing: border-box;
          min-width: 1em;
          padding: 8px 12px;
          position: relative;
          vertical-align: top;
        }

        .advanced-rich-editor .editor-table td,
        .advanced-rich-editor .editor-table th {
          min-width: 1em;
          padding: 8px 12px;
          position: relative;
          vertical-align: top;
        }

        .advanced-rich-editor .editor-table th {
          font-weight: bold;
          text-align: left;
          background-color: #f5f5f5;
        }

        /* Merged cells styling */
        .advanced-rich-editor .editor-table td[colspan],
        .advanced-rich-editor .editor-table th[colspan],
        .advanced-rich-editor .editor-table td[rowspan],
        .advanced-rich-editor .editor-table th[rowspan] {
          background-color: rgba(25, 118, 210, 0.05);
          position: relative;
        }

        .advanced-rich-editor .editor-table td[colspan]:after,
        .advanced-rich-editor .editor-table th[colspan]:after {
          content: "↔";
          position: absolute;
          top: 2px;
          right: 2px;
          font-size: 10px;
          color: #1976d2;
          opacity: 0.7;
        }

        .advanced-rich-editor .editor-table td[rowspan]:after,
        .advanced-rich-editor .editor-table th[rowspan]:after {
          content: "↕";
          position: absolute;
          top: 2px;
          right: 2px;
          font-size: 10px;
          color: #1976d2;
          opacity: 0.7;
        }

        .advanced-rich-editor .editor-table td[colspan][rowspan]:after,
        .advanced-rich-editor .editor-table th[colspan][rowspan]:after {
          content: "⤡";
          position: absolute;
          top: 2px;
          right: 2px;
          font-size: 10px;
          color: #1976d2;
          opacity: 0.7;
        }

        .advanced-rich-editor .editor-image {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .advanced-rich-editor .editor-image:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        /* Absolutely positioned resizable images */
        .advanced-rich-editor [data-node-view-wrapper] {
          position: absolute !important;
          z-index: 1;
        }

        .advanced-rich-editor [data-node-view-wrapper].ProseMirror-selectednode {
          z-index: 1000 !important;
        }

        /* Images behind text styling */
        .advanced-rich-editor [data-node-view-wrapper][data-layer="behind"] {
          z-index: 1 !important;
        }

        .advanced-rich-editor [data-node-view-wrapper][data-layer="overlay"] {
          z-index: 100 !important;
        }

        /* Ensure text content is above background images but still allows them to show through */
        .advanced-rich-editor .ProseMirror p,
        .advanced-rich-editor .ProseMirror h1,
        .advanced-rich-editor .ProseMirror h2,
        .advanced-rich-editor .ProseMirror h3,
        .advanced-rich-editor .ProseMirror h4,
        .advanced-rich-editor .ProseMirror h5,
        .advanced-rich-editor .ProseMirror h6,
        .advanced-rich-editor .ProseMirror div,
        .advanced-rich-editor .ProseMirror ul,
        .advanced-rich-editor .ProseMirror ol,
        .advanced-rich-editor .ProseMirror blockquote {
          position: relative;
          z-index: 10;
        }

        /* Clean text styling */
        .advanced-rich-editor .ProseMirror p,
        .advanced-rich-editor .ProseMirror h1,
        .advanced-rich-editor .ProseMirror h2,
        .advanced-rich-editor .ProseMirror h3,
        .advanced-rich-editor .ProseMirror h4,
        .advanced-rich-editor .ProseMirror h5,
        .advanced-rich-editor .ProseMirror h6 {
          background-color: transparent;
        }

        /* Drag indicators and handles */
        .advanced-rich-editor .drag-handle {
          position: absolute;
          background: #1976d2;
          border: 2px solid white;
          border-radius: 50%;
          cursor: grab;
          transition: all 0.2s ease;
        }

        .advanced-rich-editor .drag-handle:hover {
          background: #1565c0;
          transform: scale(1.1);
        }

        .advanced-rich-editor .drag-handle:active {
          cursor: grabbing;
        }

        /* Hide image controls in preview mode */
        .advanced-rich-editor.preview-mode .drag-handle,
        .advanced-rich-editor.preview-mode .MuiIconButton-root {
          display: none !important;
        }

        .advanced-rich-editor.preview-mode [data-node-view-wrapper] {
          cursor: default !important;
        }


        .advanced-rich-editor .ProseMirror .ProseMirror-selectednode {
          outline: none !important;
        }

        .advanced-rich-editor .resize-handle {
          position: absolute;
          bottom: -5px;
          right: -5px;
          width: 12px;
          height: 12px;
          background: #1976d2;
          border: 2px solid white;
          border-radius: 3px;
          cursor: se-resize;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .advanced-rich-editor .resize-handle:hover {
          background: #1565c0;
          transform: scale(1.1);
        }

        .advanced-rich-editor .resize-tooltip {
          position: absolute;
          top: -30px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0,0,0,0.8);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-family: monospace;
          white-space: nowrap;
          pointer-events: none;
          z-index: 1000;
        }


        .advanced-rich-editor .editor-link {
          color: #1976d2;
          text-decoration: underline;
          cursor: pointer;
        }

        .advanced-rich-editor .editor-link:hover {
          color: #1565c0;
        }

        .advanced-rich-editor figure {
          margin: 24px 0;
          text-align: center;
          position: relative;
          display: inline-block;
          max-width: 100%;
          clear: both;
        }

        .advanced-rich-editor figure img {
          max-width: 100%;
          height: auto;
        }

        /* Image alignment styles */
        .advanced-rich-editor .ProseMirror p[style*="text-align: left"] img,
        .advanced-rich-editor .ProseMirror div[style*="text-align: left"] img {
          display: block;
          margin-left: 0;
          margin-right: auto;
        }

        .advanced-rich-editor .ProseMirror p[style*="text-align: center"] img,
        .advanced-rich-editor .ProseMirror div[style*="text-align: center"] img {
          display: block;
          margin-left: auto;
          margin-right: auto;
        }

        .advanced-rich-editor .ProseMirror p[style*="text-align: right"] img,
        .advanced-rich-editor .ProseMirror div[style*="text-align: right"] img {
          display: block;
          margin-left: auto;
          margin-right: 0;
        }

        .advanced-rich-editor .ProseMirror p[style*="text-align: left"],
        .advanced-rich-editor .ProseMirror p[style*="text-align: center"],
        .advanced-rich-editor .ProseMirror p[style*="text-align: right"] {
          margin: 16px 0;
        }


        .advanced-rich-editor figcaption {
          color: #666;
          font-size: 0.875rem;
          font-style: italic;
          margin-top: 8px;
          padding: 0 16px;
        }

        .advanced-rich-editor .code-block {
          background-color: #f4f4f4;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          font-family: 'Monaco', 'Courier New', monospace;
          font-size: 14px;
          margin: 16px 0;
          overflow-x: auto;
          padding: 16px;
        }

        .advanced-rich-editor .editor-blockquote {
          border-left: 4px solid #1976d2;
          margin: 16px 0;
          padding: 8px 16px;
          background-color: #f8f9fa;
          font-style: italic;
        }

        .advanced-rich-editor .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
      `}</style>
    </Box>
  );
};

export default SimpleRichEditor;
