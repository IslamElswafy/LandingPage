import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Alert, Box, Snackbar, Typography } from "@mui/material";
import { CloudUpload } from "@mui/icons-material";
import { RichTextEditor } from "mui-tiptap";
import type { Editor } from "@tiptap/react";

import EmojiPicker from "./EmojiPicker";
import ImageDialog from "./ImageDialog";
import TableDialog from "./TableDialog";
import EditorStyles from "./EditorStyles";
import EditorToolbar from "./EditorToolbar";
import { useEditorExtensions } from "./extensions";
import {
  useEditorState,
  useEmojiLibrary,
  useFilteredEmojis,
  useFontFamilyOptions,
  useFontSizeOptions,
} from "./hooks";
import type { SimpleRichEditorProps } from "./types";

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
  const [editor, setEditor] = useState<Editor | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const [state, updateState] = useEditorState(autoSave);

  const emojiCategories = useEmojiLibrary();
  const filteredEmojis = useFilteredEmojis(
    emojiCategories,
    state.emojiCategory,
    state.emojiSearch
  );
  const fontFamilyOptions = useFontFamilyOptions();
  const fontSizeOptions = useFontSizeOptions();
  const extensions = useEditorExtensions(placeholder, state.tableBorders);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp", ".svg"],
    },
    maxFiles: 10,
    maxSize: 10485760,
    onDrop: useCallback(
      (acceptedFiles: File[]) => {
        if (!editor) {
          return;
        }

        acceptedFiles.forEach((file) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            const chain = editor.chain() as any;
            chain
              .focus()
              .setInlineImage({
                src: result,
                alt: file.name,
                title: file.name,
                float: "none",
              })
              .run();

            updateState({
              notification: 'Image "' + file.name + '" uploaded successfully!',
              showNotification: true,
            });
          };
          reader.readAsDataURL(file);
        });
      },
      [editor, updateState]
    ),
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const updateCounts = () => {
      const text = editor.getText();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const characters = text.length;

      updateState({ wordCount: words, characterCount: characters });
    };

    editor.on("update", updateCounts);
    updateCounts();

    return () => {
      editor.off("update", updateCounts);
    };
  }, [editor, updateState]);

  const isPreviewMode =
    externalPreviewMode !== undefined ? externalPreviewMode : state.isPreviewMode;

  const loadSavedState = useCallback(() => {
    const savedJsonContent = window.localStorage.getItem("editor-content-json");
    if (savedJsonContent && editor) {
      try {
        const jsonContent = JSON.parse(savedJsonContent);
        editor.commands.setContent(jsonContent);
        updateState({ notification: "Saved layout loaded!", showNotification: true });
      } catch (error) {
        console.error("Error loading saved state:", error);
      }
    }
  }, [editor, updateState]);

  useEffect(() => {
    if (isPreviewMode && editor) {
      loadSavedState();
    }
  }, [isPreviewMode, editor, loadSavedState]);

  const insertEmoji = useCallback(
    (emoji: string) => {
      if (!editor) {
        return;
      }
      editor.chain().focus().insertContent(emoji).run();
      updateState({ showEmojiPicker: false });
    },
    [editor, updateState]
  );

  const insertImage = useCallback(() => {
    if (!editor) {
      return;
    }

    const handleInsertion = (imageSrc: string) => {
      if (state.imageCaption) {
        const imageHtml =
          '<figure><img src="' +
          imageSrc +
          '" alt="' +
          state.imageCaption +
          '" title="' +
          state.imageCaption +
          '" /><figcaption>' +
          state.imageCaption +
          '</figcaption></figure>';
        editor.chain().focus().insertContent(imageHtml).run();
      } else {
        const chain = editor.chain() as any;
        chain
          .focus()
          .setInlineImage({ src: imageSrc, alt: "", title: "", float: "none" })
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
      if (!state.imageUrl) {
        return;
      }
      handleInsertion(state.imageUrl);
    } else if (state.imageInputMode === "file" && state.selectedImageFile) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        handleInsertion(result);
      };
      reader.readAsDataURL(state.selectedImageFile);
    }
  }, [
    editor,
    state.imageCaption,
    state.imageInputMode,
    state.imageUrl,
    state.selectedImageFile,
    updateState,
  ]);

  const insertTable = useCallback(() => {
    if (!editor) {
      return;
    }

    try {
      editor
        .chain()
        .focus()
        .insertTable({
          rows: state.tableRows,
          cols: state.tableCols,
          withHeaderRow: true,
        })
        .run();

      window.setTimeout(() => {
        const tables = editor.view.dom.querySelectorAll("table:last-child");
        if (tables.length > 0) {
          const lastTable = tables[tables.length - 1];
          lastTable.className = state.tableBorders
            ? "editor-table bordered"
            : "editor-table";
        }
      }, 100);

      updateState({
        showTableDialog: false,
        notification:
          "Table " + state.tableRows + "×" + state.tableCols + " inserted successfully!",
        showNotification: true,
      });
    } catch (error) {
      console.error("Error inserting table:", error);
      updateState({
        notification: "Failed to insert table. Please try again.",
        showNotification: true,
      });
    }
  }, [editor, state.tableBorders, state.tableCols, state.tableRows, updateState]);

  const applyFontSize = useCallback(
    (size: string) => {
      if (!editor) {
        return;
      }
      editor.chain().focus().setFontSize(size + "px").run();
      updateState({ fontSize: size });
    },
    [editor, updateState]
  );

  const insertLink = useCallback(() => {
    if (!editor) {
      return;
    }
    const url = window.prompt("Enter link URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
      updateState({ notification: "Link inserted!", showNotification: true });
    }
  }, [editor, updateState]);

  const insertCodeBlock = useCallback(() => {
    editor?.chain().focus().toggleCodeBlock().run();
  }, [editor]);

  const insertBlockquote = useCallback(() => {
    editor?.chain().focus().toggleBlockquote().run();
  }, [editor]);

  const deleteTable = useCallback(() => {
    if (!editor) {
      return;
    }
    editor.chain().focus().deleteTable().run();
    updateState({ notification: "Table deleted successfully!", showNotification: true });
  }, [editor, updateState]);

  const mergeCells = useCallback(() => {
    if (!editor) {
      return;
    }
    editor.chain().focus().mergeCells().run();
    updateState({ notification: "Cells merged successfully!", showNotification: true });
  }, [editor, updateState]);

  const splitCell = useCallback(() => {
    if (!editor) {
      return;
    }
    editor.chain().focus().splitCell().run();
    updateState({ notification: "Cell split successfully!", showNotification: true });
  }, [editor, updateState]);

  const addColumnBefore = useCallback(() => {
    if (!editor) {
      return;
    }
    if (editor.can().addColumnBefore()) {
      editor.chain().focus().addColumnBefore().run();
      updateState({ notification: "Column added before!", showNotification: true });
    } else {
      updateState({
        notification: "Cannot add column. Make sure cursor is in a table cell.",
        showNotification: true,
      });
    }
  }, [editor, updateState]);

  const addColumnAfter = useCallback(() => {
    if (!editor) {
      return;
    }
    if (editor.can().addColumnAfter()) {
      editor.chain().focus().addColumnAfter().run();
      updateState({ notification: "Column added after!", showNotification: true });
    } else {
      updateState({
        notification: "Cannot add column. Make sure cursor is in a table cell.",
        showNotification: true,
      });
    }
  }, [editor, updateState]);

  const deleteColumn = useCallback(() => {
    if (!editor) {
      return;
    }
    if (editor.can().deleteColumn()) {
      editor.chain().focus().deleteColumn().run();
      updateState({ notification: "Column deleted!", showNotification: true });
    } else {
      updateState({
        notification: "Cannot delete column. Make sure cursor is in a table cell.",
        showNotification: true,
      });
    }
  }, [editor, updateState]);

  const addRowBefore = useCallback(() => {
    if (!editor) {
      return;
    }
    if (editor.can().addRowBefore()) {
      editor.chain().focus().addRowBefore().run();
      updateState({ notification: "Row added before!", showNotification: true });
    } else {
      updateState({
        notification: "Cannot add row. Make sure cursor is in a table cell.",
        showNotification: true,
      });
    }
  }, [editor, updateState]);

  const addRowAfter = useCallback(() => {
    if (!editor) {
      return;
    }
    if (editor.can().addRowAfter()) {
      editor.chain().focus().addRowAfter().run();
      updateState({ notification: "Row added after!", showNotification: true });
    } else {
      updateState({
        notification: "Cannot add row. Make sure cursor is in a table cell.",
        showNotification: true,
      });
    }
  }, [editor, updateState]);

  const deleteRow = useCallback(() => {
    if (!editor) {
      return;
    }
    if (editor.can().deleteRow()) {
      editor.chain().focus().deleteRow().run();
      updateState({ notification: "Row deleted!", showNotification: true });
    } else {
      updateState({
        notification: "Cannot delete row. Make sure cursor is in a table cell.",
        showNotification: true,
      });
    }
  }, [editor, updateState]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape" && onPreviewModeToggle) {
        onPreviewModeToggle();
      }
    };

    const element = editorRef.current;
    if (element) {
      element.addEventListener("keydown", handler);
    }

    return () => {
      if (element) {
        element.removeEventListener("keydown", handler);
      }
    };
  }, [editor, onPreviewModeToggle]);

  const editorClassNames = ["advanced-rich-editor"];
  if (isPreviewMode) {
    editorClassNames.push("preview-mode");
  }
  if (className) {
    editorClassNames.push(className);
  }
  const editorClassName = editorClassNames.join(" ").trim();
  const rootProps = isDragActive && !isPreviewMode ? getRootProps() : {};

  return (
    <Box
      className={editorClassName}
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
      {...rootProps}
    >
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

      <input {...getInputProps()} />

      <Box ref={editorRef}>
        <RichTextEditor
          extensions={extensions}
          content={content}
          editable={!readOnly && !isPreviewMode}
          onCreate={({ editor: createdEditor }) => {
            setEditor(createdEditor);
          }}
          onUpdate={({ editor: updatedEditor }) => {
            if (!isPreviewMode) {
              const htmlContent = updatedEditor.getHTML();
              const jsonContent = updatedEditor.getJSON();

              window.localStorage.setItem(
                "editor-content-json",
                JSON.stringify(jsonContent)
              );

              onChange(htmlContent, jsonContent);
            }
            setEditor(updatedEditor);
          }}
          renderControls={() => (
            <EditorToolbar
              editor={editor}
              fontSize={state.fontSize}
              fontSizeOptions={fontSizeOptions}
              fontFamilyOptions={fontFamilyOptions}
              onFontSizeChange={applyFontSize}
              onOpenImageDialog={() => updateState({ showImageDialog: true })}
              onOpenTableDialog={() => updateState({ showTableDialog: true })}
              onInsertLink={insertLink}
              onInsertCodeBlock={insertCodeBlock}
              onInsertBlockquote={insertBlockquote}
              onToggleEmojiPicker={() =>
                updateState({ showEmojiPicker: !state.showEmojiPicker })
              }
              isEmojiPickerOpen={state.showEmojiPicker}
              onMergeCells={mergeCells}
              onSplitCell={splitCell}
              onAddColumnBefore={addColumnBefore}
              onAddColumnAfter={addColumnAfter}
              onDeleteColumn={deleteColumn}
              onAddRowBefore={addRowBefore}
              onAddRowAfter={addRowAfter}
              onDeleteRow={deleteRow}
              onDeleteTable={deleteTable}
            />
          )}
          editorProps={{
            attributes: {
              style:
                "min-height: 400px; max-height: 400px; overflow-y: auto; scrollbar-gutter: stable both-edges; padding: 16px; outline: none; line-height: 1.6;",
              placeholder,
            },
          }}
        />
      </Box>

      <EmojiPicker
        open={state.showEmojiPicker}
        categories={emojiCategories}
        activeCategory={state.emojiCategory}
        search={state.emojiSearch}
        filteredEmojis={filteredEmojis}
        onCategoryChange={(category) => updateState({ emojiCategory: category })}
        onSearchChange={(value) => updateState({ emojiSearch: value })}
        onSelectEmoji={insertEmoji}
        onClose={() => updateState({ showEmojiPicker: false })}
      />

      <ImageDialog
        open={state.showImageDialog}
        inputMode={state.imageInputMode}
        imageUrl={state.imageUrl}
        imageCaption={state.imageCaption}
        selectedImageFile={state.selectedImageFile}
        onClose={() => updateState({ showImageDialog: false })}
        onInputModeChange={(mode) => updateState({ imageInputMode: mode })}
        onUrlChange={(value) => updateState({ imageUrl: value })}
        onCaptionChange={(value) => updateState({ imageCaption: value })}
        onFileSelect={(file) => updateState({ selectedImageFile: file })}
        onInsert={insertImage}
        isInsertDisabled={
          (state.imageInputMode === "url" && !state.imageUrl) ||
          (state.imageInputMode === "file" && !state.selectedImageFile)
        }
      />

      <TableDialog
        open={state.showTableDialog}
        rows={state.tableRows}
        cols={state.tableCols}
        showBorders={state.tableBorders}
        onClose={() => updateState({ showTableDialog: false })}
        onRowsChange={(value) => updateState({ tableRows: value })}
        onColsChange={(value) => updateState({ tableCols: value })}
        onToggleBorders={(value) => {
          updateState({ tableBorders: value });
          if (editor) {
            const tables = editor.view.dom.querySelectorAll("table.editor-table");
            tables.forEach((table) => {
              if (value) {
                table.classList.add("bordered");
              } else {
                table.classList.remove("bordered");
              }
            });
          }
        }}
        onQuickSizeSelect={(rows, cols) =>
          updateState({ tableRows: rows, tableCols: cols })
        }
        onInsert={insertTable}
      />

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

      <EditorStyles />
    </Box>
  );
};

export default SimpleRichEditor;
