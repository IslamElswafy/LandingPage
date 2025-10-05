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
    externalPreviewMode !== undefined
      ? externalPreviewMode
      : state.isPreviewMode;

  const loadSavedState = useCallback(() => {
    const savedJsonContent = window.localStorage.getItem("editor-content-json");
    if (savedJsonContent && editor) {
      try {
        const jsonContent = JSON.parse(savedJsonContent);
        editor.commands.setContent(jsonContent);
        updateState({
          notification: "Saved layout loaded!",
          showNotification: true,
        });
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
          "</figcaption></figure>";
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

      const borderWidthPx = state.tableBorderWidth.endsWith("px")
        ? state.tableBorderWidth
        : state.tableBorderWidth + "px";

      editor
        .chain()
        .focus()
        .updateAttributes("table", {
          borderColor: state.tableBorderColor,
          borderWidth: borderWidthPx,
          borderStyle: state.tableBorderStyle,
        })
        .run();

      syncActiveTableDom({
        borderColor: state.tableBorderColor,
        borderWidth: borderWidthPx,
        borderStyle: state.tableBorderStyle,
      });

      window.setTimeout(() => {
        const tables = editor.view.dom.querySelectorAll("table:last-child");
        if (tables.length > 0) {
          const lastTable = tables[tables.length - 1] as HTMLElement;
          lastTable.className = state.tableBorders
            ? "editor-table bordered"
            : "editor-table";
          lastTable.style.setProperty(
            "--table-border-color",
            state.tableBorderColor
          );
          lastTable.style.setProperty("--table-border-width", borderWidthPx);
          lastTable.style.setProperty(
            "--table-border-style",
            state.tableBorderStyle
          );
          lastTable.querySelectorAll("th, td").forEach((cell) => {
            const htmlCell = cell as HTMLElement;
            htmlCell.style.setProperty(
              "--cell-border-color",
              state.tableBorderColor
            );
            htmlCell.style.setProperty("--cell-border-width", borderWidthPx);
            htmlCell.style.setProperty(
              "--cell-border-style",
              state.tableBorderStyle
            );
          });
        }
      }, 100);

      updateState({
        showTableDialog: false,
        notification:
          "Table " +
          state.tableRows +
          "×" +
          state.tableCols +
          " inserted successfully!",
        showNotification: true,
      });
    } catch (error) {
      console.error("Error inserting table:", error);
      updateState({
        notification: "Failed to insert table. Please try again.",
        showNotification: true,
      });
    }
  }, [
    editor,
    state.tableBorderColor,
    state.tableBorderStyle,
    state.tableBorderWidth,
    state.tableBorders,
    state.tableCols,
    state.tableRows,
    updateState,
  ]);

  const applyFontSize = useCallback(
    (size: string) => {
      if (!editor) {
        return;
      }
      editor
        .chain()
        .focus()
        .setFontSize(size + "px")
        .run();
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
    updateState({
      notification: "Table deleted successfully!",
      showNotification: true,
    });
  }, [editor, updateState]);

  const mergeCells = useCallback(() => {
    if (!editor) {
      return;
    }
    editor.chain().focus().mergeCells().run();
    updateState({
      notification: "Cells merged successfully!",
      showNotification: true,
    });
  }, [editor, updateState]);

  const splitCell = useCallback(() => {
    if (!editor) {
      return;
    }
    editor.chain().focus().splitCell().run();
    updateState({
      notification: "Cell split successfully!",
      showNotification: true,
    });
  }, [editor, updateState]);

  const addColumnBefore = useCallback(() => {
    if (!editor) {
      return;
    }
    if (editor.can().addColumnBefore()) {
      editor.chain().focus().addColumnBefore().run();
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
  }, [editor, updateState]);

  const addColumnAfter = useCallback(() => {
    if (!editor) {
      return;
    }
    if (editor.can().addColumnAfter()) {
      editor.chain().focus().addColumnAfter().run();
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
        notification:
          "Cannot delete column. Make sure cursor is in a table cell.",
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

  const getActiveTableElement = useCallback((): HTMLTableElement | null => {
    if (!editor) {
      return null;
    }

    const { state, view } = editor;
    const { $from } = state.selection;

    for (let depth = $from.depth; depth > 0; depth -= 1) {
      const node = $from.node(depth);
      if (node.type.name === "table") {
        const pos = $from.before(depth);
        const dom = view.nodeDOM(pos);
        if (dom instanceof HTMLTableElement) {
          return dom;
        }
        if (dom instanceof HTMLElement) {
          const table = dom.querySelector("table.editor-table");
          if (table instanceof HTMLTableElement) {
            return table;
          }
        }
      }
    }

    const domContext = view.domAtPos(state.selection.from);
    const contextNode =
      domContext?.node instanceof Element
        ? domContext.node
        : domContext?.node?.parentElement ?? null;

    if (contextNode) {
      const table = contextNode.closest("table.editor-table");
      if (table instanceof HTMLTableElement) {
        return table;
      }
    }

    return null;
  }, [editor]);

  const syncActiveTableDom = useCallback(
    (attributes: {
      borderColor?: string;
      borderWidth?: string;
      borderStyle?: string;
    }) => {
      const tableElement = getActiveTableElement();
      if (!tableElement) {
        return;
      }

      const setProperty = (
        element: HTMLElement,
        property: string,
        value?: string
      ) => {
        if (value === undefined || value === null) {
          element.style.removeProperty(property);
        } else {
          element.style.setProperty(property, value);
        }
      };

      if (attributes.borderColor !== undefined) {
        setProperty(
          tableElement,
          "--table-border-color",
          attributes.borderColor
        );
      }
      if (attributes.borderWidth !== undefined) {
        setProperty(
          tableElement,
          "--table-border-width",
          attributes.borderWidth
        );
      }
      if (attributes.borderStyle !== undefined) {
        setProperty(
          tableElement,
          "--table-border-style",
          attributes.borderStyle
        );
      }

      tableElement.querySelectorAll<HTMLElement>("th, td").forEach((cell) => {
        if (attributes.borderColor !== undefined) {
          setProperty(cell, "--cell-border-color", attributes.borderColor);
        }
        if (attributes.borderWidth !== undefined) {
          setProperty(cell, "--cell-border-width", attributes.borderWidth);
        }
        if (attributes.borderStyle !== undefined) {
          setProperty(cell, "--cell-border-style", attributes.borderStyle);
        }
      });
    },
    [getActiveTableElement]
  );

  const applyTableAttributes = useCallback(
    (attributes: {
      borderColor?: string;
      borderWidth?: string;
      borderStyle?: string;
    }) => {
      if (!editor) {
        return false;
      }
      if (!editor.isActive("table")) {
        updateState({
          notification:
            "Place the cursor inside a table to adjust its borders.",
          showNotification: true,
        });
        return false;
      }

      const tableAttributes: Record<string, string> = {};
      if (attributes.borderColor !== undefined) {
        tableAttributes.borderColor = attributes.borderColor;
      }
      if (attributes.borderWidth !== undefined) {
        tableAttributes.borderWidth = attributes.borderWidth;
      }
      if (attributes.borderStyle !== undefined) {
        tableAttributes.borderStyle = attributes.borderStyle;
      }

      if (Object.keys(tableAttributes).length === 0) {
        return true;
      }

      const success = editor
        .chain()
        .focus()
        .updateAttributes("table", tableAttributes)
        .run();

      if (!success) {
        updateState({
          notification:
            "Unable to update the table borders. Try selecting the table cell again.",
          showNotification: true,
        });
      }

      if (success) {
        syncActiveTableDom(attributes);
      }

      return success;
    },
    [editor, syncActiveTableDom, updateState]
  );

  const setTableBorderColor = useCallback(
    (color: string) => {
      const normalized = color.trim();
      if (!normalized) {
        updateState({
          notification: "Please provide a valid CSS color value.",
          showNotification: true,
        });
        return;
      }

      if (!applyTableAttributes({ borderColor: normalized })) {
        return;
      }

      updateState({
        tableBorderColor: normalized,
        notification: "Table border color updated successfully!",
        showNotification: true,
      });
    },
    [applyTableAttributes, updateState]
  );

  const setTableBorderWidth = useCallback(
    (widthValue: string) => {
      const sanitized = widthValue.replace(/px$/i, "").trim();
      if (!sanitized) {
        updateState({
          notification: "Please provide a numeric border width.",
          showNotification: true,
        });
        return;
      }

      const parsed = Number.parseFloat(sanitized);
      if (Number.isNaN(parsed) || parsed < 0) {
        updateState({
          notification: "Border width must be a non-negative number.",
          showNotification: true,
        });
        return;
      }

      const clamped = Math.min(12, parsed);
      const formatted = String(clamped);
      const pixelWidth = formatted + "px";

      if (!applyTableAttributes({ borderWidth: pixelWidth })) {
        return;
      }

      updateState({
        tableBorderWidth: formatted,
        notification: "Table border width updated successfully!",
        showNotification: true,
      });
    },
    [applyTableAttributes, updateState]
  );

  const setTableBorderStyle = useCallback(
    (styleValue: string) => {
      const normalized = styleValue.trim();
      if (!normalized) {
        updateState({
          notification: "Please provide a border style.",
          showNotification: true,
        });
        return;
      }

      const allowedStyles = new Set([
        "solid",
        "dashed",
        "dotted",
        "double",
        "groove",
        "ridge",
        "none",
      ]);

      const lower = normalized.toLowerCase();
      const finalStyle = allowedStyles.has(lower) ? lower : normalized;

      if (!applyTableAttributes({ borderStyle: finalStyle })) {
        return;
      }

      updateState({
        tableBorderStyle: finalStyle,
        notification: "Table border style updated successfully!",
        showNotification: true,
      });
    },
    [applyTableAttributes, updateState]
  );

  const clearTableBorders = useCallback(() => {
    if (!applyTableAttributes({ borderWidth: "0px", borderStyle: "none" })) {
      return;
    }

    updateState({
      tableBorderWidth: "0",
      tableBorderStyle: "none",
      notification: "Table borders removed.",
      showNotification: true,
    });
  }, [applyTableAttributes, updateState]);

  const setRowBackground = useCallback(
    (color: string | null) => {
      if (!editor) {
        return;
      }
      if (!editor.isActive("table")) {
        updateState({
          notification:
            "Select the table cells you want to style, then try again.",
          showNotification: true,
        });
        return;
      }

      const success = editor
        .chain()
        .focus()
        .setCellAttribute("backgroundColor", color ?? null)
        .run();

      if (!success) {
        updateState({
          notification:
            "Select the table cells you want to style, then try again.",
          showNotification: true,
        });
        return;
      }

      updateState({
        ...(color ? { rowHighlightColor: color } : {}),
        notification: color
          ? "Selected cells background updated."
          : "Cell backgrounds cleared.",
        showNotification: true,
      });
    },
    [editor, updateState]
  );

  const setColumnBackground = useCallback(
    (color: string | null) => {
      if (!editor) {
        return;
      }
      if (!editor.isActive("table")) {
        updateState({
          notification:
            "Select the table cells you want to style, then try again.",
          showNotification: true,
        });
        return;
      }

      const success = editor
        .chain()
        .focus()
        .setCellAttribute("backgroundColor", color ?? null)
        .run();

      if (!success) {
        updateState({
          notification:
            "Select the table cells you want to style, then try again.",
          showNotification: true,
        });
        return;
      }

      updateState({
        ...(color ? { columnHighlightColor: color } : {}),
        notification: color
          ? "Selected cells background updated."
          : "Cell backgrounds cleared.",
        showNotification: true,
      });
    },
    [editor, updateState]
  );

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
              tableBorderColor={state.tableBorderColor}
              tableBorderWidth={state.tableBorderWidth}
              tableBorderStyle={state.tableBorderStyle}
              rowHighlightColor={state.rowHighlightColor}
              columnHighlightColor={state.columnHighlightColor}
              onSetTableBorderColor={setTableBorderColor}
              onSetTableBorderWidth={setTableBorderWidth}
              onSetTableBorderStyle={setTableBorderStyle}
              onClearTableBorders={clearTableBorders}
              onSetRowBackground={setRowBackground}
              onSetColumnBackground={setColumnBackground}
            />
          )}
          editorProps={{
            attributes: {
              style:
                "min-height: 400px; height: auto; overflow-y: visible; padding: 16px; outline: none; line-height: 1.6; white-space: pre-wrap; word-break: break-word; overflow-wrap: anywhere;",
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
        onCategoryChange={(category) =>
          updateState({ emojiCategory: category })
        }
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
        borderColor={state.tableBorderColor}
        borderWidth={state.tableBorderWidth}
        borderStyle={state.tableBorderStyle}
        onClose={() => updateState({ showTableDialog: false })}
        onRowsChange={(value) => updateState({ tableRows: value })}
        onColsChange={(value) => updateState({ tableCols: value })}
        onToggleBorders={(value) => {
          updateState({ tableBorders: value });
          if (editor) {
            const tables =
              editor.view.dom.querySelectorAll("table.editor-table");
            tables.forEach((table) => {
              if (value) {
                table.classList.add("bordered");
              } else {
                table.classList.remove("bordered");
              }
            });
          }
        }}
        onBorderColorChange={(color) =>
          updateState({ tableBorderColor: color })
        }
        onBorderWidthChange={(width) =>
          updateState({ tableBorderWidth: width })
        }
        onBorderStyleChange={(style) =>
          updateState({ tableBorderStyle: style })
        }
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
