import { useTranslation } from "react-i18next";
import type {
  NavigationItem,
  NavbarSettings,
  LanguageOption,
} from "../../types/app";
import { useCallback, type ChangeEvent } from "react";
import defaultLogo from "/wjl_Icon.png";

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAddNavigationItem = () => {
    const newItem: NavigationItem = {
      id: `nav_${Date.now()}`,
      label: t("blocks.newItem"),
      view: "custom",
      customUrl: "",
      isVisible: true,
      order: navigationItems.length + 1,
    };
    onNavigationItemsChange([...navigationItems, newItem]);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDeleteNavigationItem = (id: string) => {
    const updatedItems = navigationItems.filter((item) => item.id !== id);
    onNavigationItemsChange(updatedItems);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
              <div className="color-input-container">
                <input
                  type="color"
                  value={navbarSettings.backgroundColor}
                  onChange={(e) =>
                    onNavbarSettingsChange("backgroundColor", e.target.value)
                  }
                  className="color-input"
                />
                <input
                  type="text"
                  value={navbarSettings.backgroundColor}
                  onChange={(e) =>
                    onNavbarSettingsChange("backgroundColor", e.target.value)
                  }
                  className="color-text-input"
                  placeholder="#1d1d1f"
                />
              </div>
            </div>

            <div className="color-input-group">
              <label>Text Color:</label>
              <div className="color-input-container">
                <input
                  type="color"
                  value={navbarSettings.textColor}
                  onChange={(e) =>
                    onNavbarSettingsChange("textColor", e.target.value)
                  }
                  className="color-input"
                />
                <input
                  type="text"
                  value={navbarSettings.textColor}
                  onChange={(e) =>
                    onNavbarSettingsChange("textColor", e.target.value)
                  }
                  className="color-text-input"
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





