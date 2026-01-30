import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

export default function Footer() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const navLinks = [
    { name: t.nav.home, href: "/" },
    { name: t.nav.market, href: "/market" },
    { name: t.nav.business, href: "/business" },
    { name: t.nav.flow, href: "/flow" },
    { name: t.nav.company, href: "/company" },
  ];

  const scrollToSection = (sectionId: string) => {
    navigate("/");

    const attemptScroll = (retries = 10) => {
      const element = document.getElementById(sectionId);
      if (element) {
        const elementRect = element.getBoundingClientRect();
        const elementHeight = elementRect.height;
        const windowHeight = window.innerHeight;
        const elementTop = elementRect.top + window.scrollY;
        const scrollPosition = elementTop - (windowHeight / 2) + (elementHeight / 2);

        window.scrollTo({
          top: scrollPosition,
          behavior: "smooth"
        });

        // Add highlight class for animated underline
        element.classList.add("section-highlight");
        setTimeout(() => {
          element.classList.remove("section-highlight");
        }, 3000);
      } else if (retries > 0) {
        setTimeout(() => attemptScroll(retries - 1), 100);
      }
    };

    attemptScroll();
  };

  return (
    <footer className="footer">
      <div className="footer__container">
        {/* Company Info */}
        <div className="footer__company">
          <img
            src="/assets/images/companyLog1.png"
            alt="Ndong World Wide Trading"
            className="footer__logo"
          />
          <div className="footer__info">
            <p className="footer__address">
              {t.company.companyLocationValue}
            </p>
            <p className="footer__phone">
              <a href="tel:+817077746436" style={{ color: 'inherit', textDecoration: 'none' }}>
                +81 70-7774-6436
              </a> (English)
            </p>
            <p className="footer__phone">
              <a href="tel:+819080864799" style={{ color: 'inherit', textDecoration: 'none' }}>
                +81 90-8086-4799
              </a> (Japanese)
            </p>
            <p className="footer__email">
              <a href="mailto:info@ndongworldwide.com" style={{ color: 'inherit', textDecoration: 'none' }}>
                info@ndongworldwide.com
              </a>
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="footer__nav">
          <h3 className="footer__nav-title">{t.footer.quickLinks}</h3>
          <ul className="footer__links">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link to={link.href} className="footer__link">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Services */}
        <div className="footer__services">
          <h3 className="footer__nav-title">{t.footer.ourServices}</h3>
          <ul className="footer__links">
            <li><button onClick={() => scrollToSection("car-provision")} className="footer__link footer__link--btn">{t.carProvision.title}</button></li>
            <li><button onClick={() => scrollToSection("tyres-provision")} className="footer__link footer__link--btn">{t.tyresProvision.title}</button></li>
            <li><button onClick={() => scrollToSection("wheels-provision")} className="footer__link footer__link--btn">{t.wheelsProvision.title}</button></li>
            <li><button onClick={() => scrollToSection("mission")} className="footer__link footer__link--btn">{t.mission.title}</button></li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="footer__bottom">
        <p>&copy; {new Date().getFullYear()} {t.footer.copyright}</p>
      </div>
    </footer>
  );
}
