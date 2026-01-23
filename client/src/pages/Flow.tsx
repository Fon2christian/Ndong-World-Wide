import { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import { Link } from "react-router-dom";

const heroImages = [
  "/assets/images/pic1.jpg",
  "/assets/images/pic2.jpg",
  "/assets/images/pic3.jpg",
];

export default function Flow() {
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flow-page">
      {/* Hero Section with Slideshow */}
      <div className="flow-hero">
        <div className="flow-hero__slideshow">
          {heroImages.map((image, index) => (
            <div
              key={index}
              className={`flow-hero__slide ${index === currentSlide ? "flow-hero__slide--active" : ""}`}
              style={{ backgroundImage: `url(${image})` }}
            />
          ))}
          <div className="flow-hero__overlay" />
        </div>
        <div className="flow-hero__content">
          <h1 className="flow-hero__title">{t.flow.title}</h1>
          <p className="flow-hero__subtitle">{t.flow.subtitle}</p>
        </div>
        <div className="flow-hero__dots">
          {heroImages.map((_, index) => (
            <button
              key={index}
              className={`flow-hero__dot ${index === currentSlide ? "flow-hero__dot--active" : ""}`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* International Customers Section */}
      <section className="flow-section">
        <div className="flow-section-header">
          <h2 className="flow-section-title">{t.flow.international.title}</h2>
          <p className="flow-section-subtitle">{t.flow.international.subtitle}</p>
        </div>
        <div className="flow-steps">
          {t.flow.international.steps.map((step, index) => (
            <div key={index} className="flow-step">
              <div className="flow-step-number">
                <span>{index + 1}</span>
              </div>
              <div className="flow-step-content">
                <h3 className="flow-step-title">{step.title}</h3>
                <p className="flow-step-description">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Local Customers Section */}
      <section className="flow-section flow-section-local">
        <div className="flow-section-header">
          <h2 className="flow-section-title">{t.flow.local.title}</h2>
          <p className="flow-section-subtitle">{t.flow.local.subtitle}</p>
        </div>
        <div className="flow-steps">
          {t.flow.local.steps.map((step, index) => (
            <div key={index} className="flow-step">
              <div className="flow-step-number">
                <span>{index + 1}</span>
              </div>
              <div className="flow-step-content">
                <h3 className="flow-step-title">{step.title}</h3>
                <p className="flow-step-description">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="flow-cta">
        <h2 className="flow-cta-title">{t.flow.contactCta}</h2>
        <Link to="/contact" className="flow-cta-button">
          {t.flow.contactButton}
        </Link>
      </section>
    </div>
  );
}
