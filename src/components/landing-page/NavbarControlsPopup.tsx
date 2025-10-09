import { useTranslation } from "react-i18next";
import type {
  NavigationItem,
  NavbarSettings,
  LanguageOption,
} from "../../types/app";
import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
} from "react";
import type { CSSProperties } from "react";
import { HexColorInput, HexColorPicker } from "react-colorful";
import defaultLogo from "/wjl_Icon.png";

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
const DEFAULT_NAVBAR_BACKGROUND = "#111111";
const DEFAULT_NAVBAR_TEXT = "#ffffff";

const NavbarControlsPopup = ({
  isOpen,
  onClose,
  navbarSettings,
  onNavbarSettingsChange,
  navigationItems,
  onNavigationItemsChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  navbarSettings: NavbarSettings;
  onNavbarSettingsChange: (key: keyof NavbarSettings, value: NavbarSettings[keyof NavbarSettings]) => void;
  navigationItems: NavigationItem[];
  onNavigationItemsChange: (items: NavigationItem[]) => void;
}) => {
  const { t, i18n } = useTranslation();
  const backgroundColorSafe = sanitizeHexColor(
    navbarSettings.backgroundColor,
    DEFAULT_NAVBAR_BACKGROUND
  );
  const textColorSafe = sanitizeHexColor(
    navbarSettings.textColor,
    DEFAULT_NAVBAR_TEXT
  );
  const [backgroundColorInput, setBackgroundColorInput] = useState(
    backgroundColorSafe
  );
  const [textColorInput, setTextColorInput] = useState(textColorSafe);

  useEffect(() => {
    setBackgroundColorInput(backgroundColorSafe);
  }, [backgroundColorSafe]);

  useEffect(() => {
    setTextColorInput(textColorSafe);
  }, [textColorSafe]);

  const handleBackgroundColorCommit = useCallback(
    (color: string) => {
      const normalized = color.toLowerCase();
      setBackgroundColorInput(normalized);
      onNavbarSettingsChange("backgroundColor", normalized);
    },
    [onNavbarSettingsChange]
  );

  const handleTextColorCommit = useCallback(
    (color: string) => {
      const normalized = color.toLowerCase();
      setTextColorInput(normalized);
      onNavbarSettingsChange("textColor", normalized);
    },
    [onNavbarSettingsChange]
  );

  const handleLogoUpload = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const input = event.target;
      const file = input.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          onNavbarSettingsChange("logoUrl", reader.result);
        }
        input.value = "";
      };
      reader.readAsDataURL(file);
    },
    [onNavbarSettingsChange]
  );

  const handleLogoReset = useCallback(() => {
    onNavbarSettingsChange("logoUrl", defaultLogo);
  }, [onNavbarSettingsChange]);

  const updateLanguageOption = useCallback(
    (code: string, partial: Partial<LanguageOption>) => {
      const updatedOptions = navbarSettings.languageOptions.map((option) =>
        option.code === code ? { ...option, ...partial } : option
      );
      onNavbarSettingsChange("languageOptions", updatedOptions);
    },
    [navbarSettings.languageOptions, onNavbarSettingsChange]
  );

  const handleLanguageLabelChange = useCallback(
    (code: string, label: string) => {
      updateLanguageOption(code, { label });
    },
    [updateLanguageOption]
  );

  const handleLanguageIconUpload = useCallback(
    (code: string) => (event: ChangeEvent<HTMLInputElement>) => {
      const input = event.target;
      const file = input.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          updateLanguageOption(code, { iconUrl: reader.result });
        }
        input.value = "";
      };
      reader.readAsDataURL(file);
    },
    [updateLanguageOption]
  );

  const handleLanguageIconReset = useCallback(
    (code: string) => {
      updateLanguageOption(code, { iconUrl: "" });
    },
    [updateLanguageOption]
  );

  if (!isOpen) return null;

  const handleAddNavigationItem = () => {
    const newItem: NavigationItem = {
      id: `nav_${Date.now()}`,
      label: t("blocks.newItem"),
      view: "custom",
      customUrl: "",
      isVisible: true,
      order: navigationItems.length + 1,
      icon: "",
      iconUrl: "",
    };
    onNavigationItemsChange([...navigationItems, newItem]);
  };

  const handleUpdateNavigationItem = (
    id: string,
    field: keyof NavigationItem,
    value: NavigationItem[keyof NavigationItem]
  ) => {
    const updatedItems = navigationItems.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onNavigationItemsChange(updatedItems);
  };

  const handleDeleteNavigationItem = (id: string) => {
    const updatedItems = navigationItems
      .filter((item) => item.id !== id)
      .map((item, index) => ({ ...item, order: index + 1 }));
    onNavigationItemsChange(updatedItems);
  };

  const handleMoveItem = (id: string, direction: "up" | "down") => {
    const currentIndex = navigationItems.findIndex((item) => item.id === id);
    if (
      (direction === "up" && currentIndex > 0) ||
      (direction === "down" && currentIndex < navigationItems.length - 1)
    ) {
      const newItems = [...navigationItems];
      const targetIndex =
        direction === "up" ? currentIndex - 1 : currentIndex + 1;
      [newItems[currentIndex], newItems[targetIndex]] = [
        newItems[targetIndex],
        newItems[currentIndex],
      ];
      // Update order values
      newItems.forEach((item, index) => {
        item.order = index + 1;
      });
      onNavigationItemsChange(newItems);
    }
  };

  const handleNavigationLabelChange = (id: string, label: string) => {
    handleUpdateNavigationItem(id, "label", label);
  };

  const handleNavigationVisibilityChange = (id: string, isVisible: boolean) => {
    handleUpdateNavigationItem(id, "isVisible", isVisible);
  };

  const handleNavigationIconPathChange = (id: string, path: string) => {
    handleUpdateNavigationItem(id, "icon", path);
  };

  const handleNavigationIconUpload =
    (id: string) => (event: ChangeEvent<HTMLInputElement>) => {
      const input = event.target;
      const file = input.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          handleUpdateNavigationItem(id, "iconUrl", reader.result);
        }
        input.value = "";
      };
      reader.readAsDataURL(file);
    };

  const handleNavigationIconReset = (id: string) => {
    handleUpdateNavigationItem(id, "iconUrl", "");
  };

  const handleNavigationCustomUrlChange = (id: string, url: string) => {
    handleUpdateNavigationItem(id, "customUrl", url);
  };

  const handleNavigationViewChange = (
    id: string,
    view: NavigationItem["view"]
  ) => {
    handleUpdateNavigationItem(id, "view", view);
    if (view !== "custom") {
      handleUpdateNavigationItem(id, "customUrl", "");
    }
  };

  return (
    <div className="admin-popup-overlay" onClick={onClose}>
      <div
        className="admin-popup-content navbar-controls"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-popup-header">
          <h3>
            {t("settings.navbar")} {t("settings.settings")}
          </h3>
          <button className="admin-popup-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="admin-popup-body navbar-controls-body">
          {/* Navbar Appearance */}
          <div className="control-group">
            <h4>Appearance</h4>

            <label>
              <input
                type="checkbox"
                checked={navbarSettings.isVisible}
                onChange={(e) =>
                  onNavbarSettingsChange("isVisible", e.target.checked)
                }
              />
              Show Navbar
            </label>

            <label>
              <input
                type="checkbox"
                checked={navbarSettings.isSticky}
                onChange={(e) =>
                  onNavbarSettingsChange("isSticky", e.target.checked)
                }
              />
              Sticky Position
            </label>

            <label>
              <input
                type="checkbox"
                checked={navbarSettings.shadow}
                onChange={(e) =>
                  onNavbarSettingsChange("shadow", e.target.checked)
                }
              />
              Drop Shadow
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
                  placeholder="#1d1d1f"
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
                  placeholder="#f5f5f7"
                />
              </div>
            </div>

            <div className="slider-input-group">
              <label>Transparency: {navbarSettings.transparency}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={navbarSettings.transparency}
                onChange={(e) =>
                  onNavbarSettingsChange(
                    "transparency",
                    parseInt(e.target.value)
                  )
                }
                className="slider"
              />
            </div>

            <div className="slider-input-group">
              <label>Height: {navbarSettings.height}px</label>
              <input
                type="range"
                min="40"
                max="80"
                value={navbarSettings.height}
                onChange={(e) =>
                  onNavbarSettingsChange("height", parseInt(e.target.value))
                }
                className="slider"
              />
            </div>

            <div className="slider-input-group">
              <label>Border Radius: {navbarSettings.borderRadius}px</label>
              <input
                type="range"
                min="0"
                max="20"
                value={navbarSettings.borderRadius}
                onChange={(e) =>
                  onNavbarSettingsChange(
                    "borderRadius",
                    parseInt(e.target.value)
                  )
                }
                className="slider"
              />
            </div>
          </div>

          {/* Navbar Elements */}
          <div className="control-group">
            <h4>Navbar Elements</h4>

            <label>
              <input
                type="checkbox"
                checked={navbarSettings.showLogo}
                onChange={(e) =>
                  onNavbarSettingsChange("showLogo", e.target.checked)
                }
              />
              {t("settings.showLogo")}
            </label>
            {navbarSettings.showLogo && (
              <div className="file-input-group">
                <label htmlFor="nav-logo-upload">Logo Image</label>
                <input
                  id="nav-logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                />
                <div className="logo-preview">
                  <img
                    src={navbarSettings.logoUrl || defaultLogo}
                    alt="Logo preview"
                    style={{
                      width: "64px",
                      height: "64px",
                      objectFit: "contain",
                      display: "block",
                      marginTop: "8px",
                    }}
                  />
                  <button
                    type="button"
                    className="reset-button"
                    onClick={handleLogoReset}
                    style={{
                      marginTop: "8px",
                      background: "transparent",
                      border: "1px solid #ccc",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Reset Logo
                  </button>
                </div>
              </div>
            )}

            <label>
              <input
                type="checkbox"
                checked={navbarSettings.showSearch}
                onChange={(e) =>
                  onNavbarSettingsChange("showSearch", e.target.checked)
                }
              />
              {t("settings.showSearch")}
            </label>

            <label>
              <input
                type="checkbox"
                checked={navbarSettings.showSaveButton}
                onChange={(e) =>
                  onNavbarSettingsChange("showSaveButton", e.target.checked)
                }
              />
              {t("settings.showSaveButton")}
            </label>
          </div>

          <div className="control-group">
            <h4>Navigation Items</h4>
            <button
              type="button"
              onClick={handleAddNavigationItem}
              style={{
                alignSelf: "flex-start",
                marginBottom: "12px",
                padding: "6px 10px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                background: "#f5f5f5",
                cursor: "pointer",
              }}
            >
              + Add Navigation Item
            </button>

            <div className="navigation-items-editor" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[...navigationItems]
                .sort((a, b) => a.order - b.order)
                .map((item, index, array) => (
                  <div
                    key={item.id}
                    className="navigation-item-card"
                    style={{
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                      padding: "12px",
                      background: "#fafafa",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    <div
                      className="navigation-item-header"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <strong>{item.label || `Item ${index + 1}`}</strong>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          type="button"
                          onClick={() => handleMoveItem(item.id, "up")}
                          disabled={index === 0}
                          style={{
                            padding: "2px 6px",
                            borderRadius: "4px",
                            border: "1px solid #ccc",
                            background: index === 0 ? "#f0f0f0" : "#fff",
                            cursor: index === 0 ? "not-allowed" : "pointer",
                          }}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveItem(item.id, "down")}
                          disabled={index === array.length - 1}
                          style={{
                            padding: "2px 6px",
                            borderRadius: "4px",
                            border: "1px solid #ccc",
                            background:
                              index === array.length - 1 ? "#f0f0f0" : "#fff",
                            cursor:
                              index === array.length - 1
                                ? "not-allowed"
                                : "pointer",
                          }}
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteNavigationItem(item.id)}
                          style={{
                            padding: "2px 6px",
                            borderRadius: "4px",
                            border: "1px solid #e57373",
                            background: "#ffebee",
                            color: "#c62828",
                            cursor: "pointer",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      Label
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) =>
                          handleNavigationLabelChange(item.id, e.target.value)
                        }
                      />
                    </label>

                    <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <input
                        type="checkbox"
                        checked={item.isVisible}
                        onChange={(e) =>
                          handleNavigationVisibilityChange(
                            item.id,
                            e.target.checked
                          )
                        }
                      />
                      Visible
                    </label>

                    <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      Destination
                      <select
                        value={item.view}
                        onChange={(e) =>
                          handleNavigationViewChange(
                            item.id,
                            e.target.value as NavigationItem["view"]
                          )
                        }
                      >
                        <option value="home">Home</option>
                        <option value="about">About</option>
                        <option value="contact">Contact</option>
                        <option value="custom">Custom URL</option>
                      </select>
                    </label>

                    {item.view === "custom" && (
                      <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        Custom URL
                        <input
                          type="url"
                          value={item.customUrl || ""}
                          onChange={(e) =>
                            handleNavigationCustomUrlChange(
                              item.id,
                              e.target.value
                            )
                          }
                          placeholder="https://example.com/your-page"
                        />
                      </label>
                    )}

                    <div
                      className="icon-editor"
                      style={{ display: "flex", flexDirection: "column", gap: "8px" }}
                    >
                      <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        SVG Path (advanced)
                        <textarea
                          rows={2}
                          value={item.icon || ""}
                          onChange={(e) =>
                            handleNavigationIconPathChange(
                              item.id,
                              e.target.value
                            )
                          }
                          placeholder="Paste SVG path data (d attribute)"
                        />
                      </label>

                      <div className="file-input-group" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label htmlFor={`nav-icon-upload-${item.id}`}>
                          Icon Image
                        </label>
                        <input
                          id={`nav-icon-upload-${item.id}`}
                          type="file"
                          accept="image/*"
                          onChange={handleNavigationIconUpload(item.id)}
                        />
                      </div>

                      <div
                        className="icon-preview"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        {item.iconUrl ? (
                          <img
                            src={item.iconUrl}
                            alt={`${item.label || "Navigation"} icon preview`}
                            style={{
                              width: "48px",
                              height: "48px",
                              objectFit: "contain",
                              border: "1px solid #ddd",
                              borderRadius: "6px",
                              padding: "4px",
                              background: "white",
                            }}
                          />
                        ) : (
                          <span style={{ color: "#666", fontSize: "12px" }}>
                            No icon image selected. SVG path will be used.
                          </span>
                        )}
                        <button
                          type="button"
                          className="reset-button"
                          onClick={() => handleNavigationIconReset(item.id)}
                          style={{
                            background: "transparent",
                            border: "1px solid #ccc",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          Reset Icon Image
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Language Settings */}
          <div className="control-group">
            <h4>{t("ui.language")}</h4>

            <div className="language-switcher">
              {navbarSettings.languageOptions.map((option) => (
                <label
                  key={option.code}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <input
                    type="radio"
                    name="locale"
                    value={option.code}
                    checked={i18n.language === option.code}
                    onChange={() => i18n.changeLanguage(option.code)}
                  />
                  {option.iconUrl && (
                    <img
                      src={option.iconUrl}
                      alt={`${option.label || option.code.toUpperCase()} icon`}
                      style={{
                        width: "16px",
                        height: "16px",
                        objectFit: "contain",
                      }}
                    />
                  )}
                  {option.label || option.code.toUpperCase()}
                </label>
              ))}
            </div>

            <div className="language-options-editor">
              {navbarSettings.languageOptions.map((option) => {
                const inputId = `language-icon-${option.code}`;
                return (
                  <div
                    key={`${option.code}-editor`}
                    className="language-option-card"
                    style={{
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                      padding: "12px",
                      marginTop: "12px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      background: "#fafafa",
                    }}
                  >
                    <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      Display Name
                      <input
                        type="text"
                        value={option.label}
                        onChange={(e) =>
                          handleLanguageLabelChange(option.code, e.target.value)
                        }
                      />
                    </label>

                    <div className="file-input-group" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label htmlFor={inputId}>Icon Image</label>
                      <input
                        id={inputId}
                        type="file"
                        accept="image/*"
                        onChange={handleLanguageIconUpload(option.code)}
                      />
                    </div>

                    <div
                      className="language-icon-preview"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      {option.iconUrl ? (
                        <img
                          src={option.iconUrl}
                          alt={`${option.label || option.code.toUpperCase()} icon preview`}
                          style={{
                            width: "48px",
                            height: "48px",
                            objectFit: "contain",
                            border: "1px solid #ddd",
                            borderRadius: "6px",
                            padding: "4px",
                            background: "white",
                          }}
                        />
                      ) : (
                        <span style={{ color: "#666", fontSize: "12px" }}>
                          No icon selected
                        </span>
                      )}
                      <button
                        type="button"
                        className="reset-button"
                        onClick={() => handleLanguageIconReset(option.code)}
                        style={{
                          background: "transparent",
                          border: "1px solid #ccc",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        Reset Icon
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavbarControlsPopup;





