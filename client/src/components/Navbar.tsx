import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAdmin } = useAuth();
  const { t } = useLanguage();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navLinks = [
    { name: t.nav.home, href: "/" },
    { name: t.nav.market, href: "/market" },
    { name: t.nav.flow, href: "/flow" },
    { name: t.nav.company, href: "/company" },
    { name: t.nav.contact, href: "/contact" },
  ];

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
            <li key={link.name}>
              <Link to={link.href} className="navbar__link">
                {link.name}
              </Link>
            </li>
          ))}
          {isAdmin && (
            <li>
              <Link to="/admin" className="navbar__link navbar__link--admin">
                Admin
              </Link>
            </li>
          )}
        </ul>

        {/* Language Switcher and Contact / Login Button */}
        <div className="navbar__actions">
          <LanguageSwitcher />
          {isAdmin ? (
            <Link to="/admin" className="btn btn--primary navbar__contact">
              Dashboard
            </Link>
          ) : (
            <Link to="/login" className="btn btn--primary navbar__contact">
              Admin Login
            </Link>
          )}
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
            <li key={link.name}>
              <Link
                to={link.href}
                className="navbar__dropdown-link"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            </li>
          ))}
          <li>
            <Link
              to={isAdmin ? "/admin" : "/login"}
              className={`navbar__dropdown-link ${isAdmin ? "navbar__link--admin" : ""}`}
              onClick={() => setIsMenuOpen(false)}
            >
              {isAdmin ? "Admin Dashboard" : "Admin Login"}
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
