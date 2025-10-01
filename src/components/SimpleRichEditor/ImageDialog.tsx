import React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { CloudUpload, Link as LinkIcon, Upload } from "@mui/icons-material";
import type { ImageDialogProps } from "./types";

const ImageDialog: React.FC<ImageDialogProps> = ({
  open,
  inputMode,
  imageUrl,
  imageCaption,
  selectedImageFile,
  onClose,
  onInputModeChange,
  onUrlChange,
  onCaptionChange,
  onFileSelect,
  onInsert,
  isInsertDisabled,
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="sm"
    fullWidth
    sx={{ zIndex: 1400 }}
    PaperProps={{ sx: { zIndex: 1400 } }}
  >
    <DialogTitle>Insert Image</DialogTitle>
    <DialogContent>
      <Tabs
        value={inputMode}
        onChange={(_, newValue) => onInputModeChange(newValue as "url" | "file")}
        sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}
      >
        <Tab icon={<LinkIcon />} label="URL" value="url" iconPosition="start" />
        <Tab icon={<Upload />} label="Upload File" value="file" iconPosition="start" />
      </Tabs>

      {inputMode === "url" && (
        <TextField
          autoFocus
          margin="dense"
          label="Image URL"
          fullWidth
          variant="outlined"
          value={imageUrl}
          onChange={(event) => onUrlChange(event.target.value)}
          placeholder="https://example.com/image.jpg"
          sx={{ mb: 2 }}
        />
      )}

      {inputMode === "file" && (
        <Box sx={{ mb: 2 }}>
          <input
            accept="image/*"
            style={{ display: "none" }}
            id="image-file-input"
            type="file"
            onChange={(event) => {
              const file = event.target.files?.[0] || null;
              onFileSelect(file);
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
          {selectedImageFile && (
            <Typography variant="body2" color="text.secondary">
              Selected: {selectedImageFile.name}
            </Typography>
          )}
        </Box>
      )}

      <TextField
        margin="dense"
        label="Caption (optional)"
        fullWidth
        variant="outlined"
        value={imageCaption}
        onChange={(event) => onCaptionChange(event.target.value)}
        placeholder="Enter image caption..."
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button onClick={onInsert} variant="contained" disabled={isInsertDisabled}>
        Insert Image
      </Button>
    </DialogActions>
  </Dialog>
);

export default ImageDialog;
