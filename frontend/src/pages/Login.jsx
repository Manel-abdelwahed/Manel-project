"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "../styles/Login.css"

const TEST_ACCOUNTS = {
  admin: {
    email: "admin@manel.com",
    password: "Admin123!",
    role: "admin",
    name: "Admin Test",
  },
  marketing: {
    email: "marketing@manel.com",
    password: "Marketing123!",
    role: "marketing",
    name: "Marketing Test",
  },
  commercial: {
    email: "commercial@manel.com",
    password: "Commercial123!",
    role: "commercial",
    name: "Commercial Test",
  },
}

function Login({ onLogin }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Check for test accounts first
      const testAccount = Object.values(TEST_ACCOUNTS).find(
        (account) => account.email === email && account.password === password,
      )

      if (testAccount) {
        const userData = {
          email: testAccount.email,
          role: testAccount.role,
          name: testAccount.name,
          token: "test-token-" + testAccount.role,
        }

        localStorage.setItem("user", JSON.stringify(userData))
        localStorage.setItem("token", userData.token)

        onLogin(userData)
        navigate("/dashboard")
        return
      }

      const result = await login({ email, password })

      if (result.success) {
        onLogin(result.user)
        navigate("/dashboard")
      } else {
        setError(result.error)
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("Erreur de connexion. Vérifiez que le serveur backend est démarré ou utilisez un compte de test.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="corner-decoration bottom-right">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
          <circle cx="60" cy="60" r="60" fill="url(#gradient2)" />
          <defs>
            <linearGradient id="gradient2" x1="0" y1="0" x2="120" y2="120">
              <stop stopColor="#7C3AED" />
              <stop offset="1" stopColor="#5B4FFF" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="login-split-container">
        {/* Left side - Login Form */}
        <div className="login-form-side">
          <div className="login-card-new">
            <h2 className="login-title">Veuillez vous connecter</h2>

            <form onSubmit={handleSubmit} className="login-form-new">
              <div className="input-group">
                <div className="input-icon">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M2.5 5.83333C2.5 4.91286 3.24619 4.16667 4.16667 4.16667H15.8333C16.7538 4.16667 17.5 4.91286 17.5 5.83333V14.1667C17.5 15.0871 16.7538 15.8333 15.8333 15.8333H4.16667C3.24619 15.8333 2.5 15.0871 2.5 14.1667V5.83333Z"
                      stroke="#9CA3AF"
                      strokeWidth="1.5"
                    />
                    <path d="M2.5 5.83333L10 10.8333L17.5 5.83333" stroke="#9CA3AF" strokeWidth="1.5" />
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Input your user ID or Email"
                  required
                />
              </div>

              <div className="input-group">
                <div className="input-icon">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M5.83333 9.16667V6.66667C5.83333 4.36548 7.69881 2.5 10 2.5C12.3012 2.5 14.1667 4.36548 14.1667 6.66667V9.16667M6.66667 17.5H13.3333C14.2538 17.5 15 16.7538 15 15.8333V10.8333C15 9.91286 14.2538 9.16667 13.3333 9.16667H6.66667C5.74619 9.16667 5 9.91286 5 10.8333V15.8333C5 16.7538 5.74619 17.5 6.66667 17.5Z"
                      stroke="#9CA3AF"
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Input your password"
                  required
                />
              </div>

              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                  <span>Remember me</span>
                </label>
              
              </div>

              {error && <div className="error-message">{error}</div>}

              <button type="submit" className="login-button-new" disabled={loading}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M3.33333 10H16.6667M16.6667 10L11.6667 5M16.6667 10L11.6667 15"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {loading ? "Loading..." : "Se Connecter"}
              </button>
            </form>
          </div>
        </div>

        {/* Right side - Welcome Panel */}
        <div className="login-welcome-side">
          <div className="welcome-content">
            <h1 className="welcome-title">BIENVENUE!</h1>
            <p className="welcome-subtitle">Entrez vos informations et commencez votre aventure avec nous.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
