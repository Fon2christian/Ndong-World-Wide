import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { useLanguage } from "../context/LanguageContext";
import OptimizedImage from "../components/OptimizedImage";
import { useImagePreloader, extractFirstImages } from "../hooks/useImagePreloader";

type TabType = "cars" | "new-tires" | "used-tires" | "wheel-drums";

// Image Gallery Hook for managing image index per item
function useImageGallery() {
  const [currentIndices, setCurrentIndices] = useState<Record<string, number>>({});

  const getCurrentIndex = useCallback((id: string) => currentIndices[id] || 0, [currentIndices]);

  const nextImage = useCallback((id: string, totalImages: number) => {
    setCurrentIndices(prev => ({
      ...prev,
      [id]: ((prev[id] || 0) + 1) % totalImages
    }));
  }, []);

  const prevImage = useCallback((id: string, totalImages: number) => {
    setCurrentIndices(prev => ({
      ...prev,
      [id]: ((prev[id] || 0) - 1 + totalImages) % totalImages
    }));
  }, []);

  return { getCurrentIndex, nextImage, prevImage };
}

interface Car {
  _id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel: string;
  transmission: string;
  images: string[];
  createdAt: string;
}

interface Tire {
  _id: string;
  brand: string;
  size: string;
  price: number;
  condition: "new" | "used";
  images: string[];
  createdAt: string;
}

interface WheelDrum {
  _id: string;
  brand: string;
  size: string;
  price: number;
  condition: string;
  images: string[];
  createdAt: string;
}

// Lightbox state interface
interface LightboxState {
  isOpen: boolean;
  images: string[];
  currentIndex: number;
  title: string;
}

