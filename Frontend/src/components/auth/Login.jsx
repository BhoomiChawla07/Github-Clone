import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../authContext";
import "./auth.css";
import logo from "../../assets/github-mark-white.svg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("https://github-clone-scsa.onrender.com/login", {
        email: email.trim(),
        password: password.trim(),
      });

      const userId = res?.data?.userId;
      if (userId) {
        login(userId, res.data.token);
      }

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-logo-container">
        <div className="logo-content">
          <img className="logo-login" src={logo} alt="Logo" />
          <h1 className="logo-title">Welcome to GitHub</h1>
          <p className="logo-subtext">Build amazing things with your team.</p>
        </div>
      </div>

      <div className="login-box-wrapper">
        <div className="login-heading">
          <h2>Sign in to your account</h2>
          <p className="subtext">Enter your email and password to continue.</p>
        </div>

        <div className="login-box">
          {error && <div className="error-banner">{error}</div>}

          <form className="signup-form" onSubmit={handleLogin}>
            <div>
              <label className="label" htmlFor="Email">
                Email address
              </label>
              <input
                autoComplete="off"
                name="Email"
                id="Email"
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="div">
              <label className="label" htmlFor="Password">
                Password
              </label>
              <input
                autoComplete="off"
                name="Password"
                id="Password"
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button className="submit-btn" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <div className="pass-box">
          <p>
            New to GitHub? <span className="signup" onClick={() => navigate("/signup")}>Create an account</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
