import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { Mail, Phone, MessageSquare, MapPin, Send, Check } from "lucide-react";

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const heroTitleRef = useRef(null);
  const formRef = useRef(null);
  const infoRef = useRef(null);

  // GSAP entrance
  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.3 });

    if (heroTitleRef.current) {
      tl.fromTo(
        heroTitleRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
      );
    }

    if (infoRef.current) {
      const items = infoRef.current.querySelectorAll(".contact-item");
      tl.fromTo(
        items,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power3.out" },
        "-=0.3"
      );
    }

    if (formRef.current) {
      tl.fromTo(
        formRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
        "-=0.4"
      );
    }

    return () => tl.kill();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Contact form submitted:", formData);
      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  const contactMethods = [
    { icon: <Mail size={18} />, title: "Email", line1: "support@eleven.com", line2: "We'll respond within 24 hours" },
    { icon: <Phone size={18} />, title: "Phone", line1: "+1 (555) 123-4567", line2: "Mon-Fri from 9am to 6pm" },
    { icon: <MessageSquare size={18} />, title: "Live Chat", line1: "Available 24/7", line2: "Instant support for urgent issues" },
    { icon: <MapPin size={18} />, title: "Store", line1: "123 Fashion Avenue", line2: "New York, NY 10001" },
  ];

  return (
    <div style={{ background: "var(--color-white)", minHeight: "100vh" }}>
      {/* Hero */}
      <section className="page-hero">
        <div className="hero-inner" style={{ textAlign: "center" }}>
          <p className="section-label" style={{ color: "var(--color-accent)", marginBottom: "0.75rem" }}>
            Get in Touch
          </p>
          <h1 ref={heroTitleRef}>Contact Us</h1>
          <div className="divider-gold" style={{ margin: "1.25rem auto 0" }} />
        </div>
      </section>

      {/* Content */}
      <div className="page-section">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* LEFT — Contact Info */}
          <div ref={infoRef}>
            <h2
              className="contact-item"
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.6rem",
                fontWeight: 400,
                marginBottom: "0.75rem",
              }}
            >
              We're Here to Help
            </h2>
            <p
              className="contact-item"
              style={{
                color: "var(--color-text-muted)",
                lineHeight: 1.7,
                fontSize: "0.9rem",
                marginBottom: "2.5rem",
              }}
            >
              Have questions about our products, orders, or need assistance?
              Our customer support team is ready to help you.
            </p>

            {/* Contact Methods */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem", marginBottom: "2.5rem" }}>
              {contactMethods.map((method) => (
                <div key={method.title} className="contact-item" style={{ display: "flex", gap: "1rem", alignItems: "start" }}>
                  <div className="contact-icon">{method.icon}</div>
                  <div>
                    <h3
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        marginBottom: "0.25rem",
                      }}
                    >
                      {method.title}
                    </h3>
                    <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", lineHeight: 1.5 }}>
                      {method.line1}
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "var(--color-text-light)" }}>{method.line2}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Business Hours */}
            <div
              className="contact-item premium-card"
              style={{ padding: "1.5rem" }}
            >
              <h3
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--color-accent)",
                  marginBottom: "1rem",
                }}
              >
                Business Hours
              </h3>
              {[
                ["Monday - Friday", "9:00 AM - 8:00 PM"],
                ["Saturday", "10:00 AM - 6:00 PM"],
                ["Sunday", "11:00 AM - 5:00 PM"],
              ].map(([day, hours]) => (
                <div
                  key={day}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.8rem",
                    padding: "0.5rem 0",
                    borderBottom: "1px solid var(--color-border)",
                  }}
                >
                  <span style={{ color: "var(--color-text-muted)" }}>{day}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontWeight: 500, fontSize: "0.75rem" }}>{hours}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Form */}
          <div
            ref={formRef}
            className="glass-light"
            style={{ padding: "2.5rem", borderRadius: "var(--radius-lg)" }}
          >
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.4rem",
                fontWeight: 400,
                marginBottom: "2rem",
              }}
            >
              Send us a Message
            </h2>

            {submitted ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    margin: "0 auto 1.5rem",
                    borderRadius: "50%",
                    background: "rgba(34,197,94,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Check size={28} style={{ color: "var(--color-success)" }} />
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "1.3rem",
                    fontWeight: 400,
                    marginBottom: "0.5rem",
                  }}
                >
                  Message Sent!
                </h3>
                <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem", fontSize: "0.9rem" }}>
                  Thank you for reaching out. We'll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="btn-premium btn-primary"
                  style={{ borderRadius: "var(--radius-sm)" }}
                >
                  <span>Send Another Message</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontFamily: "var(--font-body)",
                        fontSize: "0.65rem",
                        fontWeight: 600,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "var(--color-text-muted)",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="input-premium"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontFamily: "var(--font-body)",
                        fontSize: "0.65rem",
                        fontWeight: 600,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "var(--color-text-muted)",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="input-premium"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontFamily: "var(--font-body)",
                      fontSize: "0.65rem",
                      fontWeight: 600,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "var(--color-text-muted)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Subject *
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="input-premium"
                    style={{ cursor: "pointer" }}
                  >
                    <option value="">Select a topic</option>
                    <option value="order-issue">Order Issue</option>
                    <option value="product-question">Product Question</option>
                    <option value="shipping">Shipping & Delivery</option>
                    <option value="returns">Returns & Exchanges</option>
                    <option value="wholesale">Wholesale Inquiry</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontFamily: "var(--font-body)",
                      fontSize: "0.65rem",
                      fontWeight: 600,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "var(--color-text-muted)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    className="input-premium"
                    placeholder="Tell us how we can help you..."
                    style={{ resize: "none" }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-premium btn-primary"
                  style={{
                    width: "100%",
                    borderRadius: "var(--radius-sm)",
                    marginTop: "0.5rem",
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                    {loading ? (
                      <>
                        <div
                          style={{
                            width: "14px",
                            height: "14px",
                            border: "2px solid rgba(255,255,255,0.3)",
                            borderTopColor: "#fff",
                            borderRadius: "50%",
                            animation: "spin 1s linear infinite",
                          }}
                        />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={13} /> Send Message
                      </>
                    )}
                  </span>
                </button>

                <p style={{ fontSize: "0.7rem", color: "var(--color-text-light)", textAlign: "center" }}>
                  By contacting us, you agree to our Privacy Policy and Terms of Service
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
