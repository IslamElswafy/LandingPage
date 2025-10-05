import React, { useEffect, useMemo, useState } from "react";
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
  Box,
  ButtonBase,
  IconButton,
  Menu,
  MenuItem,
  Select,
  Slider,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
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

const BORDER_COLOR_SWATCHES = [
  "#ffffff",
  "#1e88e5",
  "#d32f2f",
  "#2e7d32",
  "#fbc02d",
  "#7b1fa2",
  "#00838f",
  "#6d4c41",
  "#546e7a",
  "#c0c0c0",
  "#000000",
];

const HIGHLIGHT_SWATCHES = [
  "#e3f2fd",
  "#fff3e0",
  "#fce4ec",
  "#e8f5e9",
  "#f5f5f5",
  "#f3e5f5",
  "#ffebee",
  "#ede7f6",
  "#eceff1",
  "#fffde7",
];

const BORDER_STYLE_OPTIONS = [
  { label: "Solid", value: "solid" },
  { label: "Dashed", value: "dashed" },
  { label: "Dotted", value: "dotted" },
  { label: "Double", value: "double" },
  { label: "Groove", value: "groove" },
  { label: "Ridge", value: "ridge" },
  { label: "None", value: "none" },
];

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
}) => {
  const [borderColorAnchorEl, setBorderColorAnchorEl] =
    useState<null | HTMLElement>(null);
  const [borderWidthAnchorEl, setBorderWidthAnchorEl] =
    useState<null | HTMLElement>(null);
  const [borderStyleAnchorEl, setBorderStyleAnchorEl] =
    useState<null | HTMLElement>(null);
  const [pendingBorderWidth, setPendingBorderWidth] = useState<number>(
    Number.parseFloat(tableBorderWidth || "0") || 0
  );
  const [rowColorAnchorEl, setRowColorAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [columnColorAnchorEl, setColumnColorAnchorEl] =
    useState<null | HTMLElement>(null);

  useEffect(() => {
    if (borderWidthAnchorEl) {
      setPendingBorderWidth(Number.parseFloat(tableBorderWidth || "0") || 0);
    }
  }, [borderWidthAnchorEl, tableBorderWidth]);

  const openColorMenu = Boolean(borderColorAnchorEl);
  const openWidthMenu = Boolean(borderWidthAnchorEl);
  const openStyleMenu = Boolean(borderStyleAnchorEl);
  const openRowMenu = Boolean(rowColorAnchorEl);
  const openColumnMenu = Boolean(columnColorAnchorEl);

  const handleBorderWidthChange = (_event: Event, value: number | number[]) => {
    if (Array.isArray(value)) {
      return;
    }
    setPendingBorderWidth(value);
  };

  const handleBorderWidthCommit = (
    _event: React.SyntheticEvent | Event,
    value: number | number[]
  ) => {
    if (Array.isArray(value)) {
      return;
    }
    onSetTableBorderWidth(String(value));
    setBorderWidthAnchorEl(null);
  };

  const safeBorderColor = tableBorderColor || "#1e88e5";
  const handleColorMenuClose = () => setBorderColorAnchorEl(null);
  const handleBorderColorSelect = (color: string) => {
    onSetTableBorderColor(color);
    handleColorMenuClose();
  };

  const handleBorderStyleChange = (
    _event: React.MouseEvent<HTMLElement>,
    value: string | null
  ) => {
    if (!value) {
      return;
    }
    onSetTableBorderStyle(value);
    setBorderStyleAnchorEl(null);
  };

  const rowHighlightColorSafe = rowHighlightColor || "#e3f2fd";
  const columnHighlightColorSafe = columnHighlightColor || "#fff3e0";

  const handleRowMenuClose = () => setRowColorAnchorEl(null);
  const handleColumnMenuClose = () => setColumnColorAnchorEl(null);

  const handleRowColorSelect = (color: string | null) => {
    onSetRowBackground(color);
    handleRowMenuClose();
  };

  const handleColumnColorSelect = (color: string | null) => {
    onSetColumnBackground(color);
    handleColumnMenuClose();
  };

  const renderColorSwatches = useMemo(
    () =>
      (
        palette: string[],
        selected: string,
        onSelect: (color: string) => void
      ) =>
        (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {palette.map((color) => {
              const isSelected = color.toLowerCase() === selected.toLowerCase();
              return (
                <ButtonBase
                  key={color}
                  onClick={() => onSelect(color)}
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1,
                    backgroundColor: color,
                    border: isSelected
                      ? "2px solid #1976d2"
                      : "2px solid transparent",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
                    transition: "transform 0.2s ease",
                    "&:hover": {
                      transform: "scale(1.06)",
                    },
                  }}
                />
              );
            })}
          </Box>
        ),
    []
  );

  return (
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

          <Tooltip title="Table Border Color">
            <IconButton
              size="small"
              onClick={(event) => setBorderColorAnchorEl(event.currentTarget)}
              sx={{
                color: safeBorderColor,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <BorderColor />
            </IconButton>
          </Tooltip>

          <Tooltip title="Table Border Width">
            <IconButton
              size="small"
              onClick={(event) => setBorderWidthAnchorEl(event.currentTarget)}
            >
              <BorderAll />
            </IconButton>
          </Tooltip>

          <Tooltip title="Table Border Style">
            <IconButton
              size="small"
              onClick={(event) => setBorderStyleAnchorEl(event.currentTarget)}
            >
              <BorderStyle />
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={borderColorAnchorEl}
            open={openColorMenu}
            onClose={handleColorMenuClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
          >
            <Box sx={{ p: 2, width: 220 }}>
              <Typography variant="subtitle2" gutterBottom>
                Border Color
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {BORDER_COLOR_SWATCHES.map((color) => {
                  const isSelected =
                    color.toLowerCase() === safeBorderColor.toLowerCase();
                  return (
                    <ButtonBase
                      key={color}
                      onClick={() => handleBorderColorSelect(color)}
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        backgroundColor: color,
                        border: isSelected
                          ? "2px solid #1976d2"
                          : "2px solid transparent",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
                        transition: "transform 0.2s ease",
                        "&:hover": {
                          transform: "scale(1.1)",
                        },
                      }}
                    />
                  );
                })}
              </Box>
              <TextField
                label="Custom Color"
                type="color"
                value={safeBorderColor}
                onChange={(event) => onSetTableBorderColor(event.target.value)}
                size="small"
                sx={{ mt: 2, width: "100%" }}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </Menu>

          <Menu
            anchorEl={borderWidthAnchorEl}
            open={openWidthMenu}
            onClose={() => setBorderWidthAnchorEl(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
          >
            <Box sx={{ p: 2, width: 240 }}>
              <Typography variant="subtitle2" gutterBottom>
                Border Width ({pendingBorderWidth}px)
              </Typography>
              <Slider
                min={0}
                max={12}
                step={1}
                value={pendingBorderWidth}
                valueLabelDisplay="auto"
                onChange={handleBorderWidthChange}
                onChangeCommitted={handleBorderWidthCommit}
              />
            </Box>
          </Menu>

          <Menu
            anchorEl={borderStyleAnchorEl}
            open={openStyleMenu}
            onClose={() => setBorderStyleAnchorEl(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
          >
            <Box sx={{ p: 2, width: 260 }}>
              <Typography variant="subtitle2" gutterBottom>
                Border Style
              </Typography>
              <ToggleButtonGroup
                value={tableBorderStyle || "solid"}
                exclusive
                fullWidth
                size="small"
                onChange={handleBorderStyleChange}
                sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}
              >
                {BORDER_STYLE_OPTIONS.map((option) => (
                  <ToggleButton
                    key={option.value}
                    value={option.value}
                    sx={{ flex: "1 1 45%", textTransform: "capitalize" }}
                  >
                    {option.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
          </Menu>

          <Menu
            anchorEl={rowColorAnchorEl}
            open={openRowMenu}
            onClose={handleRowMenuClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
          >
            <Box sx={{ p: 2, width: 240 }}>
              <Typography variant="subtitle2" gutterBottom>
                Row Background
              </Typography>
              {renderColorSwatches(
                HIGHLIGHT_SWATCHES,
                rowHighlightColorSafe,
                (color) => handleRowColorSelect(color)
              )}
              <TextField
                label="Custom"
                type="color"
                value={rowHighlightColorSafe}
                onChange={(event) => onSetRowBackground(event.target.value)}
                size="small"
                sx={{ mt: 2, width: "100%" }}
                InputLabelProps={{ shrink: true }}
              />
              <ButtonBase
                onClick={() => handleRowColorSelect(null)}
                sx={{
                  mt: 2,
                  width: "100%",
                  py: 1,
                  borderRadius: 1,
                  border: "1px dashed",
                  borderColor: "divider",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                <FormatColorReset fontSize="small" />
                <Typography variant="body2">Clear background</Typography>
              </ButtonBase>
            </Box>
          </Menu>

          <Menu
            anchorEl={columnColorAnchorEl}
            open={openColumnMenu}
            onClose={handleColumnMenuClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
          >
            <Box sx={{ p: 2, width: 240 }}>
              <Typography variant="subtitle2" gutterBottom>
                Column Background
              </Typography>
              {renderColorSwatches(
                HIGHLIGHT_SWATCHES,
                columnHighlightColorSafe,
                (color) => handleColumnColorSelect(color)
              )}
              <TextField
                label="Custom"
                type="color"
                value={columnHighlightColorSafe}
                onChange={(event) => onSetColumnBackground(event.target.value)}
                size="small"
                sx={{ mt: 2, width: "100%" }}
                InputLabelProps={{ shrink: true }}
              />
              <ButtonBase
                onClick={() => handleColumnColorSelect(null)}
                sx={{
                  mt: 2,
                  width: "100%",
                  py: 1,
                  borderRadius: 1,
                  border: "1px dashed",
                  borderColor: "divider",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                <FormatColorReset fontSize="small" />
                <Typography variant="body2">Clear background</Typography>
              </ButtonBase>
            </Box>
          </Menu>

          <Tooltip title="Remove Table Borders">
            <IconButton size="small" onClick={onClearTableBorders}>
              <BorderClear />
            </IconButton>
          </Tooltip>

          <MenuDivider />

          <Tooltip title="Row Background">
            <IconButton
              size="small"
              onClick={(event) => setRowColorAnchorEl(event.currentTarget)}
              sx={{
                color: rowHighlightColorSafe,
                border: "1px solid",
                borderColor: "divider",
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

          <Tooltip title="Column Background">
            <IconButton
              size="small"
              onClick={(event) => setColumnColorAnchorEl(event.currentTarget)}
              sx={{
                color: columnHighlightColorSafe,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <FormatColorFill sx={{ transform: "rotate(90deg)" }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Clear Column Background">
            <IconButton
              size="small"
              onClick={() => onSetColumnBackground(null)}
            >
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
};

export default EditorToolbar;
