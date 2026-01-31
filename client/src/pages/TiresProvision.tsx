import { useEffect, useState } from "react";
import axios from "axios";
import { useLanguage } from "../context/LanguageContext";
import { Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface Tire {
  _id: string;
  brand: string;
  size: string;
  condition: string;
  price?: number;
  images: string[];
}

export default function TiresProvision() {
  const { t } = useLanguage();
  const [tires, setTires] = useState<Tire[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTires = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/tires?location=business`);
        setTires(response.data);
      } catch (err) {
        console.error("Error fetching tires:", err);
        setError("Failed to load tires inventory");
      } finally {
        setLoading(false);
      }
    };
    fetchTires();
  }, []);

  if (loading) {
    return (
      <div className="provision-page">
        <div className="provision-loading">
          <div className="loading__spinner"></div>
          <p>Loading tires...</p>
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
        <span>Tyres Provision</span>
      </div>

      {/* Hero Section */}
      <section className="provision-hero">
        <div className="provision-hero__icon">🛞</div>
        <h1 className="provision-hero__title">{t.tyresProvision.title}</h1>
        <p className="provision-hero__subtitle">
          Quality tires sourced directly from Japan's trusted suppliers
        </p>
        <div className="provision-hero__stats">
          <div className="provision-stat">
            <span className="provision-stat__number">{tires.length}</span>
            <span className="provision-stat__label">Tires Available</span>
          </div>
          <div className="provision-stat">
            <span className="provision-stat__number">
              {tires.filter(t => t.condition === "new").length}
            </span>
            <span className="provision-stat__label">New</span>
          </div>
          <div className="provision-stat">
            <span className="provision-stat__number">
              {tires.filter(t => t.condition === "used").length}
            </span>
            <span className="provision-stat__label">Used</span>
          </div>
        </div>
      </section>

      {/* Tires Grid */}
      <section className="provision-inventory">
        {tires.length > 0 ? (
          <div className="provision-grid">
            {tires.map((tire) => (
              <div key={tire._id} className="provision-card">
                <div className="provision-card__image">
                  {tire.images && tire.images[0] ? (
                    <img src={tire.images[0]} alt={`${tire.brand} ${tire.size}`} />
                  ) : (
                    <div className="provision-card__placeholder">
                      <span className="provision-card__placeholder-icon">🛞</span>
                    </div>
                  )}
                  <span className={`provision-card__badge provision-card__badge--${tire.condition.toLowerCase()}`}>
                    {tire.condition}
                  </span>
                </div>
                <div className="provision-card__info">
                  <h3 className="provision-card__brand">{tire.brand}</h3>
                  <p className="provision-card__size">{tire.size}</p>
                  {tire.price && (
                    <p className="provision-card__price">
                      {t.market.currency}{tire.price.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="provision-empty">
            <span className="provision-empty__icon">🛞</span>
            <h3>No Tires Available</h3>
            <p>Check back soon for new inventory</p>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="provision-cta">
        <h2>Interested in our tire selection?</h2>
        <p>Visit our Market page for detailed specifications and pricing</p>
        <Link to="/market" className="btn btn--primary">
          View in Market
        </Link>
      </section>
    </div>
  );
}
