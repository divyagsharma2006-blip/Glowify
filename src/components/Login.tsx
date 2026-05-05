import { useState } from "react";
import { useRef } from "react";
import { supabase } from "../lib/supabaseClient";

interface LoginProps {
  onLogin: () => void;
  onSignupStart: () => void;
  onSignupComplete: () => void;
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --teal: #5fb3a2;
    --teal-dark: #4a9a8b;
    --teal-light: #8fcec3;
    --teal-pale: #d6eeeb;
    --bg: #fafaf7;
    --charcoal: #2e2e2e;
    --charcoal-muted: #6b6b6b;
    --accent: #6c8ebf;
    --accent-light: #a8bfdf;
    --white: #ffffff;
    --shadow: 0 20px 60px rgba(95,179,162,0.15), 0 4px 16px rgba(0,0,0,0.08);
  }

  html, body, #root {
    height: 100%;
    width: 100%;
    background: var(--bg);
    font-family: 'DM Sans', sans-serif;
    overflow-x: hidden;
  }

  .login-wrapper {
    width: 100%;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg);
    position: relative;
    overflow: hidden;
    padding: 40px 20px;
  }

  /* Floating ambient blobs */
  .blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.35;
    animation: floatBlob 8s ease-in-out infinite;
    pointer-events: none;
  }
  .blob-1 {
    width: 420px; height: 420px;
    background: radial-gradient(circle, var(--teal-light), transparent 70%);
    top: -100px; left: -100px;
    animation-delay: 0s;
  }
  .blob-2 {
    width: 320px; height: 320px;
    background: radial-gradient(circle, var(--accent-light), transparent 70%);
    bottom: -80px; right: -60px;
    animation-delay: -3s;
  }
  .blob-3 {
    width: 200px; height: 200px;
    background: radial-gradient(circle, var(--teal-pale), transparent 70%);
    top: 60%; left: 10%;
    animation-delay: -5s;
  }

  @keyframes floatBlob {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(20px, -20px) scale(1.05); }
    66% { transform: translate(-15px, 15px) scale(0.97); }
  }

  /* Card */
  .login-card {
    display: flex;
    width: min(95vw, 1120px);
    max-width: 1120px;
    min-height: 680px;
    max-height: min(90vh, 760px);
    border-radius: 42px;
    overflow: hidden;
    background: linear-gradient(180deg, rgba(255,255,255,0.95), rgba(245,245,247,0.95));
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.6), 0 32px 120px rgba(25, 95, 90, 0.18);
    position: relative;
    z-index: 1;
    animation: cardReveal 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
    backdrop-filter: blur(12px);
  }

  @keyframes cardReveal {
    from { opacity: 0; transform: translateY(40px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* Left panel */
  .left-panel {
    width: 58%;
    background: radial-gradient(circle at top left, rgba(111, 179, 156, 0.95), rgba(94, 163, 145, 0.95) 35%, rgba(62, 128, 112, 0.98) 75%);
    padding: 56px 52px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
    animation: leftPanelGlow 12s ease-in-out infinite;
    background-size: 220% 220%;
    border-top-left-radius: 42px;
    border-bottom-left-radius: 42px;
  }

  .left-panel::before {
    content: '';
    position: absolute;
    width: 360px; height: 360px;
    background: rgba(255,255,255,0.14);
    border-radius: 50%;
    top: -100px; right: -100px;
    filter: blur(26px);
    animation: pulseSoft 6s ease-in-out infinite;
  }
  .left-panel::after {
    content: '';
    position: absolute;
    width: 260px; height: 260px;
    background: rgba(255,255,255,0.08);
    border-radius: 50%;
    bottom: -70px; left: -60px;
    filter: blur(18px);
    animation: pulseSoft 6s ease-in-out infinite reverse;
  }

  @keyframes pulseSoft {
    0%, 100% { transform: scale(1); opacity: 0.6; }
    50% { transform: scale(1.12); opacity: 1; }
  }

  /* Wavy decorative shape */
  .wave-shape {
    position: absolute;
    bottom: 60px; right: -30px;
    width: 220px; height: 220px;
    background: rgba(255,255,255,0.12);
    border-radius: 60% 40% 70% 30% / 50% 60% 40% 60%;
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.25);
    animation: morphBlob 7s ease-in-out infinite;
  }
  @keyframes morphBlob {
    0%, 100% { border-radius: 60% 40% 70% 30% / 50% 60% 40% 60%; transform: rotate(0deg); }
    50% { border-radius: 40% 60% 30% 70% / 60% 40% 60% 40%; transform: rotate(15deg); }
  }

  @keyframes leftPanelGlow {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }

  .floating-shapes {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .floating-dot {
    position: absolute;
    border-radius: 50%;
    background: rgba(255,255,255,0.14);
    box-shadow: 0 0 22px rgba(255,255,255,0.22);
    backdrop-filter: blur(12px);
    animation: floatDot 8s ease-in-out infinite;
  }

  .floating-dot-1 {
    width: 80px;
    height: 80px;
    top: 18%;
    left: 20%;
    animation-delay: 0s;
  }

  .floating-dot-2 {
    width: 120px;
    height: 120px;
    bottom: 24%;
    right: 16%;
    animation-delay: 2s;
    background: rgba(255,255,255,0.1);
  }

  .floating-dot-3 {
    width: 40px;
    height: 40px;
    top: 38%;
    right: 24%;
    animation-delay: 1.2s;
    background: rgba(255,255,255,0.24);
  }

  @keyframes floatDot {
    0%, 100% { transform: translateY(0) scale(1); opacity: 0.9; }
    50% { transform: translateY(-18px) scale(1.05); opacity: 1; }
  }

  .logo-mark {
    width: 42px; height: 42px;
    background: rgba(255,255,255,0.2);
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    backdrop-filter: blur(4px);
    border: 1.5px solid rgba(255,255,255,0.3);
    animation: fadeSlideDown 0.6s 0.2s cubic-bezier(0.22,1,0.36,1) both;
  }
  .logo-mark svg { width: 22px; height: 22px; fill: white; }

  .panel-headline {
    position: relative; z-index: 2;
    animation: fadeSlideUp 0.7s 0.4s cubic-bezier(0.22,1,0.36,1) both;
  }
  .panel-headline h2 {
    font-family: 'DM Serif Display', serif;
    font-size: 44px;
    line-height: 1.1;
    color: white;
    letter-spacing: -0.5px;
  }
  .panel-headline h2 em {
    font-style: italic;
    color: rgba(255,255,255,0.75);
  }
  .panel-tagline {
    margin-top: 14px;
    font-size: 14px;
    color: rgba(255,255,255,0.65);
    line-height: 1.6;
    font-weight: 300;
  }

  /* Dots decoration */
  .dots-grid {
    position: absolute;
    bottom: 32px; left: 36px;
    display: grid;
    grid-template-columns: repeat(5, 8px);
    gap: 6px;
    opacity: 0.25;
    z-index: 1;
  }
  .dots-grid span {
    width: 4px; height: 4px;
    background: white;
    border-radius: 50%;
    display: block;
    animation: dotPop 2s ease-in-out infinite;
  }
  .dots-grid span:nth-child(odd) { animation-delay: 0.3s; }

  @keyframes dotPop {
    0%, 100% { transform: scale(1); opacity: 0.4; }
    50% { transform: scale(1.5); opacity: 1; }
  }

  /* Right form panel */
  .right-panel {
    width: 42%;
    min-width: 420px;
    padding: 52px 48px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background: rgba(255,255,255,0.82);
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.8), 0 20px 60px rgba(20, 45, 56, 0.08);
    backdrop-filter: blur(18px);
    position: relative;
    min-height: 100%;
    overflow: hidden;
    border-top-right-radius: 42px;
    border-bottom-right-radius: 42px;
  }

  .form-header {
    margin-bottom: 28px;
    animation: fadeSlideDown 0.6s 0.3s cubic-bezier(0.22,1,0.36,1) both;
  }
  .form-header h1 {
    font-family: 'DM Serif Display', serif;
    font-size: 34px;
    color: var(--charcoal);
    letter-spacing: -0.5px;
  }
  .form-header p {
    margin-top: 8px;
    font-size: 14px;
    color: var(--charcoal-muted);
    font-weight: 300;
    line-height: 1.5;
  }

  /* Toggle Buttons */
  .toggle-buttons {
    display: flex;
    gap: 12px;
    margin-bottom: 28px;
    background: rgba(255,255,255,0.65);
    backdrop-filter: blur(16px);
    padding: 10px;
    border-radius: 22px;
    box-shadow: inset 0 1px 2px rgba(255,255,255,0.9), 0 10px 20px rgba(34, 82, 79, 0.07);
    animation: fadeSlideUp 0.6s 0.35s cubic-bezier(0.22,1,0.36,1) both;
  }
  .toggle-btn {
    flex: 1;
    padding: 14px 16px;
    border: none;
    background: transparent;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    border-radius: 16px;
    transition: all 0.3s ease;
    color: var(--charcoal-muted);
  }
  .toggle-btn.active {
    background: rgba(95,179,162,0.95);
    color: white;
    box-shadow: 0 24px 52px rgba(95,179,162,0.16);
    transform: translateY(-1px);
  }
  .toggle-btn:not(.active):hover {
    color: var(--teal);
    background: rgba(95,179,162,0.1);
  }

  /* Input group */
  .field {
    margin-bottom: 18px;
    animation: fadeSlideUp 0.6s cubic-bezier(0.22,1,0.36,1) both;
  }

  .field label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.6px;
    text-transform: uppercase;
    color: var(--charcoal-muted);
    margin-bottom: 8px;
  }

  .input-wrap {
    position: relative;
  }
  .input-wrap input, .input-wrap select {
    width: 100%;
    padding: 14px 16px 14px 44px;
    border: 1.5px solid rgba(134, 158, 159, 0.16);
    border-radius: 18px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: var(--charcoal);
    background: rgba(255,255,255,0.88);
    outline: none;
    transition: border-color 0.25s, box-shadow 0.25s, background 0.25s;
    box-shadow: inset 0 1px 1px rgba(255,255,255,0.7);
  }
  .input-wrap select {
    padding: 12px 16px 12px 44px;
    appearance: none;
    cursor: pointer;
  }
  .input-wrap input:focus, .input-wrap select:focus {
    border-color: rgba(95,179,162,0.8);
    background: rgba(255,255,255,0.98);
    box-shadow: 0 0 0 4px rgba(95,179,162,0.12);
  }
  .input-wrap input::placeholder { color: #b8b8b4; }

  .input-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #c0c0bb;
    transition: color 0.25s;
    pointer-events: none;
  }
  .input-wrap:focus-within .input-icon { color: var(--teal); }

  .eye-toggle {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: #c0c0bb;
    padding: 2px;
    transition: color 0.2s;
    display: flex; align-items: center;
  }
  .eye-toggle:hover { color: var(--teal); }

  /* Row: remember + forgot */
  .extras-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 4px 0 24px;
    animation: fadeSlideUp 0.6s 0.62s cubic-bezier(0.22,1,0.36,1) both;
  }

  .remember-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 13.5px;
    color: var(--charcoal-muted);
    user-select: none;
  }
  .remember-label input[type="checkbox"] { display: none; }
  .custom-check {
    width: 18px; height: 18px;
    border: 1.5px solid #d0d0cb;
    border-radius: 5px;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
    background: var(--bg);
    flex-shrink: 0;
  }
  .custom-check.checked {
    background: var(--teal);
    border-color: var(--teal);
  }
  .custom-check.checked svg { opacity: 1; }
  .custom-check svg { opacity: 0; transition: opacity 0.15s; }

  .forgot-link {
    font-size: 13.5px;
    color: var(--accent);
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
    background: none; border: none; cursor: pointer;
    padding: 0;
  }
  .forgot-link:hover { color: var(--teal); }

  /* Login button */
  .btn-login, .btn-signup {
    width: 100%;
    padding: 16px;
    background: linear-gradient(135deg, rgba(95,179,162,0.95) 0%, rgba(70,152,143,1) 100%);
    color: white;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.4px;
    border: none;
    border-radius: 18px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s, filter 0.2s;
    box-shadow: 0 24px 40px rgba(14, 62, 54, 0.16);
    animation: fadeSlideUp 0.6s 0.68s cubic-bezier(0.22,1,0.36,1) both;
  }
  .btn-login:hover, .btn-signup:hover, .btn-google:hover {
    transform: translateY(-2px);
    box-shadow: 0 28px 60px rgba(14, 62, 54, 0.2);
    filter: saturate(1.05);
  }
  .btn-login:active, .btn-signup:active, .btn-google:active { transform: translateY(0); }
  .btn-login .ripple, .btn-signup .ripple, .btn-google .ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255,255,255,0.3);
    transform: scale(0);
    animation: rippleAnim 0.6s linear;
    pointer-events: none;
  }
  .btn-google {
    width: 100%;
    padding: 14px;
    background: white;
    color: #202124;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.3px;
    border: 1px solid #dfe1e5;
    border-radius: 12px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-bottom: 16px;
  }
  .btn-google:hover {
    background: #f7f8f8;
  }
  .btn-google svg {
    width: 18px;
    height: 18px;
  }
  .btn-google .btn-text { position: relative; z-index: 1; }
  .btn-google .btn-spinner { border-top-color: #202124; }
  @keyframes rippleAnim {
    to { transform: scale(4); opacity: 0; }
  }

  /* Shimmer on button */
  .btn-login::after, .btn-signup::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%);
    transform: translateX(-100%);
    transition: transform 0.6s;
  }
  .btn-login:hover::after, .btn-signup:hover::after { transform: translateX(100%); }

  .btn-text { position: relative; z-index: 1; }

  /* Loading spinner inside btn */
  .btn-spinner {
    width: 18px; height: 18px;
    border: 2.5px solid rgba(255,255,255,0.4);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: inline-block;
    vertical-align: middle;
    margin-right: 8px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Signup row link */
  .signup-row {
    margin-top: 20px;
    text-align: center;
    font-size: 13.5px;
    color: var(--charcoal-muted);
    animation: fadeSlideUp 0.6s 0.75s cubic-bezier(0.22,1,0.36,1) both;
  }
  .signup-link {
    color: var(--teal-dark);
    font-weight: 600;
    text-decoration: none;
    background: none; border: none; cursor: pointer;
    transition: color 0.2s;
    padding: 0;
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
  }
  .signup-link:hover { color: var(--accent); }


  /* Shared keyframes */
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeSlideDown {
    from { opacity: 0; transform: translateY(-14px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Error shake */
  .shake { animation: shake 0.4s ease; }
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-8px); }
    40% { transform: translateX(8px); }
    60% { transform: translateX(-5px); }
    80% { transform: translateX(5px); }
  }

  .error-msg {
    font-size: 12px;
    color: #e05c5c;
    margin-top: 6px;
    opacity: 0;
    transform: translateY(-4px);
    transition: opacity 0.3s, transform 0.3s;
  }
  .error-msg.visible { opacity: 1; transform: translateY(0); }

  /* Grid for age and gender */
  .grid-2cols {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .left-panel { display: none; }
    .right-panel { padding: 28px 24px; }
    .login-card { width: 100%; min-height: 100svh; border-radius: 0; }
  }
`;

export default function Login({ onLogin, onSignupStart, onSignupComplete }: LoginProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  // Debounce ref for request throttling
  const lastRequestRef = useRef<number>(0);
  const minRequestIntervalMs = 2000; // Minimum 2 seconds between requests

  // Login form data
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  // Signup form data
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateSignup = () => {
    const newErrors: Record<string, string> = {};

    if (!signupData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (signupData.fullName.length < 2) {
      newErrors.fullName = "Name must be at least 2 characters";
    }

    if (!signupData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(signupData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!signupData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[\d\s+-]{10,}$/.test(signupData.phone.replace(/\s/g, ''))) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!signupData.password) {
      newErrors.password = "Password is required";
    } else if (signupData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (signupData.password !== signupData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateLogin = () => {
    const newErrors: Record<string, string> = {};

    if (!loginData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(loginData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!loginData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.MouseEvent) => {
    e.preventDefault();

    // Debounce: prevent simultaneous requests
    const now = Date.now();
    if (now - lastRequestRef.current < minRequestIntervalMs) {
      return;
    }
    lastRequestRef.current = now;

    if (!validateLogin()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    if (loading) return; // Extra safety check
    setError("");
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password
      });

      setLoading(false);

      if (error) {
        let errorMsg = "Invalid email or password. Please try again.";

        // Handle specific error cases
        if (error.message?.includes("rate limit")) {
          errorMsg = "Too many login attempts. Please wait a few minutes before trying again.";
        } else if (error.message?.includes("Invalid login credentials")) {
          errorMsg = "Invalid email or password. Please check and try again.";
        }

        setError(errorMsg);
        setShake(true);
        setTimeout(() => setShake(false), 500);
        return;
      }

      if (data.session) {
        if (remember) {
          localStorage.setItem('rememberedEmail', loginData.email);
        }
        onLogin();
      } else {
        setError("Login failed. Please try again.");
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    } catch (err: any) {
      setLoading(false);
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again later.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleGoogleLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin
      }
    });

    setLoading(false);

    if (error) {
      setError("Google sign-in failed. Please try again.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    if (data?.url) {
      window.location.href = data.url;
    } else {
      onLogin();
    }
  };

  const handleSignup = async (e: React.MouseEvent) => {
    e.preventDefault();

    console.log("📝 Signup button clicked");
    onSignupStart();

    // Debounce: prevent simultaneous requests
    const now = Date.now();
    if (now - lastRequestRef.current < minRequestIntervalMs) {
      console.warn("⏰ Debounce: Too many requests, waiting...");
      return;
    }
    lastRequestRef.current = now;

    if (!validateSignup()) {
      console.log("❌ Validation failed");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    if (loading) {
      console.log("⏳ Already loading, ignoring duplicate request");
      return;
    }

    setError("");
    setLoading(true);

    console.log("🚀 Starting signup with data:", {
      email: signupData.email,
      fullName: signupData.fullName,
      phone: signupData.phone
    });

    try {
      console.log("📤 Calling supabase.auth.signUp...");
      const { data, error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            full_name: signupData.fullName,
            phone_number: signupData.phone
          }
        }
      });

      if (error) {
        console.error("❌ Auth signup error:", error.message);
        setLoading(false);
        let errorMsg = error.message || "Signup failed. Please try again.";

        // Handle specific error cases
        if (error.message?.includes("rate limit")) {
          errorMsg = "⏳ Too many signup attempts. Please wait a few minutes before trying again.";
        } else if (error.message?.includes("already registered")) {
          errorMsg = "This email is already registered. Please login or use a different email.";
        } else if (error.message?.includes("User already exists")) {
          errorMsg = "This email is already registered. Please login instead.";
        }

        setError(errorMsg);
        setShake(true);
        setTimeout(() => setShake(false), 500);
        onSignupComplete(); // Reset signup state on error
        return;
      }

      console.log("✅ Auth signup successful, user ID:", data.user?.id);
      const userId = data.user?.id;

      if (userId) {
        const profilePayload = {
          user_id: userId,
          full_name: signupData.fullName,
          phone: signupData.phone,
          password: signupData.password,
          confirm_password: signupData.confirmPassword
        };

        console.log("💾 Inserting profile to user_profiles table...");
        // Create profile
        const { error: profileError } = await supabase
          .from("user_profiles")
          .insert([profilePayload]);

        if (profileError) {
          console.error("❌ Profile insert failed:", profileError.message, profileError.code);
        } else {
          console.log("✅ Profile inserted successfully");
        }
      } else {
        console.warn("⚠️ No user ID returned from signup");
      }

      if (data.session) {
        console.log("🔐 Signup returned a session; signing out to stay on login page.");
        await supabase.auth.signOut();
      }

      console.log("✅ Signup complete, returning to login form");
      setLoading(false);
      setIsLogin(true);
      setError("Account created! Please log in to continue.");
      onSignupComplete();
    } catch (err: any) {
      setLoading(false);
      console.error("❌ Signup exception:", err.message || err);
      setError("An unexpected error occurred. Please try again later.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      onSignupComplete(); // Reset signup state on exception
    }
  };

  const handleForgotPassword = () => {
    alert("Password reset functionality coming soon!");
  };

  const handleRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(btn.clientWidth, btn.clientHeight);
    const radius = diameter / 2;
    const rect = btn.getBoundingClientRect();
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - rect.left - radius}px`;
    circle.style.top = `${e.clientY - rect.top - radius}px`;
    circle.classList.add("ripple");
    btn.appendChild(circle);
    setTimeout(() => circle.remove(), 700);
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError("");
    setErrors({});
    setShake(false);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="login-wrapper">
        {/* ambient blobs */}
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />

        <div className="login-card">
          {/* Left panel */}
          <div className="left-panel">
            <div className="logo-mark">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" fill="none" />
                <circle cx="12" cy="12" r="3" fill="white" stroke="none" />
              </svg>
            </div>
            <div className="panel-headline">
              <h2>Glow<br /><em>With Us</em></h2>
              <p className="panel-tagline">Nurture Your Natural Glow — personalized skincare journeys for radiant, healthy skin.</p>
            </div>
            <div className="wave-shape" />
            <div className="dots-grid">
              {Array.from({ length: 20 }).map((_, i) => <span key={i} />)}
            </div>
            <div className="floating-shapes">
              <span className="floating-dot floating-dot-1" />
              <span className="floating-dot floating-dot-2" />
              <span className="floating-dot floating-dot-3" />
            </div>
          </div>

          {/* Right form */}
          <div className="right-panel">
            {isLogin && (
              <div className="form-header">
                <h1>Glowify</h1>
                <p>Skin Scan Plan</p>
              </div>
            )}

            {/* Toggle Buttons */}
            <div className="toggle-buttons">
              <button
                className={`toggle-btn ${isLogin ? 'active' : ''}`}
                onClick={() => setIsLogin(true)}
              >
                Login
              </button>
              <button
                className={`toggle-btn ${!isLogin ? 'active' : ''}`}
                onClick={() => setIsLogin(false)}
              >
                Create Account
              </button>
            </div>

            <div className={shake ? "shake" : ""}>
              {/* Login Form */}
              {isLogin && (
                <>
                  <div className="field">
                    <label>Email Address</label>
                    <div className="input-wrap">
                      <span className="input-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                      </span>
                      <input
                        type="email"
                        placeholder="hello@glowify.com"
                        value={loginData.email}
                        onChange={(e) => { setLoginData({ ...loginData, email: e.target.value }); setError(""); }}
                      />
                    </div>
                    {errors.email && <p className="error-msg visible">{errors.email}</p>}
                  </div>

                  <div className="field">
                    <label>Password</label>
                    <div className="input-wrap">
                      <span className="input-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={loginData.password}
                        onChange={(e) => { setLoginData({ ...loginData, password: e.target.value }); setError(""); }}
                      />
                      <button className="eye-toggle" onClick={() => setShowPassword(!showPassword)} type="button">
                        {showPassword ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {errors.password && <p className="error-msg visible">{errors.password}</p>}
                    {error && <p className="error-msg visible">{error}</p>}
                  </div>

                  <div className="extras-row">
                    <label className="remember-label" onClick={() => setRemember(!remember)}>
                      <input type="checkbox" readOnly checked={remember} />
                      <span className={`custom-check${remember ? " checked" : ""}`}>
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      Remember Me
                    </label>
                    <button className="forgot-link" onClick={handleForgotPassword}>Forgot Password?</button>
                  </div>

                  <button
                    className="btn-google"
                    onClick={(e) => { handleRipple(e); handleGoogleLogin(e); }}
                    disabled={loading}
                  >
                    {loading && <span className="btn-spinner" />}
                    <span className="btn-text">Continue with Google</span>
                  </button>

                  <button
                    className="btn-login"
                    onClick={(e) => { handleRipple(e); handleLogin(e); }}
                    disabled={loading}
                  >
                    {loading && <span className="btn-spinner" />}
                    <span className="btn-text">{loading ? "Signing in…" : "Login"}</span>
                  </button>
                </>
              )}

              {/* Signup Form */}
              {!isLogin && (
                <>
                  <div className="field">
                    <label>Full Name</label>
                    <div className="input-wrap">
                      <span className="input-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </span>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={signupData.fullName}
                        onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                      />
                    </div>
                    {errors.fullName && <p className="error-msg visible">{errors.fullName}</p>}
                  </div>

                  <div className="field">
                    <label>Email Address</label>
                    <div className="input-wrap">
                      <span className="input-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                      </span>
                      <input
                        type="email"
                        placeholder="hello@glowify.com"
                        value={signupData.email}
                        onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      />
                    </div>
                    {errors.email && <p className="error-msg visible">{errors.email}</p>}
                  </div>

                  <div className="field">
                    <label>Phone Number</label>
                    <div className="input-wrap">
                      <span className="input-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                      </span>
                      <input
                        type="tel"
                        placeholder="+1 234 567 8900"
                        value={signupData.phone}
                        onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                      />
                    </div>
                    {errors.phone && <p className="error-msg visible">{errors.phone}</p>}
                  </div>


                  <div className="field">
                    <label>Password</label>
                    <div className="input-wrap">
                      <span className="input-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={signupData.password}
                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      />
                      <button className="eye-toggle" onClick={() => setShowPassword(!showPassword)} type="button">
                        {showPassword ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {errors.password && <p className="error-msg visible">{errors.password}</p>}
                  </div>

                  <div className="field">
                    <label>Confirm Password</label>
                    <div className="input-wrap">
                      <span className="input-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </span>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm password"
                        value={signupData.confirmPassword}
                        onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                      />
                      <button className="eye-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)} type="button">
                        {showConfirmPassword ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="error-msg visible">{errors.confirmPassword}</p>}
                  </div>

                  <button
                    className="btn-signup"
                    onClick={(e) => { handleRipple(e); handleSignup(e); }}
                    disabled={loading}
                  >
                    {loading && <span className="btn-spinner" />}
                    <span className="btn-text">{loading ? "Creating Account…" : "Create Account"}</span>
                  </button>
                </>
              )}
            </div>

            {/* Toggle link */}
            <p className="signup-row">
              {isLogin ? (
                <>Don't have an account? <button className="signup-link" onClick={toggleForm}>Create Account</button></>
              ) : (
                <>Already have an account? <button className="signup-link" onClick={toggleForm}>Login</button></>
              )}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}