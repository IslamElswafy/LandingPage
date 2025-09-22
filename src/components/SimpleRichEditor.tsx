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
} from "@mui/material";
import {
  TableChart,
  Image as ImageIcon,
  EmojiEmotions,
  Code,
  FormatQuote,
  Fullscreen,
  FullscreenExit,
  Preview,
  Edit,
  CloudUpload,
  Settings,
  Link as LinkIcon,
  Upload,
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
import { Node } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";

const lowlight = createLowlight(common);

// Resizable Image Component
const ResizableImageComponent: React.FC<{
  node: any;
  updateAttributes: (attrs: any) => void;
  selected: boolean;
}> = ({ node, updateAttributes, selected }) => {
  const { src, alt, title, width, height } = node.attrs;
  const [isResizing, setIsResizing] = useState(false);
  const [dimensions, setDimensions] = useState({
    width: width || "auto",
    height: height || "auto",
  });
  const imageRef = useRef<HTMLImageElement>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);

      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = imageRef.current?.offsetWidth || 0;
      const startHeight = imageRef.current?.offsetHeight || 0;
      const aspectRatio = startWidth / startHeight;

      const handleMouseMove = (e: MouseEvent) => {
        const deltaX = e.clientX - startX;
        const newWidth = Math.max(50, startWidth + deltaX);
        const newHeight = newWidth / aspectRatio;

        setDimensions({ width: newWidth, height: newHeight });
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        updateAttributes({
          width: dimensions.width,
          height: dimensions.height,
        });
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [dimensions, updateAttributes]
  );

  return (
    <NodeViewWrapper
      style={{
        position: "relative",
        display: "inline-block",
        border: selected ? "2px solid #1976d2" : "2px solid transparent",
        borderRadius: "4px",
      }}
    >
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        title={title}
        style={{
          width: dimensions.width === "auto" ? "auto" : `${dimensions.width}px`,
          height:
            dimensions.height === "auto" ? "auto" : `${dimensions.height}px`,
          maxWidth: "100%",
          borderRadius: "4px",
          display: "block",
        }}
        draggable={false}
      />
      {selected && (
        <div
          style={{
            position: "absolute",
            bottom: "-5px",
            right: "-5px",
            width: "10px",
            height: "10px",
            backgroundColor: "#1976d2",
            cursor: "se-resize",
            borderRadius: "2px",
            border: "1px solid white",
          }}
          onMouseDown={handleMouseDown}
        />
      )}
      {isResizing && (
        <div
          style={{
            position: "absolute",
            top: "-25px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "rgba(0,0,0,0.8)",
            color: "white",
            padding: "2px 8px",
            borderRadius: "4px",
            fontSize: "12px",
            whiteSpace: "nowrap",
          }}
        >
          {Math.round(dimensions.width as number)} ×{" "}
          {Math.round(dimensions.height as number)}
        </div>
      )}
    </NodeViewWrapper>
  );
};

// Custom Resizable Image Extension
const ResizableImage = Image.extend({
  name: "resizableImage",

  addAttributes() {
    return {
      ...(typeof super.addAttributes === "function"
        ? super.addAttributes()
        : {}),
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
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  autoSave?: boolean;
  maxLength?: number;
  readOnly?: boolean;
  theme?: "light" | "dark";
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
              .insertContent(
                `<p><img src="${result}" alt="${file.name}" title="${file.name}" /></p>`
              )
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
        // Insert resizable image in a paragraph so it can be aligned
        currentEditor
          .chain()
          .focus()
          .insertContent(`<p><img src="${imageSrc}" alt="" title="" /></p>`)
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

    currentEditor
      .chain()
      .focus()
      .insertTable({
        rows: state.tableRows,
        cols: state.tableCols,
        withHeaderRow: true,
      })
      .run();

    updateState({
      showTableDialog: false,
      notification: `Table ${state.tableRows}x${state.tableCols} inserted!`,
      showNotification: true,
    });
  }, [currentEditor, state.tableRows, state.tableCols, updateState]);

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
      className={`advanced-rich-editor ${className}`}
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
      }}
      {...(isDragActive ? getRootProps() : {})}
    >
      {/* Drop Zone Overlay */}
      {isDragActive && (
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
          editable={!readOnly}
          onCreate={({ editor }) => {
            // Ensure controls render immediately on mount
            setCurrentEditor(editor);
          }}
          onUpdate={({ editor }) => {
            onChange(editor.getHTML());
            setCurrentEditor(editor);
          }}
          renderControls={() => {
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
                    <Settings />
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
        maxWidth="sm"
        fullWidth
        sx={{ zIndex: 1400 }}
        PaperProps={{
          sx: { zIndex: 1400 },
        }}
      >
        <DialogTitle>Insert Table</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Rows</InputLabel>
            <Select
              value={state.tableRows}
              onChange={(e) =>
                updateState({ tableRows: Number(e.target.value) })
              }
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <MenuItem key={num} value={num}>
                  {num}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="dense">
            <InputLabel>Columns</InputLabel>
            <Select
              value={state.tableCols}
              onChange={(e) =>
                updateState({ tableCols: Number(e.target.value) })
              }
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <MenuItem key={num} value={num}>
                  {num}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={state.tableBorders}
                onChange={(e) =>
                  updateState({ tableBorders: e.target.checked })
                }
              />
            }
            label="Show borders"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => updateState({ showTableDialog: false })}>
            Cancel
          </Button>
          <Button onClick={insertTable} variant="contained">
            Insert Table
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