export default function Market() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>("cars");
  const [cars, setCars] = useState<Car[]>([]);
  const [newTires, setNewTires] = useState<Tire[]>([]);
  const [usedTires, setUsedTires] = useState<Tire[]>([]);
  const [wheelDrums, setWheelDrums] = useState<WheelDrum[]>([]);
  const [loading, setLoading] = useState(true);
  const { getCurrentIndex, nextImage, prevImage } = useImageGallery();

  // Contact modal state
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string>("");

  // Lightbox state
  const [lightbox, setLightbox] = useState<LightboxState>({
    isOpen: false,
    images: [],
    currentIndex: 0,
    title: "",
  });

  const openLightbox = (images: string[], index: number, title: string) => {
    setLightbox({ isOpen: true, images, currentIndex: index, title });
    document.body.style.overflow = "hidden"; // Prevent background scroll
  };

  const closeLightbox = useCallback(() => {
    setLightbox({ isOpen: false, images: [], currentIndex: 0, title: "" });
    document.body.style.overflow = ""; // Restore scroll
  }, []);

  const openContactModal = (itemId: string) => {
    setSelectedItem(itemId);
    setShowContactModal(true);
  };

  const closeContactModal = () => {
    setShowContactModal(false);
    setSelectedItem("");
  };

  const lightboxNext = useCallback(() => {
    setLightbox(prev => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % prev.images.length,
    }));
  }, []);

  const lightboxPrev = useCallback(() => {
    setLightbox(prev => ({
      ...prev,
      currentIndex: (prev.currentIndex - 1 + prev.images.length) % prev.images.length,
    }));
  }, []);

  // Handle keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightbox.isOpen) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") lightboxNext();
      if (e.key === "ArrowLeft") lightboxPrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightbox.isOpen, closeLightbox, lightboxNext, lightboxPrev]);

  // Handle keyboard navigation for contact modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showContactModal) return;
      if (e.key === "Escape") closeContactModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showContactModal]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch only items that should be displayed on Market (location=market or both)
      const [carsRes, newTiresRes, usedTiresRes, wheelDrumsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/cars?location=market`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/tires?condition=new&location=market`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/tires?condition=used&location=market`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/wheel-drums?location=market`),
      ]);
      setCars(carsRes.data);
      setNewTires(newTiresRes.data);
      setUsedTires(usedTiresRes.data);
      setWheelDrums(wheelDrumsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Preload first image from each item for faster tab switching
  // Only preload images from non-active tabs to avoid bandwidth competition
  const imagesToPreload = useMemo(() => {
    const images: string[] = [];
    if (activeTab !== "cars") images.push(...extractFirstImages(cars));
    if (activeTab !== "new-tires") images.push(...extractFirstImages(newTires));
    if (activeTab !== "used-tires") images.push(...extractFirstImages(usedTires));
    if (activeTab !== "wheel-drums") images.push(...extractFirstImages(wheelDrums));
    return images;
  }, [cars, newTires, usedTires, wheelDrums, activeTab]);

  useImagePreloader(imagesToPreload, !loading);

  const tabs = [
    { id: "cars" as TabType, label: t.market.tabs.cars, icon: "car", count: cars.length },
    { id: "new-tires" as TabType, label: t.market.tabs.newTires, icon: "tire-new", count: newTires.length },
    { id: "used-tires" as TabType, label: t.market.tabs.usedTires, icon: "tire-used", count: usedTires.length },
    { id: "wheel-drums" as TabType, label: t.market.tabs.wheelDrums, icon: "wheel", count: wheelDrums.length },
  ];

  const getTabIcon = (icon: string) => {
    switch (icon) {
      case "car":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 17H21V15L19 7H5L3 15V17H5M19 17H5M19 17C19 18.1046 18.1046 19 17 19C15.8954 19 15 18.1046 15 17M5 17C5 18.1046 5.89543 19 7 19C8.10457 19 9 18.1046 9 17"/>
          </svg>
        );
      case "tire-new":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
          </svg>
        );
      case "tire-used":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="4"/>
            <path d="M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M4.93 19.07l4.24-4.24M14.83 9.17l4.24-4.24"/>
          </svg>
        );
      case "wheel":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 5v2M12 17v2M5 12h2M17 12h2M7.05 7.05l1.41 1.41M15.54 15.54l1.41 1.41M7.05 16.95l1.41-1.41M15.54 8.46l1.41-1.41"/>
          </svg>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading__spinner"></div>
      </div>
    );
  }

  const renderEmptyState = (type: string) => (
    <div className="empty-state">
      <div className="empty-state__icon">
        {getTabIcon(type === "cars" ? "car" : type.includes("tire") ? "tire-new" : "wheel")}
      </div>
      <h3 className="empty-state__title">{t.market.noItems}</h3>
      <p className="empty-state__description">{t.market.checkBack}</p>
    </div>
  );

  const renderCarCard = (car: Car) => {
    const currentIndex = getCurrentIndex(car._id);
    return (
    <article key={car._id} className="car-card">
      <div className="car-card__gallery">
        {car.images.length > 0 ? (
          <>
            <OptimizedImage
              src={car.images[currentIndex]}
              alt={`${car.brand} ${car.model}`}
              className="car-card__image car-card__image--clickable"
              onClick={() => openLightbox(car.images, currentIndex, `${car.brand} ${car.model}`)}
              placeholderIcon="🚗"
              placeholderLabel={`${car.brand} ${car.model}`}
              placeholderClassName="car-card__gallery-placeholder"
            />
            {car.images.length > 1 && (
              <>
                <button
                  className="gallery-nav gallery-nav--prev"
                  onClick={(e) => { e.stopPropagation(); prevImage(car._id, car.images.length); }}
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  className="gallery-nav gallery-nav--next"
                  onClick={(e) => { e.stopPropagation(); nextImage(car._id, car.images.length); }}
                  aria-label="Next image"
                >
                  ›
                </button>
                <div className="gallery-dots">
                  {car.images.map((_, i) => (
                    <span key={i} className={`gallery-dot ${i === currentIndex ? 'gallery-dot--active' : ''}`} />
                  ))}
                </div>
                <span className="car-card__image-count">{currentIndex + 1}/{car.images.length}</span>
              </>
            )}
          </>
        ) : (
          <div className="car-card__gallery-placeholder">{getTabIcon("car")}</div>
        )}
      </div>
      <div className="car-card__body">
        <div className="car-card__header">
          <h2 className="car-card__title">{car.brand} {car.model}</h2>
          <span className="car-card__year">{car.year}</span>
        </div>
        <p className="car-card__price">¥{car.price.toLocaleString()}</p>
        <div className="car-card__specs">
          <div className="car-spec">
            <span className="car-spec__label">{t.market.mileage}</span>
            <span className="car-spec__value">{car.mileage.toLocaleString()} km</span>
          </div>
          <div className="car-spec">
            <span className="car-spec__label">{t.market.fuel}</span>
            <span className="car-spec__value">{car.fuel}</span>
          </div>
          <div className="car-spec">
            <span className="car-spec__label">{t.market.transmission}</span>
            <span className="car-spec__value">{car.transmission}</span>
          </div>
        </div>
        <div className="car-card__actions">
          <button
            className="btn btn--primary btn--small"
            onClick={() => openContactModal(car._id)}
          >
            {t.market.contactSeller}
          </button>
        </div>
      </div>
    </article>
  );
  };

  const renderTireCard = (tire: Tire) => {
    const currentIndex = getCurrentIndex(tire._id);
    return (
    <article key={tire._id} className="product-card product-card--tire">
      <div className="product-card__gallery">
        {tire.images.length > 0 ? (
          <>
            <OptimizedImage
              src={tire.images[currentIndex]}
              alt={`${tire.brand} ${tire.size}`}
              className="product-card__image product-card__image--clickable"
              onClick={() => openLightbox(tire.images, currentIndex, `${tire.brand} - ${tire.size}`)}
              placeholderIcon="🛞"
              placeholderLabel={`${tire.brand} ${tire.size}`}
              placeholderClassName="product-card__gallery-placeholder"
            />
            {tire.images.length > 1 && (
              <>
                <button
                  className="gallery-nav gallery-nav--prev"
                  onClick={(e) => { e.stopPropagation(); prevImage(tire._id, tire.images.length); }}
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  className="gallery-nav gallery-nav--next"
                  onClick={(e) => { e.stopPropagation(); nextImage(tire._id, tire.images.length); }}
                  aria-label="Next image"
                >
                  ›
                </button>
                <div className="gallery-dots">
                  {tire.images.map((_, i) => (
                    <span key={i} className={`gallery-dot ${i === currentIndex ? 'gallery-dot--active' : ''}`} />
                  ))}
                </div>
                <span className="product-card__image-count">{currentIndex + 1}/{tire.images.length}</span>
              </>
            )}
          </>
        ) : (
          <div className="product-card__gallery-placeholder">{getTabIcon("tire-new")}</div>
        )}
        <span className={`product-card__badge product-card__badge--${tire.condition}`}>
          {tire.condition === "new" ? t.market.conditionNew : t.market.conditionUsed}
        </span>
      </div>
      <div className="product-card__body">
        <h2 className="product-card__title">{tire.brand}</h2>
        <p className="product-card__subtitle">{tire.size}</p>
        <p className="product-card__price">¥{tire.price.toLocaleString()}</p>
        <div className="product-card__actions">
          <button
            className="btn btn--primary btn--small"
            onClick={() => openContactModal(tire._id)}
          >
            {t.market.contactSeller}
          </button>
        </div>
      </div>
    </article>
  );
  };

  const renderWheelDrumCard = (wheelDrum: WheelDrum) => {
    const currentIndex = getCurrentIndex(wheelDrum._id);
    return (
    <article key={wheelDrum._id} className="product-card product-card--wheel">
      <div className="product-card__gallery">
        {wheelDrum.images.length > 0 ? (
          <>
            <OptimizedImage
              src={wheelDrum.images[currentIndex]}
              alt={`${wheelDrum.brand} ${wheelDrum.size}`}
              className="product-card__image product-card__image--clickable"
              onClick={() => openLightbox(wheelDrum.images, currentIndex, `${wheelDrum.brand} - ${wheelDrum.size}`)}
              placeholderIcon="⚙️"
              placeholderLabel={`${wheelDrum.brand} ${wheelDrum.size}`}
              placeholderClassName="product-card__gallery-placeholder"
            />
            {wheelDrum.images.length > 1 && (
              <>
                <button
                  className="gallery-nav gallery-nav--prev"
                  onClick={(e) => { e.stopPropagation(); prevImage(wheelDrum._id, wheelDrum.images.length); }}
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  className="gallery-nav gallery-nav--next"
                  onClick={(e) => { e.stopPropagation(); nextImage(wheelDrum._id, wheelDrum.images.length); }}
                  aria-label="Next image"
                >
                  ›
                </button>
                <div className="gallery-dots">
                  {wheelDrum.images.map((_, i) => (
                    <span key={i} className={`gallery-dot ${i === currentIndex ? 'gallery-dot--active' : ''}`} />
                  ))}
                </div>
                <span className="product-card__image-count">{currentIndex + 1}/{wheelDrum.images.length}</span>
              </>
            )}
          </>
        ) : (
          <div className="product-card__gallery-placeholder">{getTabIcon("wheel")}</div>
        )}
      </div>
      <div className="product-card__body">
        <h2 className="product-card__title">{wheelDrum.brand}</h2>
        <p className="product-card__subtitle">{wheelDrum.size}</p>
        <p className="product-card__condition">{wheelDrum.condition}</p>
        <p className="product-card__price">¥{wheelDrum.price.toLocaleString()}</p>
        <div className="product-card__actions">
          <button
            className="btn btn--primary btn--small"
            onClick={() => openContactModal(wheelDrum._id)}
          >
            {t.market.contactSeller}
          </button>
        </div>
      </div>
    </article>
  );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "cars":
        return cars.length === 0 ? renderEmptyState("cars") : (
          <div className="car-grid">{cars.map(renderCarCard)}</div>
        );
      case "new-tires":
        return newTires.length === 0 ? renderEmptyState("new-tires") : (
          <div className="product-grid">{newTires.map(renderTireCard)}</div>
        );
      case "used-tires":
        return usedTires.length === 0 ? renderEmptyState("used-tires") : (
          <div className="product-grid">{usedTires.map(renderTireCard)}</div>
        );
      case "wheel-drums":
        return wheelDrums.length === 0 ? renderEmptyState("wheel-drums") : (
          <div className="product-grid">{wheelDrums.map(renderWheelDrumCard)}</div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="market">
      {/* Header */}
      <header className="market__header">
        <div className="market__title">
          <div className="market__logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </div>
          <h1>{t.market.title}</h1>
        </div>
      </header>

      {/* Tabs */}
      <nav className="market__tabs" role="tablist" aria-label="Product categories">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`${tab.id}-panel`}
            className={`market__tab ${activeTab === tab.id ? "market__tab--active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="market__tab-icon">{getTabIcon(tab.icon)}</span>
            <span className="market__tab-label">{tab.label}</span>
            <span className="market__tab-count">{tab.count}</span>
          </button>
        ))}
      </nav>

      {/* Content */}
      <div className="market__content" id={`${activeTab}-panel`} role="tabpanel">
        {renderContent()}
      </div>

      {/* Lightbox Modal */}
      {lightbox.isOpen && (
        <div className="lightbox" onClick={closeLightbox}>
          <div className="lightbox__overlay" />
          <div className="lightbox__content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox__close" onClick={closeLightbox} aria-label="Close">
              ×
            </button>
            <div className="lightbox__header">
              <h3 className="lightbox__title">{lightbox.title}</h3>
              <span className="lightbox__counter">
                {lightbox.currentIndex + 1} / {lightbox.images.length}
              </span>
            </div>
            <div className="lightbox__main">
              {lightbox.images.length > 1 && (
                <button className="lightbox__nav lightbox__nav--prev" onClick={lightboxPrev} aria-label="Previous">
                  ‹
                </button>
              )}
              <div className="lightbox__image-container">
                <img
                  src={lightbox.images[lightbox.currentIndex]}
                  alt={`${lightbox.title} - Image ${lightbox.currentIndex + 1}`}
                  className="lightbox__image"
                />
              </div>
              {lightbox.images.length > 1 && (
                <button className="lightbox__nav lightbox__nav--next" onClick={lightboxNext} aria-label="Next">
                  ›
                </button>
              )}
            </div>
            {lightbox.images.length > 1 && (
              <div className="lightbox__thumbnails">
                {lightbox.images.map((img, i) => (
                  <button
                    key={i}
                    className={`lightbox__thumbnail ${i === lightbox.currentIndex ? 'lightbox__thumbnail--active' : ''}`}
                    onClick={() => setLightbox(prev => ({ ...prev, currentIndex: i }))}
                  >
                    <img src={img} alt={`Thumbnail ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && (
        <div
          className="contact-modal"
          onClick={closeContactModal}
          role="presentation"
        >
          <div className="contact-modal__overlay" aria-hidden="true" />
          <div
            className="contact-modal__content"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-modal-title"
          >
            <button className="contact-modal__close" onClick={closeContactModal} aria-label="Close">
              ×
            </button>
            <div className="contact-modal__header">
              <h3 id="contact-modal-title" className="contact-modal__title">{t.market.contactModal.title}</h3>
              <p className="contact-modal__subtitle">{t.market.contactModal.subtitle}</p>
            </div>
            <div className="contact-modal__options">
              <a
                href="tel:+817077746436"
                className="contact-modal__option"
                onClick={closeContactModal}
              >
                <div className="contact-modal__option-icon">📞</div>
                <div className="contact-modal__option-content">
                  <h4 className="contact-modal__option-title">{t.market.contactModal.callEnglishFrench}</h4>
                  <p className="contact-modal__option-number">+81 70-7774-6436</p>
                </div>
              </a>
              <a
                href="tel:+819080864799"
                className="contact-modal__option"
                onClick={closeContactModal}
              >
                <div className="contact-modal__option-icon">📞</div>
                <div className="contact-modal__option-content">
                  <h4 className="contact-modal__option-title">{t.market.contactModal.callJapanese}</h4>
                  <p className="contact-modal__option-number">+81 90-8086-4799</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
