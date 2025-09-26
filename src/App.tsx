import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import "./App.css";
import SimpleRichEditor from "./components/SimpleRichEditor";
import CleanLandingPage from "./components/CleanLandingPage";
import NotificationCenter from "./components/NotificationCenter";
import ToastNotification from "./components/ToastNotification";
import { useNotifications } from "./hooks/useNotifications";
import type { ToastNotificationData } from "./types/notifications";

// Types
interface ContentItem {
  id: string;
  type: "text" | "image";
  content?: string;
  contentImage?: string;
  order: number;
}

interface BlockData {
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
  isFullWidth?: boolean;
  styleSettings?: StyleSettings;
  content?: string;
  contentImage?: string;
  contentType?: "text" | "image" | "both";
  contentItems?: ContentItem[];
}

interface CarouselImage {
  src: string;
  alt: string;
  link?: string;
}

interface ContactMessage {
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

interface VisitorData {
  id: string;
  timestamp: string;
  source: string;
  userAgent: string;
  country: string;
  ip: string;
  page: string;
}

interface VisitorStats {
  totalVisitors: number;
  todayVisitors: number;
  uniqueVisitors: number;
  topSources: { source: string; count: number }[];
  topCountries: { country: string; count: number }[];
  visitorsData: VisitorData[];
}

interface StyleSettings {
  stylePreset: string;
  animation: string;
  corners: string;
  elevation: string;
  border: string;
  background: string;
}

interface NavbarSettings {
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

interface FooterSettings {
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

interface PageBackgroundSettings {
  type: "solid" | "gradient" | "image";
  solidColor: string;
  gradientColors: string[];
  gradientDirection: string;
  backgroundImage: string;
}

interface NavigationItem {
  id: string;
  label: string;
  view: "home" | "about" | "contact" | "custom";
  customUrl?: string;
  isVisible: boolean;
  order: number;
}

interface ResizeState {
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

// Brands Slider Component
const BrandsSlider = () => {
  const { t } = useTranslation();
  // Real brand logos - single row
  const brands = [
    {
      name: t("brands.microsoft"),
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/2048px-Microsoft_logo.svg.png",
    },
    {
      name: t("brands.google"),
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/2560px-Google_2015_logo.svg.png",
    },
    {
      name: t("brands.apple"),
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/1667px-Apple_logo_black.svg.png",
    },
    {
      name: t("brands.amazon"),
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/2560px-Amazon_logo.svg.png",
    },
    {
      name: t("brands.netflix"),
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/2560px-Netflix_2015_logo.svg.png",
    },
    {
      name: t("brands.tesla"),
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Tesla_T_symbol.svg/1200px-Tesla_T_symbol.svg.png",
    },
    {
      name: t("brands.meta"),
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/2560px-Meta_Platforms_Inc._logo.svg.png",
    },
    {
      name: t("brands.adobe"),
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Adobe_Corporate_Logo.svg/2560px-Adobe_Corporate_Logo.svg.png",
    },
    {
      name: t("brands.ibm"),
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IBM_logo.svg/2560px-IBM_logo.svg.png",
    },
    {
      name: t("brands.intel"),
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Intel_logo_%282006-2020%29.svg/2560px-Intel_logo_%282006-2020%29.svg.png",
    },
    {
      name: t("brands.nike"),
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/2560px-Logo_NIKE.svg.png",
    },
    {
      name: t("brands.samsung"),
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/2560px-Samsung_Logo.svg.png",
    },
    {
      name: t("brands.oracle"),
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Oracle_logo.svg/2560px-Oracle_logo.svg.png",
    },
    {
      name: t("brands.uber"),
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Uber_logo_2018.svg/2560px-Uber_logo_2018.svg.png",
    },
  ];

  return (
    <section
      style={{
        padding: "40px 0",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "0 20px",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            overflow: "hidden",
            mask: "linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)",
            WebkitMask:
              "linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)",
          }}
        >
          <div
            style={{
              display: "flex",
              animation: "scroll 30s linear infinite",
              gap: "60px",
              alignItems: "center",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.animationPlayState = "paused";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.animationPlayState = "running";
            }}
          >
            {/* First set of brands */}
            {brands.map((brand, index) => (
              <div
                key={`first-${index}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: "160px",
                  height: "60px",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <img
                  src={brand.logo}
                  alt={brand.name}
                  style={{
                    maxWidth: "140px",
                    maxHeight: "50px",
                    objectFit: "contain",
                    filter: "grayscale(1) opacity(0.6)",
                    transition: "filter 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.filter = "grayscale(0) opacity(1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.filter = "grayscale(1) opacity(0.6)";
                  }}
                />
              </div>
            ))}

            {/* Duplicate set for seamless loop */}
            {brands.map((brand, index) => (
              <div
                key={`second-${index}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: "160px",
                  height: "60px",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <img
                  src={brand.logo}
                  alt={brand.name}
                  style={{
                    maxWidth: "140px",
                    maxHeight: "50px",
                    objectFit: "contain",
                    filter: "grayscale(1) opacity(0.6)",
                    transition: "filter 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.filter = "grayscale(0) opacity(1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.filter = "grayscale(1) opacity(0.6)";
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          
          @media (max-width: 768px) {
            .brands-slider {
              padding: 20px 0 !important;
            }
          }
        `}
      </style>
    </section>
  );
};

// Footer Component
const Footer = ({ footerSettings }: { footerSettings: FooterSettings }) => {
  const { t } = useTranslation();

  if (!footerSettings.isVisible) {
    return null;
  }

  return (
    <footer
      style={{
        backgroundColor: footerSettings.backgroundColor,
        color: footerSettings.textColor,
        padding: "40px 0 20px 0",
        borderTop: "1px solid #424245",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 20px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            <span
              style={{
                fontSize: "1.2rem",
                fontWeight: "600",
              }}
            >
              {footerSettings.companyName}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              gap: "30px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {[
              { key: "home", label: t("navigation.home") },
              { key: "about", label: t("navigation.about") },
              { key: "services", label: t("navigation.services") },
              { key: "contact", label: t("navigation.contact") },
            ].map((link) => (
              <a
                key={link.key}
                href="#"
                style={{
                  color: footerSettings.textColor,
                  opacity: 0.7,
                  textDecoration: "none",
                  fontSize: "0.95rem",
                  transition: "opacity 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "0.7";
                }}
              >
                {link.label}
              </a>
            ))}
          </div>

          {footerSettings.showSocialLinks && (
            <div
              style={{
                display: "flex",
                gap: "15px",
                alignItems: "center",
              }}
            >
              {/* Facebook Icon */}
              {footerSettings.socialLinks.facebook && (
                <a
                  href={footerSettings.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "36px",
                    height: "36px",
                    backgroundColor: "#2d2d30",
                    borderRadius: "8px",
                    color: footerSettings.textColor,
                    textDecoration: "none",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#007AFF";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#2d2d30";
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
              )}

              {/* LinkedIn Icon */}
              {footerSettings.socialLinks.linkedin && (
                <a
                  href={footerSettings.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "36px",
                    height: "36px",
                    backgroundColor: "#2d2d30",
                    borderRadius: "8px",
                    color: footerSettings.textColor,
                    textDecoration: "none",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#0077B5";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#2d2d30";
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              )}

              {/* GitHub Icon */}
              {footerSettings.socialLinks.github && (
                <a
                  href={footerSettings.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "36px",
                    height: "36px",
                    backgroundColor: "#2d2d30",
                    borderRadius: "8px",
                    color: footerSettings.textColor,
                    textDecoration: "none",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#333";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#2d2d30";
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
              )}
            </div>
          )}
        </div>

        <div
          style={{
            borderTop: "1px solid #424245",
            marginTop: "30px",
            paddingTop: "20px",
            textAlign: "center",
            color: footerSettings.textColor,
            opacity: 0.7,
            fontSize: "0.9rem",
          }}
        >
          {footerSettings.copyright ||
            `© 2024 ${footerSettings.companyName}. All rights reserved.`}
          {footerSettings.customText && (
            <div style={{ marginTop: "10px" }}>{footerSettings.customText}</div>
          )}
        </div>
      </div>
    </footer>
  );
};

// Hero Carousel Component
const HeroCarousel = ({
  autoRotate,
  isVisible,
  onToggleVisibility,
  images: propImages,
  onImagesChange,
}: {
  autoRotate: boolean;
  isVisible: boolean;
  onToggleVisibility: () => void;
  images?: CarouselImage[];
  onImagesChange?: (images: CarouselImage[]) => void;
}) => {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [pendingImage, setPendingImage] = useState<CarouselImage | null>(null);
  const [linkInputValue, setLinkInputValue] = useState("");
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(
    null
  );
  const [images, setImages] = useState<CarouselImage[]>(propImages || []);

  // Sync with propImages
  useEffect(() => {
    if (propImages) {
      setImages(propImages);
    }
  }, [propImages]);

  useEffect(() => {
    if (!autoRotate) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [autoRotate, images.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        const newImage: CarouselImage = {
          src: imageUrl,
          alt: file.name.split(".")[0] || "Uploaded image",
        };
        setPendingImage(newImage);
        setShowLinkInput(true);
        setLinkInputValue("");
      };
      reader.readAsDataURL(file);
    }
    event.target.value = "";
  };

  const handleLinkSubmit = () => {
    if (pendingImage) {
      const imageWithLink = {
        ...pendingImage,
        link: linkInputValue || undefined,
      };

      if (editingImageIndex !== null) {
        const newImages = images.map((img, index) =>
          index === editingImageIndex ? imageWithLink : img
        );
        setImages(newImages);
        onImagesChange?.(newImages);
        setEditingImageIndex(null);
      } else {
        const newImages = [...images, imageWithLink];
        setImages(newImages);
        onImagesChange?.(newImages);
      }

      setPendingImage(null);
      setShowLinkInput(false);
      setLinkInputValue("");
    }
  };

  const handleLinkCancel = () => {
    if (editingImageIndex === null && pendingImage) {
      const newImages = [...images, pendingImage];
      setImages(newImages);
      onImagesChange?.(newImages);
    }
    setPendingImage(null);
    setShowLinkInput(false);
    setLinkInputValue("");
    setEditingImageIndex(null);
  };

  const handleEditLink = (index: number) => {
    const image = images[index];
    setPendingImage(image);
    setLinkInputValue(image.link || "");
    setEditingImageIndex(index);
    setShowLinkInput(true);
  };

  const deleteImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesChange?.(newImages);
    if (currentSlide >= images.length - 1) {
      setCurrentSlide(Math.max(0, images.length - 2));
    }
  };

  if (!isVisible) {
    return (
      <section className="hero-hidden" aria-label={t("hero.heroGalleryHidden")}>
        <button
          className="show-hero-btn"
          onClick={onToggleVisibility}
          aria-label={t("hero.showHeroCarousel")}
          title={t("hero.showHeroCarousel")}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span>{t("hero.showHeroCarousel")}</span>
        </button>
      </section>
    );
  }

  return (
    <section className="hero rounded shadow" aria-label={t("hero.heroGallery")}>
      <button
        className="hide-hero-btn"
        onClick={onToggleVisibility}
        aria-label={t("hero.hideHeroCarousel")}
        title={t("hero.hideHeroCarousel")}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      </button>
      <div className="slides" role="region">
        {images.map((image, index) => (
          <div
            key={index}
            className={`slide ${index === currentSlide ? "active" : ""}`}
          >
            {image.link ? (
              <a
                href={image.link}
                target="_blank"
                rel="noopener noreferrer"
                className="image-link"
              >
                <img src={image.src} alt={image.alt} className="slide-image" />
              </a>
            ) : (
              <img src={image.src} alt={image.alt} className="slide-image" />
            )}
            <div className="slide-controls">
              <button
                className="edit-link-btn"
                aria-label={`Edit link for image ${index + 1}`}
                onClick={() => handleEditLink(index)}
                title={t("hero.editLink")}
              >
                🔗
              </button>
              <button
                className="delete-btn"
                aria-label={`Delete image ${index + 1}`}
                onClick={() => deleteImage(index)}
                title={t("hero.deleteThisImage")}
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        className="ctrl prev"
        aria-label={t("hero.previousSlide")}
        onClick={prevSlide}
      >
        ‹
      </button>
      <button
        className="ctrl next"
        aria-label={t("hero.nextSlide")}
        onClick={nextSlide}
      >
        ›
      </button>
      <div className="carousel-controls">
        <div className="dots" aria-label="Slide navigation">
          {images.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentSlide ? "active" : ""}`}
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
        <div className="upload-controls">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: "none" }}
            id="image-upload"
          />
          <label htmlFor="image-upload" className="upload-btn">
            + {t("hero.addImage")}
          </label>
        </div>
      </div>

      {showLinkInput && (
        <div className="link-input-overlay">
          <div className="link-input-dialog">
            <h3>
              {editingImageIndex !== null
                ? t("hero.editLink")
                : t("hero.addLink")}
            </h3>
            <p>{t("hero.enterUrl")}</p>
            <input
              type="url"
              value={linkInputValue}
              onChange={(e) => setLinkInputValue(e.target.value)}
              placeholder={t("hero.urlPlaceholder")}
              className="link-input"
              autoFocus
            />
            <div className="dialog-buttons">
              <button onClick={handleLinkSubmit} className="submit-btn">
                {editingImageIndex !== null
                  ? t("ui.update")
                  : t("hero.addImage")}
              </button>
              <button onClick={handleLinkCancel} className="cancel-btn">
                {editingImageIndex !== null
                  ? t("ui.cancel")
                  : t("hero.skipLink")}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

// Dynamic Block Component
const DynamicBlock = ({
  block,
  defaultStyleSettings,
  showHandles,
  enableDrag,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onDragEnter,
  onDragLeave,
  onDoubleClick,
  onResizeStart,
  onImageUpload,
  onImageDelete,
  onBlockClick,
  isSelected,
  onReadMore,
  onDeleteBlock,
}: {
  block: BlockData;
  defaultStyleSettings: StyleSettings;
  showHandles: boolean;
  enableDrag: boolean;
  onDragStart: (e: React.DragEvent, blockId: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, blockId: string) => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDoubleClick: (blockId: string) => void;
  onResizeStart: (
    e: React.MouseEvent,
    blockId: string,
    direction: string
  ) => void;
  onImageUpload: (blockId: string, imageUrl: string) => void;
  onImageDelete: (blockId: string) => void;
  onBlockSelect: (blockId: string) => void;
  onBlockClick: (blockId: string) => void;
  isSelected: boolean;
  onReadMore: (blockId: string) => void;
  onDeleteBlock: (blockId: string) => void;
}) => {
  const { t } = useTranslation();
  const blockRef = useRef<HTMLElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        onImageUpload(block.id, imageUrl);
      };
      reader.readAsDataURL(file);
    }
    event.target.value = "";
  };

  const handleImageDelete = () => {
    onImageDelete(block.id);
  };

  const getStyleClasses = () => {
    const classes = ["card", "resizable", "draggable"];
    const styleSettings = block.styleSettings || defaultStyleSettings;

    if (block.isManuallyResized) classes.push("manually-resized");
    if (block.isFullWidth) classes.push("full-width");
    if (isSelected) classes.push("selected");
    if (styleSettings.stylePreset) classes.push(styleSettings.stylePreset);
    if (styleSettings.animation) classes.push(styleSettings.animation);
    if (styleSettings.corners) classes.push(styleSettings.corners);
    if (styleSettings.elevation) classes.push(styleSettings.elevation);
    if (styleSettings.border) classes.push(styleSettings.border);
    if (styleSettings.background) classes.push(styleSettings.background);

    return classes.join(" ");
  };

  const getBlockStyle = () => {
    const baseStyle = getBackgroundStyle();

    if (block.isManuallyResized) {
      return {
        ...baseStyle,
        width: block.width ? `${block.width}px` : "auto",
        height: block.height ? `${block.height}px` : "auto",
        position: "relative" as const,
        zIndex: 10,
      };
    }

    return baseStyle;
  };

  const getBackgroundStyle = () => {
    const styleSettings = block.styleSettings || defaultStyleSettings;
    if (styleSettings.background === "bg-image" && block.backgroundImage) {
      return { backgroundImage: `url('${block.backgroundImage}')` };
    } else if (styleSettings.background === "bg-gradient") {
      const colors = block.gradientColors || ["#667eea", "#764ba2"];
      const direction = block.gradientDirection || "135deg";
      const gradientStyle = `linear-gradient(${direction}, ${colors.join(
        ", "
      )})`;
      console.log("Applying gradient:", gradientStyle, "for block:", block.id);
      return {
        background: gradientStyle,
      };
    } else if (styleSettings.background === "bg-solid") {
      return { backgroundColor: block.backgroundColor || "#111" };
    }
    return {};
  };

  return (
    <article
      ref={blockRef}
      className={getStyleClasses()}
      style={getBlockStyle()}
      draggable={enableDrag}
      onDragStart={(e) => onDragStart(e, block.id)}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, block.id)}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDoubleClick={() => onDoubleClick(block.id)}
      onClick={() => onBlockClick(block.id)}
    >
      <span className="tag">{block.tag}</span>
      <button
        className="cta"
        onClick={(e) => {
          e.stopPropagation();
          onReadMore(block.id);
        }}
      >
        Read More
      </button>

      {/* Block Image Controls */}
      <div className="block-image-controls">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: "none" }}
          id={`image-upload-${block.id}`}
        />
        <label
          htmlFor={`image-upload-${block.id}`}
          className="upload-btn-block"
        >
          📷
        </label>
        {block.backgroundImage && (
          <button
            className="delete-btn-block"
            onClick={handleImageDelete}
            title={t("style.deleteBackgroundImage")}
          >
            🗑️
          </button>
        )}
        <button
          className="delete-block-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteBlock(block.id);
          }}
          title={t("blocks.deleteBlock")}
        >
          ❌
        </button>
      </div>

      {/* Resize handles */}
      {showHandles && (
        <>
          <div
            className="resize-handle se"
            onMouseDown={(e) => onResizeStart(e, block.id, "se")}
          ></div>
          <div
            className="resize-handle sw"
            onMouseDown={(e) => onResizeStart(e, block.id, "sw")}
          ></div>
          <div
            className="resize-handle ne"
            onMouseDown={(e) => onResizeStart(e, block.id, "ne")}
          ></div>
          <div
            className="resize-handle nw"
            onMouseDown={(e) => onResizeStart(e, block.id, "nw")}
          ></div>
          <div
            className="resize-handle e"
            onMouseDown={(e) => onResizeStart(e, block.id, "e")}
          ></div>
          <div
            className="resize-handle w"
            onMouseDown={(e) => onResizeStart(e, block.id, "w")}
          ></div>
          <div
            className="resize-handle n"
            onMouseDown={(e) => onResizeStart(e, block.id, "n")}
          ></div>
          <div
            className="resize-handle s"
            onMouseDown={(e) => onResizeStart(e, block.id, "s")}
          ></div>
        </>
      )}
    </article>
  );
};

// Block Content Viewer Modal Component
const BlockContentViewModal = ({
  block,
  isOpen,
  onClose,
  onEdit,
}: {
  block: BlockData | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [tempContent, setTempContent] = useState("");
  const [tempJsonContent, setTempJsonContent] = useState<any>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  useEffect(() => {
    if (block && isOpen) {
      // Initialize editor with existing content or default
      const initialContent = block.title
        ? `<h1>${block.title}</h1><p>Add your content here...</p>`
        : "<p>Add your content here...</p>";
      setEditorContent(initialContent);
      setTempContent(initialContent);
      setIsEditing(false);
    }
  }, [block, isOpen]);

  if (!isOpen || !block) return null;

  const handleSave = () => {
    setEditorContent(tempContent);

    // Save JSON content to localStorage for image positioning data
    if (tempJsonContent) {
      console.log("Saving JSON to localStorage:", tempJsonContent);
      localStorage.setItem('editor-content-json', JSON.stringify(tempJsonContent));
    } else {
      console.log("No JSON content to save!");
    }

    // Enter Preview Mode after saving
    setIsPreviewMode(true);
    setIsEditing(false);

    // Here you would typically save to your backend/state management
    console.log("Saving content:", tempContent);
    console.log("Saving JSON content:", tempJsonContent);
  };

  const handleCancel = () => {
    setTempContent(editorContent);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setIsPreviewMode(false); // Exit preview mode when editing
  };

  const handlePreviewModeToggle = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  const handleContentChange = (htmlContent: string, jsonContent?: any) => {
    setTempContent(htmlContent);
    if (jsonContent) {
      setTempJsonContent(jsonContent);
    }
  };

  return (
    <div
      className="admin-popup-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="admin-popup-content"
        style={{ width: "90vw", maxWidth: "1200px", height: "90vh" }}
      >
        <div className="admin-popup-header">
          <h3>
            {isEditing && !isPreviewMode
              ? `${t("Editing")}: ${block.title}`
              : isPreviewMode
              ? `👁️ ${t("Preview Mode")}: ${block.title}`
              : `${t("Viewing")}: ${block.title}`}
          </h3>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {!isEditing && (
              <button
                onClick={handleEdit}
                style={{
                  background: "#007AFF",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                ✏️ {t("Edit")}
              </button>
            )}
            {isEditing && (
              <>
                <button
                  onClick={handleCancel}
                  style={{
                    background: "#6c757d",
                    color: "white",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  {t("Cancel")}
                </button>
                <button
                  onClick={handleSave}
                  style={{
                    background: "#28a745",
                    color: "white",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  💾 {t("Save")}
                </button>
              </>
            )}
            <button className="admin-popup-close" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        <div
          className="admin-popup-body"
          style={{
            height: "calc(100% - 80px)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Block Info Section */}
          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "20px",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "16px",
                fontSize: "14px",
              }}
            >
              <div>
                <strong>{t("Tag")}:</strong>{" "}
                <span
                  style={{
                    background: "#e3f2fd",
                    padding: "2px 8px",
                    borderRadius: "12px",
                  }}
                >
                  {block.tag}
                </span>
              </div>
              <div>
                <strong>{t("ID")}:</strong>{" "}
                <code
                  style={{
                    background: "#f1f3f4",
                    padding: "2px 6px",
                    borderRadius: "3px",
                  }}
                >
                  {block.id}
                </code>
              </div>
              {block.backgroundColor && (
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <strong>{t("Background")}:</strong>
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      backgroundColor: block.backgroundColor,
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                    }}
                  ></div>
                  <span>{block.backgroundColor}</span>
                </div>
              )}
              {block.width && block.height && (
                <div>
                  <strong>{t("Size")}:</strong> {block.width} × {block.height}px
                </div>
              )}
            </div>
          </div>

          {/* Content Editor/Viewer */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              borderRadius: "8px",
              overflow: "auto",
            }}
          >
            {isEditing ? (
              <SimpleRichEditor
                content={tempContent}
                onChange={handleContentChange}
                placeholder={`${t("Start writing content for")} "${
                  block.title
                }"...`}
                className="block-content-editor"
                autoSave={false}
                isPreviewMode={isPreviewMode}
                onPreviewModeToggle={handlePreviewModeToggle}
              />
            ) : (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    background: "#f8fafc",
                    padding: "12px 16px",
                    borderBottom: "1px solid #e5e7eb",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>👁️ {t("Preview Mode")}</span>
                  <span style={{ fontSize: "12px", color: "#6b7280" }}>
                    {t("Click Edit to modify content")}
                  </span>
                </div>
                <div
                  style={{
                    flex: 1,
                    padding: "24px",
                    overflow: "auto",
                    backgroundColor: "white",
                    fontSize: "16px",
                    lineHeight: "1.6",
                  }}
                  className="item-content-display"
                  dangerouslySetInnerHTML={{ __html: editorContent }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Block Content Modal Component

// Reply Modal Component
const ReplyModal = ({
  message,
  isOpen,
  onClose,
  onSendReply,
}: {
  message: ContactMessage | null;
  isOpen: boolean;
  onClose: () => void;
  onSendReply: (replyTitle: string, replyBody: string) => void;
}) => {
  const { t } = useTranslation();
  const [replyTitle, setReplyTitle] = useState("");
  const [replyBody, setReplyBody] = useState("");

  useEffect(() => {
    if (message && isOpen) {
      setReplyTitle(`Re: ${message.subject}`);
      setReplyBody("");
    }
  }, [message, isOpen]);

  const handleSend = () => {
    if (replyTitle.trim() && replyBody.trim()) {
      onSendReply(replyTitle, replyBody);
      setReplyTitle("");
      setReplyBody("");
      onClose();
    }
  };

  const handleCancel = () => {
    setReplyTitle("");
    setReplyBody("");
    onClose();
  };

  if (!isOpen || !message) return null;

  return (
    <div className="modal-overlay">
      <div className="reply-modal">
        <button className="modal-close" onClick={onClose}>
          ▲
        </button>

        <div className="modal-header">
          <h2>{t("contact.reply")}</h2>
        </div>

        <div className="message-details">
          <div className="detail-row">
            <span className="detail-label">{t("contact.type")}:</span>
            <span className="type-tag">{message.type}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">{t("contact.name")}:</span>
            <span className="detail-value">{message.name}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">{t("contact.email")}:</span>
            <span className="detail-value">{message.email}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">{t("contact.mobile")}:</span>
            <span className="detail-value">{message.mobile}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">{t("contact.body")}:</span>
            <span className="detail-value">{message.message}</span>
          </div>
        </div>

        <div className="reply-section">
          <h3>{t("contact.reply")}</h3>
          <div className="form-group">
            <label htmlFor="reply-title">{t("contact.title")}</label>
            <input
              id="reply-title"
              type="text"
              value={replyTitle}
              onChange={(e) => setReplyTitle(e.target.value)}
              placeholder={t("contact.replyPlaceholder")}
              className="reply-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="reply-body">{t("contact.body")}</label>
            <textarea
              id="reply-body"
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              placeholder={t("contact.replyBodyPlaceholder")}
              className="reply-textarea"
              rows={6}
            />
          </div>
        </div>

        <div className="modal-actions">
          <button className="send-btn" onClick={handleSend}>
            {t("ui.send")}
          </button>
          <button className="cancel-btn" onClick={handleCancel}>
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
};

// Contact Messages Admin Component
const ContactMessagesAdmin = ({
  messages,
  onDeleteMessage,
  onMarkAsRead,
  onReplyMessage,
  doubleCheckMessages,
}: {
  messages: ContactMessage[];
  onUpdateMessage: (id: number, status: string) => void;
  onDeleteMessage: (id: number) => void;
  onMarkAsRead: (id: number) => void;
  onReplyMessage: (id: number) => void;
  doubleCheckMessages: Set<number>;
}) => {
  const { t } = useTranslation();
  const [filterType] = useState("all");
  const [selectedMessages, setSelectedMessages] = useState<number[]>([]);

  const filteredMessages = messages.filter(
    (msg) =>
      filterType === "all" ||
      msg.type.toLowerCase() === filterType.toLowerCase()
  );

  const handleSelectAll = () => {
    if (selectedMessages.length === filteredMessages.length) {
      setSelectedMessages([]);
    } else {
      setSelectedMessages(filteredMessages.map((msg) => msg.id));
    }
  };

  const handleSelectMessage = (id: number) => {
    setSelectedMessages((prev) =>
      prev.includes(id) ? prev.filter((msgId) => msgId !== id) : [...prev, id]
    );
  };

  return (
    <div className="contact-admin">
      <div className="admin-header">
        <div className="breadcrumbs">
          <span>{t("contact.contactUs")}</span>
        </div>
      </div>

      <div className="admin-content">
        <div className="tabs">
          <button className="tab active">{t("contact.messages")}</button>
        </div>

        <div className="messages-table">
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={
                      selectedMessages.length === filteredMessages.length &&
                      filteredMessages.length > 0
                    }
                    onChange={handleSelectAll}
                  />
                </th>
                <th>ID</th>
                <th>{t("contact.country")}</th>
                <th>{t("contact.type")}</th>
                <th>{t("contact.name")}</th>
                <th>{t("contact.mobile")}</th>
                <th>{t("contact.subject")}</th>
                <th>{t("contact.message")}</th>
                <th>{t("contact.date")}</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredMessages.map((message) => (
                <tr key={message.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedMessages.includes(message.id)}
                      onChange={() => handleSelectMessage(message.id)}
                    />
                  </td>
                  <td>{message.id}</td>
                  <td>
                    <div className="country-flag">🇸🇦</div>
                  </td>
                  <td>{message.type}</td>
                  <td>{message.name}</td>
                  <td>{message.mobile}</td>
                  <td>{message.subject}</td>
                  <td>{message.message}</td>
                  <td>{message.date}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn delete"
                        onClick={() => onDeleteMessage(message.id)}
                        title={t("ui.delete")}
                      >
                        🗑
                      </button>
                      <button
                        className="action-btn mark-read"
                        onClick={() => onMarkAsRead(message.id)}
                        title={t("contact.markAsRead")}
                      >
                        {doubleCheckMessages.has(message.id) ? "✓✓" : "✓"}
                      </button>
                      <button
                        className="action-btn reply"
                        onClick={() => onReplyMessage(message.id)}
                        title={t("ui.reply")}
                      >
                        ↩
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Visitor Statistics Component
const VisitorStatistics = ({ stats }: { stats: VisitorStats }) => {
  return (
    <div className="visitor-stats">
      <div className="stats-header">
        <h2>إحصائيات الزوار</h2>
        <p>عرض أرقام الزوار ومصادرهم</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalVisitors.toLocaleString()}</h3>
            <p>إجمالي الزوار</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>{stats.todayVisitors.toLocaleString()}</h3>
            <p>زوار اليوم</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🌟</div>
          <div className="stat-content">
            <h3>{stats.uniqueVisitors.toLocaleString()}</h3>
            <p>زوار فريدون</p>
          </div>
        </div>
      </div>

      <div className="sources-section">
        <h3>أهم مصادر الزوار</h3>
        <div className="sources-list">
          {stats.topSources.map((source, index) => (
            <div key={index} className="source-item">
              <div className="source-info">
                <span className="source-name">{source.source}</span>
                <span className="source-count">{source.count} زائر</span>
              </div>
              <div
                className="source-bar"
                style={{
                  width: `${
                    (source.count /
                      Math.max(...stats.topSources.map((s) => s.count))) *
                    100
                  }%`,
                }}
              ></div>
            </div>
          ))}
        </div>
      </div>

      <div className="countries-section">
        <h3>أهم البلدان</h3>
        <div className="countries-list">
          {stats.topCountries.map((country, index) => (
            <div key={index} className="country-item">
              <span className="country-flag">{country.country}</span>
              <span className="country-count">{country.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="recent-visitors">
        <h3>الزوار الحاليون</h3>
        <div className="visitors-table">
          <table>
            <thead>
              <tr>
                <th>الوقت</th>
                <th>المصدر</th>
                <th>البلد</th>
                <th>الصفحة</th>
              </tr>
            </thead>
            <tbody>
              {stats.visitorsData.slice(0, 10).map((visitor) => (
                <tr key={visitor.id}>
                  <td>
                    {new Date(visitor.timestamp).toLocaleTimeString("ar-SA")}
                  </td>
                  <td>{visitor.source}</td>
                  <td>{visitor.country}</td>
                  <td>{visitor.page}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Admin Controls Popup Component
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
  setBlocks: React.Dispatch<React.SetStateAction<BlockData[]>>;
}) => {
  const { t } = useTranslation();
  const currentSettings = selectedBlock?.styleSettings || styleSettings;
  const isBlockSelected = !!selectedBlock;

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
            <div className="selected-block-info">
              <p>
                <strong>✅ Controlling Block:</strong> {selectedBlock.tag} (ID:{" "}
                {selectedBlock.id})
              </p>
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

          <div className="control-group">
            <h4>Block Selection</h4>
            {selectedBlockId ? (
              <p>
                <strong>Selected Block:</strong> {selectedBlockId}
                <br />
                <small>
                  Click on any block to select it, or click the same block again
                  to deselect.
                </small>
              </p>
            ) : (
              <p>
                <em>No block selected</em>
                <br />
                <small>
                  Click on any block to select and control it individually.
                </small>
              </p>
            )}
          </div>

          <p>
            <strong>Admin Note:</strong> Can add pictures background or flat or
            solid color or gradient other things as admin and these can be
            discussed.
          </p>
          <p>
            <strong>Resizing Tips:</strong>
            <br />
            • Drag resize handles to adjust width and height
            <br />
            • Widen a block to 85% of container width to make it full-width
            <br />
            • Full-width blocks push other blocks to new rows
            <br />• Double-click any card to reset its size to auto
          </p>
        </div>
      </div>
    </div>
  );
};

// Navbar Controls Component
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
  onNavbarSettingsChange: (key: keyof NavbarSettings, value: any) => void;
  navigationItems: NavigationItem[];
  onNavigationItemsChange: (items: NavigationItem[]) => void;
}) => {
  const { t, i18n } = useTranslation();
  if (!isOpen) return null;

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

  const handleUpdateNavigationItem = (
    id: string,
    field: keyof NavigationItem,
    value: any
  ) => {
    const updatedItems = navigationItems.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onNavigationItemsChange(updatedItems);
  };

  const handleDeleteNavigationItem = (id: string) => {
    const updatedItems = navigationItems.filter((item) => item.id !== id);
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

// Footer Controls Popup Component
const FooterControlsPopup = ({
  isOpen,
  onClose,
  footerSettings,
  onFooterSettingsChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  footerSettings: FooterSettings;
  onFooterSettingsChange: (key: keyof FooterSettings, value: any) => void;
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

// Page Background Controls Popup Component
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
    value: any
  ) => void;
}) => {
  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    },
    {
      id: "4",
      title: t("blocks.analytics"),
      tag: t("blocks.analytics"),
      backgroundImage:
        "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop",
      isManuallyResized: false,
    },
    {
      id: "5",
      title: t("blocks.analytics"),
      tag: t("blocks.analytics"),
      backgroundImage:
        "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1200&auto=format&fit=crop",
      isManuallyResized: false,
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
    },
    {
      id: "7",
      title: t("blocks.gradientTest"),
      tag: t("blocks.gradient"),
      isGradient: true,
      gradientColors: ["#ff6b6b", "#4ecdc4"],
      gradientDirection: "45deg",
      isManuallyResized: false,
      styleSettings: {
        stylePreset: "",
        animation: "",
        corners: "rounded",
        elevation: "shadow",
        border: "no-border",
        background: "bg-gradient",
      },
    },
  ]);

  const [styleSettings, setStyleSettings] = useState<StyleSettings>({
    stylePreset: "",
    animation: "",
    corners: "rounded",
    elevation: "shadow",
    border: "no-border",
    background: "bg-image",
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
    transparency: 95,
    isVisible: true,
    isSticky: true,
    showLogo: true,
    showSearch: false,
    showSaveButton: true,
    height: 48,
    borderRadius: 0,
    shadow: true,
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
    { id: "nav_1", label: "Home", view: "home", isVisible: true, order: 1 },
    { id: "nav_2", label: "About", view: "about", isVisible: true, order: 2 },
    {
      id: "nav_3",
      label: "Contact",
      view: "contact",
      isVisible: true,
      order: 3,
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
  });

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
        const [draggedBlock] = newBlocks.splice(draggedIndex, 1);
        newBlocks.splice(targetIndex, 0, draggedBlock);
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

    const element = e.currentTarget.parentElement;
    if (!element) return;

    const rect = element.getBoundingClientRect();

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
    });

    // Mark block as manually resized
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === blockId ? { ...block, isManuallyResized: true } : block
      )
    );
  };

  const handleStyleChange = (key: keyof StyleSettings, value: string) => {
    setStyleSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSelectedBlockStyleChange = (
    key: keyof StyleSettings,
    value: string
  ) => {
    if (!selectedBlockId) return;

    setBlocks((prev) =>
      prev.map((block) => {
        if (block.id === selectedBlockId) {
          const updatedBlock = {
            ...block,
            styleSettings: {
              ...block.styleSettings,
              [key]: value as string, // ensure value is string
            },
          } as BlockData;

          // Set isGradient property based on background type
          if (key === "background") {
            if (value === "bg-gradient") {
              updatedBlock.isGradient = true;
              // Initialize gradient colors if not set
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
        }
        return block;
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
    };
    setBlocks((prev) => [...prev, newBlock]);
    setSelectedBlockId(newId);
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

  // Mouse event handlers for resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeState.isResizing || !resizeState.currentBlockId) return;

      const deltaX = e.clientX - resizeState.startX;
      const deltaY = e.clientY - resizeState.startY;

      let newWidth = resizeState.startWidth;
      let newHeight = resizeState.startHeight;

      // Calculate new dimensions based on resize direction
      switch (resizeState.direction) {
        case "e":
          newWidth = Math.max(150, resizeState.startWidth + deltaX);
          break;
        case "w":
          newWidth = Math.max(150, resizeState.startWidth - deltaX);
          break;
        case "s":
          newHeight = Math.max(100, resizeState.startHeight + deltaY);
          break;
        case "n":
          newHeight = Math.max(100, resizeState.startHeight - deltaY);
          break;
        case "se":
          newWidth = Math.max(150, resizeState.startWidth + deltaX);
          newHeight = Math.max(100, resizeState.startHeight + deltaY);
          break;
        case "sw":
          newWidth = Math.max(150, resizeState.startWidth - deltaX);
          newHeight = Math.max(100, resizeState.startHeight + deltaY);
          break;
        case "ne":
          newWidth = Math.max(150, resizeState.startWidth + deltaX);
          newHeight = Math.max(100, resizeState.startHeight - deltaY);
          break;
        case "nw":
          newWidth = Math.max(150, resizeState.startWidth - deltaX);
          newHeight = Math.max(100, resizeState.startHeight - deltaY);
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
              <div className="logo" style={{ color: navbarSettings.logoColor }}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
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
                    style={{ color: navbarSettings.textColor }}
                  >
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
                aria-label={`Switch to ${
                  i18n.language === "en" ? "Arabic" : "English"
                }`}
                title={`Switch to ${
                  i18n.language === "en" ? "العربية" : "English"
                }`}
                onClick={() =>
                  i18n.changeLanguage(i18n.language === "en" ? "ar" : "en")
                }
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
                <span style={{ minWidth: "20px" }}>
                  {i18n.language.toUpperCase()}
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

            <section className="grid" id="grid">
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
                  isSelected={selectedBlockId === block.id}
                  onReadMore={handleReadMore}
                  onDeleteBlock={handleDeleteBlock}
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
