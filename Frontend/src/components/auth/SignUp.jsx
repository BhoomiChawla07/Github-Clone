
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../authContext";
import "./auth.css";
import logo from "../../assets/github-mark-white.svg";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !email.trim() || !password.trim()) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("https://github-clone-scsa.onrender.com/signup", {
        username: username.trim(),
        email: email.trim(),
        password: password.trim(),
      });

      const userId = res?.data?.userId || res?.data?._id;
      if (userId) {
        localStorage.setItem("userID", userId);
        setCurrentUser(userId);
      }

      navigate("/auth");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Signup failed. Please try again.");
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
          <h2>Create your account</h2>
          <p className="subtext">Join GitHub and start building.</p>
        </div>

        <div className="login-box">
          {error && <div className="error-banner">{error}</div>}

          <form className="signup-form" onSubmit={handleSignup}>
            <div>
              <label className="label" htmlFor="Username">
                Username
              </label>
              <input
                autoComplete="off"
                name="Username"
                id="Username"
                className="input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

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
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
        </div>

        <div className="pass-box">
          <p>
            Already have an account? <span className="signup" onClick={() => navigate("/auth")}>Login</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;