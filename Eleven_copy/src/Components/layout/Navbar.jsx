import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../features/auth/context/AuthContext";
import { useCart } from "../../features/cart/context/CartContext";
import { useWishlist } from "../../features/wishlist/components/WishList";
import {
  Heart,
  ShoppingBag,
  Menu,
  X,
  Search,
  User,
} from "lucide-react";
import ProfileModal from "../common/ProfileModal";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { user, logout } = useContext(AuthContext);
  const { cartItems, getCartCount } = useCart();
  const { getWishlistCount } = useWishlist();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    logout();
    setIsProfileModalOpen(false);
    navigate("/login");
  };

  const navigateToSection = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const cartCount =
    getCartCount?.() ||
    cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;
  const wishlistCount = getWishlistCount?.() || 0;

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          width: '100%',
          top: 0,
          zIndex: 50,
          background: '#fff',
          borderBottom: isScrolled ? '1px solid #e5e5e5' : '1px solid transparent',
          transition: 'border-color 0.2s ease',
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 clamp(1rem, 4vw, 2.5rem)' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              height: '60px',
            }}
          >
            {/* Left — Logo */}
            <Link
              to="/"
              style={{
                fontSize: '1.1rem',
                fontWeight: 500,
                letterSpacing: '0.25em',
                textDecoration: 'none',
                color: '#000',
                textTransform: 'uppercase',
              }}
            >
              ELEVEN
            </Link>

            {/* Center — Desktop Nav Links */}
            <div
              className="hidden lg:flex items-center"
              style={{ gap: '2.5rem' }}
            >
              {[
                { name: "New", path: "/shop?is_new=true" },
                { name: "Shop", path: "/shop" },
                { name: "About", path: "/about" },
                { name: "Contact", path: "/contact" },
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => navigateToSection(item.path)}
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 400,
                    fontFamily: 'inherit',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    color: '#000',
                    transition: 'opacity 0.15s ease',
                    padding: 0,
                  }}
                  onMouseEnter={(e) => (e.target.style.opacity = '0.5')}
                  onMouseLeave={(e) => (e.target.style.opacity = '1')}
                >
                  {item.name}
                </button>
              ))}
            </div>

            {/* Right — Actions */}
            <div className="flex items-center" style={{ gap: '1.25rem' }}>
              {/* Desktop only icons */}
              <button
                onClick={() => navigate("/shop")}
                className="hidden lg:flex"
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: '#000',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
                aria-label="Search"
              >
                <Search size={18} strokeWidth={1.5} />
              </button>

              <Link
                to="/wishlist"
                className="hidden lg:flex"
                style={{
                  position: 'relative',
                  color: '#000',
                  display: 'flex',
                  alignItems: 'center',
                }}
                aria-label="Wishlist"
              >
                <Heart size={18} strokeWidth={1.5} />
                {wishlistCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-8px',
                      fontSize: '0.55rem',
                      fontWeight: 600,
                      color: '#000',
                    }}
                  >
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                to="/cart"
                style={{
                  position: 'relative',
                  color: '#000',
                  display: 'flex',
                  alignItems: 'center',
                }}
                aria-label="Cart"
              >
                <ShoppingBag size={18} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-8px',
                      fontSize: '0.55rem',
                      fontWeight: 600,
                      color: '#000',
                    }}
                  >
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Desktop auth */}
              <div className="hidden lg:flex items-center" style={{ gap: '1rem' }}>
                {user ? (
                  <button
                    onClick={() => setIsProfileModalOpen(!isProfileModalOpen)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                      padding: 0,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.08)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(99,102,241,0.35)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    aria-label="Account"
                  >
                    <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 600, lineHeight: 1 }}>
                      {(user?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  </button>
                ) : (
                  <Link
                    to="/login"
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 400,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: '#000',
                      textDecoration: 'none',
                      transition: 'opacity 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.target.style.opacity = '0.5')}
                    onMouseLeave={(e) => (e.target.style.opacity = '1')}
                  >
                    Log in
                  </Link>
                )}
              </div>

              {/* Mobile hamburger */}
              <button
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: '#000',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
                aria-label="Menu"
              >
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu — clean white panel */}
        {isMobileMenuOpen && (
          <>
            <div
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.15)',
                zIndex: 55,
              }}
            />
            <div
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: '100%',
                maxWidth: '320px',
                background: '#fff',
                padding: '5rem 2rem 2rem',
                zIndex: 60,
                overflowY: 'auto',
                borderLeft: '1px solid #e5e5e5',
              }}
            >
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  position: 'absolute',
                  top: '1.25rem',
                  right: '1.25rem',
                  color: '#000',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <X size={20} />
              </button>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  { name: "Home", path: "/" },
                  { name: "New", path: "/shop?is_new=true" },
                  { name: "Shop", path: "/shop" },
                  { name: "About", path: "/about" },
                  { name: "Contact", path: "/contact" },
                  { name: "Wishlist", path: "/wishlist" },
                ].map((item) => (
                  <button
                    key={item.name}
                    onClick={() => navigateToSection(item.path)}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.875rem 0',
                      fontSize: '0.8rem',
                      fontWeight: 400,
                      fontFamily: 'inherit',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: '#000',
                      background: 'none',
                      border: 'none',
                      borderBottom: '1px solid #f0f0f0',
                      cursor: 'pointer',
                    }}
                  >
                    {item.name}
                  </button>
                ))}

                <div style={{ marginTop: '2rem' }}>
                  {user ? (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsProfileModalOpen(true);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.75rem 0',
                        fontFamily: 'inherit',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: '#000',
                        background: 'none',
                        border: '1px solid #000',
                        cursor: 'pointer',
                      }}
                    >
                      My Account
                    </button>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <Link
                        to="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        style={{
                          display: 'block',
                          textAlign: 'center',
                          padding: '0.75rem',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          color: '#000',
                          border: '1px solid #000',
                        }}
                      >
                        Log in
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setIsMobileMenuOpen(false)}
                        style={{
                          display: 'block',
                          textAlign: 'center',
                          padding: '0.75rem',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          color: '#fff',
                          background: '#000',
                        }}
                      >
                        Register
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </nav>

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onLogout={handleLogout}
      />
    </>
  );
};

export default Navbar;