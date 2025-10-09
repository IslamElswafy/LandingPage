import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { HexColorInput, HexColorPicker } from "react-colorful";
import SimpleRichEditor from "../SimpleRichEditor/SimpleRichEditor";
import type { FooterSettings } from "../../types/app";

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
  borderRadius: "12px",
};
const HEX_COLOR_INPUT_STYLE: CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: "8px",
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
const DEFAULT_BACKGROUND_COLOR = "#111111";
const DEFAULT_TEXT_COLOR = "#ffffff";

const FooterControlsPopup = ({
  isOpen,
  onClose,
  footerSettings,
  onFooterSettingsChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  footerSettings: FooterSettings;
  onFooterSettingsChange: (
    key: keyof FooterSettings,
    value: FooterSettings[keyof FooterSettings]
  ) => void;
}) => {
  const backgroundColorSafe = sanitizeHexColor(
    footerSettings.backgroundColor,
    DEFAULT_BACKGROUND_COLOR
  );
  const textColorSafe = sanitizeHexColor(
    footerSettings.textColor,
    DEFAULT_TEXT_COLOR
  );
  const [backgroundColorInput, setBackgroundColorInput] =
    useState<string>(backgroundColorSafe);
  const [textColorInput, setTextColorInput] = useState<string>(textColorSafe);
  const [middleEditorContent, setMiddleEditorContent] = useState<string>(
    footerSettings.middleContent || ""
  );
  const [middleEditorContentAr, setMiddleEditorContentAr] = useState<string>(
    footerSettings.middleContentAr || ""
  );


  const handleMiddleEditorChange = (htmlContent: string) => {
    setMiddleEditorContent(htmlContent);
  };

  const handleMiddleEditorChangeAr = (htmlContent: string) => {
    setMiddleEditorContentAr(htmlContent);
  };

  const handleSaveMiddleContent = () => {
    onFooterSettingsChange("middleContent", middleEditorContent);
  };

  const handleClearMiddleContent = () => {
    setMiddleEditorContent("");
    onFooterSettingsChange("middleContent", "");
  };

  const handleSaveMiddleContentAr = () => {
    onFooterSettingsChange("middleContentAr", middleEditorContentAr);
  };

  const handleClearMiddleContentAr = () => {
    setMiddleEditorContentAr("");
    onFooterSettingsChange("middleContentAr", "");
  };

  useEffect(() => {
    setBackgroundColorInput(backgroundColorSafe);
  }, [backgroundColorSafe]);

  useEffect(() => {
    setTextColorInput(textColorSafe);
  }, [textColorSafe]);

  const handleLogoUpload = (file: File | null) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onFooterSettingsChange("leftLogoUrl", result);
    };
    reader.readAsDataURL(file);
  };

  const handleClearLogo = () => {
    onFooterSettingsChange("leftLogoUrl", "");
  };

  const handleBackgroundColorCommit = (color: string) => {
    const normalized = color.toLowerCase();
    setBackgroundColorInput(normalized);
    onFooterSettingsChange("backgroundColor", normalized);
  };

  const handleTextColorCommit = (color: string) => {
    const normalized = color.toLowerCase();
    setTextColorInput(normalized);
    onFooterSettingsChange("textColor", normalized);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="admin-popup-overlay" onClick={onClose}>
      <div
        className="admin-popup-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "900px",
          width: "90%",
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <div className="admin-popup-header">
          <h3>Footer Controls</h3>
          <button className="admin-popup-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="admin-popup-body">
          <div className="control-group">
            <h4>General Settings</h4>

            <label>
              <input
                type="checkbox"
                checked={footerSettings.isVisible}
                onChange={(e) =>
                  onFooterSettingsChange("isVisible", e.target.checked)
                }
              />
              Show Footer
            </label>

            <div className="color-input-group">
              <label>Background Color:</label>
              <div
                className="color-input-container"
                style={COLOR_PICKER_CONTAINER_STYLE}
              >
                <HexColorPicker
                  color={backgroundColorSafe}
                  onChange={handleBackgroundColorCommit}
                  style={HEX_COLOR_PICKER_STYLE}
                />
                <HexColorInput
                  prefixed
                  color={backgroundColorInput}
                  onChange={(value) => {
                    const normalized = normalizeHexValue(value);
                    setBackgroundColorInput(normalized);
                    if (HEX_COLOR_PATTERN.test(normalized)) {
                      handleBackgroundColorCommit(normalized);
                    }
                  }}
                  className="color-text-input"
                  style={HEX_COLOR_INPUT_STYLE}
                />
              </div>
            </div>

            <div className="color-input-group">
              <label>Text Color:</label>
              <div
                className="color-input-container"
                style={COLOR_PICKER_CONTAINER_STYLE}
              >
                <HexColorPicker
                  color={textColorSafe}
                  onChange={handleTextColorCommit}
                  style={HEX_COLOR_PICKER_STYLE}
                />
                <HexColorInput
                  prefixed
                  color={textColorInput}
                  onChange={(value) => {
                    const normalized = normalizeHexValue(value);
                    setTextColorInput(normalized);
                    if (HEX_COLOR_PATTERN.test(normalized)) {
                      handleTextColorCommit(normalized);
                    }
                  }}
                  className="color-text-input"
                  style={HEX_COLOR_INPUT_STYLE}
                />
              </div>
            </div>
          </div>

          <div className="control-group">
            <h4>Content Settings</h4>

            <label>
              Copyright Text:
              <input
                type="text"
                value={footerSettings.copyright}
                onChange={(e) =>
                  onFooterSettingsChange("copyright", e.target.value)
                }
                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              />
            </label>

            <label>
              Custom Text (optional):
              <textarea
                value={footerSettings.customText}
                onChange={(e) =>
                  onFooterSettingsChange("customText", e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "8px",
                  marginTop: "5px",
                  minHeight: "60px",
                }}
                placeholder="Additional footer text..."
              />
            </label>
          </div>

          <div className="control-group">
            <h4>Logo Settings</h4>
            <p
              style={{
                fontSize: "0.9rem",
                color: "#666",
                marginBottom: "10px",
              }}
            >
              Upload a logo image. Leave empty to use default Apple logo.
            </p>

            {footerSettings.leftLogoUrl && (
              <div style={{ marginBottom: "15px" }}>
                <img
                  src={footerSettings.leftLogoUrl}
                  alt="Logo Preview"
                  style={{
                    maxHeight: "80px",
                    maxWidth: "250px",
                    objectFit: "contain",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    padding: "12px",
                    backgroundColor: "#f9f9f9",
                  }}
                />
              </div>
            )}

            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleLogoUpload(e.target.files?.[0] || null)}
                style={{ flex: 1 }}
              />
              <button
                onClick={handleClearLogo}
                style={{
                  padding: "8px 16px",
                  background: "#FF3B30",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                🗑️ Clear
              </button>
            </div>
          </div>

          <div className="control-group">
            <h4>Middle Content - English (Rich Text Editor)</h4>
            <p
              style={{
                fontSize: "0.9rem",
                color: "#666",
                marginBottom: "10px",
              }}
            >
              Use the rich text editor below to customize the middle section for
              English language. Leave empty to show default navigation links.
            </p>

            <div
              style={{
                marginBottom: "15px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <SimpleRichEditor
                content={middleEditorContent}
                onChange={handleMiddleEditorChange}
                placeholder="Enter footer middle content for English (e.g., quick links, contact info)..."
                autoSave={false}
                theme="light"
              />
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <button
                onClick={handleSaveMiddleContent}
                style={{
                  padding: "10px 20px",
                  background: "#007AFF",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                💾 Save English Content
              </button>
              <button
                onClick={handleClearMiddleContent}
                style={{
                  padding: "10px 20px",
                  background: "#FF3B30",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                🗑️ Clear & Use Default Links
              </button>
            </div>
          </div>

          <div className="control-group">
            <h4>Middle Content - Arabic (Rich Text Editor)</h4>
            <p
              style={{
                fontSize: "0.9rem",
                color: "#666",
                marginBottom: "10px",
              }}
            >
              Use the rich text editor below to customize the middle section for
              Arabic language. Leave empty to show default navigation links.
            </p>

            <div
              style={{
                marginBottom: "15px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <SimpleRichEditor
                content={middleEditorContentAr}
                onChange={handleMiddleEditorChangeAr}
                placeholder="أدخل محتوى منتصف التذييل للغة العربية (مثل الروابط السريعة، معلومات الاتصال)..."
                autoSave={false}
                theme="light"
              />
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <button
                onClick={handleSaveMiddleContentAr}
                style={{
                  padding: "10px 20px",
                  background: "#007AFF",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                💾 Save Arabic Content
              </button>
              <button
                onClick={handleClearMiddleContentAr}
                style={{
                  padding: "10px 20px",
                  background: "#FF3B30",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                🗑️ Clear & Use Default Links
              </button>
            </div>
          </div>

          <div className="control-group">
            <h4>Social Links</h4>

            <label>
              <input
                type="checkbox"
                checked={footerSettings.showSocialLinks}
                onChange={(e) =>
                  onFooterSettingsChange("showSocialLinks", e.target.checked)
                }
              />
              Show Social Links
            </label>

            {footerSettings.showSocialLinks && (
              <>
                <label>
                  Facebook URL:
                  <input
                    type="url"
                    value={footerSettings.socialLinks.facebook}
                    onChange={(e) =>
                      onFooterSettingsChange("socialLinks", {
                        ...footerSettings.socialLinks,
                        facebook: e.target.value,
                      })
                    }
                    style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                    placeholder="https://facebook.com/yourpage"
                  />
                </label>

                <label>
                  LinkedIn URL:
                  <input
                    type="url"
                    value={footerSettings.socialLinks.linkedin}
                    onChange={(e) =>
                      onFooterSettingsChange("socialLinks", {
                        ...footerSettings.socialLinks,
                        linkedin: e.target.value,
                      })
                    }
                    style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </label>

                <label>
                  GitHub URL:
                  <input
                    type="url"
                    value={footerSettings.socialLinks.github}
                    onChange={(e) =>
                      onFooterSettingsChange("socialLinks", {
                        ...footerSettings.socialLinks,
                        github: e.target.value,
                      })
                    }
                    style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                    placeholder="https://github.com/yourusername"
                  />
                </label>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FooterControlsPopup;
