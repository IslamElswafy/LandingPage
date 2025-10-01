import type { FooterSettings } from "../../types/app";
const FooterControlsPopup = ({
  isOpen,
  onClose,
  footerSettings,
  onFooterSettingsChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  footerSettings: FooterSettings;
  onFooterSettingsChange: (key: keyof FooterSettings, value: FooterSettings[keyof FooterSettings]) => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="admin-popup-overlay" onClick={onClose}>
      <div className="admin-popup-content" onClick={(e) => e.stopPropagation()}>
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
              <div className="color-input-container">
                <input
                  type="color"
                  value={footerSettings.backgroundColor}
                  onChange={(e) =>
                    onFooterSettingsChange("backgroundColor", e.target.value)
                  }
                  className="color-input"
                />
                <input
                  type="text"
                  value={footerSettings.backgroundColor}
                  onChange={(e) =>
                    onFooterSettingsChange("backgroundColor", e.target.value)
                  }
                  className="color-text-input"
                />
              </div>
            </div>

            <div className="color-input-group">
              <label>Text Color:</label>
              <div className="color-input-container">
                <input
                  type="color"
                  value={footerSettings.textColor}
                  onChange={(e) =>
                    onFooterSettingsChange("textColor", e.target.value)
                  }
                  className="color-input"
                />
                <input
                  type="text"
                  value={footerSettings.textColor}
                  onChange={(e) =>
                    onFooterSettingsChange("textColor", e.target.value)
                  }
                  className="color-text-input"
                />
              </div>
            </div>
          </div>

          <div className="control-group">
            <h4>Content Settings</h4>

            <label>
              Company Name:
              <input
                type="text"
                value={footerSettings.companyName}
                onChange={(e) =>
                  onFooterSettingsChange("companyName", e.target.value)
                }
                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              />
            </label>

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



