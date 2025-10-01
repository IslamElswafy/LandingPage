import type { Editor } from "@tiptap/react";
import type { FontFamilySelectOption } from "mui-tiptap";

export interface SimpleRichEditorProps {
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

export interface EditorState {
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

export type UpdateEditorState = (updates: Partial<EditorState>) => void;

export type EmojiCategories = Readonly<Record<string, readonly string[]>>;

export interface EditorToolbarProps {
  editor: Editor | null;
  fontSize: string;
  fontSizeOptions: string[];
  fontFamilyOptions: FontFamilySelectOption[];
  onFontSizeChange: (value: string) => void;
  onOpenImageDialog: () => void;
  onOpenTableDialog: () => void;
  onInsertLink: () => void;
  onInsertCodeBlock: () => void;
  onInsertBlockquote: () => void;
  onToggleEmojiPicker: () => void;
  isEmojiPickerOpen: boolean;
  onMergeCells: () => void;
  onSplitCell: () => void;
  onAddColumnBefore: () => void;
  onAddColumnAfter: () => void;
  onDeleteColumn: () => void;
  onAddRowBefore: () => void;
  onAddRowAfter: () => void;
  onDeleteRow: () => void;
  onDeleteTable: () => void;
}

export interface EmojiPickerProps {
  open: boolean;
  categories: EmojiCategories;
  activeCategory: string;
  search: string;
  filteredEmojis: readonly string[];
  onCategoryChange: (category: string) => void;
  onSearchChange: (value: string) => void;
  onSelectEmoji: (emoji: string) => void;
  onClose: () => void;
}

export interface ImageDialogProps {
  open: boolean;
  inputMode: "url" | "file";
  imageUrl: string;
  imageCaption: string;
  selectedImageFile: File | null;
  onClose: () => void;
  onInputModeChange: (mode: "url" | "file") => void;
  onUrlChange: (value: string) => void;
  onCaptionChange: (value: string) => void;
  onFileSelect: (file: File | null) => void;
  onInsert: () => void;
  isInsertDisabled: boolean;
}

export interface TableDialogProps {
  open: boolean;
  rows: number;
  cols: number;
  showBorders: boolean;
  onClose: () => void;
  onRowsChange: (value: number) => void;
  onColsChange: (value: number) => void;
  onToggleBorders: (value: boolean) => void;
  onQuickSizeSelect: (rows: number, cols: number) => void;
  onInsert: () => void;
}
