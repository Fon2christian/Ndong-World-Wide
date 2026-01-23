import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";

type FormData = {
  name: string;
  furigana: string;
  email: string;
  phone: string;
  inquiryDetails: string;
};

export default function Contact() {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    furigana: "",
    email: "",
    phone: "",
    inquiryDetails: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<FormData> = {};
    if (!formData.name.trim()) newErrors.name = t.contact.errors.nameRequired;
    if (!formData.furigana.trim())
      newErrors.furigana = t.contact.errors.furiganaRequired;
    if (!formData.email.trim()) {
      newErrors.email = t.contact.errors.emailRequired;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.contact.errors.emailInvalid;
    }
    if (!formData.phone.trim()) newErrors.phone = t.contact.errors.phoneRequired;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateForm()) {
      setStep(2);
    }
  };

  const handleSubmit = () => {
    // Here you would typically send the data to a server
    console.log("Form submitted:", formData);
    setStep(3);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleNewInquiry = () => {
    setFormData({
      name: "",
      furigana: "",
      email: "",
      phone: "",
      inquiryDetails: "",
    });
    setStep(1);
  };

  return (
    <div className="contact-page">
      {/* Hero Section with Image */}
      <div className="contact-hero">
        <div
          className="contact-hero__image"
          style={{ backgroundImage: `url(/assets/images/pic2.jpg)` }}
        />
        <div className="contact-hero__overlay" />
        <div className="contact-hero__content">
          <h1 className="contact-hero__title">{t.contact.heroTitle}</h1>
          <p className="contact-hero__subtitle">{t.contact.heroSubtitle}</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="contact-progress">
        <div className={`contact-progress__step ${step >= 1 ? "active" : ""}`}>
          <div className="contact-progress__number">1</div>
          <span className="contact-progress__label">{t.contact.step1}</span>
        </div>
        <div className="contact-progress__line" />
        <div className={`contact-progress__step ${step >= 2 ? "active" : ""}`}>
          <div className="contact-progress__number">2</div>
          <span className="contact-progress__label">{t.contact.step2}</span>
        </div>
        <div className="contact-progress__line" />
        <div className={`contact-progress__step ${step >= 3 ? "active" : ""}`}>
          <div className="contact-progress__number">3</div>
          <span className="contact-progress__label">{t.contact.step3}</span>
        </div>
      </div>

      {/* Step 1: Enter Information */}
      {step === 1 && (
        <div className="contact-form">
          <h2 className="contact-form__title">{t.contact.formTitle}</h2>
          <p className="contact-form__required-note">{t.contact.requiredNote}</p>

          <div className="contact-form__group">
            <label className="contact-form__label">
              <span className="contact-form__required">*</span> {t.contact.name}
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`contact-form__input ${errors.name ? "error" : ""}`}
              placeholder={t.contact.namePlaceholder}
            />
            {errors.name && (
              <span className="contact-form__error">{errors.name}</span>
            )}
          </div>

          <div className="contact-form__group">
            <label className="contact-form__label">
              <span className="contact-form__required">*</span> {t.contact.furigana}
            </label>
            <input
              type="text"
              name="furigana"
              value={formData.furigana}
              onChange={handleInputChange}
              className={`contact-form__input ${errors.furigana ? "error" : ""}`}
              placeholder={t.contact.furiganaPlaceholder}
            />
            {errors.furigana && (
              <span className="contact-form__error">{errors.furigana}</span>
            )}
          </div>

          <div className="contact-form__group">
            <label className="contact-form__label">
              <span className="contact-form__required">*</span> {t.contact.email}
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`contact-form__input ${errors.email ? "error" : ""}`}
              placeholder={t.contact.emailPlaceholder}
            />
            {errors.email && (
              <span className="contact-form__error">{errors.email}</span>
            )}
          </div>

          <div className="contact-form__group">
            <label className="contact-form__label">
              <span className="contact-form__required">*</span> {t.contact.phone}
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={`contact-form__input ${errors.phone ? "error" : ""}`}
              placeholder={t.contact.phonePlaceholder}
            />
            {errors.phone && (
              <span className="contact-form__error">{errors.phone}</span>
            )}
          </div>

          <div className="contact-form__group">
            <label className="contact-form__label">{t.contact.inquiryDetails}</label>
            <textarea
              name="inquiryDetails"
              value={formData.inquiryDetails}
              onChange={handleInputChange}
              className="contact-form__textarea"
              placeholder={t.contact.inquiryPlaceholder}
              rows={5}
            />
          </div>

          <button className="contact-form__button" onClick={handleNextStep}>
            {t.contact.nextButton}
          </button>
        </div>
      )}

      {/* Step 2: Confirm Contents */}
      {step === 2 && (
        <div className="contact-confirm">
          <h2 className="contact-confirm__title">{t.contact.confirmTitle}</h2>
          <p className="contact-confirm__subtitle">{t.contact.confirmSubtitle}</p>

          <div className="contact-confirm__details">
            <div className="contact-confirm__item">
              <span className="contact-confirm__label">{t.contact.name}</span>
              <span className="contact-confirm__value">{formData.name}</span>
            </div>
            <div className="contact-confirm__item">
              <span className="contact-confirm__label">{t.contact.furigana}</span>
              <span className="contact-confirm__value">{formData.furigana}</span>
            </div>
            <div className="contact-confirm__item">
              <span className="contact-confirm__label">{t.contact.email}</span>
              <span className="contact-confirm__value">{formData.email}</span>
            </div>
            <div className="contact-confirm__item">
              <span className="contact-confirm__label">{t.contact.phone}</span>
              <span className="contact-confirm__value">{formData.phone}</span>
            </div>
            <div className="contact-confirm__item">
              <span className="contact-confirm__label">{t.contact.inquiryDetails}</span>
              <span className="contact-confirm__value">
                {formData.inquiryDetails || "-"}
              </span>
            </div>
          </div>

          <div className="contact-confirm__buttons">
            <button className="contact-confirm__button--back" onClick={handleBack}>
              {t.contact.backButton}
            </button>
            <button className="contact-confirm__button--submit" onClick={handleSubmit}>
              {t.contact.submitButton}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Submission Complete */}
      {step === 3 && (
        <div className="contact-complete">
          <div className="contact-complete__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h2 className="contact-complete__title">{t.contact.completeTitle}</h2>
          <p className="contact-complete__message">{t.contact.completeMessage}</p>
          <button className="contact-complete__button" onClick={handleNewInquiry}>
            {t.contact.newInquiryButton}
          </button>
        </div>
      )}
    </div>
  );
}
