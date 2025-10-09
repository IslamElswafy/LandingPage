import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { TableChart } from "@mui/icons-material";
import type { CSSProperties } from "react";
import { HexColorInput, HexColorPicker } from "react-colorful";
import type { TableDialogProps } from "./types";

const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;
const COLOR_PICKER_CONTAINER_STYLE: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  width: "100%",
};
const HEX_COLOR_PICKER_STYLE: CSSProperties = {
  width: "100%",
  minHeight: 140,
  borderRadius: 8,
};
const HEX_COLOR_INPUT_STYLE: CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #d0d5dd",
  fontFamily: "inherit",
  fontSize: "0.875rem",
  boxSizing: "border-box",
};
const normalizeHexValue = (value: string): string => {
  const prefixed = value.startsWith("#") ? value : `#${value}`;
  return prefixed.slice(0, 7).toLowerCase();
};
const sanitizeHexColor = (value: string | undefined, fallback: string) => {
  if (!value) return fallback;
  const normalized = normalizeHexValue(value);
  return HEX_COLOR_PATTERN.test(normalized) ? normalized : fallback;
};
const DEFAULT_BORDER_COLOR = "#1e88e5";

const QUICK_SIZES: Array<[number, number]> = [
  [2, 2],
  [3, 3],
  [3, 4],
  [4, 4],
  [5, 3],
  [6, 4],
];

