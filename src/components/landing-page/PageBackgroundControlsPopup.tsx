import { useEffect, useState } from "react";
import type { ChangeEvent, CSSProperties } from "react";
import { HexColorInput, HexColorPicker } from "react-colorful";
import type { PageBackgroundSettings } from "../../types/app";

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
const DEFAULT_SOLID_COLOR = "#111111";
const DEFAULT_GRADIENT_COLORS: [string, string] = ["#667eea", "#764ba2"];
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
  const solidColorSafe = sanitizeHexColor(
    pageBackgroundSettings.solidColor,
    DEFAULT_SOLID_COLOR
  );
  const gradientColorSafe1 = sanitizeHexColor(
    pageBackgroundSettings.gradientColors?.[0],
    DEFAULT_GRADIENT_COLORS[0]
  );
  const gradientColorSafe2 = sanitizeHexColor(
    pageBackgroundSettings.gradientColors?.[1],
    DEFAULT_GRADIENT_COLORS[1]
  );
  const [solidColorInput, setSolidColorInput] = useState(solidColorSafe);
  const [gradientColorInputs, setGradientColorInputs] = useState<
    [string, string]
  >([gradientColorSafe1, gradientColorSafe2]);

  useEffect(() => {
    setSolidColorInput(solidColorSafe);
  }, [solidColorSafe]);

  useEffect(() => {
    setGradientColorInputs([gradientColorSafe1, gradientColorSafe2]);
  }, [gradientColorSafe1, gradientColorSafe2]);

  const handleSolidColorCommit = (color: string) => {
    const normalized = color.toLowerCase();
    setSolidColorInput(normalized);
    onPageBackgroundSettingsChange("solidColor", normalized);
  };

  const handleGradientColorCommit = (index: 0 | 1, color: string) => {
    const normalized = color.toLowerCase();
    setGradientColorInputs((prev) => {
      const next = [...prev] as [string, string];
      next[index] = normalized;
      return next;
    });
    const existing = pageBackgroundSettings.gradientColors;
    const currentColors =
      existing && existing.length >= 2
        ? [...existing]
        : [...DEFAULT_GRADIENT_COLORS];
    currentColors[index] = normalized;
    onPageBackgroundSettingsChange("gradientColors", currentColors);
  };

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

  if (!isOpen) return null;

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
                <div
                  className="color-input-container"
                  style={COLOR_PICKER_CONTAINER_STYLE}
                >
                  <HexColorPicker
                    color={solidColorSafe}
                    onChange={handleSolidColorCommit}
                    style={HEX_COLOR_PICKER_STYLE}
                  />
                  <HexColorInput
                    prefixed
                    color={solidColorInput}
                    onChange={(value) => {
                      const normalized = normalizeHexValue(value);
                      setSolidColorInput(normalized);
                      if (HEX_COLOR_PATTERN.test(normalized)) {
                        handleSolidColorCommit(normalized);
                      }
                    }}
                    className="color-text-input"
                    style={HEX_COLOR_INPUT_STYLE}
                  />
                </div>
              </div>
            </div>
          )}

          {pageBackgroundSettings.type === "gradient" && (
            <div className="control-group">
              <h4>Gradient Settings</h4>

              <div className="gradient-inputs">
                {([0, 1] as const).map((index) => {
                  const label = index === 0 ? "Color 1:" : "Color 2:";
                  const safeColor =
                    index === 0 ? gradientColorSafe1 : gradientColorSafe2;
                  const inputValue = gradientColorInputs[index];
                  return (
                    <div className="gradient-color-input" key={index}>
                      <label>{label}</label>
                      <div
                        className="color-input-container"
                        style={COLOR_PICKER_CONTAINER_STYLE}
                      >
                        <HexColorPicker
                          color={safeColor}
                          onChange={(color) =>
                            handleGradientColorCommit(index, color)
                          }
                          style={HEX_COLOR_PICKER_STYLE}
                        />
                        <HexColorInput
                          prefixed
                          color={inputValue}
                          onChange={(value) => {
                            const normalized = normalizeHexValue(value);
                            setGradientColorInputs((prev) => {
                              const next = [...prev] as [string, string];
                              next[index] = normalized;
                              return next;
                            });
                            if (HEX_COLOR_PATTERN.test(normalized)) {
                              handleGradientColorCommit(index, normalized);
                            }
                          }}
                          className="color-text-input"
                          style={HEX_COLOR_INPUT_STYLE}
                        />
                      </div>
                    </div>
                  );
                })}
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


