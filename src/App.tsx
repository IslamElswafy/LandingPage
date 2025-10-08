import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./App.css";
import wjlIcon from "/wjl_Icon.png";
import CleanLandingPage from "./components/CleanLandingPage";
import NotificationCenter from "./components/NotificationCenter";
import ToastNotification from "./components/ToastNotification";
import AdminControlsPopup from "./components/landing-page/AdminControlsPopup";
import BlockContentViewModal from "./components/landing-page/BlockContentViewModal";
import BrandsSlider from "./components/landing-page/BrandsSlider";
import ContactMessagesAdmin from "./components/landing-page/ContactMessagesAdmin";
import DynamicBlock from "./components/landing-page/DynamicBlock";
import Footer from "./components/landing-page/Footer";
import FooterControlsPopup from "./components/landing-page/FooterControlsPopup";
import HeroCarousel from "./components/landing-page/HeroCarousel";
import NavbarControlsPopup from "./components/landing-page/NavbarControlsPopup";
import PageBackgroundControlsPopup from "./components/landing-page/PageBackgroundControlsPopup";
import ReplyModal from "./components/landing-page/ReplyModal";
import VisitorStatistics from "./components/landing-page/VisitorStatistics";
import { useNotifications } from "./hooks/useNotifications";
import { useMasonryGrid } from "./hooks/useMasonryGrid";
import type { ToastNotificationData } from "./types/notifications";
import type {
  StyleSettings,
  BorderSide,
  CornerSide,
  ContentItem,
  BlockData,
  CarouselImage,
  ContactMessage,
  VisitorData,
  VisitorStats,
  NavbarSettings,
  FooterSettings,
  PageBackgroundSettings,
  NavigationItem,
  LanguageOption,
  ResizeState,
} from "./types/app";

