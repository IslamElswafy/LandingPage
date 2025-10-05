import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  TextField,
} from "@mui/material";
import { Link as LinkIcon, Language, Home, Description, Info } from "@mui/icons-material";

export interface LinkDialogProps {
  open: boolean;
  onClose: () => void;
  onInsertLink: (url: string) => void;
}

interface LinkOption {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  category: "internal" | "external";
}

const INTERNAL_LINKS: LinkOption[] = [
  { id: "home", label: "Home Page", path: "/", icon: <Home />, category: "internal" },
  { id: "about", label: "About Us", path: "/about", icon: <Info />, category: "internal" },
  { id: "services", label: "Services", path: "/services", icon: <Description />, category: "internal" },
  { id: "contact", label: "Contact", path: "/contact", icon: <Info />, category: "internal" },
  { id: "portfolio", label: "Portfolio", path: "/portfolio", icon: <Description />, category: "internal" },
  { id: "blog", label: "Blog", path: "/blog", icon: <Description />, category: "internal" },
  { id: "products", label: "Products", path: "/products", icon: <Description />, category: "internal" },
  { id: "pricing", label: "Pricing", path: "/pricing", icon: <Description />, category: "internal" },
];

const LinkDialog: React.FC<LinkDialogProps> = ({ open, onClose, onInsertLink }) => {
  const [linkType, setLinkType] = useState<"internal" | "external">("internal");
  const [selectedInternalLink, setSelectedInternalLink] = useState<string>("");
  const [externalUrl, setExternalUrl] = useState<string>("");

  const handleInsert = () => {
    let url = "";
    
    if (linkType === "internal") {
      if (!selectedInternalLink) return;
      const linkOption = INTERNAL_LINKS.find(link => link.id === selectedInternalLink);
      url = linkOption?.path || "";
    } else {
      if (!externalUrl) return;
      url = externalUrl;
    }

    if (url) {
      onInsertLink(url);
      handleClose();
    }
  };

  const handleClose = () => {
    setLinkType("internal");
    setSelectedInternalLink("");
    setExternalUrl("");
    onClose();
  };

  const isInsertDisabled = 
    (linkType === "internal" && !selectedInternalLink) ||
    (linkType === "external" && !externalUrl);

  const selectedLinkOption = INTERNAL_LINKS.find(link => link.id === selectedInternalLink);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <LinkIcon />
          Insert Link
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          {/* Link Type Selection */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Link Type
            </Typography>
            <ToggleButtonGroup
              value={linkType}
              exclusive
              onChange={(_, value) => value && setLinkType(value)}
              fullWidth
              size="small"
            >
              <ToggleButton value="internal" sx={{ flex: 1 }}>
                <Home sx={{ mr: 1 }} />
                Internal Link
              </ToggleButton>
              <ToggleButton value="external" sx={{ flex: 1 }}>
                <Language sx={{ mr: 1 }} />
                External URL
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Divider />

          {/* Internal Links */}
          {linkType === "internal" && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Select Page
              </Typography>
              <FormControl fullWidth size="small">
                <InputLabel>Choose a page</InputLabel>
                <Select
                  value={selectedInternalLink}
                  onChange={(e) => setSelectedInternalLink(e.target.value)}
                  label="Choose a page"
                >
                  {INTERNAL_LINKS.map((link) => (
                    <MenuItem key={link.id} value={link.id}>
                      <Box display="flex" alignItems="center" gap={1}>
                        {link.icon}
                        {link.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {selectedLinkOption && (
                <Box sx={{ mt: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Preview:</strong> {selectedLinkOption.label} → {selectedLinkOption.path}
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* External URL */}
          {linkType === "external" && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                External URL
              </Typography>
              <TextField
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="https://example.com"
                fullWidth
                size="small"
                helperText="Enter the full URL including http:// or https://"
              />
              
              {externalUrl && (
                <Box sx={{ mt: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Preview:</strong> {externalUrl}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleInsert} 
          variant="contained" 
          disabled={isInsertDisabled}
        >
          Insert Link
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LinkDialog;
