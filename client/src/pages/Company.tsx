import { useLanguage } from "../context/LanguageContext";

export default function Company() {
  const { t } = useLanguage();

  return (
    <div className="company-page">
      {/* Hero Section with Image */}
      <div className="company-hero">
        <div
          className="company-hero__image"
          style={{ backgroundImage: `url(/assets/images/pic1.jpg)` }}
        />
        <div className="company-hero__overlay" />
        <div className="company-hero__content">
          <h1 className="company-hero__title">{t.company.title}</h1>
        </div>
      </div>

      {/* Company Info Section */}
      <div className="company-info">
        <h2 className="company-info__heading">{t.company.profileTitle}</h2>

        <div className="company-info__grid">
          <div className="company-info__item">
            <span className="company-info__label">{t.company.name}</span>
            <span className="company-info__value">Ndong World Wide Trading Ltd.</span>
          </div>

          <div className="company-info__item">
            <span className="company-info__label">{t.company.companyLocation}</span>
            <span className="company-info__value">{t.company.companyLocationValue}</span>
          </div>

          <div className="company-info__item">
            <span className="company-info__label">{t.company.companyOffice}</span>
            <span className="company-info__value">{t.company.companyOfficeValue}</span>
          </div>

          <div className="company-info__item">
            <span className="company-info__label">{t.company.established}</span>
            <span className="company-info__value">{t.company.establishedValue}</span>
          </div>

          <div className="company-info__item">
            <span className="company-info__label">{t.company.capital}</span>
            <span className="company-info__value">5,000,000 {t.company.yen}</span>
          </div>

          <div className="company-info__item">
            <span className="company-info__label">{t.company.representative}</span>
            <span className="company-info__value">{t.company.representativeValue}</span>
          </div>

          <div className="company-info__item">
            <span className="company-info__label">{t.company.businessDetails}</span>
            <span className="company-info__value">{t.company.businessDescription}</span>
          </div>

          <div className="company-info__item">
            <span className="company-info__label">{t.company.license}</span>
            <span className="company-info__value">{t.company.licenseDescription}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