const TableDialog: React.FC<TableDialogProps> = ({
  open,
  rows,
  cols,
  showBorders,
  borderColor,
  borderWidth,
  borderStyle,
  onClose,
  onRowsChange,
  onColsChange,
  onToggleBorders,
  onBorderColorChange,
  onBorderWidthChange,
  onBorderStyleChange,
  onQuickSizeSelect,
  onInsert,
}) => {
  const borderColorSafe = sanitizeHexColor(borderColor, DEFAULT_BORDER_COLOR);
  const [borderColorInput, setBorderColorInput] = useState(borderColorSafe);

  useEffect(() => {
    setBorderColorInput(borderColorSafe);
  }, [borderColorSafe]);

  const handleBorderColorCommit = (color: string) => {
    const normalized = color.toLowerCase();
    setBorderColorInput(normalized);
    onBorderColorChange(normalized);
  };

  const effectiveBorderColor =
    borderStyle === "none" ? "transparent" : borderColorSafe;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{ zIndex: 1400 }}
      PaperProps={{ sx: { zIndex: 1400 } }}
    >
    <DialogTitle>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <TableChart color="primary" />
        Insert Table
      </Box>
    </DialogTitle>
    <DialogContent>
      <Box sx={{ py: 2 }}>
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <TextField
            label="Rows"
            type="number"
            value={rows}
            onChange={(event) =>
              onRowsChange(Math.max(1, Math.min(20, Number(event.target.value) || 1)))
            }
            inputProps={{ min: 1, max: 20 }}
            sx={{ width: 120 }}
            size="small"
          />
          <TextField
            label="Columns"
            type="number"
            value={cols}
            onChange={(event) =>
              onColsChange(Math.max(1, Math.min(10, Number(event.target.value) || 1)))
            }
            inputProps={{ min: 1, max: 10 }}
            sx={{ width: 120 }}
            size="small"
          />
        </Box>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
          <Box sx={{ width: 200, minWidth: 180 }}>
            <Typography variant="subtitle2" gutterBottom>
              Border Color
            </Typography>
            <Box sx={COLOR_PICKER_CONTAINER_STYLE}>
              <HexColorPicker
                color={borderColorSafe}
                onChange={handleBorderColorCommit}
                style={HEX_COLOR_PICKER_STYLE}
              />
              <HexColorInput
                prefixed
                color={borderColorInput}
                onChange={(value) => {
                  const normalized = normalizeHexValue(value);
                  setBorderColorInput(normalized);
                  if (HEX_COLOR_PATTERN.test(normalized)) {
                    handleBorderColorCommit(normalized);
                  }
                }}
                style={HEX_COLOR_INPUT_STYLE}
              />
            </Box>
          </Box>
          <TextField
            label="Border Width (px)"
            type="number"
            value={borderWidth}
            onChange={(event) =>
              onBorderWidthChange(String(Math.max(0, Math.min(12, Number(event.target.value) || 0))))
            }
            inputProps={{ min: 0, max: 12 }}
            sx={{ width: 160 }}
            size="small"
          />
          <TextField
            select
            label="Border Style"
            value={borderStyle}
            onChange={(event) => onBorderStyleChange(event.target.value)}
            sx={{ minWidth: 160 }}
            size="small"
          >
            <MenuItem value="solid">Solid</MenuItem>
            <MenuItem value="dashed">Dashed</MenuItem>
            <MenuItem value="dotted">Dotted</MenuItem>
            <MenuItem value="double">Double</MenuItem>
            <MenuItem value="groove">Groove</MenuItem>
            <MenuItem value="ridge">Ridge</MenuItem>
            <MenuItem value="none">None</MenuItem>
          </TextField>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Preview ({rows} × {cols})
          </Typography>
          <Box
            sx={{
              border: "1px solid #e0e0e0",
              borderRadius: 1,
              p: 2,
              backgroundColor: "#fafafa",
              overflow: "auto",
              maxHeight: 200,
            }}
          >
            <table
              style={{
                borderCollapse: "collapse",
                width: "100%",
                fontSize: "12px",
              }}
            >
              <tbody>
                {Array.from({ length: Math.min(rows, 6) }, (_, rowIndex) => (
                  <tr key={rowIndex}>
                    {Array.from({ length: Math.min(cols, 8) }, (_, colIndex) =>
                      rowIndex === 0 ? (
                        <th
                          key={colIndex}
                          style={{
                            border: showBorders
                              ? `${borderWidth || "0"}px ${borderStyle} ${effectiveBorderColor}`
                              : "1px solid transparent",
                            padding: "4px 8px",
                            backgroundColor: "#f5f5f5",
                            fontWeight: "bold",
                            minWidth: "60px",
                            textAlign: "left",
                          }}
                        >
                          H{colIndex + 1}
                        </th>
                      ) : (
                        <td
                          key={colIndex}
                          style={{
                            border: showBorders
                              ? `${borderWidth || "0"}px ${borderStyle} ${effectiveBorderColor}`
                              : "1px solid transparent",
                            padding: "4px 8px",
                            minWidth: "60px",
                          }}
                        >
                          {rowIndex},{colIndex + 1}
                        </td>
                      )
                    )}
                    {cols > 8 && (
                      <td
                        style={{
                          padding: "4px 8px",
                          fontStyle: "italic",
                          color: "#666",
                        }}
                      >
                        +{cols - 8} more
                      </td>
                    )}
                  </tr>
                ))}
                {rows > 6 && (
                  <tr>
                    <td
                      colSpan={Math.min(cols, 8) + (cols > 8 ? 1 : 0)}
                      style={{
                        padding: "4px 8px",
                        fontStyle: "italic",
                        color: "#666",
                        textAlign: "center",
                      }}
                    >
                      +{rows - 6} more rows
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={showBorders}
                onChange={(event) => onToggleBorders(event.target.checked)}
              />
            }
            label="Show table borders"
          />

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Quick Sizes:
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {QUICK_SIZES.map(([quickRows, quickCols]) => (
                <Button
                  key={String(quickRows) + "x" + String(quickCols)}
                  variant={rows === quickRows && cols === quickCols ? "contained" : "outlined"}
                  size="small"
                  onClick={() => onQuickSizeSelect(quickRows, quickCols)}
                  sx={{ minWidth: "auto", px: 1 }}
                >
                  {quickRows}×{quickCols}
                </Button>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button
        onClick={onInsert}
        variant="contained"
        startIcon={<TableChart />}
        disabled={rows < 1 || cols < 1}
      >
        Insert Table ({rows}×{cols})
      </Button>
    </DialogActions>
    </Dialog>
  );
};

export default TableDialog;
