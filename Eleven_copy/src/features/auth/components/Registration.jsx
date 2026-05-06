import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import gsap from "gsap";
import api from "../../../api/apiService";
import { toast } from "sonner";

const Registration = () => {
  const navigate = useNavigate();
  const cardRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 40, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "power3.out", delay: 0.1 }
      );
    }
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/register/", {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
      });

      toast.success("Registration successful! Please login.");
      navigate("/login");
    } catch (error) {
      console.error(error);
      if (error.response?.data) {
        const errors = error.response.data;
        const firstError =
          Object.values(errors)[0]?.[0] || "Registration failed";
        toast.error(firstError);
      } else {
        toast.error("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: "fullName", label: "Full Name", type: "text", placeholder: "Enter Your Name" },
    { name: "email", label: "Email Address", type: "email", placeholder: "you@example.com" },
    { name: "password", label: "Password", type: "password", placeholder: "••••••", minLength: 6 },
    { name: "confirmPassword", label: "Confirm Password", type: "password", placeholder: "••••••" },
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 40%, #16213e 70%, #0a0a0a 100%)',
      }}
    >
      <div
  ref={cardRef}
  className="glass-light"
  style={{
    maxWidth: '420px',
    width: '100%',
    borderRadius: 'var(--radius-lg)',
    padding: 'clamp(1.5rem,4vw,2.5rem)',
    opacity: 0,
  }}
>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link
            to="/"
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.8rem',
              fontWeight: 400,
              letterSpacing: '0.15em',
              color: 'var(--color-text)',
              textDecoration: 'none',
              display: 'block',
              marginBottom: '0.5rem',
            }}
          >
            ELEVEN
          </Link>
          <div className="divider-gold" style={{ margin: '1rem auto' }} />
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.5rem',
              fontWeight: 400,
              color: 'var(--color-text)',
              marginBottom: '0.5rem',
            }}
          >
            Create Your Account
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            Join us and discover premium fashion.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {fields.map((field) => (
            <div key={field.name}>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-muted)',
                  marginBottom: '0.5rem',
                }}
              >
                {field.label}
              </label>
              <input
                type={field.type}
                name={field.name}
                required
                minLength={field.minLength}
                value={formData[field.name]}
                onChange={handleChange}
                className="input-premium"
                placeholder={field.placeholder}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="btn-premium btn-primary"
            style={{
              width: '100%',
              borderRadius: 'var(--radius-sm)',
              marginTop: '0.5rem',
              opacity: loading ? 0.7 : 1,
            }}
          >
            <span>{loading ? "Creating Account..." : "Sign Up"}</span>
          </button>
        </form>

        <p
          style={{
            marginTop: '2rem',
            textAlign: 'center',
            fontSize: '0.85rem',
            color: 'var(--color-text-muted)',
          }}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            style={{
              color: 'var(--color-accent)',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Registration;