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
import { HexColorInput, HexColorPicker } from "react-colorful";
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

const DEFAULT_BORDER_COLOR = "#1e88e5";
const DEFAULT_ROW_HIGHLIGHT_COLOR = "#e3f2fd";
const DEFAULT_COLUMN_HIGHLIGHT_COLOR = "#fff3e0";
const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

const COLOR_PICKER_SX = {
  mt: 1,
  display: "flex",
  flexDirection: "column",
  gap: 1.5,
  "& .react-colorful": {
    width: "100%",
    height: 160,
    borderRadius: 1,
  },
  "& .react-colorful__saturation": {
    borderRadius: 1,
    marginBottom: 1,
  },
  "& .react-colorful__hue": {
    borderRadius: 1,
  },
  "& .modern-color-input": {
    width: "100%",
    padding: "8px 12px",
    borderRadius: 1,
    border: "1px solid",
    borderColor: "divider",
    backgroundColor: "background.paper",
    fontFamily: "inherit",
    fontSize: "0.875rem",
    lineHeight: 1.5,
    boxSizing: "border-box",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  "& .modern-color-input:focus": {
    borderColor: "primary.main",
    outline: "none",
    boxShadow: "0 0 0 2px rgba(25, 118, 210, 0.2)",
  },
} as const;

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
  onOpenLinkDialog,
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
  const [borderInputValue, setBorderInputValue] = useState(
    tableBorderColor || DEFAULT_BORDER_COLOR
  );
  const [pendingBorderWidth, setPendingBorderWidth] = useState<number>(
    Number.parseFloat(tableBorderWidth || "0") || 0
  );
  const [rowColorAnchorEl, setRowColorAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [columnColorAnchorEl, setColumnColorAnchorEl] =
    useState<null | HTMLElement>(null);
  const [rowInputValue, setRowInputValue] = useState(
    rowHighlightColor || DEFAULT_ROW_HIGHLIGHT_COLOR
  );
  const [columnInputValue, setColumnInputValue] = useState(
    columnHighlightColor || DEFAULT_COLUMN_HIGHLIGHT_COLOR
  );
  const borderColorSafe = tableBorderColor || DEFAULT_BORDER_COLOR;

  useEffect(() => {
    if (borderWidthAnchorEl) {
      setPendingBorderWidth(Number.parseFloat(tableBorderWidth || "0") || 0);
    }
  }, [borderWidthAnchorEl, tableBorderWidth]);

  useEffect(() => {
    setBorderInputValue(borderColorSafe);
  }, [borderColorSafe]);

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

  const handleColorMenuClose = () => setBorderColorAnchorEl(null);
  const handleBorderColorSelect = (color: string) => {
    const normalized = color.toLowerCase();
    setBorderInputValue(normalized);
    onSetTableBorderColor(normalized);
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

  const rowHighlightColorSafe =
    rowHighlightColor || DEFAULT_ROW_HIGHLIGHT_COLOR;
  const columnHighlightColorSafe =
    columnHighlightColor || DEFAULT_COLUMN_HIGHLIGHT_COLOR;

  useEffect(() => {
    setRowInputValue(rowHighlightColorSafe);
  }, [rowHighlightColorSafe]);

  useEffect(() => {
    setColumnInputValue(columnHighlightColorSafe);
  }, [columnHighlightColorSafe]);

  const handleRowMenuClose = () => setRowColorAnchorEl(null);
  const handleColumnMenuClose = () => setColumnColorAnchorEl(null);

  const handleRowColorSelect = (color: string | null) => {
    if (color) {
      const normalized = color.toLowerCase();
      setRowInputValue(normalized);
      onSetRowBackground(normalized);
    } else {
      setRowInputValue(DEFAULT_ROW_HIGHLIGHT_COLOR);
      onSetRowBackground(null);
    }
    handleRowMenuClose();
  };

  const handleColumnColorSelect = (color: string | null) => {
    if (color) {
      const normalized = color.toLowerCase();
      setColumnInputValue(normalized);
      onSetColumnBackground(normalized);
    } else {
      setColumnInputValue(DEFAULT_COLUMN_HIGHLIGHT_COLOR);
      onSetColumnBackground(null);
    }
    handleColumnMenuClose();
  };

  const handleBorderHexInputChange = (value: string) => {
    const prefixed = value.startsWith("#") ? value : `#${value}`;
    const sanitized = prefixed.slice(0, 7).toLowerCase();
    setBorderInputValue(sanitized);
    if (HEX_COLOR_PATTERN.test(sanitized)) {
      onSetTableBorderColor(sanitized);
    }
  };

  const handleBorderPickerChange = (color: string) => {
    const normalized = color.toLowerCase();
    setBorderInputValue(normalized);
    onSetTableBorderColor(normalized);
  };

  const handleRowHexInputChange = (value: string) => {
    const prefixed = value.startsWith("#") ? value : `#${value}`;
    const sanitized = prefixed.slice(0, 7).toLowerCase();
    setRowInputValue(sanitized);
    if (HEX_COLOR_PATTERN.test(sanitized)) {
      onSetRowBackground(sanitized);
    }
  };

  const handleColumnHexInputChange = (value: string) => {
    const prefixed = value.startsWith("#") ? value : `#${value}`;
    const sanitized = prefixed.slice(0, 7).toLowerCase();
    setColumnInputValue(sanitized);
    if (HEX_COLOR_PATTERN.test(sanitized)) {
      onSetColumnBackground(sanitized);
    }
  };

  const handleRowPickerChange = (color: string) => {
    const normalized = color.toLowerCase();
    setRowInputValue(normalized);
    onSetRowBackground(normalized);
  };

  const handleColumnPickerChange = (color: string) => {
    const normalized = color.toLowerCase();
    setColumnInputValue(normalized);
    onSetColumnBackground(normalized);
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
        <IconButton size="small" onClick={onOpenLinkDialog}>
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
                color: borderColorSafe,
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
            <Box sx={{ p: 2, width: 280 }}>
              <Typography variant="subtitle2" gutterBottom>
                Border Color
              </Typography>
              {renderColorSwatches(
                BORDER_COLOR_SWATCHES,
                borderColorSafe,
                (color) => handleBorderColorSelect(color)
              )}
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Custom color
                </Typography>
                <Box sx={COLOR_PICKER_SX}>
                  <HexColorPicker
                    color={borderColorSafe}
                    onChange={handleBorderPickerChange}
                  />
                  <HexColorInput
                    className="modern-color-input"
                    color={borderInputValue}
                    onChange={handleBorderHexInputChange}
                    prefixed
                  />
                </Box>
              </Box>
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
            <Box sx={{ p: 2, width: 280 }}>
              <Typography variant="subtitle2" gutterBottom>
                Row Background
              </Typography>
              {renderColorSwatches(
                HIGHLIGHT_SWATCHES,
                rowHighlightColorSafe,
                (color) => handleRowColorSelect(color)
              )}
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Custom color
                </Typography>
                <Box sx={COLOR_PICKER_SX}>
                  <HexColorPicker
                    color={rowHighlightColorSafe}
                    onChange={handleRowPickerChange}
                  />
                  <HexColorInput
                    className="modern-color-input"
                    color={rowInputValue}
                    onChange={handleRowHexInputChange}
                    prefixed
                  />
                </Box>
              </Box>
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
            <Box sx={{ p: 2, width: 280 }}>
              <Typography variant="subtitle2" gutterBottom>
                Column Background
              </Typography>
              {renderColorSwatches(
                HIGHLIGHT_SWATCHES,
                columnHighlightColorSafe,
                (color) => handleColumnColorSelect(color)
              )}
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Custom color
                </Typography>
                <Box sx={COLOR_PICKER_SX}>
                  <HexColorPicker
                    color={columnHighlightColorSafe}
                    onChange={handleColumnPickerChange}
                  />
                  <HexColorInput
                    className="modern-color-input"
                    color={columnInputValue}
                    onChange={handleColumnHexInputChange}
                    prefixed
                  />
                </Box>
              </Box>
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
