import { useEffect, useState } from "react";
import axios from "axios";
import { useLanguage } from "../context/LanguageContext";
import { Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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

export default function CarsProvision() {
  const { t } = useLanguage();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/cars?location=business`);
        setCars(response.data);
      } catch (err) {
        console.error("Error fetching cars:", err);
        setError("Failed to load cars inventory");
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  if (loading) {
    return (
      <div className="provision-page">
        <div className="provision-loading">
          <div className="loading__spinner"></div>
          <p>Loading vehicles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="provision-page">
        <div className="provision-error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="provision-page">
      {/* Breadcrumb */}
      <div className="provision-breadcrumb">
        <Link to="/business">Business</Link>
        <span> / </span>
        <span>Car Provision</span>
      </div>

      {/* Hero Section */}
      <section className="provision-hero">
        <div className="provision-hero__icon">🚗</div>
        <h1 className="provision-hero__title">{t.carProvision.title}</h1>
        <p className="provision-hero__subtitle">
          Quality used vehicles directly from Japan's trusted auto markets
        </p>
        <div className="provision-hero__stats">
          <div className="provision-stat">
            <span className="provision-stat__number">{cars.length}</span>
            <span className="provision-stat__label">Vehicles Available</span>
          </div>
          <div className="provision-stat">
            <span className="provision-stat__number">
              {new Set(cars.map(c => c.brand)).size}
            </span>
            <span className="provision-stat__label">Brands</span>
          </div>
          <div className="provision-stat">
            <span className="provision-stat__number">
              {cars.filter(c => c.year >= new Date().getFullYear() - 5).length}
            </span>
            <span className="provision-stat__label">Recent Models</span>
          </div>
        </div>
      </section>

      {/* Cars Grid */}
      <section className="provision-inventory">
        {cars.length > 0 ? (
          <div className="provision-grid provision-grid--cars">
            {cars.map((car) => (
              <div key={car._id} className="provision-card provision-card--car">
                <div className="provision-card__image">
                  {car.images && car.images[0] ? (
                    <img src={car.images[0]} alt={`${car.brand} ${car.model}`} />
                  ) : (
                    <div className="provision-card__placeholder">
                      <span className="provision-card__placeholder-icon">🚗</span>
                    </div>
                  )}
                  <span className="provision-card__year-badge">{car.year}</span>
                </div>
                <div className="provision-card__info">
                  <h3 className="provision-card__brand">{car.brand} {car.model}</h3>
                  <div className="provision-card__details">
                    {car.mileage && (
                      <span className="provision-card__detail">
                        {car.mileage.toLocaleString()} km
                      </span>
                    )}
                    {car.fuel && (
                      <span className="provision-card__detail">{car.fuel}</span>
                    )}
                    {car.transmission && (
                      <span className="provision-card__detail">{car.transmission}</span>
                    )}
                  </div>
                  {car.price && (
                    <p className="provision-card__price">
                      {t.market.currency}{car.price.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="provision-empty">
            <span className="provision-empty__icon">🚗</span>
            <h3>No Vehicles Available</h3>
            <p>Check back soon for new inventory</p>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="provision-cta">
        <h2>Interested in our vehicle selection?</h2>
        <p>Visit our Market page for detailed specifications and pricing</p>
        <Link to="/market" className="btn btn--primary">
          View in Market
        </Link>
      </section>
    </div>
  );
}