// Main App Component
function App() {
  const { t, i18n } = useTranslation();

  // Notification system
  const {
    notifications,
    toasts,
    notificationCenterOpen,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    removeToast,
    toggleNotificationCenter,
    closeNotificationCenter,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  } = useNotifications();

  // State management
  const [blocks, setBlocks] = useState<BlockData[]>([
    {
      id: "1",
      title: t("blocks.innovation"),
      tag: t("blocks.innovation"),
      backgroundImage:
        "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop",
      isManuallyResized: false,
      isResizeLocked: false,
      content:
        "**Innovation** is at the heart of everything we do. We constantly push the boundaries of what's possible, bringing you cutting-edge solutions that transform the way you work and live.\n\nOur innovative approach includes:\n- Revolutionary technology\n- User-centered design\n- Sustainable practices\n- Continuous improvement",
      contentType: "text" as const,
    },
    {
      id: "2",
      title: t("blocks.automation"),
      tag: t("blocks.automation"),
      backgroundImage:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop",
      isManuallyResized: false,
      isResizeLocked: false,
      content:
        "*Streamline your workflow* with our powerful automation tools. Say goodbye to repetitive tasks and hello to increased productivity and efficiency.",
      contentType: "text" as const,
    },
    {
      id: "3",
      title: t("blocks.analytics"),
      tag: t("blocks.analytics"),
      backgroundImage:
        "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop",
      isManuallyResized: false,
      isResizeLocked: false,
    },
    {
      id: "4",
      title: t("blocks.analytics"),
      tag: t("blocks.analytics"),
      backgroundImage:
        "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop",
      isManuallyResized: false,
      isResizeLocked: false,
    },
    {
      id: "5",
      title: t("blocks.analytics"),
      tag: t("blocks.analytics"),
      backgroundImage:
        "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1200&auto=format&fit=crop",
      isManuallyResized: false,
      isResizeLocked: false,
    },
    {
      id: "6",
      title: t("blocks.flat"),
      tag: t("blocks.flat"),
      backgroundColor: "#000",
      isGradient: false,
      gradientColors: ["#000000", "#333333"],
      gradientDirection: "135deg",
      isManuallyResized: false,
      isResizeLocked: false,
    },
    {
      id: "7",
      title: t("blocks.gradientTest"),
      tag: t("blocks.gradient"),
      isGradient: true,
      gradientColors: ["#ff6b6b", "#4ecdc4"],
      gradientDirection: "45deg",
      isManuallyResized: false,
      isResizeLocked: false,
      styleSettings: {
        stylePreset: "",
        opacity: 100,
        animation: "",
        corners: "rounded",
        cornerSides: ["top-left", "top-right", "bottom-right", "bottom-left"],
        elevation: "shadow",
        border: "no-border",
        background: "bg-gradient",
        borderSides: ["top", "right", "bottom", "left"],
        borderColor: "#111111",
        borderWidth: 1,
      },
    },
  ]);

  const [styleSettings, setStyleSettings] = useState<StyleSettings>({
    stylePreset: "",
    opacity: 100,
    animation: "",
    corners: "rounded",
    cornerSides: ["top-left", "top-right", "bottom-right", "bottom-left"],
    elevation: "shadow",
    border: "no-border",
    background: "bg-image",
    borderSides: ["top", "right", "bottom", "left"],
    borderColor: "#111111",
    borderWidth: 1,
  });

  const [autoRotate, setAutoRotate] = useState(false);
  const [showHandles, setShowHandles] = useState(false);
  const [enableDrag, setEnableDrag] = useState(true);
  const [heroVisible, setHeroVisible] = useState(true);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<"home" | "contact" | "about">(
    "home"
  );
  const [isLiveView, setIsLiveView] = useState(false);
  const [heroImages, setHeroImages] = useState<CarouselImage[]>([
    {
      src: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop",
      alt: "Golden liquid drop creating ripples",
      link: "https://unsplash.com/photos/golden-liquid-drop-creating-ripples",
    },
    {
      src: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1600&auto=format&fit=crop",
      alt: "Forest river winding through landscape",
      link: "https://unsplash.com/photos/forest-river-winding-through-landscape",
    },
    {
      src: "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=1600&auto=format&fit=crop",
      alt: "Golden liquid drop creating ripples",
      link: "https://unsplash.com/photos/another-golden-liquid-drop",
    },
    {
      src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600&auto=format&fit=crop",
      alt: "Forest river from above",
      link: "https://unsplash.com/photos/forest-river-from-above",
    },
    {
      src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop",
      alt: "Forest landscape",
      link: "https://unsplash.com/photos/forest-landscape",
    },
  ]);
  const [visitorStats, setVisitorStats] = useState<VisitorStats>({
    totalVisitors: 12847,
    todayVisitors: 234,
    uniqueVisitors: 8392,
    topSources: [
      { source: "Google", count: 4235 },
      { source: "Facebook", count: 2341 },
      { source: "Direct", count: 1876 },
      { source: "Twitter", count: 943 },
      { source: "LinkedIn", count: 672 },
    ],
    topCountries: [
      { country: "🇸🇦", count: 5432 },
      { country: "🇦🇪", count: 2341 },
      { country: "🇪🇬", count: 1876 },
      { country: "🇯🇴", count: 943 },
      { country: "🇰🇼", count: 672 },
    ],
    visitorsData: [
      {
        id: "1",
        timestamp: new Date().toISOString(),
        source: "Google",
        userAgent: "Chrome/91.0",
        country: "🇸🇦",
        ip: "192.168.1.1",
        page: "/",
      },
      {
        id: "2",
        timestamp: new Date(Date.now() - 300000).toISOString(),
        source: "Facebook",
        userAgent: "Safari/14.0",
        country: "🇦🇪",
        ip: "192.168.1.2",
        page: "/about",
      },
      {
        id: "3",
        timestamp: new Date(Date.now() - 600000).toISOString(),
        source: "Direct",
        userAgent: "Firefox/89.0",
        country: "🇪🇬",
        ip: "192.168.1.3",
        page: "/contact",
      },
    ],
  });
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
    null
  );
  const [doubleCheckMessages, setDoubleCheckMessages] = useState<Set<number>>(
    new Set()
  );
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [blockViewModalOpen, setBlockViewModalOpen] = useState(false);
  const [adminPopupOpen, setAdminPopupOpen] = useState(false);
  const [selectedBlockForModal, setSelectedBlockForModal] =
    useState<BlockData | null>(null);
  const [navbarSettings, setNavbarSettings] = useState<NavbarSettings>({
    backgroundColor: "#1d1d1f",
    textColor: "#f5f5f7",
    logoColor: "#f5f5f7",
    logoUrl: wjlIcon,
    transparency: 95,
    isVisible: true,
    isSticky: true,
    showLogo: true,
    showSearch: false,
    showSaveButton: true,
    height: 48,
    borderRadius: 0,
    shadow: true,
    languageOptions: [
      { code: "en", label: "English", iconUrl: "" },
      { code: "ar", label: "العربية", iconUrl: "" },
    ],
  });

  const [footerSettings, setFooterSettings] = useState<FooterSettings>({
    isVisible: true,
    backgroundColor: "#1d1d1f",
    textColor: "#f5f5f7",
    companyName: "Company",
    copyright: "© 2024 Company Name. All rights reserved.",
    showSocialLinks: true,
    socialLinks: {
      facebook: "",
      linkedin: "",
      github: "",
    },
    customText: "",
  });

  const [pageBackgroundSettings, setPageBackgroundSettings] =
    useState<PageBackgroundSettings>({
      type: "solid",
      solidColor: "#ffffff",
      gradientColors: ["#667eea", "#764ba2"],
      gradientDirection: "135deg",
      backgroundImage: "",
    });

  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([
    {
      id: "nav_1",
      label: "Home",
      view: "home",
      isVisible: true,
      order: 1,
      icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
      iconUrl: "",
    },
    {
      id: "nav_2",
      label: "About",
      view: "about",
      isVisible: true,
      order: 2,
      icon: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 16v-4 M12 8h.01",
      iconUrl: "",
    },
    {
      id: "nav_3",
      label: "Contact",
      view: "contact",
      isVisible: true,
      order: 3,
      icon: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
      iconUrl: "",
    },
  ]);

  const [navbarControlsOpen, setNavbarControlsOpen] = useState(false);
  const [footerControlsOpen, setFooterControlsOpen] = useState(false);
  const [pageBackgroundControlsOpen, setPageBackgroundControlsOpen] =
    useState(false);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([
    {
      id: 27,
      country: "🇸🇦",
      type: "Other",
      name: "فهد سعود",
      email: "fahad@wjl.sa",
      mobile: "+966599919866",
      subject: "...",
      message: ".........",
      date: "23 August 2025",
      status: "pending",
    },
    {
      id: 26,
      country: "🇸🇦",
      type: "Other",
      name: "فهد سعود",
      email: "fahad2@wjl.sa",
      mobile: "+966599919866",
      subject: "higigi",
      message: "yyyyuyuyuyuyyuyjyjgjhhj",
      date: "21 August 2025",
      status: "pending",
    },
    {
      id: 25,
      country: "🇸🇦",
      type: "Other",
      name: "فهد سعود",
      email: "fahad3@wjl.sa",
      mobile: "+966599919866",
      subject: "hkgfh",
      message: "vhghfjgfhgvcjgfhhfhhhf",
      date: "21 August 2025",
      status: "pending",
    },
    {
      id: 24,
      country: "🇸🇦",
      type: "Support",
      name: "أحمد محمد",
      email: "ahmed@example.com",
      mobile: "+966501234567",
      subject: "Technical Issue",
      message: "I am experiencing problems with the system",
      date: "20 August 2025",
      status: "pending",
    },
    {
      id: 23,
      country: "🇸🇦",
      type: "Complaint",
      name: "سارة أحمد",
      email: "sara@example.com",
      mobile: "+966509876543",
      subject: "Service Complaint",
      message: "The service was not as expected",
      date: "19 August 2025",
      status: "approved",
    },
  ]);
  const [draggedElement, setDraggedElement] = useState<string | null>(null);
  const [dragOverElement, setDragOverElement] = useState<string | null>(null);
  const [resizeState, setResizeState] = useState<ResizeState>({
    isResizing: false,
    currentBlockId: null,
    direction: "",
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
    startLeft: 0,
    startTop: 0,
    preserveAspectRatio: false,
    initialAspectRatio: 1,
  });

  // Initialize masonry grid hook (10px row height, 16px gap)
  // Hook automatically recalculates layout when cards resize
  const masonryGridRef = useMasonryGrid(10, 16);

  // Visitor tracking functionality
  const trackVisitor = () => {
    const getRandomSource = () => {
      const sources = [
        "Google",
        "Facebook",
        "Direct",
        "Twitter",
        "LinkedIn",
        "Instagram",
        "YouTube",
      ];
      return sources[Math.floor(Math.random() * sources.length)];
    };

    const getRandomCountry = () => {
      const countries = ["🇸🇦", "🇦🇪", "🇪🇬", "🇯🇴", "🇰🇼", "🇶🇦", "🇧🇭", "🇴🇲"];
      return countries[Math.floor(Math.random() * countries.length)];
    };

    const newVisitor: VisitorData = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      source: getRandomSource(),
      userAgent: navigator.userAgent.split("/")[0] || "Unknown",
      country: getRandomCountry(),
      ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(
        Math.random() * 255
      )}`,
      page: currentView === "home" ? "/" : `/${currentView}`,
    };

    setVisitorStats((prev) => ({
      ...prev,
      totalVisitors: prev.totalVisitors + 1,
      todayVisitors: prev.todayVisitors + 1,
      uniqueVisitors: prev.uniqueVisitors + (Math.random() > 0.3 ? 1 : 0),
      visitorsData: [newVisitor, ...prev.visitorsData.slice(0, 19)],
      topSources: prev.topSources.map((source) =>
        source.source === newVisitor.source
          ? { ...source, count: source.count + 1 }
          : source
      ),
      topCountries: prev.topCountries.map((country) =>
        country.country === newVisitor.country
          ? { ...country, count: country.count + 1 }
          : country
      ),
    }));
  };

  // Auto-track visitors every 10-30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.3) {
        // 70% chance to track a visitor
        trackVisitor();
      }
    }, Math.random() * 20000 + 10000); // Random interval between 10-30 seconds

    return () => clearInterval(interval);
  }, [currentView]);

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, blockId: string) => {
    const block = blocks.find((b) => b.id === blockId);

    // Prevent dragging if block is locked
    if (block?.isResizeLocked) {
      e.preventDefault();
      return;
    }

    setDraggedElement(blockId);
    e.currentTarget.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("dragging");
    setDraggedElement(null);
    if (dragOverElement) {
      setDragOverElement(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetBlockId: string) => {
    e.preventDefault();

    if (draggedElement && draggedElement !== targetBlockId) {
      const draggedIndex = blocks.findIndex(
        (block) => block.id === draggedElement
      );
      const targetIndex = blocks.findIndex(
        (block) => block.id === targetBlockId
      );

      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newBlocks = [...blocks];
        const draggedBlock = newBlocks[draggedIndex];
        const targetBlock = newBlocks[targetIndex];

        // Prevent dropping onto locked blocks
        if (targetBlock.isResizeLocked) {
          return;
        }

        // Swap all content properties except id and lock state
        const draggedContent = {
          title: draggedBlock.title,
          tag: draggedBlock.tag,
          backgroundImage: draggedBlock.backgroundImage,
          backgroundColor: draggedBlock.backgroundColor,
          isGradient: draggedBlock.isGradient,
          gradientColors: draggedBlock.gradientColors,
          gradientDirection: draggedBlock.gradientDirection,
          content: draggedBlock.content,
          contentType: draggedBlock.contentType,
          contentImage: draggedBlock.contentImage,
          contentItems: draggedBlock.contentItems,
          styleSettings: draggedBlock.styleSettings,
          isManuallyResized: draggedBlock.isManuallyResized,
          width: draggedBlock.width,
          height: draggedBlock.height,
          isFullWidth: draggedBlock.isFullWidth,
          showReadMoreButton: draggedBlock.showReadMoreButton,
          readMoreButtonText: draggedBlock.readMoreButtonText,
          readMoreButtonPosition: draggedBlock.readMoreButtonPosition,
        };

        const targetContent = {
          title: targetBlock.title,
          tag: targetBlock.tag,
          backgroundImage: targetBlock.backgroundImage,
          backgroundColor: targetBlock.backgroundColor,
          isGradient: targetBlock.isGradient,
          gradientColors: targetBlock.gradientColors,
          gradientDirection: targetBlock.gradientDirection,
          content: targetBlock.content,
          contentType: targetBlock.contentType,
          contentImage: targetBlock.contentImage,
          contentItems: targetBlock.contentItems,
          styleSettings: targetBlock.styleSettings,
          isManuallyResized: targetBlock.isManuallyResized,
          width: targetBlock.width,
          height: targetBlock.height,
          isFullWidth: targetBlock.isFullWidth,
          showReadMoreButton: targetBlock.showReadMoreButton,
          readMoreButtonText: targetBlock.readMoreButtonText,
          readMoreButtonPosition: targetBlock.readMoreButtonPosition,
        };

        // Swap content while preserving id and isResizeLocked
        newBlocks[draggedIndex] = {
          ...draggedBlock,
          ...targetContent,
        };

        newBlocks[targetIndex] = {
          ...targetBlock,
          ...draggedContent,
        };

        setBlocks(newBlocks);
      }
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    const blockId = blocks.find(
      (block) =>
        target.classList.contains("card") &&
        target.querySelector(".tag")?.textContent === block.tag
    )?.id;

    if (blockId && blockId !== draggedElement) {
      setDragOverElement(blockId);
      target.classList.add("drag-over");
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.classList.remove("drag-over");
    setDragOverElement(null);
  };

  const handleDoubleClick = (blockId: string) => {
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === blockId
          ? {
              ...block,
              isManuallyResized: false,
              isResizeLocked: false,
              isFullWidth: false,
              width: undefined,
              height: undefined,
            }
          : block
      )
    );
  };

  const handleResizeStart = (
    e: React.MouseEvent,
    blockId: string,
    direction: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const targetBlock = blocks.find((block) => block.id === blockId);
    if (targetBlock?.isResizeLocked) {
      return;
    }

    const element = e.currentTarget.parentElement;
    if (!element) return;

    const rect = element.getBoundingClientRect();

    // Determine if aspect ratio should be preserved
    // For corner handles (se, sw, ne, nw), preserve aspect ratio by default or with Shift key
    const isCornerHandle = ["se", "sw", "ne", "nw"].includes(direction);
    const preserveAspectRatio = isCornerHandle && e.shiftKey;
    const aspectRatio = rect.height / rect.width;

    setResizeState({
      isResizing: true,
      currentBlockId: blockId,
      direction,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: rect.width,
      startHeight: rect.height,
      startLeft: rect.left,
      startTop: rect.top,
      preserveAspectRatio,
      initialAspectRatio: aspectRatio,
    });

    // Mark block as manually resized
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === blockId ? { ...block, isManuallyResized: true } : block
      )
    );
  };

  const normalizeStyleValue = (
    key: keyof StyleSettings,
    value: string | number | BorderSide[] | CornerSide[],
    current?: StyleSettings[keyof StyleSettings]
  ): StyleSettings[keyof StyleSettings] => {
    if (key === "opacity" || key === "borderWidth") {
      const numeric = typeof value === "number" ? value : Number(value);
      if (Number.isNaN(numeric)) {
        return (
          typeof current === "number" ? current : 0
        ) as StyleSettings[keyof StyleSettings];
      }
      return numeric as StyleSettings[keyof StyleSettings];
    }

    if (key === "borderSides") {
      if (Array.isArray(value)) {
        return value as StyleSettings[keyof StyleSettings];
      }
      if (Array.isArray(current)) {
        return current;
      }
      return [value as BorderSide] as StyleSettings[keyof StyleSettings];
    }

    if (key === "cornerSides") {
      if (Array.isArray(value)) {
        return value as StyleSettings[keyof StyleSettings];
      }
      if (Array.isArray(current)) {
        return current;
      }
      return [value as CornerSide] as StyleSettings[keyof StyleSettings];
    }

    return String(value) as StyleSettings[keyof StyleSettings];
  };

  const handleStyleChange = (
    key: keyof StyleSettings,
    value: string | number | BorderSide[] | CornerSide[]
  ) => {
    setStyleSettings((prev) => ({
      ...prev,
      [key]: normalizeStyleValue(key, value, prev[key]),
    }));
  };

  const handleSelectedBlockStyleChange = (
    key: keyof StyleSettings,
    value: string | number | BorderSide[] | CornerSide[]
  ) => {
    if (!selectedBlockId) return;

    setBlocks((prev) =>
      prev.map((block) => {
        if (block.id !== selectedBlockId) return block;

        const baseStyle: StyleSettings = {
          ...styleSettings,
          ...(block.styleSettings || {}),
        };

        const normalizedValue = normalizeStyleValue(key, value, baseStyle[key]);

        const nextStyle: StyleSettings = {
          ...baseStyle,
          [key]: normalizedValue,
        };

        const updatedBlock: BlockData = {
          ...block,
          styleSettings: nextStyle,
        };

        if (key === "background" && typeof normalizedValue === "string") {
          if (normalizedValue === "bg-gradient") {
            updatedBlock.isGradient = true;
            if (!updatedBlock.gradientColors) {
              updatedBlock.gradientColors = ["#667eea", "#764ba2"];
            }
            if (!updatedBlock.gradientDirection) {
              updatedBlock.gradientDirection = "135deg";
            }
          } else {
            updatedBlock.isGradient = false;
          }
        }

        return updatedBlock;
      })
    );
  };

  const handleNavbarSettingsChange = (
    key: keyof NavbarSettings,
    value: any
  ) => {
    setNavbarSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleFooterSettingsChange = (
    key: keyof FooterSettings,
    value: any
  ) => {
    setFooterSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handlePageBackgroundSettingsChange = (
    key: keyof PageBackgroundSettings,
    value: any
  ) => {
    setPageBackgroundSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleResetAllCards = () => {
    setBlocks((prev) =>
      prev.map((block) => ({
        ...block,
        isManuallyResized: false,
        isResizeLocked: false,
        isFullWidth: false,
        width: undefined,
        height: undefined,
      }))
    );
  };

  const handleImageUpload = (blockId: string, imageUrl: string) => {
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === blockId ? { ...block, backgroundImage: imageUrl } : block
      )
    );
  };

  const handleImageDelete = (blockId: string) => {
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === blockId ? { ...block, backgroundImage: undefined } : block
      )
    );
  };

  const handleDeleteBlock = (blockId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this block? This action cannot be undone."
      )
    ) {
      setBlocks((prev) => prev.filter((block) => block.id !== blockId));
      if (selectedBlockId === blockId) {
        setSelectedBlockId(null);
      }
    }
  };

  const handleDeleteAllBlocks = () => {
    if (
      confirm(
        "Are you sure you want to delete all blocks? This action cannot be undone."
      )
    ) {
      setBlocks([]);
      setSelectedBlockId(null);
    }
  };

  const handleAddNewBlock = () => {
    const newId = (
      Math.max(...blocks.map((b) => parseInt(b.id)), 0) + 1
    ).toString();
    const newBlock: BlockData = {
      id: newId,
      title: t("blocks.newBlock"),
      tag: t("blocks.newBlock"),
      backgroundColor: "#333",
      isGradient: false,
      gradientColors: ["#333333", "#666666"],
      gradientDirection: "135deg",
      isManuallyResized: false,
      isResizeLocked: false,
    };
    setBlocks((prev) => [...prev, newBlock]);
    setSelectedBlockId(newId);
  };

  const handleToggleResizeLock = (blockId: string) => {
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === blockId
          ? { ...block, isResizeLocked: !block.isResizeLocked }
          : block
      )
    );
    setResizeState((prev) =>
      prev.currentBlockId === blockId
        ? { ...prev, isResizing: false, currentBlockId: null }
        : prev
    );
  };

  const handleBlockSelection = (blockId: string) => {
    setSelectedBlockId(selectedBlockId === blockId ? null : blockId);
  };

  const handleBlockClick = (blockId: string) => {
    setSelectedBlockId(blockId);
    setAdminPopupOpen(true);
  };

  // Contact messages handlers
  const handleUpdateMessage = (id: number, status: string) => {
    setContactMessages((prev) =>
      prev.map((msg) =>
        msg.id === id ? { ...msg, status: status as any } : msg
      )
    );
  };

  const handleDeleteMessage = (id: number) => {
    setContactMessages((prev) => prev.filter((msg) => msg.id !== id));
  };

  const handleMarkAsRead = (id: number) => {
    // Toggle double check state
    setDoubleCheckMessages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id); // Remove from double check (back to single ✓)
      } else {
        newSet.add(id); // Add to double check (show ✓✓)
      }
      return newSet;
    });

    // Mark as approved
    setContactMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, status: "approved" } : msg))
    );

    // Log the action
    console.log(`Message ${id} marked as read - icon toggled!`);
  };

  const handleReplyMessage = (id: number) => {
    const message = contactMessages.find((msg) => msg.id === id);
    if (message) {
      setSelectedMessage(message);
      setReplyModalOpen(true);
    }
  };

  const handleSendReply = (replyTitle: string, replyBody: string) => {
    if (selectedMessage) {
      console.log("Sending reply to message:", selectedMessage.id);
      console.log("Reply title:", replyTitle);
      console.log("Reply body:", replyBody);

      // Update message status to replied
      setContactMessages((prev) =>
        prev.map((msg) =>
          msg.id === selectedMessage.id ? { ...msg, status: "replied" } : msg
        )
      );

      alert(`Reply sent successfully to ${selectedMessage.name}!`);
    }
  };

  const handleCloseModal = () => {
    setReplyModalOpen(false);
    setSelectedMessage(null);
  };

  // Block modal handlers
  const handleReadMore = (blockId: string) => {
    const block = blocks.find((b) => b.id === blockId);
    if (block) {
      setSelectedBlockForModal(block);
      setBlockViewModalOpen(true);
    }
  };

  const handleEditContent = () => {
    setBlockViewModalOpen(false);
    setBlockModalOpen(true);
  };

  const handleBlockContentSave = (
    blockId: string,
    content: string,
    contentImage: string,
    contentType: "text" | "image" | "both",
    contentItems?: ContentItem[]
  ) => {
    console.log("Saving block content:", {
      blockId,
      content,
      contentImage,
      contentType,
      contentItems,
    });
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === blockId
          ? { ...block, content, contentImage, contentType, contentItems }
          : block
      )
    );
  };

  const handleCloseBlockModal = () => {
    setBlockModalOpen(false);
    setSelectedBlockForModal(null);
  };

  const handleCloseViewModal = () => {
    setBlockViewModalOpen(false);
    setSelectedBlockForModal(null);
  };

  // Share block handler
  const handleShareBlock = (blockId: string) => {
    const shareUrl =
      window.location.origin + window.location.pathname + "?cardId=" + blockId;
    navigator.clipboard.writeText(shareUrl).then(
      () => {
        showSuccess(
          "Link Copied!",
          "The shareable link has been copied to your clipboard."
        );
      },
      () => {
        showError("Copy Failed", "Failed to copy the link. Please try again.");
      }
    );
  };

  // Detect shared card from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedCardId = params.get("cardId");

    if (sharedCardId) {
      const sharedBlock = blocks.find((b) => b.id === sharedCardId);
      if (sharedBlock) {
        setSelectedBlockForModal(sharedBlock);
        setBlockViewModalOpen(true);
        const cardTitle = sharedBlock.title || sharedBlock.tag;
        showInfo("Shared Card", "Opening shared card: " + cardTitle);

        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      } else {
        showWarning(
          "Card Not Found",
          "The shared card with ID " + sharedCardId + " was not found."
        );
      }
    }
  }, []);

  // Mouse event handlers for resize
  useEffect(() => {
    let rafId: number | null = null;
    let lastTime = 0;
    const throttleMs = 16; // ~60fps

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeState.isResizing || !resizeState.currentBlockId) return;

      const now = Date.now();
      if (now - lastTime < throttleMs) {
        return;
      }
      lastTime = now;

      // Cancel any pending animation frame
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }

      // Use requestAnimationFrame for smooth updates
      rafId = requestAnimationFrame(() => {
        const deltaX = e.clientX - resizeState.startX;
        const deltaY = e.clientY - resizeState.startY;

      let newWidth = resizeState.startWidth;
      let newHeight = resizeState.startHeight;

      // Calculate new dimensions based on resize direction
      const isCornerHandle = ["se", "sw", "ne", "nw"].includes(
        resizeState.direction
      );

      switch (resizeState.direction) {
        case "e":
          newWidth = resizeState.startWidth + deltaX;
          break;
        case "w":
          newWidth = resizeState.startWidth - deltaX;
          break;
        case "s":
          newHeight = resizeState.startHeight + deltaY;
          break;
        case "n":
          newHeight = resizeState.startHeight - deltaY;
          break;
        case "se":
          if (resizeState.preserveAspectRatio) {
            // Use the larger delta to determine new size
            const delta = Math.max(Math.abs(deltaX), Math.abs(deltaY));
            newWidth = resizeState.startWidth + delta * Math.sign(deltaX);
            newHeight = newWidth * resizeState.initialAspectRatio;
          } else {
            newWidth = resizeState.startWidth + deltaX;
            newHeight = resizeState.startHeight + deltaY;
          }
          break;
        case "sw":
          if (resizeState.preserveAspectRatio) {
            const delta = Math.max(Math.abs(deltaX), Math.abs(deltaY));
            newWidth = resizeState.startWidth - delta * Math.sign(deltaX);
            newHeight = newWidth * resizeState.initialAspectRatio;
          } else {
            newWidth = resizeState.startWidth - deltaX;
            newHeight = resizeState.startHeight + deltaY;
          }
          break;
        case "ne":
          if (resizeState.preserveAspectRatio) {
            const delta = Math.max(Math.abs(deltaX), Math.abs(deltaY));
            newWidth = resizeState.startWidth + delta * Math.sign(deltaX);
            newHeight = newWidth * resizeState.initialAspectRatio;
          } else {
            newWidth = resizeState.startWidth + deltaX;
            newHeight = resizeState.startHeight - deltaY;
          }
          break;
        case "nw":
          if (resizeState.preserveAspectRatio) {
            const delta = Math.max(Math.abs(deltaX), Math.abs(deltaY));
            newWidth = resizeState.startWidth - delta * Math.sign(deltaX);
            newHeight = newWidth * resizeState.initialAspectRatio;
          } else {
            newWidth = resizeState.startWidth - deltaX;
            newHeight = resizeState.startHeight - deltaY;
          }
          break;
      }

      // Get container width for full-width detection
      const container = document.querySelector(".grid");
      const containerWidth = container ? container.clientWidth : 1100;
      const fullWidthThreshold = containerWidth * 0.85; // 85% of container width

      // Determine if block should be full-width
      const shouldBeFullWidth = newWidth >= fullWidthThreshold;

      // Update block dimensions
      setBlocks((prev) =>
        prev.map((block) =>
          block.id === resizeState.currentBlockId
            ? {
                ...block,
                width: shouldBeFullWidth ? containerWidth : newWidth,
                height: newHeight,
                isFullWidth: shouldBeFullWidth,
              }
            : block
        )
      );
      });
    };

    const handleMouseUp = () => {
      if (resizeState.isResizing) {
        setResizeState((prev) => ({ ...prev, isResizing: false }));
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };

    if (resizeState.isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = `${resizeState.direction}-resize`;
      document.body.style.userSelect = "none";

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
        }
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };
    }
  }, [resizeState]);

  // Create dynamic navbar styles
  const navbarStyle: React.CSSProperties = {
    backgroundColor: `${navbarSettings.backgroundColor}${Math.round(
      (navbarSettings.transparency / 100) * 255
    )
      .toString(16)
      .padStart(2, "0")}`,
    color: navbarSettings.textColor,
    height: `${navbarSettings.height}px`,
    borderRadius: `${navbarSettings.borderRadius}px`,
    position: navbarSettings.isSticky ? "sticky" : "relative",
    boxShadow: navbarSettings.shadow ? "0 2px 10px rgba(0, 0, 0, 0.1)" : "none",
    top: navbarSettings.isSticky ? "0" : "auto",
    zIndex: navbarSettings.isSticky ? 1000 : "auto",
  };

  const handleNavItemClick = (item: NavigationItem) => {
    if (item.view === "custom" && item.customUrl) {
      if (
        item.customUrl.startsWith("http://") ||
        item.customUrl.startsWith("https://")
      ) {
        window.open(item.customUrl, "_blank");
      } else {
        window.location.href = item.customUrl;
      }
    } else {
      setCurrentView(item.view as "home" | "about" | "contact");
    }
  };

  const fallbackLanguageOptions: LanguageOption[] = [
    { code: "en", label: "English", iconUrl: "" },
    { code: "ar", label: "العربية", iconUrl: "" },
  ];

  const effectiveLanguageOptions =
    navbarSettings.languageOptions && navbarSettings.languageOptions.length > 0
      ? navbarSettings.languageOptions
      : fallbackLanguageOptions;

  const currentLanguageIndex = effectiveLanguageOptions.findIndex(
    (option) => option.code === i18n.language
  );
  const resolvedLanguageIndex =
    currentLanguageIndex >= 0 ? currentLanguageIndex : 0;
  const currentLanguageOption =
    effectiveLanguageOptions[resolvedLanguageIndex] ||
    fallbackLanguageOptions[0];
  const nextLanguageOption =
    effectiveLanguageOptions[
      (resolvedLanguageIndex + 1) % effectiveLanguageOptions.length
    ] || fallbackLanguageOptions[1];

  const currentLanguageLabel =
    currentLanguageOption.label ||
    currentLanguageOption.code.toUpperCase() ||
    i18n.language.toUpperCase();

  const nextLanguageLabel =
    nextLanguageOption.label ||
    nextLanguageOption.code.toUpperCase() ||
    currentLanguageLabel;

  const handleLanguageToggle = () => {
    if (effectiveLanguageOptions.length <= 1) {
      return;
    }

    const nextCode = nextLanguageOption.code;
    if (nextCode && nextCode !== i18n.language) {
      i18n.changeLanguage(nextCode);
    }
  };

  // Create dynamic page background styles
  const getPageBackgroundStyle = (): React.CSSProperties => {
    switch (pageBackgroundSettings.type) {
      case "solid":
        return { backgroundColor: pageBackgroundSettings.solidColor };
      case "gradient":
        const direction = pageBackgroundSettings.gradientDirection;
        const colors = pageBackgroundSettings.gradientColors;
        return {
          background: `linear-gradient(${direction}, ${colors[0]}, ${colors[1]})`,
        };
      case "image":
        return pageBackgroundSettings.backgroundImage
          ? {
              backgroundImage: `url(${pageBackgroundSettings.backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }
          : { backgroundColor: pageBackgroundSettings.solidColor };
      default:
        return { backgroundColor: "#ffffff" };
    }
  };

  return (
    <div className="container" style={getPageBackgroundStyle()}>
      {navbarSettings.isVisible && (
        <header className="apple-header" style={navbarStyle}>
          <div className="header-content">
            {navbarSettings.showLogo && (
              <div style={{ color: navbarSettings.logoColor }}>
                <img
                  src={navbarSettings.logoUrl || wjlIcon}
                  width="35"
                  height="50"
                  style={{ objectFit: "contain" }}
                />
              </div>
            )}
            <nav className="main-nav">
              {navigationItems
                .filter((item) => item.isVisible)
                .sort((a, b) => a.order - b.order)
                .map((item) => (
                  <button
                    key={item.id}
                    className={`nav-link ${
                      item.view !== "custom" && currentView === item.view
                        ? "active"
                        : ""
                    }`}
                    onClick={() => handleNavItemClick(item)}
                    style={{
                      color: navbarSettings.textColor,
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    {item.iconUrl ? (
                      <img
                        src={item.iconUrl}
                        alt={`${item.label} icon`}
                        style={{
                          width: "16px",
                          height: "16px",
                          objectFit: "contain",
                        }}
                      />
                    ) : (
                      item.icon && (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d={item.icon} />
                        </svg>
                      )
                    )}
                    {item.view === "home"
                      ? t("navigation.home")
                      : item.view === "about"
                      ? t("navigation.about")
                      : item.view === "contact"
                      ? t("navigation.contact")
                      : item.label}
                  </button>
                ))}
            </nav>
            <div className="header-actions">
              {/* Navbar Controls Button - only visible in edit mode */}
              {!isLiveView && (
                <>
                  <button
                    className="navbar-controls-btn"
                    onClick={() => setNavbarControlsOpen(true)}
                    style={{
                      background: "#34C759",
                      color: "white",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "500",
                      marginRight: "12px",
                    }}
                  >
                    ⚙️ Navbar
                  </button>

                  <button
                    className="footer-controls-btn"
                    onClick={() => setFooterControlsOpen(true)}
                    style={{
                      background: "#FF9500",
                      color: "white",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "500",
                      marginRight: "12px",
                    }}
                  >
                    🦶 Footer
                  </button>

                  <button
                    className="page-background-controls-btn"
                    onClick={() => setPageBackgroundControlsOpen(true)}
                    style={{
                      background: "#5856D6",
                      color: "white",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "500",
                      marginRight: "12px",
                    }}
                  >
                    🎨 Background
                  </button>
                </>
              )}

              {navbarSettings.showSaveButton && (
                <>
                  {!isLiveView && (
                    <button
                      className="save-btn"
                      onClick={() => setIsLiveView(true)}
                      style={{
                        background: "#007AFF",
                        color: "white",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                        marginRight: "12px",
                      }}
                    >
                      💾 Save & View Live
                    </button>
                  )}
                  {isLiveView && (
                    <button
                      className="edit-btn"
                      onClick={() => setIsLiveView(false)}
                      style={{
                        background: "#FF3B30",
                        color: "white",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                        marginRight: "12px",
                      }}
                    >
                      ✏️ Edit Page
                    </button>
                  )}
                </>
              )}

              {/* Notification Icon */}
              <button
                className="notification-btn"
                aria-label="Notifications"
                onClick={toggleNotificationCenter}
                style={{
                  color: navbarSettings.textColor,
                  position: "relative",
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  padding: "8px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "8px",
                  transition: "all 0.2s ease",
                  transform: "scale(1)",
                  backdropFilter: "blur(8px)",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.02)";
                  e.currentTarget.style.background =
                    "rgba(255, 255, 255, 0.12)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0, 0, 0, 0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.background =
                    "rgba(255, 255, 255, 0.08)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 8px rgba(0, 0, 0, 0.08)";
                }}
              >
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "20px",
                    height: "20px",
                  }}
                >
                  🔔
                </div>
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-2px",
                      right: "-2px",
                      background: "#ff4757",
                      color: "white",
                      borderRadius: "50%",
                      minWidth: "18px",
                      height: "18px",
                      fontSize: "10px",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0",
                      boxShadow: "0 2px 8px rgba(255, 71, 87, 0.4)",
                      border: "2px solid white",
                      fontFamily:
                        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                      textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
                      transform: "scale(1)",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.1)";
                      e.currentTarget.style.boxShadow =
                        "0 6px 16px rgba(255, 107, 107, 0.6), 0 0 0 4px rgba(255, 255, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 12px rgba(255, 107, 107, 0.5), 0 0 0 3px rgba(255, 255, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)";
                    }}
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Language Switcher Icon */}
              <button
                className="language-switcher-btn"
                aria-label={
                  effectiveLanguageOptions.length > 1
                    ? `Switch to ${nextLanguageLabel}`
                    : currentLanguageLabel
                }
                title={
                  effectiveLanguageOptions.length > 1
                    ? `Switch to ${nextLanguageLabel}`
                    : currentLanguageLabel
                }
                onClick={handleLanguageToggle}
                style={{
                  color: navbarSettings.textColor,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  background: "none",
                  border: "none",
                  padding: "6px 8px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "500",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "none";
                }}
              >
                {currentLanguageOption.iconUrl ? (
                  <img
                    src={currentLanguageOption.iconUrl}
                    alt={`${currentLanguageLabel} icon`}
                    style={{
                      width: "16px",
                      height: "16px",
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                )}
                <span style={{ minWidth: "20px" }}>
                  {currentLanguageLabel}
                </span>
              </button>
            </div>
          </div>
        </header>
      )}

      {currentView === "home" ? (
        isLiveView ? (
          <CleanLandingPage
            blocks={blocks}
            styleSettings={styleSettings}
            autoRotate={autoRotate}
            heroVisible={heroVisible}
            heroImages={heroImages}
            onReadMore={handleReadMore}
            onCloseModal={handleCloseViewModal}
            selectedBlockForModal={selectedBlockForModal}
            blockViewModalOpen={blockViewModalOpen}
          />
        ) : (
          <>
            <HeroCarousel
              autoRotate={autoRotate}
              isVisible={heroVisible}
              onToggleVisibility={() => setHeroVisible(!heroVisible)}
              images={heroImages}
              onImagesChange={setHeroImages}
            />

            <section
              className="grid"
              id="grid"
              ref={masonryGridRef as React.RefObject<HTMLElement>}
            >
              {blocks.map((block) => (
                <DynamicBlock
                  key={block.id}
                  block={block}
                  defaultStyleSettings={styleSettings}
                  showHandles={showHandles}
                  enableDrag={enableDrag}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDoubleClick={handleDoubleClick}
                  onResizeStart={handleResizeStart}
                  onImageUpload={handleImageUpload}
                  onImageDelete={handleImageDelete}
                  onBlockSelect={handleBlockSelection}
                  onBlockClick={handleBlockClick}
                  onToggleResizeLock={handleToggleResizeLock}
                  isSelected={selectedBlockId === block.id}
                  onReadMore={handleReadMore}
                  onDeleteBlock={handleDeleteBlock}
                  onShareBlock={handleShareBlock}
                />
              ))}
            </section>

            <AdminControlsPopup
              isOpen={adminPopupOpen}
              onClose={() => setAdminPopupOpen(false)}
              styleSettings={styleSettings}
              onStyleChange={handleStyleChange}
              autoRotate={autoRotate}
              onAutoRotateChange={setAutoRotate}
              showHandles={showHandles}
              onShowHandlesChange={setShowHandles}
              enableDrag={enableDrag}
              onEnableDragChange={setEnableDrag}
              onResetAllCards={handleResetAllCards}
              onDeleteAllBlocks={handleDeleteAllBlocks}
              onAddNewBlock={handleAddNewBlock}
              selectedBlockId={selectedBlockId}
              selectedBlock={
                blocks.find((b) => b.id === selectedBlockId) || null
              }
              onSelectedBlockStyleChange={handleSelectedBlockStyleChange}
              setBlocks={setBlocks}
            />
          </>
        )
      ) : currentView === "about" ? (
        <VisitorStatistics stats={visitorStats} />
      ) : (
        <ContactMessagesAdmin
          messages={contactMessages}
          onUpdateMessage={handleUpdateMessage}
          onDeleteMessage={handleDeleteMessage}
          onMarkAsRead={handleMarkAsRead}
          onReplyMessage={handleReplyMessage}
          doubleCheckMessages={doubleCheckMessages}
        />
      )}

      {/* Brands Slider and Footer - visible on all views */}
      <BrandsSlider />
      <Footer footerSettings={footerSettings} />

      <ReplyModal
        message={selectedMessage}
        isOpen={replyModalOpen}
        onClose={handleCloseModal}
        onSendReply={handleSendReply}
      />

      <BlockContentViewModal
        block={selectedBlockForModal}
        isOpen={blockViewModalOpen}
        onClose={handleCloseViewModal}
        onEdit={handleEditContent}
        onShare={handleShareBlock}
      />

      <NavbarControlsPopup
        isOpen={navbarControlsOpen}
        onClose={() => setNavbarControlsOpen(false)}
        navbarSettings={navbarSettings}
        onNavbarSettingsChange={handleNavbarSettingsChange}
        navigationItems={navigationItems}
        onNavigationItemsChange={setNavigationItems}
      />

      <FooterControlsPopup
        isOpen={footerControlsOpen}
        onClose={() => setFooterControlsOpen(false)}
        footerSettings={footerSettings}
        onFooterSettingsChange={handleFooterSettingsChange}
      />

      <PageBackgroundControlsPopup
        isOpen={pageBackgroundControlsOpen}
        onClose={() => setPageBackgroundControlsOpen(false)}
        pageBackgroundSettings={pageBackgroundSettings}
        onPageBackgroundSettingsChange={handlePageBackgroundSettingsChange}
      />

      {/* Notification Center */}
      <NotificationCenter
        isOpen={notificationCenterOpen}
        onClose={closeNotificationCenter}
        notifications={notifications}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onClearAll={clearAllNotifications}
        showSuccess={showSuccess}
        showError={showError}
        showWarning={showWarning}
        showInfo={showInfo}
        isEditMode={!isLiveView}
      />

      {/* Toast Notifications */}
      {toasts.map((toast: ToastNotificationData) => (
        <ToastNotification
          key={toast.id}
          id={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          duration={toast.duration}
          position={toast.position}
          onClose={removeToast}
        />
      ))}
    </div>
  );
}

export default App;
