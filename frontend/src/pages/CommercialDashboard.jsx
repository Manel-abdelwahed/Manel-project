"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import "../styles/Dashboard.css"

function CommercialDashboard() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      navigate("/login")
      return
    }
    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== "commercial") {
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
      <nav className="dashboard-nav commercial">
        <h1>Manel Project - Commercial</h1>
        <button onClick={handleLogout} className="logout-btn">
          Déconnexion
        </button>
      </nav>

      <div className="dashboard-content">
        <div className="welcome-card commercial">
          <h2>Tableau de bord Commercial</h2>
          <p className="user-role">
            Connecté en tant que: <span className="role-badge commercial">{user.role}</span>
          </p>
          <p className="user-email">{user.email}</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card commercial">
            <h3>Mes clients</h3>
            <p>Gérer votre portefeuille clients</p>
          </div>
          <div className="dashboard-card commercial">
            <h3>Opportunités</h3>
            <p>Suivre vos opportunités de vente</p>
          </div>
          <div className="dashboard-card commercial">
            <h3>Devis</h3>
            <p>Créer et gérer vos devis</p>
          </div>
          <div className="dashboard-card commercial">
            <h3>Objectifs</h3>
            <p>Suivre vos objectifs commerciaux</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommercialDashboard
