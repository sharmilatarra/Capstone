import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const { email, username, password } = form;

    // Email validation
    const emailRegex = /^[A-Za-z][A-Za-z0-9._%+-]*@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email))
      return "Enter a valid email (should not start with symbols)";

    // Username validation
    const userRegex = /^[A-Za-z0-9_]{4,15}$/;
    if (!userRegex.test(username))
      return "Username should be 4–15 chars (letters, numbers, underscores only)";

    // Password validation
    const passRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    if (!passRegex.test(password))
      return "Password must have 1 uppercase, 1 number, 1 special char, and min 8 chars";

    return "";
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const validationMsg = validateForm();
    if (validationMsg) {
      setMessage(validationMsg);
      return;
    }

    try {
      const res = await axios.post("http://localhost:3030/register", form);
      setMessage(res.data.message || "Registered successfully!");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <img src="14.png" alt="Coding Tracker" className="logo" />
        <h2>Create Your Account</h2>

        <form onSubmit={handleRegister}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button type="submit">Sign Up</button>
        </form>

        {message && <p className="msg">{message}</p>}

        <p className="switch-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
