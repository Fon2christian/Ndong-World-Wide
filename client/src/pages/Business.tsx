import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useLanguage } from "../context/LanguageContext";
import OptimizedImage from "../components/OptimizedImage";
import { useImagePreloader, extractFirstImages } from "../hooks/useImagePreloader";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

type TabType = "cars" | "new-tires" | "used-tires" | "wheel-drums";

interface Car {
  _id: string;
  brand: string;
  model: string;
  year: number;
  price?: number;
  mileage?: number;
  fuel?: string;
  transmission?: string;
  images: string[];
}

interface Tire {
  _id: string;
  brand: string;
  size: string;
  condition: string;
  price?: number;
  images: string[];
}

interface WheelDrum {
  _id: string;
  brand: string;
  size: string;
  condition: string;
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
  const cachedData = getCachedBusinessData();

  const [cars, setCars] = useState<Car[]>(cachedData?.cars || []);
  const [newTires, setNewTires] = useState<Tire[]>(cachedData?.newTires || []);
  const [usedTires, setUsedTires] = useState<Tire[]>(cachedData?.usedTires || []);
  const [wheelDrums, setWheelDrums] = useState<WheelDrum[]>(cachedData?.wheelDrums || []);
  const [loading, setLoading] = useState(!cachedData);

  useEffect(() => {
    const fetchData = async () => {
      // Check for cached data first
      const cacheKey = 'business-data';
      const cached = sessionStorage.getItem(cacheKey);

      if (cached) {
        try {
          const cachedData = JSON.parse(cached);
          setCars(cachedData?.cars || []);
          setNewTires(cachedData?.newTires || []);
          setUsedTires(cachedData?.usedTires || []);
          setWheelDrums(cachedData?.wheelDrums || []);
          setLoading(false);
        } catch (e) {
          console.error('Cache parse error:', e);
        }
      }

      // Fetch fresh data in background
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

        setCars(freshData.cars);
        setNewTires(freshData.newTires);
        setUsedTires(freshData.usedTires);
        setWheelDrums(freshData.wheelDrums);

        // Cache the fresh data
        sessionStorage.setItem(cacheKey, JSON.stringify(freshData));
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
    { id: "cars" as TabType, label: t.business.cars, icon: "🚗", count: cars.length },
    { id: "new-tires" as TabType, label: t.business.newTires, icon: "🛞", count: newTires.length },
    { id: "used-tires" as TabType, label: t.business.usedTires, icon: "🛞", count: usedTires.length },
    { id: "wheel-drums" as TabType, label: t.business.wheelDrums, icon: "⚙️", count: wheelDrums.length },
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
          <p>Loading products...</p>
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
    const carAlt = `${car.brand} ${car.model} ${car.year}`;
    return (
      <div key={car._id} className="business-card">
        {car.images && car.images[0] ? (
          <OptimizedImage
            src={car.images[0]}
            alt={carAlt}
            wrapperClassName="business-card__image"
            placeholderIcon="🚗"
            placeholderLabel={`${carAlt} - ${t.business.noImageAvailable}`}
          />
        ) : (
          <div
            className="business-card__placeholder"
            role="img"
            aria-label={`${carAlt} - ${t.business.noImageAvailable}`}
          >
            🚗
          </div>
        )}
      </div>
    );
  };

  const renderTireCard = (tire: Tire) => {
    const conditionLabel = localizeCondition(tire.condition);
    const tireAlt = [tire.brand, tire.size, conditionLabel, t.business.altTextTire]
      .filter(Boolean)
      .join(" ");
    return (
      <div key={tire._id} className="business-card">
        {tire.images && tire.images[0] ? (
          <OptimizedImage
            src={tire.images[0]}
            alt={tireAlt}
            wrapperClassName="business-card__image"
            placeholderIcon="🛞"
            placeholderLabel={`${tireAlt} - ${t.business.noImageAvailable}`}
          />
        ) : (
          <div
            className="business-card__placeholder"
            role="img"
            aria-label={`${tireAlt} - ${t.business.noImageAvailable}`}
          >
            🛞
          </div>
        )}
      </div>
    );
  };

  const renderWheelDrumCard = (drum: WheelDrum) => {
    const conditionLabel = localizeCondition(drum.condition);
    const drumAlt = [drum.brand, drum.size, conditionLabel, t.business.altTextWheelDrum]
      .filter(Boolean)
      .join(" ");
    return (
      <div key={drum._id} className="business-card">
        {drum.images && drum.images[0] ? (
          <OptimizedImage
            src={drum.images[0]}
            alt={drumAlt}
            wrapperClassName="business-card__image"
            placeholderIcon="⚙️"
            placeholderLabel={`${drumAlt} - ${t.business.noImageAvailable}`}
          />
        ) : (
          <div
            className="business-card__placeholder"
            role="img"
            aria-label={`${drumAlt} - ${t.business.noImageAvailable}`}
          >
            ⚙️
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "cars":
        return cars.length === 0 ? renderEmptyState("🚗", "Check back soon for new vehicles") : (
          <div className="business-gallery business-gallery--cars">{cars.map(renderCarCard)}</div>
        );
      case "new-tires":
        return newTires.length === 0 ? renderEmptyState("🛞", "Check back soon for new tires") : (
          <div className="business-gallery">{newTires.map(renderTireCard)}</div>
        );
      case "used-tires":
        return usedTires.length === 0 ? renderEmptyState("🛞", "Check back soon for used tires") : (
          <div className="business-gallery">{usedTires.map(renderTireCard)}</div>
        );
      case "wheel-drums":
        return wheelDrums.length === 0 ? renderEmptyState("⚙️", "Check back soon for wheel drums") : (
          <div className="business-gallery">{wheelDrums.map(renderWheelDrumCard)}</div>
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
            <span className="business-tab__count">{tab.count}</span>
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
