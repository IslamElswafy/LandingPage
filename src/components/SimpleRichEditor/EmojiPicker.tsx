import React from "react";
import { Box, Button, Chip, Paper, TextField, Typography } from "@mui/material";
import type { EmojiPickerProps } from "./types";

const EmojiPicker: React.FC<EmojiPickerProps> = ({
  open,
  categories,
  activeCategory,
  search,
  filteredEmojis,
  onCategoryChange,
  onSearchChange,
  onSelectEmoji,
  onClose,
}) => {
  if (!open) {
    return null;
  }

  return (
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
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        size="small"
        fullWidth
        sx={{ mb: 2 }}
      />

      <Box sx={{ mb: 2 }}>
        {Object.keys(categories).map((category) => (
          <Chip
            key={category}
            label={category}
            onClick={() => onCategoryChange(category)}
            color={activeCategory === category ? "primary" : "default"}
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
            key={emoji + "-" + String(index)}
            onClick={() => onSelectEmoji(emoji)}
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
        <Button onClick={onClose}>Close</Button>
      </Box>
    </Paper>
  );
};

export default EmojiPicker;
