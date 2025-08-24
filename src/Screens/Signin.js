import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider
} from "firebase/auth";
import { auth } from "../Firebase/firebase";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  const handleSignin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignin = async () => {
    try {
      await signInWithPopup(auth, provider);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Welcome Back!</h2>
        <p style={styles.subtitle}>Sign in to continue</p>

        <form onSubmit={handleSignin} style={styles.form}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />

          <div style={styles.passwordWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.passwordInput}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={styles.toggle}
            >
              {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </span>
          </div>

          <button type="submit" style={styles.button}>
            Sign In
          </button>
        </form>

        <div style={styles.or}>OR</div>

        <button onClick={handleGoogleSignin} style={styles.googleButton}>
          <FcGoogle size={20} style={{ marginRight: "10px" }} />
          Continue with Google
        </button>

        {error && <p style={styles.error}>{error}</p>}

        <p style={styles.signupText}>
          Don’t have an account? <a href="/signup" style={styles.signupLink}>Sign Up</a>
        </p>
      </div>
    </div>
  );
};

const styles = {
  page: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    background: "white",
    padding: "40px",
    borderRadius: "15px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    textAlign: "center",
    width: "350px",
  },
  title: { margin: 0, fontSize: "28px", fontWeight: "bold", color: "#333" },
  subtitle: { margin: "10px 0 20px", color: "#666", fontSize: "14px" },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px",
    outline: "none",
    transition: "0.3s",
  },
  passwordWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  passwordInput: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px",
    outline: "none",
    flex: 1,
  },
  toggle: {
    position: "absolute",
    right: "10px",
    cursor: "pointer",
    fontSize: "20px",
    color: "#2575fc",
    userSelect: "none",
  },
  button: {
    padding: "12px",
    background: "linear-gradient(90deg, #6a11cb, #2575fc)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "0.3s",
  },
  googleButton: {
    marginTop: "15px",
    padding: "12px",
    background: "white",
    color: "#444",
    border: "1px solid #ccc",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "bold",
    width: "100%",
    transition: "0.3s",
  },
  or: {
    margin: "20px 0",
    fontWeight: "bold",
    color: "#aaa",
  },
  error: { color: "red", marginTop: "10px" },
  signupText: { marginTop: "20px", fontSize: "14px", color: "#555" },
  signupLink: { color: "#2575fc", fontWeight: "bold", textDecoration: "none" },
};

export default Signin;
