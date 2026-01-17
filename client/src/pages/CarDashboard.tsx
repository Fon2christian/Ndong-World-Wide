import { useEffect, useState } from "react";
import axios from "axios";

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
  updatedAt: string;
}

export default function CarDashboard() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCars = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/cars`);
      setCars(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="loading__spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard__header">
        <div className="dashboard__title">
          <div className="dashboard__logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 17H21V15L19 7H5L3 15V17H5M19 17H5M19 17C19 18.1046 18.1046 19 17 19C15.8954 19 15 18.1046 15 17M5 17C5 18.1046 5.89543 19 7 19C8.10457 19 9 18.1046 9 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1>Car Market</h1>
        </div>

        <div className="dashboard__stats">
          <div className="stat-badge">
            Available Cars: <span className="stat-badge__value">{cars.length}</span>
          </div>
        </div>
      </header>

      {/* Car Grid */}
      {cars.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 17H21V15L19 7H5L3 15V17H5M19 17H5M19 17C19 18.1046 18.1046 19 17 19C15.8954 19 15 18.1046 15 17M5 17C5 18.1046 5.89543 19 7 19C8.10457 19 9 18.1046 9 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="empty-state__title">No cars available</h3>
          <p className="empty-state__description">
            Check back later for new listings.
          </p>
        </div>
      ) : (
        <div className="car-grid">
          {cars.map((car) => (
            <article key={car._id} className="car-card">
              {/* Image Gallery */}
              <div className="car-card__gallery">
                {car.images.length > 0 ? (
                  <>
                    <img
                      src={car.images[0]}
                      alt={`${car.brand} ${car.model}`}
                      className="car-card__image"
                    />
                    {car.images.length > 1 && (
                      <span className="car-card__image-count">
                        +{car.images.length - 1} photos
                      </span>
                    )}
                  </>
                ) : (
                  <div className="car-card__gallery-placeholder">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 17H21V15L19 7H5L3 15V17H5M19 17H5M19 17C19 18.1046 18.1046 19 17 19C15.8954 19 15 18.1046 15 17M5 17C5 18.1046 5.89543 19 7 19C8.10457 19 9 18.1046 9 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="car-card__body">
                <div className="car-card__header">
                  <h2 className="car-card__title">
                    {car.brand} {car.model}
                  </h2>
                  <span className="car-card__year">{car.year}</span>
                </div>

                <p className="car-card__price">
                  ${car.price.toLocaleString()}
                </p>

                {/* Specs Grid */}
                <div className="car-card__specs">
                  <div className="car-spec">
                    <span className="car-spec__label">Mileage</span>
                    <span className="car-spec__value">{car.mileage.toLocaleString()} km</span>
                  </div>
                  <div className="car-spec">
                    <span className="car-spec__label">Fuel</span>
                    <span className="car-spec__value">{car.fuel}</span>
                  </div>
                  <div className="car-spec">
                    <span className="car-spec__label">Trans.</span>
                    <span className="car-spec__value">{car.transmission}</span>
                  </div>
                </div>

                {/* Contact Button */}
                <div className="car-card__actions">
                  <a
                    href={`mailto:info@ndongworldwide.com?subject=Inquiry about ${encodeURIComponent(car.brand)} ${encodeURIComponent(car.model)} (${car.year})&body=${encodeURIComponent(`Hello,\n\nI am interested in the ${car.brand} ${car.model} (${car.year}) listed at $${car.price.toLocaleString()}.\n\nPlease contact me with more information.\n\nThank you.`)}`}
                    className="btn btn--primary btn--small"
                  >
                    Contact Seller
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
