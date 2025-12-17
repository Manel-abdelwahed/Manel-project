"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import "../styles/Dashboard.css"

function MarketingDashboard() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      navigate("/login")
      return
    }
    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== "marketing") {
      navigate("/dashboard")
      return
    }
    setUser(parsedUser)
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem("user")
    navigate("/login")
  }

  if (!user) return null

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav marketing">
        <h1>Manel Project - Marketing</h1>
        <button onClick={handleLogout} className="logout-btn">
          Déconnexion
        </button>
      </nav>

      <div className="dashboard-content">
        <div className="welcome-card marketing">
          <h2>Tableau de bord Marketing</h2>
          <p className="user-role">
            Connecté en tant que: <span className="role-badge marketing">{user.role}</span>
          </p>
          <p className="user-email">{user.email}</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card marketing">
            <h3>Mes campagnes</h3>
            <p>Gérer et créer des campagnes marketing</p>
          </div>
          <div className="dashboard-card marketing">
            <h3>Analytics</h3>
            <p>Performances de vos campagnes</p>
          </div>
          <div className="dashboard-card marketing">
            <h3>Contenu</h3>
            <p>Bibliothèque de contenu marketing</p>
          </div>
          <div className="dashboard-card marketing">
            <h3>Rapports</h3>
            <p>Rapports marketing détaillés</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MarketingDashboard
