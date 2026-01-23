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
    // TODO: Send formData to server
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
        <div className="contact-form-wrapper">
          <div className="contact-form-card">
            <div className="contact-form-header">
              <div className="contact-form-header__icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <h2 className="contact-form-header__title">{t.contact.formTitle}</h2>
              <p className="contact-form-header__subtitle">{t.contact.requiredNote}</p>
            </div>

            <div className="contact-form-fields">
              {/* Name Field */}
              <div className="contact-field">
                <div className="contact-field__icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div className="contact-field__content">
                  <label className="contact-field__label">
                    {t.contact.name} <span className="contact-field__required">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`contact-field__input ${errors.name ? "error" : ""}`}
                    placeholder={t.contact.namePlaceholder}
                  />
                  {errors.name && (
                    <span className="contact-field__error">{errors.name}</span>
                  )}
                </div>
              </div>

              {/* Furigana Field */}
              <div className="contact-field">
                <div className="contact-field__icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3v18"/>
                    <path d="M18 9H6"/>
                    <path d="M16 3H8"/>
                  </svg>
                </div>
                <div className="contact-field__content">
                  <label className="contact-field__label">
                    {t.contact.furigana} <span className="contact-field__required">*</span>
                  </label>
                  <input
                    type="text"
                    name="furigana"
                    value={formData.furigana}
                    onChange={handleInputChange}
                    className={`contact-field__input ${errors.furigana ? "error" : ""}`}
                    placeholder={t.contact.furiganaPlaceholder}
                  />
                  {errors.furigana && (
                    <span className="contact-field__error">{errors.furigana}</span>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div className="contact-field">
                <div className="contact-field__icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                </div>
                <div className="contact-field__content">
                  <label className="contact-field__label">
                    {t.contact.email} <span className="contact-field__required">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`contact-field__input ${errors.email ? "error" : ""}`}
                    placeholder={t.contact.emailPlaceholder}
                  />
                  {errors.email && (
                    <span className="contact-field__error">{errors.email}</span>
                  )}
                </div>
              </div>

              {/* Phone Field */}
              <div className="contact-field">
                <div className="contact-field__icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </div>
                <div className="contact-field__content">
                  <label className="contact-field__label">
                    {t.contact.phone} <span className="contact-field__required">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`contact-field__input ${errors.phone ? "error" : ""}`}
                    placeholder={t.contact.phonePlaceholder}
                  />
                  {errors.phone && (
                    <span className="contact-field__error">{errors.phone}</span>
                  )}
                </div>
              </div>

              {/* Inquiry Details Field */}
              <div className="contact-field contact-field--full">
                <div className="contact-field__icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <div className="contact-field__content">
                  <label className="contact-field__label">
                    {t.contact.inquiryDetails}
                  </label>
                  <textarea
                    name="inquiryDetails"
                    value={formData.inquiryDetails}
                    onChange={handleInputChange}
                    className="contact-field__textarea"
                    placeholder={t.contact.inquiryPlaceholder}
                    rows={6}
                  />
                </div>
              </div>
            </div>

            <button className="contact-form-submit" onClick={handleNextStep}>
              <span>{t.contact.nextButton}</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </div>
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
