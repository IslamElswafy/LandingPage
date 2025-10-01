import { useTranslation } from "react-i18next";
import type { NavigationItem, NavbarSettings } from "../../types/app";
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
              <label>
                <input
                  type="radio"
                  name="locale"
                  value="en"
                  checked={i18n.language === "en"}
                  onChange={() => i18n.changeLanguage("en")}
                />
                English
              </label>

              <label>
                <input
                  type="radio"
                  name="locale"
                  value="ar"
                  checked={i18n.language === "ar"}
                  onChange={() => i18n.changeLanguage("ar")}
                />
                العربية
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavbarControlsPopup;





