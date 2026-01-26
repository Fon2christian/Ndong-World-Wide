import { useEffect, useState } from "react";
import axios from "axios";
import { useLanguage } from "../context/LanguageContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface Car {
  _id: string;
  brand: string;
  model: string;
  year: number;
  images: string[];
}

interface Tire {
  _id: string;
  brand: string;
  size: string;
  condition: string;
  images: string[];
}

interface WheelDrum {
  _id: string;
  brand: string;
  size: string;
  condition: string;
  images: string[];
}

export default function Business() {
  const { t } = useLanguage();
  const [cars, setCars] = useState<Car[]>([]);
  const [tires, setTires] = useState<Tire[]>([]);
  const [wheelDrums, setWheelDrums] = useState<WheelDrum[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch only items that should be displayed on Business page (location=business or both)
        const [carsRes, tiresRes, wheelDrumsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/cars?location=business`),
          axios.get(`${API_BASE_URL}/api/tires?location=business`),
          axios.get(`${API_BASE_URL}/api/wheel-drums?location=business`),
        ]);
        setCars(carsRes.data);
        setTires(tiresRes.data);
        setWheelDrums(wheelDrumsRes.data);
      } catch (error) {
        console.error("Error fetching business data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  return (
    <div className="business-page">
      {/* Hero Section */}
      <section className="business-hero">
        <div className="business-hero__content">
          <h1 className="business-hero__title">Our Business</h1>
          <p className="business-hero__subtitle">
            Explore our complete inventory of quality vehicles, tires, and wheel drums from Japan
          </p>
        </div>
      </section>

      {/* Tires Section */}
      <section className="business-section business-section--tires">
        <div className="business-section__header">
          <h2 className="business-section__title">
            <span className="business-section__icon">🛞</span>
            {t.tyresProvision.title}
          </h2>
          <p className="business-section__description">
            Quality tires sourced directly from Japan
          </p>
        </div>
        <div className="business-gallery">
          {tires.length > 0 ? (
            tires.slice(0, 8).map((tire) => (
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
                </div>
              </div>
            ))
          ) : (
            <div className="business-empty">
              <span className="business-empty__icon">🛞</span>
              <p>Tires coming soon</p>
            </div>
          )}
        </div>
      </section>

      {/* Wheel Drums Section */}
      <section className="business-section business-section--wheels">
        <div className="business-section__header">
          <h2 className="business-section__title">
            <span className="business-section__icon">⚙️</span>
            {t.wheelsProvision.title}
          </h2>
          <p className="business-section__description">
            Premium wheel drums for all vehicle types
          </p>
        </div>
        <div className="business-gallery">
          {wheelDrums.length > 0 ? (
            wheelDrums.slice(0, 8).map((drum) => (
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
                </div>
              </div>
            ))
          ) : (
            <div className="business-empty">
              <span className="business-empty__icon">⚙️</span>
              <p>Wheel drums coming soon</p>
            </div>
          )}
        </div>
      </section>

      {/* Cars Section */}
      <section className="business-section business-section--cars">
        <div className="business-section__header">
          <h2 className="business-section__title">
            <span className="business-section__icon">🚗</span>
            {t.carProvision.title}
          </h2>
          <p className="business-section__description">
            Quality used vehicles directly from Japan's auto markets
          </p>
        </div>
        <div className="business-gallery business-gallery--cars">
          {cars.length > 0 ? (
            cars.slice(0, 6).map((car) => (
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
                </div>
              </div>
            ))
          ) : (
            <div className="business-empty">
              <span className="business-empty__icon">🚗</span>
              <p>Vehicles coming soon</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="business-cta">
        <div className="business-cta__content">
          <h2>Ready to Browse Our Full Inventory?</h2>
          <p>Visit our Market page for detailed listings, prices, and availability</p>
          <a href="/market" className="btn btn--primary business-cta__button">
            Go to Market
          </a>
        </div>
      </section>
    </div>
  );
}
