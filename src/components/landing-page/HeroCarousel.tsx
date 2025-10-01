import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ChangeEvent } from "react";
import type { CarouselImage } from "../../types/app";
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

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
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

export default HeroCarousel;



