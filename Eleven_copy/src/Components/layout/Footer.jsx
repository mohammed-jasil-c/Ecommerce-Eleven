import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer
      style={{
        borderTop: '1px solid #e5e5e5',
        background: '#fff',
        color: '#000',
      }}
    >
      {/* Main Footer */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '3.5rem clamp(1rem, 4vw, 2.5rem) 2.5rem' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">

          {/* Brand */}
          <div>
            <Link
              to="/"
              style={{
                fontSize: '1.1rem',
                fontWeight: 500,
                letterSpacing: '0.25em',
                color: '#000',
                textDecoration: 'none',
                display: 'block',
                marginBottom: '1rem',
                textTransform: 'uppercase',
              }}
            >
              ELEVEN
            </Link>
            <p style={{
              color: '#999',
              fontSize: '0.8rem',
              lineHeight: 1.7,
            }}>
              Contemporary fashion for the modern individual.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 style={{
              fontSize: '0.65rem',
              fontWeight: 500,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#000',
              marginBottom: '1.25rem',
            }}>
              Shop
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[
                { name: 'All Products', path: '/shop' },
                { name: 'New Arrivals', path: '/shop?filter=new' },
                { name: 'Featured', path: '/shop?filter=featured' },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    style={{
                      color: '#999',
                      fontSize: '0.8rem',
                      textDecoration: 'none',
                      transition: 'color 0.15s ease',
                    }}
                    onMouseEnter={(e) => { e.target.style.color = '#000'; }}
                    onMouseLeave={(e) => { e.target.style.color = '#999'; }}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 style={{
              fontSize: '0.65rem',
              fontWeight: 500,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#000',
              marginBottom: '1.25rem',
            }}>
              Help
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[
                { name: 'Contact Us', path: '/contact' },
                { name: 'Track Order', path: '/track-order' },
                { name: 'About Us', path: '/about' },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    style={{
                      color: '#999',
                      fontSize: '0.8rem',
                      textDecoration: 'none',
                      transition: 'color 0.15s ease',
                    }}
                    onMouseEnter={(e) => { e.target.style.color = '#000'; }}
                    onMouseLeave={(e) => { e.target.style.color = '#999'; }}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 style={{
              fontSize: '0.65rem',
              fontWeight: 500,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#000',
              marginBottom: '1.25rem',
            }}>
              Company
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[
                { name: 'Careers', path: '#' },
                { name: 'Privacy Policy', path: '#' },
                { name: 'Terms of Use', path: '#' },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    style={{
                      color: '#999',
                      fontSize: '0.8rem',
                      textDecoration: 'none',
                      transition: 'color 0.15s ease',
                    }}
                    onMouseEnter={(e) => { e.target.style.color = '#000'; }}
                    onMouseLeave={(e) => { e.target.style.color = '#999'; }}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{ borderTop: '1px solid #f0f0f0' }}>
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '1.25rem clamp(1rem, 4vw, 2.5rem)',
          }}
        >
          <p style={{ color: '#ccc', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
            © {new Date().getFullYear()} ELEVEN. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;