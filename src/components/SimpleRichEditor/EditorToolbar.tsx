import React from "react";
import {
  MenuButtonAlignCenter,
  MenuButtonAlignLeft,
  MenuButtonAlignRight,
  MenuButtonBold,
  MenuButtonBulletedList,
  MenuButtonHighlightColor,
  MenuButtonItalic,
  MenuButtonOrderedList,
  MenuButtonRedo,
  MenuButtonStrikethrough,
  MenuButtonSubscript,
  MenuButtonSuperscript,
  MenuButtonTextColor,
  MenuButtonUnderline,
  MenuButtonUndo,
  MenuControlsContainer,
  MenuDivider,
  MenuSelectFontFamily,
  MenuSelectHeading,
} from "mui-tiptap";
import {
  IconButton,
  MenuItem,
  Select,
  Tooltip,
} from "@mui/material";
import {
  AddBox,
  CallMerge,
  CallSplit,
  Code,
  Delete,
  EmojiEmotions,
  BorderAll,
  BorderClear,
  BorderColor,
  BorderStyle,
  FormatQuote,
  FormatColorFill,
  FormatColorReset,
  Image as ImageIcon,
  Link as LinkIcon,
  RemoveCircle,
  TableChart,
  TableRows,
  ViewColumn,
} from "@mui/icons-material";
import type { EditorToolbarProps } from "./types";

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  editor,
  fontSize,
  fontSizeOptions,
  fontFamilyOptions,
  onFontSizeChange,
  onOpenImageDialog,
  onOpenTableDialog,
  onInsertLink,
  onInsertCodeBlock,
  onInsertBlockquote,
  onToggleEmojiPicker,
  isEmojiPickerOpen,
  onMergeCells,
  onSplitCell,
  onAddColumnBefore,
  onAddColumnAfter,
  onDeleteColumn,
  onAddRowBefore,
  onAddRowAfter,
  onDeleteRow,
  onDeleteTable,
  tableBorderColor,
  tableBorderWidth,
  tableBorderStyle,
  rowHighlightColor,
  columnHighlightColor,
  onSetTableBorderColor,
  onSetTableBorderWidth,
  onSetTableBorderStyle,
  onClearTableBorders,
  onSetRowBackground,
  onSetColumnBackground,
}) => (
  <MenuControlsContainer>
    <MenuSelectFontFamily options={fontFamilyOptions} />

    <Select
      value={fontSize}
      onChange={(event) => onFontSizeChange(event.target.value)}
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

    <MenuButtonBold />
    <MenuButtonItalic />
    <MenuButtonUnderline />
    <MenuButtonStrikethrough />
    <MenuButtonSubscript />
    <MenuButtonSuperscript />

    <MenuDivider />

    <MenuButtonTextColor />
    <MenuButtonHighlightColor />

    <MenuDivider />

    <MenuSelectHeading />

    <MenuDivider />

    <MenuButtonBulletedList />
    <MenuButtonOrderedList />

    <MenuDivider />

    <MenuButtonAlignLeft />
    <MenuButtonAlignCenter />
    <MenuButtonAlignRight />

    <MenuDivider />

    <Tooltip title="Insert Link">
      <IconButton size="small" onClick={onInsertLink}>
        <LinkIcon />
      </IconButton>
    </Tooltip>

    <Tooltip title="Insert Code Block">
      <IconButton size="small" onClick={onInsertCodeBlock}>
        <Code />
      </IconButton>
    </Tooltip>

    <Tooltip title="Insert Quote">
      <IconButton size="small" onClick={onInsertBlockquote}>
        <FormatQuote />
      </IconButton>
    </Tooltip>

    <Tooltip title="Insert Image">
      <IconButton size="small" onClick={onOpenImageDialog}>
        <ImageIcon />
      </IconButton>
    </Tooltip>

    <Tooltip title="Insert Table">
      <IconButton size="small" onClick={onOpenTableDialog}>
        <TableChart />
      </IconButton>
    </Tooltip>

    {editor?.isActive("table") && (
      <>
        <MenuDivider />

        <Tooltip title="Merge Cells">
          <IconButton size="small" onClick={onMergeCells}>
            <CallMerge />
          </IconButton>
        </Tooltip>

        <Tooltip title="Split Cell">
          <IconButton size="small" onClick={onSplitCell}>
            <CallSplit />
          </IconButton>
        </Tooltip>

        <MenuDivider />

        <Tooltip title="Add Row Before">
          <IconButton size="small" onClick={onAddRowBefore}>
            <AddBox />
          </IconButton>
        </Tooltip>

        <Tooltip title="Add Row After">
          <IconButton size="small" onClick={onAddRowAfter}>
            <TableRows />
          </IconButton>
        </Tooltip>

        <Tooltip title="Delete Row">
          <IconButton
            size="small"
            onClick={onDeleteRow}
            sx={{ color: "warning.main" }}
          >
            <RemoveCircle />
          </IconButton>
        </Tooltip>

        <MenuDivider />

        <Tooltip title="Add Column Before">
          <IconButton size="small" onClick={onAddColumnBefore}>
            <AddBox sx={{ transform: "rotate(90deg)" }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Add Column After">
          <IconButton size="small" onClick={onAddColumnAfter}>
            <ViewColumn />
          </IconButton>
        </Tooltip>

        <Tooltip title="Delete Column">
          <IconButton
            size="small"
            onClick={onDeleteColumn}
            sx={{ color: "warning.main" }}
          >
            <RemoveCircle sx={{ transform: "rotate(90deg)" }} />
          </IconButton>
        </Tooltip>

        <MenuDivider />

        <Tooltip title="Delete Table">
          <IconButton
            size="small"
            onClick={onDeleteTable}
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

        <MenuDivider />

        <Tooltip title="Set Table Border Color">
          <IconButton
            size="small"
            onClick={() => {
              const value = window.prompt(
                "Enter table border color (CSS value, e.g. #1976d2 or red)",
                tableBorderColor
              );
              if (value) {
                onSetTableBorderColor(value.trim());
              }
            }}
          >
            <BorderColor />
          </IconButton>
        </Tooltip>

        <Tooltip title="Set Table Border Width">
          <IconButton
            size="small"
            onClick={() => {
              const value = window.prompt(
                "Enter table border width in pixels",
                tableBorderWidth
              );
              if (value !== null) {
                onSetTableBorderWidth(value.trim());
              }
            }}
          >
            <BorderAll />
          </IconButton>
        </Tooltip>

        <Tooltip title="Set Table Border Style">
          <IconButton
            size="small"
            onClick={() => {
              const value = window.prompt(
                "Enter table border style (solid, dashed, dotted, double, groove, ridge, none)",
                tableBorderStyle
              );
              if (value) {
                onSetTableBorderStyle(value.trim());
              }
            }}
          >
            <BorderStyle />
          </IconButton>
        </Tooltip>

        <Tooltip title="Remove Table Borders">
          <IconButton size="small" onClick={onClearTableBorders}>
            <BorderClear />
          </IconButton>
        </Tooltip>

        <MenuDivider />

        <Tooltip title="Set Row Background">
          <IconButton
            size="small"
            onClick={() => {
              const value = window.prompt(
                "Enter row background color (CSS value, e.g. #e3f2fd)",
                rowHighlightColor
              );
              if (value !== null) {
                const trimmed = value.trim();
                onSetRowBackground(trimmed.length > 0 ? trimmed : null);
              }
            }}
          >
            <FormatColorFill />
          </IconButton>
        </Tooltip>

        <Tooltip title="Clear Row Background">
          <IconButton size="small" onClick={() => onSetRowBackground(null)}>
            <FormatColorReset />
          </IconButton>
        </Tooltip>

        <Tooltip title="Set Column Background">
          <IconButton
            size="small"
            onClick={() => {
              const value = window.prompt(
                "Enter column background color (CSS value, e.g. #fff3e0)",
                columnHighlightColor
              );
              if (value !== null) {
                const trimmed = value.trim();
                onSetColumnBackground(trimmed.length > 0 ? trimmed : null);
              }
            }}
          >
            <FormatColorFill sx={{ transform: "rotate(90deg)" }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Clear Column Background">
          <IconButton size="small" onClick={() => onSetColumnBackground(null)}>
            <FormatColorReset sx={{ transform: "rotate(90deg)" }} />
          </IconButton>
        </Tooltip>
      </>
    )}

    <Tooltip title={isEmojiPickerOpen ? "Hide Emoji Picker" : "Insert Emoji"}>
      <IconButton size="small" onClick={onToggleEmojiPicker}>
        <EmojiEmotions />
      </IconButton>
    </Tooltip>

    <MenuDivider />

    <MenuButtonUndo />
    <MenuButtonRedo />
  </MenuControlsContainer>
);

export default EditorToolbar;
