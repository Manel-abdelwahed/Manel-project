"use client"

import { useState, useEffect } from "react"
import { usersAPI } from "../services/api"
import "../styles/Users.css"

const API_URL = "http://localhost:5000/api"

function Users({ user }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "commercial",
  })

  useEffect(() => {
    console.log("[v0] Users component mounted, user:", user)
    if (user.role !== "admin") {
      console.log("[v0] User is not admin, showing access denied")
      return
    }
    fetchUsers()
  }, [user])

  const fetchUsers = async () => {
    console.log("[v0] Fetching users...")
    try {
      const response = await usersAPI.getAll()
      console.log("[v0] Users loaded:", response.data.length)
      setUsers(response.data)
    } catch (error) {
      console.error("[v0] Error loading users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log("[v0] Submitting user form:", { ...formData, password: "***" })
    try {
      if (editingUser) {
        console.log("[v0] Updating user:", editingUser._id)
        await usersAPI.update(editingUser._id, formData)
      } else {
        console.log("[v0] Creating new user")
        await usersAPI.create(formData)
      }

      console.log("[v0] User operation successful")
      fetchUsers()
      closeModal()
    } catch (error) {
      console.error("[v0] Error in user operation:", error)
      console.error("[v0] Error response:", error.response?.data)
      alert(error.response?.data?.message || "Erreur lors de l'opération")
    }
  }

  const handleDelete = async (userId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      return
    }

    try {
      await usersAPI.delete(userId)
      fetchUsers()
    } catch (error) {
      console.error("Erreur lors de la suppression:", error)
      alert("Erreur lors de la suppression")
    }
  }

  const openModal = (userToEdit = null) => {
    if (userToEdit) {
      setEditingUser(userToEdit)
      setFormData({
        name: userToEdit.name,
        email: userToEdit.email,
        password: "",
        role: userToEdit.role,
      })
    } else {
      setEditingUser(null)
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "commercial",
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingUser(null)
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "commercial",
    })
  }

  if (user.role !== "admin") {
    return (
      <div className="access-denied">
        <h2>Accès refusé</h2>
        <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
      </div>
    )
  }

  if (loading) {
    return <div className="loading">Chargement...</div>
  }

  return (
    <div className="users-page">
      <div className="page-header">
        <div>
          <h1>Gestion des Utilisateurs</h1>
          <p>Gérer les comptes utilisateurs et leurs rôles</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Ajouter un utilisateur
        </button>
      </div>

      <div className="users-grid">
        {users.map((u) => (
          <div key={u._id} className="user-card">
            <div className="user-card-header">
              <div className="user-avatar-large">{u.name.charAt(0).toUpperCase()}</div>
              <div className="user-card-actions">
                <button onClick={() => openModal(u)} className="btn-icon" title="Modifier">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button onClick={() => handleDelete(u._id)} className="btn-icon btn-danger" title="Supprimer">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="user-card-body">
              <h3>{u.name}</h3>
              <p className="user-email">{u.email}</p>
              <div className={`role-badge role-${u.role}`}>
                {u.role === "admin" ? "Administrateur" : u.role === "marketing" ? "Marketing" : "Commercial"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingUser ? "Modifier l'utilisateur" : "Nouvel utilisateur"}</h2>
              <button onClick={closeModal} className="btn-close">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label>Nom complet</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mot de passe {editingUser && "(laisser vide pour ne pas changer)"}</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                />
              </div>
              <div className="form-group">
                <label>Rôle</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                >
                  <option value="commercial">Commercial</option>
                  <option value="marketing">Marketing</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={closeModal} className="btn-secondary">
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  {editingUser ? "Mettre à jour" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Users
