import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import type { Dispatch, SetStateAction, CSSProperties } from "react";
import type {
  BlockData,
  StyleSettings,
  BorderSide,
  CornerSide,
} from "../../types/app";
import { useFontFamilyOptions } from "../SimpleRichEditor/hooks";

type StyleSettingValue = string | number | BorderSide[] | CornerSide[];
const BORDER_SIDES: BorderSide[] = ["top", "right", "bottom", "left"];
const BORDER_SIDE_LABELS: Record<BorderSide, string> = {
  top: "Top",
  right: "Right",
  bottom: "Bottom",
  left: "Left",
};
const BORDER_SIDE_PROPERTIES: Record<BorderSide, keyof CSSProperties> = {
  top: "borderTop",
  right: "borderRight",
  bottom: "borderBottom",
  left: "borderLeft",
};

const CORNER_SIDES: CornerSide[] = [
  "top-left",
  "top-right",
  "bottom-right",
  "bottom-left",
];
const CORNER_SIDE_LABELS: Record<CornerSide, string> = {
  "top-left": "Top Left",
  "top-right": "Top Right",
  "bottom-right": "Bottom Right",
  "bottom-left": "Bottom Left",
};
const CORNER_SIDE_PROPERTIES: Record<CornerSide, keyof CSSProperties> = {
  "top-left": "borderTopLeftRadius",
  "top-right": "borderTopRightRadius",
  "bottom-right": "borderBottomRightRadius",
  "bottom-left": "borderBottomLeftRadius",
};

const ELEVATION_SHADOWS: Record<string, string> = {
  shadow: "0 18px 40px rgba(15, 23, 42, 0.25)",
  flat: "none",
  "shadow-soft": "0 10px 25px rgba(15, 23, 42, 0.18)",
  "shadow-strong": "0 28px 65px rgba(15, 23, 42, 0.35)",
};

const DEFAULT_FONT_FAMILY_OPTION = "__default_font_family__";

// No dimension constraints - full control over width and height
const clampDimension = (
  value: number | undefined,
  dimension: "width" | "height"
): number | undefined => {
  if (value === undefined) return undefined;
  if (!Number.isFinite(value)) return undefined;

  return Math.round(value);
};

