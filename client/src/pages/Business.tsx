import { useEffect, useState } from "react";
import axios from "axios";
import { useLanguage } from "../context/LanguageContext";

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

export default function Business() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>("cars");
  const [cars, setCars] = useState<Car[]>([]);
  const [newTires, setNewTires] = useState<Tire[]>([]);
  const [usedTires, setUsedTires] = useState<Tire[]>([]);
  const [wheelDrums, setWheelDrums] = useState<WheelDrum[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch only items that should be displayed on Business page (location=business or both)
        const [carsRes, newTiresRes, usedTiresRes, wheelDrumsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/cars?location=business`),
          axios.get(`${API_BASE_URL}/api/tires?condition=new&location=business`),
          axios.get(`${API_BASE_URL}/api/tires?condition=used&location=business`),
          axios.get(`${API_BASE_URL}/api/wheel-drums?location=business`),
        ]);
        setCars(carsRes.data);
        setNewTires(newTiresRes.data);
        setUsedTires(usedTiresRes.data);
        setWheelDrums(wheelDrumsRes.data);
      } catch (error) {
        console.error("Error fetching business data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const tabs = [
    { id: "cars" as TabType, label: "Cars", icon: "🚗", count: cars.length },
    { id: "new-tires" as TabType, label: "New Tires", icon: "🛞", count: newTires.length },
    { id: "used-tires" as TabType, label: "Used Tires", icon: "🛞", count: usedTires.length },
    { id: "wheel-drums" as TabType, label: "Wheel Drums", icon: "⚙️", count: wheelDrums.length },
  ];

  if (loading) {
    return (
      <div className="business-page">
        <div className="business-loading">
          <div className="loading__spinner"></div>
          <p>{t.market.loading}</p>
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

  const renderCarCard = (car: Car) => (
    <div key={car._id} className="business-card business-card--car">
      <div className="business-card__image">
        {car.images && car.images[0] ? (
          <img src={car.images[0]} alt={`${car.brand} ${car.model}`} />
        ) : (
          <div className="business-card__placeholder">🚗</div>
        )}
        <span className="business-card__year">{car.year}</span>
      </div>
      <div className="business-card__info">
        <h3>{car.brand} {car.model}</h3>
        {car.mileage && <p>{car.mileage.toLocaleString()} km</p>}
        {car.price && <p className="business-card__price">{t.market.currency}{car.price.toLocaleString()}</p>}
      </div>
    </div>
  );

  const renderTireCard = (tire: Tire) => (
    <div key={tire._id} className="business-card">
      <div className="business-card__image">
        {tire.images && tire.images[0] ? (
          <img src={tire.images[0]} alt={`${tire.brand} ${tire.size}`} />
        ) : (
          <div className="business-card__placeholder">🛞</div>
        )}
        <span className={`business-card__badge business-card__badge--${tire.condition.toLowerCase()}`}>
          {tire.condition}
        </span>
      </div>
      <div className="business-card__info">
        <h3>{tire.brand}</h3>
        <p>{tire.size}</p>
        {tire.price && <p className="business-card__price">{t.market.currency}{tire.price.toLocaleString()}</p>}
      </div>
    </div>
  );

  const renderWheelDrumCard = (drum: WheelDrum) => (
    <div key={drum._id} className="business-card">
      <div className="business-card__image">
        {drum.images && drum.images[0] ? (
          <img src={drum.images[0]} alt={`${drum.brand} ${drum.size}`} />
        ) : (
          <div className="business-card__placeholder">⚙️</div>
        )}
        <span className="business-card__badge">{drum.condition}</span>
      </div>
      <div className="business-card__info">
        <h3>{drum.brand}</h3>
        <p>{drum.size}</p>
        {drum.price && <p className="business-card__price">{t.market.currency}{drum.price.toLocaleString()}</p>}
      </div>
    </div>
  );

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
