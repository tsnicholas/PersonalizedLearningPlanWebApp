import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ApiClient } from "../../hooks/ApiClient";
import { useUser } from "../../hooks/useUser";
import "./login.css";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { addUser } = useUser();
  const { post } = ApiClient();
  const buttonDisabled = email === "" || password === "";

  async function handleLogin(email, password) {
    try {
      const response = await post("/login", {email, password});
      addUser({email, accessToken: response.accessToken, refreshToken: response.refreshToken});
      // Redirects if user came from another page.
      (location.state?.from) ? navigate(location.state.from) : navigate("/LearningPlan");
    } catch (error) {
      console.error(error.message);
      alert(error.message);
    }
  }

  return (
    <div className="parent-div">
      <div className="login-container">
        <div className="login-header">
          <h1>Login</h1>
        </div>
        <div className="login-form">
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(input) => setEmail(input.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(input) => setPassword(input.target.value)}
          />
          <button
            onClick={() => {
              handleLogin(email, password);
            }}
            disabled={buttonDisabled}
          >
            Login
          </button>
        </div>
      </div>
      <div className="register-footer">
        <p>Don't have an account?</p>
        <Link to="/register" className="register-link">
          <p>Register here</p>
        </Link>
      </div>
    </div>
  );
};

export default LoginScreen;
