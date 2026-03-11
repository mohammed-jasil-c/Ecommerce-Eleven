import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCountUp, useScrollReveal, useSlideIn } from "../hooks/useGsap";

gsap.registerPlugin(ScrollTrigger);

const AboutPage = () => {
  const heroTitleRef = useRef(null);
  const heroSubRef = useRef(null);
  const storyLeftRef = useSlideIn("left", { duration: 0.8 });
  const storyRightRef = useSlideIn("right", { duration: 0.8 });
  const ctaRef = useScrollReveal({ y: 40 });

  // Stats
  const stat1Ref = useCountUp(50, { suffix: "+", start: "top 85%" });
  const stat2Ref = useCountUp(10000, { suffix: "+", start: "top 85%" });
  const stat3Ref = useCountUp(25, { suffix: "+", start: "top 85%" });
  const stat4Ref = useCountUp(98, { suffix: "%", start: "top 85%" });

  // Hero entrance animation
  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.3 });

    if (heroTitleRef.current) {
      const text = heroTitleRef.current.textContent;
      heroTitleRef.current.innerHTML = "";
      const chars = text.split("").map((ch) => {
        const span = document.createElement("span");
        span.textContent = ch === " " ? "\u00A0" : ch;
        span.style.display = "inline-block";
        heroTitleRef.current.appendChild(span);
        return span;
      });

      tl.fromTo(
        chars,
        { y: 80, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.05, ease: "power3.out" }
      );
    }

    if (heroSubRef.current) {
      tl.fromTo(
        heroSubRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
        "-=0.3"
      );
    }

    return () => tl.kill();
  }, []);

  const stats = [
    { ref: stat1Ref, label: "Collections" },
    { ref: stat2Ref, label: "Happy Customers" },
    { ref: stat3Ref, label: "Countries" },
    { ref: stat4Ref, label: "Satisfaction" },
  ];

  return (
    <div style={{ background: 'var(--color-white)' }}>

      {/* Hero */}
      <section
        style={{
          position: 'relative',
          height: '450px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)',
        }}
      >
        <div style={{ position: 'relative', textAlign: 'center', color: '#fff', padding: '0 1.5rem', zIndex: 1 }}>
          <p className="section-label mb-4" ref={heroSubRef} style={{ color: 'var(--color-accent)' }}>
            Our Heritage
          </p>
          <h1
            ref={heroTitleRef}
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              fontWeight: 400,
              letterSpacing: '0.15em',
              lineHeight: 1.1,
              perspective: '600px',
            }}
          >
            OUR STORY
          </h1>
          <div className="divider-gold" style={{ margin: '1.5rem auto 0' }} />
        </div>
      </section>

      {/* Brand Story */}
      <section style={{ padding: 'var(--section-padding) 1.5rem', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div ref={storyLeftRef}>
              <p className="section-label mb-4">Our Philosophy</p>
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(1.8rem, 3vw, 2.8rem)',
                  fontWeight: 400,
                  lineHeight: 1.2,
                  marginBottom: '1.5rem',
                }}
              >
                The Art of Craftsmanship
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: 1.8, marginBottom: '1.25rem' }}>
                Founded with a vision to redefine modern fashion, Eleven embodies the pinnacle
                of artistry and design. Each collection is a testament to our unwavering commitment
                to exceptional craftsmanship, innovative design, and timeless elegance.
              </p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: 1.8 }}>
                Our journey began with a simple vision: to create fashion that transcends
                trends and becomes part of your identity. Every stitch, every curve, every
                material is carefully considered to ensure unparalleled quality and comfort.
              </p>
            </div>
            <div ref={storyRightRef} style={{ position: 'relative' }}>
              <img
                src="https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80"
                alt="Craftsmanship"
                style={{
                  width: '100%',
                  height: '450px',
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-md)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '-1rem',
                  left: '-1rem',
                  width: '80px',
                  height: '80px',
                  background: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <span
                  style={{
                    color: 'var(--color-accent)',
                    fontSize: '0.55rem',
                    fontWeight: 600,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    textAlign: 'center',
                    fontFamily: 'var(--font-body)',
                    lineHeight: 1.4,
                  }}
                >
                  Since<br />2025
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section
        style={{
          padding: '4rem 1.5rem',
          background: 'var(--color-surface)',
        }}
      >
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
          style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}
        >
          {stats.map((stat, i) => (
            <div key={i}>
              <div
                ref={stat.ref}
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                  fontWeight: 400,
                  color: 'var(--color-accent)',
                  marginBottom: '0.5rem',
                }}
              >
                0
              </div>
              <p
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-muted)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: 'var(--section-padding) 1.5rem' }}>
        <div ref={ctaRef} style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <p className="section-label mb-4">Join Our Journey</p>
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
              fontWeight: 400,
              marginBottom: '1.25rem',
              lineHeight: 1.3,
            }}
          >
            Experience the Difference
          </h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', lineHeight: 1.7, fontSize: '0.95rem' }}>
            Discover the artistry, craftsmanship, and heritage behind every piece of Eleven fashion.
          </p>
          <Link
            to="/shop"
            className="btn-premium btn-primary"
            style={{ textDecoration: 'none', display: 'inline-flex', borderRadius: '0' }}
          >
            <span>Explore Collection</span>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
