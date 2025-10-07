export type BorderSide = "top" | "right" | "bottom" | "left";
export type CornerSide =
  | "top-left"
  | "top-right"
  | "bottom-right"
  | "bottom-left";

export interface StyleSettings {
  stylePreset: string;
  opacity: number;
  animation: string;
  corners: string;
  elevation: string;
  border: string;
  background: string;
  cornerSides?: CornerSide[];
  borderSides?: BorderSide[];
  borderColor?: string;
  borderWidth?: number;
}

export interface ContentItem {
  id: string;
  type: "text" | "image";
  content?: string;
  contentImage?: string;
  order: number;
}

export interface BlockData {
  id: string;
  title: string;
  tag: string;
  backgroundImage?: string;
  backgroundColor?: string;
  isGradient?: boolean;
  gradientColors?: string[];
  gradientDirection?: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  isManuallyResized?: boolean;
  isResizeLocked?: boolean;
  isFullWidth?: boolean;
  styleSettings?: StyleSettings;
  content?: string;
  contentImage?: string;
  contentType?: "text" | "image" | "both";
  contentItems?: ContentItem[];
}

export interface CarouselImage {
  src: string;
  alt: string;
  link?: string;
}

export interface ContactMessage {
  id: number;
  country: string;
  type: string;
  name: string;
  email: string;
  mobile: string;
  subject: string;
  message: string;
  date: string;
  status: "pending" | "approved" | "replied" | "deleted";
}

export interface VisitorData {
  id: string;
  timestamp: string;
  source: string;
  userAgent: string;
  country: string;
  ip: string;
  page: string;
}

export interface VisitorStats {
  totalVisitors: number;
  todayVisitors: number;
  uniqueVisitors: number;
  topSources: { source: string; count: number }[];
  topCountries: { country: string; count: number }[];
  visitorsData: VisitorData[];
}

export interface NavbarSettings {
  backgroundColor: string;
  textColor: string;
  logoColor: string;
  transparency: number;
  isVisible: boolean;
  isSticky: boolean;
  showLogo: boolean;
  showSearch: boolean;
  showSaveButton: boolean;
  height: number;
  borderRadius: number;
  shadow: boolean;
}

export interface FooterSettings {
  isVisible: boolean;
  backgroundColor: string;
  textColor: string;
  companyName: string;
  copyright: string;
  showSocialLinks: boolean;
  socialLinks: {
    facebook: string;
    linkedin: string;
    github: string;
  };
  customText: string;
}

export interface PageBackgroundSettings {
  type: "solid" | "gradient" | "image";
  solidColor: string;
  gradientColors: string[];
  gradientDirection: string;
  backgroundImage: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  view: "home" | "about" | "contact" | "custom";
  customUrl?: string;
  isVisible: boolean;
  order: number;
  icon?: string; // SVG path data for the icon
}

export interface ResizeState {
  isResizing: boolean;
  currentBlockId: string | null;
  direction: string;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  startLeft: number;
  startTop: number;
}
