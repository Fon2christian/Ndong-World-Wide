import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useLanguage } from "../context/LanguageContext";
import OptimizedImage from "../components/OptimizedImage";
import { useImagePreloader, extractFirstImages } from "../hooks/useImagePreloader";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

type TabType = "cars" | "new-tires" | "used-tires" | "wheel-drums";

interface Car {
  _id: string;
  brand?: string;
  model?: string;
  year?: number;
  price?: number;
  mileage?: number;
  fuel?: string;
  transmission?: string;
  images: string[];
}

interface Tire {
  _id: string;
  brand?: string;
  size?: string;
  condition?: string;
  price?: number;
  images: string[];
}

interface WheelDrum {
  _id: string;
  brand?: string;
  size?: string;
  condition?: string;
  price?: number;
  images: string[];
}

// Parse cached business data once to avoid redundant parsing
function getCachedBusinessData() {
  try {
    const cached = sessionStorage.getItem('business-data');
    return cached ? JSON.parse(cached) : null;
  } catch (e) {
    console.error('Failed to parse cached business data:', e);
    return null;
  }
}

export default function Business() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>("cars");

  // Parse cache once and reuse for all state initializers
  const cachedData = useMemo(() => getCachedBusinessData(), []);

  const [cars, setCars] = useState<Car[]>(Array.isArray(cachedData?.cars) ? cachedData.cars : []);
  const [newTires, setNewTires] = useState<Tire[]>(Array.isArray(cachedData?.newTires) ? cachedData.newTires : []);
  const [usedTires, setUsedTires] = useState<Tire[]>(Array.isArray(cachedData?.usedTires) ? cachedData.usedTires : []);
  const [wheelDrums, setWheelDrums] = useState<WheelDrum[]>(Array.isArray(cachedData?.wheelDrums) ? cachedData.wheelDrums : []);
  const [loading, setLoading] = useState(!cachedData);

  useEffect(() => {
    const fetchData = async () => {
      const cacheKey = 'business-data';

      // Fetch fresh data (cache already applied at initialization)
      try {
        const [carsRes, newTiresRes, usedTiresRes, wheelDrumsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/cars?location=business`),
          axios.get(`${API_BASE_URL}/api/tires?condition=new&location=business`),
          axios.get(`${API_BASE_URL}/api/tires?condition=used&location=business`),
          axios.get(`${API_BASE_URL}/api/wheel-drums?location=business`),
        ]);

        const freshData = {
          cars: carsRes.data,
          newTires: newTiresRes.data,
          usedTires: usedTiresRes.data,
          wheelDrums: wheelDrumsRes.data,
        };

        setCars(Array.isArray(freshData.cars) ? freshData.cars : []);
        setNewTires(Array.isArray(freshData.newTires) ? freshData.newTires : []);
        setUsedTires(Array.isArray(freshData.usedTires) ? freshData.usedTires : []);
        setWheelDrums(Array.isArray(freshData.wheelDrums) ? freshData.wheelDrums : []);

        // Cache the fresh data (skip if quota exceeded - images are too large)
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(freshData));
        } catch (storageError) {
          // Quota exceeded - clear cache and skip caching
          sessionStorage.removeItem(cacheKey);
          console.warn("Cache quota exceeded, skipping cache");
        }
      } catch (error) {
        console.error("Error fetching business data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Preload first image from ALL items for instant tab switching
  // Preload everything upfront to ensure images are cached before user clicks
  const imagesToPreload = useMemo(() => {
    return [
      ...extractFirstImages(cars),
      ...extractFirstImages(newTires),
      ...extractFirstImages(usedTires),
      ...extractFirstImages(wheelDrums),
    ];
  }, [cars, newTires, usedTires, wheelDrums]);

  useImagePreloader(imagesToPreload, !loading);

  const tabs = [
    { id: "cars" as TabType, label: t.business.cars, icon: "🚗" },
    { id: "new-tires" as TabType, label: t.business.newTires, icon: "🛞" },
    { id: "used-tires" as TabType, label: t.business.usedTires, icon: "🛞" },
    { id: "wheel-drums" as TabType, label: t.business.wheelDrums, icon: "⚙️" },
  ];

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <div className="business-page">
        <section className="business-hero">
          <div className="business-hero__content">
            <h1 className="business-hero__title">{t.business.heroTitle}</h1>
            <p className="business-hero__subtitle">
              {t.business.heroSubtitle}
            </p>
          </div>
        </section>
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>{t.business.loading || 'Loading products...'}</p>
        </div>
      </div>
    );
  }

  const renderEmptyState = (icon: string, message: string) => (
    <div className="business-empty">
      <span className="business-empty__icon">{icon}</span>
      <h3>No Items Available</h3>
      <p>{message}</p>
    </div>
  );

  const localizeCondition = (condition?: string) => {
    if (!condition) return "";
    const conditionTrimmed = condition.trim();
    const conditionLower = conditionTrimmed.toLowerCase();
    if (conditionLower === "new") return t.market.conditionNew;
    if (conditionLower === "used") return t.market.conditionUsed;
    return conditionTrimmed; // Return trimmed value for other conditions like "Excellent"
  };

  const renderCarCard = (car: Car) => {
    const carAlt = `${car.brand || ''} ${car.model || ''} ${car.year || ''}`.trim() || 'Car';

    // Show all images for this item
    if (!car.images || car.images.length === 0) {
      return (
        <div key={car._id} className="business-card">
          <div
            className="business-card__placeholder"
            role="img"
            aria-label={`${carAlt} - ${t.business.noImageAvailable}`}
          >
            🚗
          </div>
        </div>
      );
    }

    return car.images.map((img, index) => (
      <div key={`${car._id}-${index}`} className="business-card">
        <OptimizedImage
          src={img}
          alt={`${carAlt} - ${index + 1}`}
          wrapperClassName="business-card__image"
          placeholderIcon="🚗"
          placeholderLabel={`${carAlt} - ${t.business.noImageAvailable}`}
        />
      </div>
    ));
  };

  const renderTireCard = (tire: Tire) => {
    const conditionLabel = localizeCondition(tire.condition);
    const tireAlt = [tire.brand, tire.size, conditionLabel, t.business.altTextTire]
      .filter(Boolean)
      .join(" ");

    // Show all images for this item
    if (!tire.images || tire.images.length === 0) {
      return (
        <div key={tire._id} className="business-card">
          <div
            className="business-card__placeholder"
            role="img"
            aria-label={`${tireAlt} - ${t.business.noImageAvailable}`}
          >
            🛞
          </div>
        </div>
      );
    }

    return tire.images.map((img, index) => (
      <div key={`${tire._id}-${index}`} className="business-card">
        <OptimizedImage
          src={img}
          alt={`${tireAlt} - ${index + 1}`}
          wrapperClassName="business-card__image"
          placeholderIcon="🛞"
          placeholderLabel={`${tireAlt} - ${t.business.noImageAvailable}`}
        />
      </div>
    ));
  };

  const renderWheelDrumCard = (drum: WheelDrum) => {
    const conditionLabel = localizeCondition(drum.condition);
    const drumAlt = [drum.brand, drum.size, conditionLabel, t.business.altTextWheelDrum]
      .filter(Boolean)
      .join(" ") || 'Wheel Drum';

    // Show all images for this item
    if (!drum.images || drum.images.length === 0) {
      return (
        <div key={drum._id} className="business-card">
          <div
            className="business-card__placeholder"
            role="img"
            aria-label={`${drumAlt} - ${t.business.noImageAvailable}`}
          >
            ⚙️
          </div>
        </div>
      );
    }

    return drum.images.map((img, index) => (
      <div key={`${drum._id}-${index}`} className="business-card">
        <OptimizedImage
          src={img}
          alt={`${drumAlt} - ${index + 1}`}
          wrapperClassName="business-card__image"
          placeholderIcon="⚙️"
          placeholderLabel={`${drumAlt} - ${t.business.noImageAvailable}`}
        />
      </div>
    ));
  };

  const renderContent = () => {
    switch (activeTab) {
      case "cars":
        return cars.length === 0 ? renderEmptyState("🚗", "Check back soon for new vehicles") : (
          <div className="business-gallery business-gallery--cars">{cars.flatMap(renderCarCard)}</div>
        );
      case "new-tires":
        return newTires.length === 0 ? renderEmptyState("🛞", "Check back soon for new tires") : (
          <div className="business-gallery">{newTires.flatMap(renderTireCard)}</div>
        );
      case "used-tires":
        return usedTires.length === 0 ? renderEmptyState("🛞", "Check back soon for used tires") : (
          <div className="business-gallery">{usedTires.flatMap(renderTireCard)}</div>
        );
      case "wheel-drums":
        return wheelDrums.length === 0 ? renderEmptyState("⚙️", "Check back soon for wheel drums") : (
          <div className="business-gallery">{wheelDrums.flatMap(renderWheelDrumCard)}</div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="business-page">
      {/* Hero Section */}
      <section className="business-hero">
        <div className="business-hero__content">
          <h1 className="business-hero__title">{t.business.heroTitle}</h1>
          <p className="business-hero__subtitle">
            {t.business.heroSubtitle}
          </p>
        </div>
      </section>

      {/* Tabs */}
      <nav className="business-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`business-tab ${activeTab === tab.id ? "business-tab--active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="business-tab__icon">{tab.icon}</span>
            <span className="business-tab__label">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Content */}
      <div className="business-content">
        {renderContent()}
      </div>
    </div>
  );
}
