import type { ChangeEvent } from "react";
import type { PageBackgroundSettings } from "../../types/app";
const PageBackgroundControlsPopup = ({
  isOpen,
  onClose,
  pageBackgroundSettings,
  onPageBackgroundSettingsChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  pageBackgroundSettings: PageBackgroundSettings;
  onPageBackgroundSettingsChange: (
    key: keyof PageBackgroundSettings,
    value: PageBackgroundSettings[keyof PageBackgroundSettings]
  ) => void;
}) => {
  if (!isOpen) return null;

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        onPageBackgroundSettingsChange("backgroundImage", imageUrl);
        onPageBackgroundSettingsChange("type", "image");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="admin-popup-overlay" onClick={onClose}>
      <div className="admin-popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="admin-popup-header">
          <h3>Page Background Controls</h3>
          <button className="admin-popup-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="admin-popup-body">
          <div className="control-group">
            <h4>Background Type</h4>

            <label>
              <input
                type="radio"
                name="backgroundType"
                value="solid"
                checked={pageBackgroundSettings.type === "solid"}
                onChange={(e) =>
                  onPageBackgroundSettingsChange("type", e.target.value)
                }
              />
              Solid Color
            </label>

            <label>
              <input
                type="radio"
                name="backgroundType"
                value="gradient"
                checked={pageBackgroundSettings.type === "gradient"}
                onChange={(e) =>
                  onPageBackgroundSettingsChange("type", e.target.value)
                }
              />
              Gradient
            </label>

            <label>
              <input
                type="radio"
                name="backgroundType"
                value="image"
                checked={pageBackgroundSettings.type === "image"}
                onChange={(e) =>
                  onPageBackgroundSettingsChange("type", e.target.value)
                }
              />
              Image
            </label>
          </div>

          {pageBackgroundSettings.type === "solid" && (
            <div className="control-group">
              <h4>Solid Color Settings</h4>
              <div className="color-input-group">
                <label>Background Color:</label>
                <div className="color-input-container">
                  <input
                    type="color"
                    value={pageBackgroundSettings.solidColor}
                    onChange={(e) =>
                      onPageBackgroundSettingsChange(
                        "solidColor",
                        e.target.value
                      )
                    }
                    className="color-input"
                  />
                  <input
                    type="text"
                    value={pageBackgroundSettings.solidColor}
                    onChange={(e) =>
                      onPageBackgroundSettingsChange(
                        "solidColor",
                        e.target.value
                      )
                    }
                    className="color-text-input"
                  />
                </div>
              </div>
            </div>
          )}

          {pageBackgroundSettings.type === "gradient" && (
            <div className="control-group">
              <h4>Gradient Settings</h4>

              <div className="gradient-inputs">
                <div className="gradient-color-input">
                  <label>Color 1:</label>
                  <div className="color-input-container">
                    <input
                      type="color"
                      value={pageBackgroundSettings.gradientColors[0]}
                      onChange={(e) => {
                        const newColors = [
                          ...pageBackgroundSettings.gradientColors,
                        ];
                        newColors[0] = e.target.value;
                        onPageBackgroundSettingsChange(
                          "gradientColors",
                          newColors
                        );
                      }}
                      className="color-input"
                    />
                    <input
                      type="text"
                      value={pageBackgroundSettings.gradientColors[0]}
                      onChange={(e) => {
                        const newColors = [
                          ...pageBackgroundSettings.gradientColors,
                        ];
                        newColors[0] = e.target.value;
                        onPageBackgroundSettingsChange(
                          "gradientColors",
                          newColors
                        );
                      }}
                      className="color-text-input"
                    />
                  </div>
                </div>

                <div className="gradient-color-input">
                  <label>Color 2:</label>
                  <div className="color-input-container">
                    <input
                      type="color"
                      value={pageBackgroundSettings.gradientColors[1]}
                      onChange={(e) => {
                        const newColors = [
                          ...pageBackgroundSettings.gradientColors,
                        ];
                        newColors[1] = e.target.value;
                        onPageBackgroundSettingsChange(
                          "gradientColors",
                          newColors
                        );
                      }}
                      className="color-input"
                    />
                    <input
                      type="text"
                      value={pageBackgroundSettings.gradientColors[1]}
                      onChange={(e) => {
                        const newColors = [
                          ...pageBackgroundSettings.gradientColors,
                        ];
                        newColors[1] = e.target.value;
                        onPageBackgroundSettingsChange(
                          "gradientColors",
                          newColors
                        );
                      }}
                      className="color-text-input"
                    />
                  </div>
                </div>
              </div>

              <label>
                Gradient Direction:
                <select
                  value={pageBackgroundSettings.gradientDirection}
                  onChange={(e) =>
                    onPageBackgroundSettingsChange(
                      "gradientDirection",
                      e.target.value
                    )
                  }
                  style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                >
                  <option value="0deg">Top to Bottom</option>
                  <option value="90deg">Left to Right</option>
                  <option value="45deg">Top-Left to Bottom-Right</option>
                  <option value="135deg">Top-Right to Bottom-Left</option>
                  <option value="180deg">Bottom to Top</option>
                  <option value="270deg">Right to Left</option>
                </select>
              </label>
            </div>
          )}

          {pageBackgroundSettings.type === "image" && (
            <div className="control-group">
              <h4>Image Settings</h4>

              <label>
                Upload Background Image:
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                />
              </label>

              <label>
                Or Image URL:
                <input
                  type="url"
                  value={pageBackgroundSettings.backgroundImage}
                  onChange={(e) =>
                    onPageBackgroundSettingsChange(
                      "backgroundImage",
                      e.target.value
                    )
                  }
                  style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                  placeholder="https://example.com/image.jpg"
                />
              </label>

              {pageBackgroundSettings.backgroundImage && (
                <div style={{ marginTop: "10px" }}>
                  <p>Preview:</p>
                  <img
                    src={pageBackgroundSettings.backgroundImage}
                    alt="Background preview"
                    style={{
                      width: "100%",
                      maxWidth: "200px",
                      height: "100px",
                      objectFit: "cover",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                    }}
                  />
                  <button
                    onClick={() =>
                      onPageBackgroundSettingsChange("backgroundImage", "")
                    }
                    style={{
                      marginTop: "5px",
                      padding: "5px 10px",
                      background: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Remove Image
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageBackgroundControlsPopup;


