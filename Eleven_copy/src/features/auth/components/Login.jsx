
import React, { useState, useContext, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import gsap from "gsap";
import api from "../../../api/apiService";
import { AuthContext } from "../context/AuthContext";
import { toast } from "sonner";

const Login = () => {
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const cardRef = useRef(null);

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
    setLoading(true);

    try {
      const response = await api.post("/auth/login/", {
        email: formData.email,
        password: formData.password,
      });

      const accessToken = response.data.access;
      const refreshToken = response.data.refresh;

      localStorage.setItem("access", accessToken);
      localStorage.setItem("refresh", refreshToken);

      const userResponse = await api.get("/auth/profile/");
      const user = userResponse.data;

      login(user);

      toast.success(`👋 Welcome back, ${user.email}!`);
      if (user.role?.toLowerCase() === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.error || "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleLoading(true);
    try {
      const response = await api.post("/auth/google/", {
        credential: credentialResponse.credential,
      });

      const accessToken = response.data.access;
      const refreshToken = response.data.refresh;

      localStorage.setItem("access", accessToken);
      localStorage.setItem("refresh", refreshToken);

      const userResponse = await api.get("/auth/profile/");
      const user = userResponse.data;

      login(user);

      toast.success(`👋 Welcome, ${user.full_name || user.email}!`);
      if (user.role?.toLowerCase() === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (error) {
      console.error("Google login error:", error);
      toast.error(
        error.response?.data?.error || "Google login failed. Please try again."
      );
    } finally {
      setGoogleLoading(false);
    }
  };

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
          padding: '3rem 2.5rem',
          opacity: 0,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
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
              fontSize: '1.6rem',
              fontWeight: 400,
              color: 'var(--color-text)',
              marginBottom: '0.5rem',
            }}
          >
            Welcome Back
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            Log in to continue to your account.
          </p>
        </div>

        {/* Google Sign-In Button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => toast.error("Google login failed")}
            theme="filled_black"
            shape="rectangular"
            size="large"
            width="340"
            text="signin_with"
          />
        </div>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 500,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
          }}>
            or
          </span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
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
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="input-premium"
              placeholder="you@example.com"
            />
          </div>

          <div>
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
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="input-premium"
              placeholder="••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="btn-premium btn-primary"
            style={{
              width: '100%',
              borderRadius: 'var(--radius-sm)',
              marginTop: '0.5rem',
              opacity: loading ? 0.7 : 1,
            }}
          >
            <span>{loading ? "Logging in..." : "Log In"}</span>
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
          Don't have an account?{" "}
          <Link
            to="/register"
            style={{
              color: 'var(--color-accent)',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;