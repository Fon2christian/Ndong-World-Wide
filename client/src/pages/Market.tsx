import { useEffect, useState } from "react";
import axios from "axios";
import { useLanguage } from "../context/LanguageContext";

type TabType = "cars" | "new-tires" | "used-tires" | "wheel-drums";

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

export default function Market() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>("cars");
  const [cars, setCars] = useState<Car[]>([]);
  const [newTires, setNewTires] = useState<Tire[]>([]);
  const [usedTires, setUsedTires] = useState<Tire[]>([]);
  const [wheelDrums, setWheelDrums] = useState<WheelDrum[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [carsRes, newTiresRes, usedTiresRes, wheelDrumsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/cars`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/tires?condition=new`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/tires?condition=used`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/wheel-drums`),
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

  const renderCarCard = (car: Car) => (
    <article key={car._id} className="car-card">
      <div className="car-card__gallery">
        {car.images.length > 0 ? (
          <>
            <img src={car.images[0]} alt={`${car.brand} ${car.model}`} className="car-card__image" />
            {car.images.length > 1 && (
              <span className="car-card__image-count">+{car.images.length - 1} photos</span>
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
        <p className="car-card__price">${car.price.toLocaleString()}</p>
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
          <button className="btn btn--primary btn--small">{t.market.contactSeller}</button>
        </div>
      </div>
    </article>
  );

  const renderTireCard = (tire: Tire) => (
    <article key={tire._id} className="product-card product-card--tire">
      <div className="product-card__gallery">
        {tire.images.length > 0 ? (
          <img src={tire.images[0]} alt={`${tire.brand} ${tire.size}`} className="product-card__image" />
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
        <p className="product-card__price">${tire.price.toLocaleString()}</p>
        <div className="product-card__actions">
          <button className="btn btn--primary btn--small">{t.market.contactSeller}</button>
        </div>
      </div>
    </article>
  );

  const renderWheelDrumCard = (wheelDrum: WheelDrum) => (
    <article key={wheelDrum._id} className="product-card product-card--wheel">
      <div className="product-card__gallery">
        {wheelDrum.images.length > 0 ? (
          <img src={wheelDrum.images[0]} alt={`${wheelDrum.brand} ${wheelDrum.size}`} className="product-card__image" />
        ) : (
          <div className="product-card__gallery-placeholder">{getTabIcon("wheel")}</div>
        )}
      </div>
      <div className="product-card__body">
        <h2 className="product-card__title">{wheelDrum.brand}</h2>
        <p className="product-card__subtitle">{wheelDrum.size}</p>
        <p className="product-card__condition">{wheelDrum.condition}</p>
        <p className="product-card__price">${wheelDrum.price.toLocaleString()}</p>
        <div className="product-card__actions">
          <button className="btn btn--primary btn--small">{t.market.contactSeller}</button>
        </div>
      </div>
    </article>
  );

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
      <nav className="market__tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
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
      <div className="market__content">
        {renderContent()}
      </div>
    </div>
  );
}
