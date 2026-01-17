import { useState, useEffect, useRef } from "react";
import { useLanguage } from "../context/LanguageContext";

const images = [
  "/assets/images/image1.png",
  "/assets/images/image2.png",
];

function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <button
      className={`scroll-to-top ${isVisible ? "scroll-to-top--visible" : ""}`}
      onClick={scrollToTop}
      aria-label="Scroll to top"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </button>
  );
}

function ProvisionSection({
  id,
  image,
  title,
  description,
  features,
  altText
}: {
  id: string;
  image: string;
  title: string;
  description: string;
  features: string[];
  altText: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: "-50px 0px"
      }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <div id={id} ref={sectionRef} className={`provision-section ${isVisible ? "provision-section--visible" : ""}`}>
      <div className="provision-section__image">
        <img src={image} alt={altText} />
      </div>
      <div className="provision-section__content">
        <h2 className="provision-section__title">{title}</h2>
        <p className="provision-section__text">{description}</p>
        <ul className="provision-section__features">
          {features.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function CarProvisionSection() {
  const { t } = useLanguage();
  return (
    <ProvisionSection
      id="car-provision"
      image="/assets/images/used cars.jpg"
      title={t.carProvision.title}
      altText="Quality Used Cars"
      description={t.carProvision.description}
      features={t.carProvision.features}
    />
  );
}

function TyresProvisionSection() {
  const { t } = useLanguage();
  return (
    <ProvisionSection
      id="tyres-provision"
      image="/assets/images/tyres.jpg"
      title={t.tyresProvision.title}
      altText="Quality Used Tyres"
      description={t.tyresProvision.description}
      features={t.tyresProvision.features}
    />
  );
}

function WheelsProvisionSection() {
  const { t } = useLanguage();
  return (
    <ProvisionSection
      id="wheels-provision"
      image="/assets/images/wheels.jpg"
      title={t.wheelsProvision.title}
      altText="Quality Wheels"
      description={t.wheelsProvision.description}
      features={t.wheelsProvision.features}
    />
  );
}

function MissionSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: "-50px 0px"
      }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <div id="mission" ref={sectionRef} className={`mission-section ${isVisible ? "mission-section--visible" : ""}`}>
      <h2 className="mission-section__title">{t.mission.title}</h2>
      <p className="mission-section__text">{t.mission.text}</p>
    </div>
  );
}

export default function ImageSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { t } = useLanguage();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <div className="slideshow">
      <div className="slideshow__container">
        {images.map((image, index) => (
          <div
            key={index}
            className={`slideshow__slide ${index === currentIndex ? "slideshow__slide--active" : ""}`}
          >
            <img src={image} alt={`Slide ${index + 1}`} />
          </div>
        ))}

        {/* Welcome Text Overlay */}
        <div className="slideshow__welcome">
          <h1>{t.hero.welcome}</h1>
          <p>{t.hero.subtitle}</p>
          <h2 className="slideshow__tagline">{t.hero.tagline}</h2>
        </div>

        {/* Navigation Arrows */}
        <button
          className="slideshow__arrow slideshow__arrow--prev"
          onClick={goToPrevious}
          aria-label="Previous slide"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button
          className="slideshow__arrow slideshow__arrow--next"
          onClick={goToNext}
          aria-label="Next slide"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

        {/* Dots */}
        <div className="slideshow__dots">
          {images.map((_, index) => (
            <button
              key={index}
              className={`slideshow__dot ${index === currentIndex ? "slideshow__dot--active" : ""}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Mission Section */}
      <MissionSection />

      {/* Car Provision Section */}
      <CarProvisionSection />

      {/* Tyres Provision Section */}
      <TyresProvisionSection />

      {/* Wheels Provision Section */}
      <WheelsProvisionSection />

      {/* Scroll to Top Button */}
      <ScrollToTopButton />
    </div>
  );
}
