import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";

function Login({ setToken }) {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState(""); // email or username
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      setMessage("Enter email/username and password");
      return;
    }

    try {
      const res = await axios.post("http://localhost:3030/login", {
        identifier,
        password
      });

      localStorage.setItem("token", res.data.token);
      if (setToken) setToken(res.data.token);

      navigate("/dashboard");
      setMessage(`Welcome ${res.data.user?.username || identifier}!`);
    } catch (err) {
      if (err.response?.status === 401) setMessage("Invalid password");
      else if (err.response?.status === 404) setMessage("User not found");
      else setMessage("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <img src="14.png" alt="Coding Tracker" className="logo" />
        <h2>Login</h2>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Email or Username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>

        {message && <p className="msg">{message}</p>}

        <p className="switch-text">
          Don’t have an account? <Link to="/register">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
