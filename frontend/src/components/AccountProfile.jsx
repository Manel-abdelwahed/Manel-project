"use client"

import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { usersAPI } from "../services/api"
import "../styles/AccountProfile.css"

function AccountProfile({ isOpen, onClose }) {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  })
  const [message, setMessage] = useState("")

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = async () => {
    try {
      await usersAPI.update(user._id, formData)
      setMessage("Profil mis à jour avec succès!")
      setIsEditing(false)
      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      setMessage("Erreur lors de la mise à jour")
    }
  }

  if (!isOpen) return null

  return (
    <div className="account-profile-overlay" onClick={onClose}>
      <div className="account-profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="profile-header">
          <h3>Mon Profil</h3>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {message && <div className="profile-message">{message}</div>}

        <div className="profile-content">
          <div className="profile-avatar">
            <div className="avatar-circle">{user?.name?.charAt(0).toUpperCase()}</div>
          </div>

          {!isEditing ? (
            <div className="profile-info">
              <div className="info-item">
                <label>Nom</label>
                <p>{user?.name}</p>
              </div>
              <div className="info-item">
                <label>Email</label>
                <p>{user?.email}</p>
              </div>
              <div className="info-item">
                <label>Rôle</label>
                <p className="role-badge">{user?.role}</p>
              </div>
              <button className="edit-btn" onClick={() => setIsEditing(true)}>
                Modifier le profil
              </button>
            </div>
          ) : (
            <div className="profile-edit">
              <div className="form-group">
                <label>Nom</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} />
              </div>
              <div className="edit-actions">
                <button className="save-btn" onClick={handleSave}>
                  Enregistrer
                </button>
                <button className="cancel-btn" onClick={() => setIsEditing(false)}>
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AccountProfile
