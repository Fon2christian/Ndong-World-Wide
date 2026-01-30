import { useEffect, useState } from "react";
import axios from "axios";
import { useLanguage } from "../context/LanguageContext";
import { Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface WheelDrum {
  _id: string;
  brand: string;
  size: string;
  condition: string;
  price?: number;
  images: string[];
}

export default function WheelsProvision() {
  const { t } = useLanguage();
  const [wheelDrums, setWheelDrums] = useState<WheelDrum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWheelDrums = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/wheel-drums?location=business`);
        setWheelDrums(response.data);
      } catch (err) {
        console.error("Error fetching wheel drums:", err);
        setError("Failed to load wheel drums inventory");
      } finally {
        setLoading(false);
      }
    };
    fetchWheelDrums();
  }, []);

  if (loading) {
    return (
      <div className="provision-page">
        <div className="provision-loading">
          <div className="loading__spinner"></div>
          <p>Loading wheel drums...</p>
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
        <span>Wheels Provision</span>
      </div>

      {/* Hero Section */}
      <section className="provision-hero">
        <div className="provision-hero__icon">⚙️</div>
        <h1 className="provision-hero__title">{t.wheelsProvision.title}</h1>
        <p className="provision-hero__subtitle">
          Premium wheel drums for all vehicle types from Japanese suppliers
        </p>
        <div className="provision-hero__stats">
          <div className="provision-stat">
            <span className="provision-stat__number">{wheelDrums.length}</span>
            <span className="provision-stat__label">Wheel Drums Available</span>
          </div>
          <div className="provision-stat">
            <span className="provision-stat__number">
              {new Set(wheelDrums.map(w => w.brand)).size}
            </span>
            <span className="provision-stat__label">Brands</span>
          </div>
          <div className="provision-stat">
            <span className="provision-stat__number">
              {new Set(wheelDrums.map(w => w.size)).size}
            </span>
            <span className="provision-stat__label">Sizes</span>
          </div>
        </div>
      </section>

      {/* Wheel Drums Grid */}
      <section className="provision-inventory">
        {wheelDrums.length > 0 ? (
          <div className="provision-grid">
            {wheelDrums.map((drum) => (
              <div key={drum._id} className="provision-card">
                <div className="provision-card__image">
                  {drum.images && drum.images[0] ? (
                    <img src={drum.images[0]} alt={`${drum.brand} ${drum.size}`} />
                  ) : (
                    <div className="provision-card__placeholder">
                      <span className="provision-card__placeholder-icon">⚙️</span>
                    </div>
                  )}
                  <span className={`provision-card__badge provision-card__badge--${drum.condition.toLowerCase()}`}>
                    {drum.condition}
                  </span>
                </div>
                <div className="provision-card__info">
                  <h3 className="provision-card__brand">{drum.brand}</h3>
                  <p className="provision-card__size">{drum.size}</p>
                  {drum.price && (
                    <p className="provision-card__price">
                      {t.market.currency}{drum.price.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="provision-empty">
            <span className="provision-empty__icon">⚙️</span>
            <h3>No Wheel Drums Available</h3>
            <p>Check back soon for new inventory</p>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="provision-cta">
        <h2>Interested in our wheel drum selection?</h2>
        <p>Visit our Market page for detailed specifications and pricing</p>
        <Link to="/market" className="btn btn--primary">
          View in Market
        </Link>
      </section>
    </div>
  );
}
