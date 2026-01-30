import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useLanguage();
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navLinks = [
    { name: t.nav.home, href: "/" },
    { name: t.nav.business, href: "/business" },
    { name: t.nav.market, href: "/market" },
    { name: t.nav.flow, href: "/flow" },
    { name: t.nav.company, href: "/company" },
    { name: t.nav.contact, href: "/contact" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  return (
    <nav className="navbar">
      <div className="navbar__container">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-icon">NW</span>
          <span className="navbar__logo-text">Ndong World Wide Trading</span>
        </Link>

        {/* Desktop Navigation */}
        <ul className="navbar__links">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                to={link.href}
                className={`navbar__link ${isActive(link.href) ? "navbar__link--active" : ""}`}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Language Switcher */}
        <div className="navbar__actions">
          <LanguageSwitcher />
        </div>

        {/* Mobile Menu Button */}
        <button
          className="navbar__toggle"
          onClick={toggleMenu}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <span className={`navbar__toggle-bar ${isMenuOpen ? "open" : ""}`}></span>
          <span className={`navbar__toggle-bar ${isMenuOpen ? "open" : ""}`}></span>
          <span className={`navbar__toggle-bar ${isMenuOpen ? "open" : ""}`}></span>
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      <div className={`navbar__dropdown ${isMenuOpen ? "navbar__dropdown--open" : ""}`}>
        <ul className="navbar__dropdown-links">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                to={link.href}
                className={`navbar__dropdown-link ${isActive(link.href) ? "navbar__dropdown-link--active" : ""}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
