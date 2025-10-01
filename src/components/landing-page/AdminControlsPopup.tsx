import { useTranslation } from "react-i18next";
import type { Dispatch, SetStateAction } from "react";
import type { BlockData, StyleSettings } from "../../types/app";
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
  onStyleChange: (key: keyof StyleSettings, value: string) => void;
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
  onSelectedBlockStyleChange: (key: keyof StyleSettings, value: string) => void;
  setBlocks: Dispatch<SetStateAction<BlockData[]>>;
}) => {
  const { t } = useTranslation();
  const currentSettings = selectedBlock?.styleSettings || styleSettings;
  const isBlockSelected = Boolean(selectedBlockId && selectedBlock);

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
                    backgroundColor: selectedBlock.backgroundColor,
                    backgroundImage: selectedBlock.backgroundImage
                      ? `url(${selectedBlock.backgroundImage})`
                      : selectedBlock.isGradient && selectedBlock.gradientColors
                      ? `linear-gradient(${
                          selectedBlock.gradientDirection || "45deg"
                        }, ${selectedBlock.gradientColors.join(", ")})`
                      : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    width: "100%",
                    height: "100%",
                    borderRadius:
                      currentSettings.corners === "rounded" ? "8px" : "0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    color: "#333",
                    textAlign: "center",
                    position: "relative",
                    overflow: "hidden",
                    opacity: currentSettings.opacity / 100,
                  }}
                ></div>
              </div>
            </div>
          )}

          <div className="control-group">
            <label>Style Preset:</label>
            <select
              value={currentSettings.stylePreset}
              onChange={(e) =>
                isBlockSelected
                  ? onSelectedBlockStyleChange("stylePreset", e.target.value)
                  : onStyleChange("stylePreset", e.target.value)
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

            <label>Opacity:</label>
            <div className="opacity-control">
              <input
                type="range"
                min="1"
                max="100"
                value={currentSettings.opacity}
                onChange={(e) =>
                  isBlockSelected
                    ? onSelectedBlockStyleChange(
                        "opacity",
                        e.target.value
                      )
                    : onStyleChange("opacity", e.target.value)
                }
                style={{
                  width: "100%",
                  marginBottom: "5px",
                }}
              />
              <span style={{ fontSize: "12px", color: "#666" }}>
                {currentSettings.opacity}%
              </span>
            </div>

            <label>Animation:</label>
            <select
              value={currentSettings.animation}
              onChange={(e) =>
                isBlockSelected
                  ? onSelectedBlockStyleChange("animation", e.target.value)
                  : onStyleChange("animation", e.target.value)
              }
            >
              <option value="">None</option>
              <option value="animate-bounce">Bounce</option>
              <option value="animate-pulse">Pulse</option>
              <option value="animate-rotate">Rotate</option>
            </select>

            <label>Corners:</label>
            <select
              value={currentSettings.corners}
              onChange={(e) =>
                isBlockSelected
                  ? onSelectedBlockStyleChange("corners", e.target.value)
                  : onStyleChange("corners", e.target.value)
              }
            >
              <option value="rounded">Rounded</option>
              <option value="">Square</option>
            </select>

            <label>Elevation:</label>
            <select
              value={currentSettings.elevation}
              onChange={(e) =>
                isBlockSelected
                  ? onSelectedBlockStyleChange("elevation", e.target.value)
                  : onStyleChange("elevation", e.target.value)
              }
            >
              <option value="shadow">Shadow</option>
              <option value="flat">{t("blocks.flat")}</option>
            </select>
          </div>

          <div className="control-group">
            <label>Border:</label>
            <select
              value={currentSettings.border}
              onChange={(e) =>
                isBlockSelected
                  ? onSelectedBlockStyleChange("border", e.target.value)
                  : onStyleChange("border", e.target.value)
              }
            >
              <option value="no-border">No border</option>
              <option value="with-border">With border</option>
            </select>

            <label>Background:</label>
            <select
              value={currentSettings.background}
              onChange={(e) =>
                isBlockSelected
                  ? onSelectedBlockStyleChange("background", e.target.value)
                  : onStyleChange("background", e.target.value)
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
              Show resize handles
            </label>

            <label>
              <input
                type="checkbox"
                checked={enableDrag}
                onChange={(e) => onEnableDragChange(e.target.checked)}
              />
              Enable drag & drop
            </label>

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



