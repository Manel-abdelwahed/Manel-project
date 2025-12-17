"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { usersAPI } from "../services/api"
import "../styles/Settings.css"

function Settings() {
  const { user, updateUser } = useAuth()
  const [settings, setSettings] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "",
    notifications: true,
    emailAlerts: true,
    darkMode: false,
  })

  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setSettings((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        role: user.role || "",
      }))
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await usersAPI.updateProfile({
        name: settings.name,
        email: settings.email,
      })
      updateUser(response.data.user)
      setMessage("Paramètres enregistrés avec succès!")
      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      console.error("[v0] Error updating profile:", error)
      setMessage("Erreur lors de l'enregistrement des paramètres")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <h2>Paramètres</h2>
        <p>Gérez vos préférences et informations de compte</p>
      </div>

      {message && <div className={`message ${message.includes("succès") ? "success" : "error"}`}>{message}</div>}

      <div className="settings-container">
        <div className="settings-section">
          <h3>Informations du compte</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Nom complet</label>
              <input type="text" id="name" name="name" value={settings.name} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" value={settings.email} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label htmlFor="role">Rôle</label>
              <input type="text" id="role" name="role" value={settings.role} disabled />
            </div>

            <button type="submit" className="save-button" disabled={loading}>
              {loading ? "Enregistrement..." : "Enregistrer les modifications"}
            </button>
          </form>
        </div>

        <div className="settings-section">
          <h3>Préférences</h3>
          <div className="preferences-list">
            <div className="preference-item">
              <div className="preference-info">
                <h4>Notifications</h4>
                <p>Recevoir des notifications dans l'application</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" name="notifications" checked={settings.notifications} onChange={handleChange} />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="preference-item">
              <div className="preference-info">
                <h4>Alertes par email</h4>
                <p>Recevoir des alertes importantes par email</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" name="emailAlerts" checked={settings.emailAlerts} onChange={handleChange} />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="preference-item">
              <div className="preference-info">
                <h4>Mode sombre</h4>
                <p>Activer le thème sombre de l'interface</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" name="darkMode" checked={settings.darkMode} onChange={handleChange} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3>Sécurité</h3>
          <div className="security-actions">
            <button className="secondary-button">Changer le mot de passe</button>
            <button className="secondary-button">Activer l'authentification à deux facteurs</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