const AdminControlsPopup = ({
  isOpen,
  onClose,
  styleSettings,
  onStyleChange,
  autoRotate,
  onAutoRotateChange,
  showHandles,
  onShowHandlesChange,
  enableDrag,
  onEnableDragChange,
  onResetAllCards,
  onDeleteAllBlocks,
  onAddNewBlock,
  selectedBlockId,
  selectedBlock,
  onSelectedBlockStyleChange,
  setBlocks,
}: {
  isOpen: boolean;
  onClose: () => void;
  styleSettings: StyleSettings;
  onStyleChange: (key: keyof StyleSettings, value: StyleSettingValue) => void;
  autoRotate: boolean;
  onAutoRotateChange: (value: boolean) => void;
  showHandles: boolean;
  onShowHandlesChange: (value: boolean) => void;
  enableDrag: boolean;
  onEnableDragChange: (value: boolean) => void;
  onResetAllCards: () => void;
  onDeleteAllBlocks: () => void;
  onAddNewBlock: () => void;
  selectedBlockId: string | null;
  selectedBlock: BlockData | null;
  onSelectedBlockStyleChange: (
    key: keyof StyleSettings,
    value: StyleSettingValue
  ) => void;
  setBlocks: Dispatch<SetStateAction<BlockData[]>>;
}) => {
  const { t } = useTranslation();
  const fontFamilyOptions = useFontFamilyOptions();
  const currentSettings: StyleSettings = {
    ...styleSettings,
    ...(selectedBlock?.styleSettings || {}),
  };
  const isBlockSelected = Boolean(selectedBlockId && selectedBlock);
  const readMoreFontFamilyValue =
    selectedBlock?.readMoreButtonFontFamily ?? undefined;
  const isCustomReadMoreFontFamily =
    readMoreFontFamilyValue !== undefined &&
    !fontFamilyOptions.some(
      (option) => option.value === readMoreFontFamilyValue
    );
  const readMoreFontFamilySelectValue =
    readMoreFontFamilyValue ?? DEFAULT_FONT_FAMILY_OPTION;
  const [isDimensionLockEnabled, setIsDimensionLockEnabled] = useState(true);
  const [dimensionRatio, setDimensionRatio] = useState<number | null>(null);

  useEffect(() => {
    if (selectedBlock?.width && selectedBlock?.height) {
      setDimensionRatio(selectedBlock.height / selectedBlock.width);
    } else {
      setDimensionRatio(null);
    }
  }, [selectedBlock?.id, selectedBlock?.width, selectedBlock?.height]);

  const applyDimensions = (width?: number, height?: number) => {
    if (!selectedBlock) return;

    setBlocks((prev) =>
      prev.map((block) => {
        if (block.id !== selectedBlock.id) return block;

        const next: BlockData = {
          ...block,
          width,
          height,
          isManuallyResized: Boolean(width || height),
        };

        if (!width) {
          next.width = undefined;
        }
        if (!height) {
          next.height = undefined;
        }
        if (!width && !height) {
          next.isManuallyResized = false;
        }

        return next;
      })
    );
  };

  const handleDimensionChange = (
    dimension: "width" | "height",
    rawValue: string
  ) => {
    if (!selectedBlock) return;

    const trimmed = rawValue.trim();
    let numericValue: number | undefined;
    if (trimmed === "") {
      numericValue = undefined;
    } else {
      const parsed = Number(trimmed);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        return;
      }
      numericValue = clampDimension(parsed, dimension);
    }

    let width = selectedBlock.width;
    let height = selectedBlock.height;

    const effectiveRatio =
      dimensionRatio ??
      (selectedBlock.width && selectedBlock.height
        ? selectedBlock.height / selectedBlock.width
        : null);

    if (dimension === "width") {
      width = numericValue;
      if (isDimensionLockEnabled) {
        if (numericValue === undefined) {
          height = undefined;
        } else if (effectiveRatio && effectiveRatio > 0) {
          height = clampDimension(numericValue * effectiveRatio, "height");
        }
      }
    } else {
      height = numericValue;
      if (isDimensionLockEnabled) {
        if (numericValue === undefined) {
          width = undefined;
        } else if (effectiveRatio && effectiveRatio > 0) {
          const clampedHeight = clampDimension(numericValue, "height");
          height = clampedHeight;
          if (clampedHeight !== undefined) {
            width = clampDimension(clampedHeight / effectiveRatio, "width");
          }
        }
      }
    }

    applyDimensions(width, height);

    if (width && height) {
      setDimensionRatio(height / width);
    } else if (!width || !height) {
      setDimensionRatio(null);
    }
  };

  const handleResetDimensions = () => {
    if (!selectedBlock) return;
    applyDimensions(undefined, undefined);
    setDimensionRatio(null);
  };

  const toggleDimensionLock = () => {
    setIsDimensionLockEnabled((prev) => {
      const next = !prev;
      if (next && selectedBlock?.width && selectedBlock?.height) {
        setDimensionRatio(selectedBlock.height / selectedBlock.width);
      }
      return next;
    });
  };

  const activeCornerSides =
    currentSettings.cornerSides !== undefined
      ? currentSettings.cornerSides
      : currentSettings.corners === "rounded"
      ? CORNER_SIDES
      : [];
  const activeBorderSides =
    currentSettings.borderSides !== undefined
      ? currentSettings.borderSides
      : BORDER_SIDES;
  const borderColorValue = currentSettings.borderColor || "#111111";
  const borderWidthValue = currentSettings.borderWidth ?? 1;

  const handleSettingChange = (
    key: keyof StyleSettings,
    value: StyleSettingValue
  ) => {
    if (isBlockSelected) {
      onSelectedBlockStyleChange(key, value);
    } else {
      onStyleChange(key, value);
    }
  };

  const handleBorderSideToggle = (side: BorderSide) => {
    const currentSet = new Set(activeBorderSides);
    if (currentSet.has(side)) {
      currentSet.delete(side);
    } else {
      currentSet.add(side);
    }
    const nextSides = BORDER_SIDES.filter((option) => currentSet.has(option));
    handleSettingChange("borderSides", nextSides);
  };

  const handleCornerSideToggle = (corner: CornerSide) => {
    const currentSet = new Set(activeCornerSides);
    if (currentSet.has(corner)) {
      currentSet.delete(corner);
    } else {
      currentSet.add(corner);
    }
    const nextCorners = CORNER_SIDES.filter((option) => currentSet.has(option));
    handleSettingChange("cornerSides", nextCorners);
  };

  const previewBorderStyle: CSSProperties = {};
  if (currentSettings.border === "with-border") {
    const borderValue = `${borderWidthValue}px solid ${borderColorValue}`;
    BORDER_SIDES.forEach((side) => {
      const prop = BORDER_SIDE_PROPERTIES[side];
      const value = activeBorderSides.includes(side) ? borderValue : "none";
      Object.assign(previewBorderStyle, {
        [prop]: value,
      });
    });
  } else {
    previewBorderStyle.border = "none";
  }

  const previewCornerStyle: CSSProperties = {};
  if (currentSettings.corners === "rounded") {
    CORNER_SIDES.forEach((corner) => {
      const prop = CORNER_SIDE_PROPERTIES[corner];
      previewCornerStyle[prop] = activeCornerSides.includes(corner)
        ? "var(--radius)"
        : "0";
    });
  } else {
    previewCornerStyle.borderRadius = "0";
  }

  const previewElevationStyle: CSSProperties = {
    boxShadow:
      ELEVATION_SHADOWS[currentSettings.elevation || "shadow"] ||
      ELEVATION_SHADOWS.shadow,
  };

  const dimensionLockTitle = isDimensionLockEnabled
    ? t("blocks.unlockRatio", { defaultValue: "Unlock ratio" })
    : t("blocks.lockRatio", { defaultValue: "Lock ratio" });

  const dimensionLockIcon = isDimensionLockEnabled ? "\u{1F512}" : "\u{1F513}";

  if (!isOpen) return null;

  return (
    <div className="admin-popup-overlay" onClick={onClose}>
      <div className="admin-popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="admin-popup-header">
          <h3>Block Editor</h3>
          <button className="admin-popup-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="admin-popup-body">
          {!isBlockSelected && (
            <div className="warning-message">
              <p>
                <strong>⚠️ No block selected</strong>
              </p>
              <p>
                Select a block to control its individual styling, or these
                controls will apply as defaults for new blocks.
              </p>
            </div>
          )}

          {isBlockSelected && (
            <div className="block-preview-container">
              <div className="preview-label">
                <strong>Preview</strong>
              </div>
              <div
                style={{
                  width: "200px",
                  height: "120px",
                  position: "relative",
                  marginBottom: "10px",
                  backgroundColor: "#f0f0f0",
                  backgroundImage:
                    "linear-gradient(45deg, #e0e0e0 25%, transparent 25%), linear-gradient(-45deg, #e0e0e0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e0e0e0 75%), linear-gradient(-45deg, transparent 75%, #e0e0e0 75%)",
                  backgroundSize: "10px 10px",
                  backgroundPosition: "0 0, 0 5px, 5px -5px, -5px 0px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              >
                <div
                  className={`block-preview ${
                    currentSettings.stylePreset || ""
                  } ${currentSettings.animation || ""} ${
                    currentSettings.corners || ""
                  } ${currentSettings.elevation || ""} ${
                    currentSettings.border || ""
                  } ${currentSettings.background || ""}`}
                  style={{
                    backgroundColor: selectedBlock?.backgroundColor,
                    backgroundImage: selectedBlock?.backgroundImage
                      ? `url(${selectedBlock.backgroundImage})`
                      : selectedBlock?.isGradient &&
                        selectedBlock?.gradientColors
                      ? `linear-gradient(${
                          selectedBlock.gradientDirection || "45deg"
                        }, ${selectedBlock.gradientColors.join(", ")})`
                      : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    color: "#333",
                    textAlign: "center",
                    position: "relative",
                    overflow: "hidden",
                    opacity: currentSettings.opacity / 100,
                    ...previewBorderStyle,
                    ...previewCornerStyle,
                    ...previewElevationStyle,
                  }}
                ></div>
              </div>
            </div>
          )}

          {/* Style Settings Group */}
          <div className="control-group">
            <label>Style Preset:</label>
            <select
              value={currentSettings.stylePreset}
              onChange={(e) =>
                handleSettingChange("stylePreset", e.target.value)
              }
            >
              <option value="">Default</option>
              <option value="style-modern">Modern</option>
              <option value="style-minimal">Minimal</option>
              <option value="style-glass">Glass</option>
              <option value="style-neon">Neon</option>
              <option value="style-gradient">Gradient</option>
              <option value="style-dark">Dark</option>
            </select>

            <label>Animation:</label>
            <select
              value={currentSettings.animation}
              onChange={(e) => handleSettingChange("animation", e.target.value)}
            >
              <option value="">None</option>
              <option value="animate-bounce">Bounce</option>
              <option value="animate-pulse">Pulse</option>
              <option value="animate-rotate">Rotate</option>
            </select>

            <label>Opacity:</label>
            <div className="opacity-control">
              <input
                type="range"
                min="1"
                max="100"
                value={currentSettings.opacity}
                onChange={(e) => handleSettingChange("opacity", e.target.value)}
                style={{
                  width: "100%",
                  marginBottom: "5px",
                }}
              />
              <span style={{ fontSize: "12px", color: "#666" }}>
                {currentSettings.opacity}%
              </span>
            </div>
          </div>

          {/* Background Settings Group */}
          <div className="control-group">
            <label>Background:</label>
            <select
              value={currentSettings.background}
              onChange={(e) =>
                handleSettingChange("background", e.target.value)
              }
            >
              <option value="bg-image">Image</option>
              <option value="bg-solid">Solid</option>
              <option value="bg-gradient">Gradient</option>
            </select>

            {/* Solid Color Input */}
            {currentSettings.background === "bg-solid" && (
              <div className="color-control-group">
                <label>Solid Color:</label>
                <div className="color-input-container">
                  <input
                    type="color"
                    value={selectedBlock?.backgroundColor || "#111111"}
                    onChange={(e) => {
                      if (isBlockSelected && selectedBlock) {
                        setBlocks((prev) =>
                          prev.map((block) =>
                            block.id === selectedBlock.id
                              ? { ...block, backgroundColor: e.target.value }
                              : block
                          )
                        );
                      }
                    }}
                    className="color-input"
                  />
                  <input
                    type="text"
                    value={selectedBlock?.backgroundColor || "#111111"}
                    onChange={(e) => {
                      if (isBlockSelected && selectedBlock) {
                        setBlocks((prev) =>
                          prev.map((block) =>
                            block.id === selectedBlock.id
                              ? { ...block, backgroundColor: e.target.value }
                              : block
                          )
                        );
                      }
                    }}
                    className="color-text-input"
                    placeholder="#111111"
                  />
                </div>
              </div>
            )}

            {/* Gradient Color Inputs */}
            {currentSettings.background === "bg-gradient" && (
              <div className="gradient-control-group">
                <label>Gradient Colors:</label>
                <div className="gradient-inputs">
                  <div className="gradient-color-input">
                    <label>Color 1:</label>
                    <div className="color-input-container">
                      <input
                        type="color"
                        value={selectedBlock?.gradientColors?.[0] || "#667eea"}
                        onChange={(e) => {
                          if (isBlockSelected && selectedBlock) {
                            const currentColors =
                              selectedBlock.gradientColors || [
                                "#667eea",
                                "#764ba2",
                              ];
                            const newColors = [
                              e.target.value,
                              currentColors[1] || "#764ba2",
                            ];
                            setBlocks((prev) =>
                              prev.map((block) =>
                                block.id === selectedBlock.id
                                  ? { ...block, gradientColors: newColors }
                                  : block
                              )
                            );
                          }
                        }}
                        className="color-input"
                      />
                      <input
                        type="text"
                        value={selectedBlock?.gradientColors?.[0] || "#667eea"}
                        onChange={(e) => {
                          if (isBlockSelected && selectedBlock) {
                            const currentColors =
                              selectedBlock.gradientColors || [
                                "#667eea",
                                "#764ba2",
                              ];
                            const newColors = [
                              e.target.value,
                              currentColors[1] || "#764ba2",
                            ];
                            setBlocks((prev) =>
                              prev.map((block) =>
                                block.id === selectedBlock.id
                                  ? { ...block, gradientColors: newColors }
                                  : block
                              )
                            );
                          }
                        }}
                        className="color-text-input"
                        placeholder="#667eea"
                      />
                    </div>
                  </div>
                  <div className="gradient-color-input">
                    <label>Color 2:</label>
                    <div className="color-input-container">
                      <input
                        type="color"
                        value={selectedBlock?.gradientColors?.[1] || "#764ba2"}
                        onChange={(e) => {
                          if (isBlockSelected && selectedBlock) {
                            const currentColors =
                              selectedBlock.gradientColors || [
                                "#667eea",
                                "#764ba2",
                              ];
                            const newColors = [
                              currentColors[0] || "#667eea",
                              e.target.value,
                            ];
                            setBlocks((prev) =>
                              prev.map((block) =>
                                block.id === selectedBlock.id
                                  ? { ...block, gradientColors: newColors }
                                  : block
                              )
                            );
                          }
                        }}
                        className="color-input"
                      />
                      <input
                        type="text"
                        value={selectedBlock?.gradientColors?.[1] || "#764ba2"}
                        onChange={(e) => {
                          if (isBlockSelected && selectedBlock) {
                            const currentColors =
                              selectedBlock.gradientColors || [
                                "#667eea",
                                "#764ba2",
                              ];
                            const newColors = [
                              currentColors[0] || "#667eea",
                              e.target.value,
                            ];
                            setBlocks((prev) =>
                              prev.map((block) =>
                                block.id === selectedBlock.id
                                  ? { ...block, gradientColors: newColors }
                                  : block
                              )
                            );
                          }
                        }}
                        className="color-text-input"
                        placeholder="#764ba2"
                      />
                    </div>
                  </div>
                </div>
                <div className="gradient-direction">
                  <label>Direction:</label>
                  <select
                    value={selectedBlock?.gradientDirection || "135deg"}
                    onChange={(e) => {
                      if (isBlockSelected && selectedBlock) {
                        setBlocks((prev) =>
                          prev.map((block) =>
                            block.id === selectedBlock.id
                              ? { ...block, gradientDirection: e.target.value }
                              : block
                          )
                        );
                      }
                    }}
                    className="gradient-direction-select"
                  >
                    <option value="0deg">Horizontal (0°)</option>
                    <option value="90deg">Vertical (90°)</option>
                    <option value="135deg">Diagonal (135°)</option>
                    <option value="45deg">Diagonal (45°)</option>
                    <option value="180deg">Reverse Horizontal (180°)</option>
                    <option value="270deg">Reverse Vertical (270°)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Border & Corners Group */}
          <div className="control-group">
            <label>Border:</label>
            <select
              value={currentSettings.border}
              onChange={(e) => handleSettingChange("border", e.target.value)}
            >
              <option value="no-border">No border</option>
              <option value="with-border">With border</option>
            </select>

            {currentSettings.border === "with-border" && (
              <div className="border-control-group">
                <label>Border Sides:</label>
                <div className="border-sides-options">
                  {BORDER_SIDES.map((side) => (
                    <label key={side} className="border-side-option">
                      <input
                        type="checkbox"
                        checked={activeBorderSides.includes(side)}
                        onChange={() => handleBorderSideToggle(side)}
                      />
                      {BORDER_SIDE_LABELS[side]}
                    </label>
                  ))}
                </div>

                <label>Border Color:</label>
                <div className="color-input-container">
                  <input
                    type="color"
                    value={borderColorValue}
                    onChange={(e) =>
                      handleSettingChange("borderColor", e.target.value)
                    }
                    className="color-input"
                  />
                  <input
                    type="text"
                    value={borderColorValue}
                    onChange={(e) =>
                      handleSettingChange("borderColor", e.target.value)
                    }
                    className="color-text-input"
                    placeholder="#111111"
                  />
                </div>

                <label>Border Thickness:</label>
                <select
                  value={String(borderWidthValue)}
                  onChange={(e) =>
                    handleSettingChange("borderWidth", Number(e.target.value))
                  }
                >
                  <option value="1">Thin</option>
                  <option value="2">Medium</option>
                  <option value="4">Bold</option>
                </select>
              </div>
            )}

            <label>Corners:</label>
            <select
              value={currentSettings.corners}
              onChange={(e) => {
                const value = e.target.value;
                handleSettingChange("corners", value);
                if (value === "rounded") {
                  if (
                    !currentSettings.cornerSides ||
                    currentSettings.cornerSides.length === 0
                  ) {
                    handleSettingChange("cornerSides", CORNER_SIDES);
                  }
                } else {
                  handleSettingChange("cornerSides", []);
                }
              }}
            >
              <option value="rounded">Rounded</option>
              <option value="">Square</option>
            </select>

            {currentSettings.corners === "rounded" && (
              <div className="border-control-group">
                <label>Rounded corners:</label>
                <div className="border-sides-options">
                  {CORNER_SIDES.map((corner) => (
                    <label key={corner} className="border-side-option">
                      <input
                        type="checkbox"
                        checked={activeCornerSides.includes(corner)}
                        onChange={() => handleCornerSideToggle(corner)}
                      />
                      {CORNER_SIDE_LABELS[corner]}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <label>Elevation:</label>
            <select
              value={currentSettings.elevation}
              onChange={(e) => handleSettingChange("elevation", e.target.value)}
            >
              <option value="shadow">Shadow</option>
              <option value="flat">{t("blocks.flat")}</option>
            </select>
          </div>

          {/* Dimensions Group (Block Selected Only) */}
          {isBlockSelected && (
            <div className="control-group">
              <div className="dimension-control">
                <label>Dimensions (px)</label>
                <div className="dimension-inputs">
                  <div className="dimension-input">
                    <span>W</span>
                    <input
                      type="number"
                      min="1"
                      value={selectedBlock?.width ?? ""}
                      onChange={(e) =>
                        handleDimensionChange("width", e.target.value)
                      }
                      placeholder="auto"
                    />
                  </div>
                  <button
                    type="button"
                    className={`dimension-lock-toggle${
                      isDimensionLockEnabled ? " locked" : ""
                    }`}
                    onClick={toggleDimensionLock}
                    title={dimensionLockTitle}
                    aria-pressed={isDimensionLockEnabled}
                    aria-label={dimensionLockTitle}
                  >
                    {dimensionLockIcon}
                  </button>
                  <div className="dimension-input">
                    <span>H</span>
                    <input
                      type="number"
                      min="1"
                      value={selectedBlock?.height ?? ""}
                      onChange={(e) =>
                        handleDimensionChange("height", e.target.value)
                      }
                      placeholder="auto"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  className="dimension-reset-btn"
                  onClick={handleResetDimensions}
                  disabled={!selectedBlock?.width && !selectedBlock?.height}
                >
                  Reset size
                </button>
              </div>
            </div>
          )}

          {/* Read More Button Controls (Block Selected Only) */}
          {isBlockSelected && (
            <div className="control-group">
              <label>
                <input
                  type="checkbox"
                  checked={selectedBlock?.showReadMoreButton ?? true}
                  onChange={(e) => {
                    if (selectedBlock) {
                      setBlocks((prev) =>
                        prev.map((block) =>
                          block.id === selectedBlock.id
                            ? { ...block, showReadMoreButton: e.target.checked }
                            : block
                        )
                      );
                    }
                  }}
                />
                Show Read More Button
              </label>

              {selectedBlock?.showReadMoreButton !== false && (
                <>
                  <label>Read More Button Text:</label>
                  <input
                    type="text"
                    value={selectedBlock?.readMoreButtonText || "Read More"}
                    onChange={(e) => {
                      if (selectedBlock) {
                        setBlocks((prev) =>
                          prev.map((block) =>
                            block.id === selectedBlock.id
                              ? { ...block, readMoreButtonText: e.target.value }
                              : block
                          )
                        );
                      }
                    }}
                    placeholder="Read More"
                  />

                  <label>Button Position:</label>
                  <select
                    value={
                      selectedBlock?.readMoreButtonPosition || "bottom-left"
                    }
                    onChange={(e) => {
                      if (selectedBlock) {
                        setBlocks((prev) =>
                          prev.map((block) =>
                            block.id === selectedBlock.id
                              ? {
                                  ...block,
                                  readMoreButtonPosition: e.target.value as
                                    | "bottom-left"
                                    | "bottom-center"
                                    | "bottom-right",
                                }
                              : block
                          )
                        );
                      }
                    }}
                  >
                    <option value="bottom-left">Bottom Left</option>
                    <option value="bottom-center">Bottom Center</option>
                    <option value="bottom-right">Bottom Right</option>
                  </select>

                  <label>Button Style:</label>
                  <select
                    value={selectedBlock?.readMoreButtonVariant || "default"}
                    onChange={(e) => {
                      if (selectedBlock) {
                        setBlocks((prev) =>
                          prev.map((block) =>
                            block.id === selectedBlock.id
                              ? {
                                  ...block,
                                  readMoreButtonVariant:
                                    e.target.value === "default"
                                      ? undefined
                                      : (e.target.value as "flat" | "round"),
                                }
                              : block
                          )
                        );
                      }
                    }}
                  >
                    <option value="default">Default</option>
                    <option value="flat">Flat</option>
                    <option value="round">Round</option>
                  </select>

                  <label>Button Font Size (px):</label>
                  <input
                    type="number"
                    min={8}
                    max={72}
                    value={
                      selectedBlock?.readMoreButtonFontSize !== undefined
                        ? selectedBlock.readMoreButtonFontSize
                        : ""
                    }
                    onChange={(e) => {
                      if (selectedBlock) {
                        const fontSize = Number.parseInt(
                          e.target.value,
                          10
                        );
                        setBlocks((prev) =>
                          prev.map((block) =>
                            block.id === selectedBlock.id
                              ? {
                                  ...block,
                                  readMoreButtonFontSize: Number.isNaN(
                                    fontSize
                                  )
                                    ? undefined
                                    : fontSize,
                                }
                              : block
                          )
                        );
                      }
                    }}
                  />

                  <label>Button Font Family:</label>
                  <select
                    value={
                      isCustomReadMoreFontFamily
                        ? readMoreFontFamilyValue ??
                          DEFAULT_FONT_FAMILY_OPTION
                        : readMoreFontFamilySelectValue
                    }
                    onChange={(e) => {
                      if (!selectedBlock) return;

                      const value = e.target.value;
                      setBlocks((prev) =>
                        prev.map((block) =>
                          block.id === selectedBlock.id
                            ? {
                                ...block,
                                readMoreButtonFontFamily:
                                  value === DEFAULT_FONT_FAMILY_OPTION
                                    ? undefined
                                    : value,
                              }
                            : block
                        )
                      );
                    }}
                  >
                    <option value={DEFAULT_FONT_FAMILY_OPTION}>Default</option>
                    {fontFamilyOptions.map(({ value, label }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                    {isCustomReadMoreFontFamily && readMoreFontFamilyValue ? (
                      <option value={readMoreFontFamilyValue}>
                        Custom ({readMoreFontFamilyValue})
                      </option>
                    ) : null}
                  </select>

                  <label>Button Background Color:</label>
                  <input
                    type="color"
                    value={selectedBlock?.readMoreButtonBackgroundColor || "#000000"}
                    onChange={(e) => {
                      if (selectedBlock) {
                        setBlocks((prev) =>
                          prev.map((block) =>
                            block.id === selectedBlock.id
                              ? {
                                  ...block,
                                  readMoreButtonBackgroundColor: e.target.value,
                                }
                              : block
                          )
                        );
                      }
                    }}
                  />

                  <label>Button Text Color:</label>
                  <input
                    type="color"
                    value={selectedBlock?.readMoreButtonTextColor || "#ffffff"}
                    onChange={(e) => {
                      if (selectedBlock) {
                        setBlocks((prev) =>
                          prev.map((block) =>
                            block.id === selectedBlock.id
                              ? {
                                  ...block,
                                  readMoreButtonTextColor: e.target.value,
                                }
                              : block
                          )
                        );
                      }
                    }}
                  />
                </>
              )}
            </div>
          )}

          {/* Global Controls Group */}
          <div className="control-group">
            <label>
              <input
                type="checkbox"
                checked={autoRotate}
                onChange={(e) => onAutoRotateChange(e.target.checked)}
              />
              Auto-rotate hero
            </label>

            <label>
              <input
                type="checkbox"
                checked={showHandles}
                onChange={(e) => onShowHandlesChange(e.target.checked)}
              />
              Show
            </label>

            <label>
              <input
                type="checkbox"
                checked={enableDrag}
                onChange={(e) => onEnableDragChange(e.target.checked)}
              />
              Enable drag & drop
            </label>
          </div>

          {/* Action Buttons Group */}
          <div className="control-group">
            <button type="button" onClick={onResetAllCards}>
              Reset All Cards
            </button>

            <button
              type="button"
              onClick={onAddNewBlock}
              className="add-block-btn"
            >
              {t("blocks.addNewBlock")}
            </button>

            <button
              type="button"
              onClick={onDeleteAllBlocks}
              className="delete-all-btn"
            >
              {t("blocks.deleteAllBlocks")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminControlsPopup;
