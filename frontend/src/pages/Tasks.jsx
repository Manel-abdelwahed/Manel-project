"use client"

import { useState, useEffect } from "react"
import { tasksAPI } from "../services/api"
import "../styles/Tasks.css"

const API_URL = "http://localhost:5000/api"

function Tasks({ user }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "email",
    dueDate: "",
    priority: "medium",
  })

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await tasksAPI.getAll()
      setTasks(response.data)
    } catch (error) {
      console.error("Erreur lors du chargement des tâches:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await tasksAPI.create(formData)
      fetchTasks()
      closeModal()
    } catch (error) {
      console.error("Erreur:", error)
      alert(error.response?.data?.message || "Erreur lors de la création")
    }
  }

  const toggleTaskStatus = async (taskId, currentStatus) => {
    try {
      await tasksAPI.update(taskId, {
        status: currentStatus === "completed" ? "pending" : "completed",
      })
      fetchTasks()
    } catch (error) {
      console.error("Erreur:", error)
    }
  }

  const handleDelete = async (taskId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) {
      return
    }

    try {
      await tasksAPI.delete(taskId)
      fetchTasks()
    } catch (error) {
      console.error("Erreur lors de la suppression:", error)
    }
  }

  const openModal = () => {
    setFormData({
      title: "",
      description: "",
      type: "email",
      dueDate: "",
      priority: "medium",
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  const formatDate = (dateString) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR")
  }

  const pendingTasks = tasks.filter((t) => t.status === "pending")
  const completedTasks = tasks.filter((t) => t.status === "completed")

  if (loading) {
    return <div className="loading">Chargement...</div>
  }

  return (
    <div className="tasks-page">
      <div className="page-header">
        <div>
          <h1>Tâches Marketing</h1>
          <p>Planifier et suivre vos actions marketing</p>
        </div>
        <button onClick={openModal} className="btn-primary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Nouvelle tâche
        </button>
      </div>

      <div className="tasks-columns">
        <div className="tasks-column">
          <div className="column-header">
            <h3>À faire ({pendingTasks.length})</h3>
          </div>
          <div className="tasks-list">
            {pendingTasks.map((task) => (
              <div key={task._id} className="task-card">
                <div className="task-header">
                  <button onClick={() => toggleTaskStatus(task._id, task.status)} className="task-checkbox">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </button>
                  <div className={`priority-badge priority-${task.priority}`}>
                    {task.priority === "high" ? "Haute" : task.priority === "medium" ? "Moyenne" : "Basse"}
                  </div>
                  <button onClick={() => handleDelete(task._id)} className="btn-icon btn-danger">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
                <h4>{task.title}</h4>
                <p>{task.description}</p>
                <div className="task-footer">
                  <span className={`type-badge type-${task.type}`}>
                    {task.type === "email"
                      ? "Email"
                      : task.type === "call"
                        ? "Appel"
                        : task.type === "meeting"
                          ? "Réunion"
                          : "Autre"}
                  </span>
                  <span className="task-date">{formatDate(task.dueDate)}</span>
                </div>
              </div>
            ))}
            {pendingTasks.length === 0 && <div className="empty-column">Aucune tâche en attente</div>}
          </div>
        </div>

        <div className="tasks-column">
          <div className="column-header">
            <h3>Terminées ({completedTasks.length})</h3>
          </div>
          <div className="tasks-list">
            {completedTasks.map((task) => (
              <div key={task._id} className="task-card task-completed">
                <div className="task-header">
                  <button
                    onClick={() => toggleTaskStatus(task._id, task.status)}
                    className="task-checkbox task-checkbox-checked"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="3" width="18" height="18" rx="2" fill="#10b981" stroke="#10b981" strokeWidth="2" />
                      <path
                        d="M9 12l2 2 4-4"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <div className={`priority-badge priority-${task.priority}`}>
                    {task.priority === "high" ? "Haute" : task.priority === "medium" ? "Moyenne" : "Basse"}
                  </div>
                  <button onClick={() => handleDelete(task._id)} className="btn-icon btn-danger">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
                <h4>{task.title}</h4>
                <p>{task.description}</p>
                <div className="task-footer">
                  <span className={`type-badge type-${task.type}`}>
                    {task.type === "email"
                      ? "Email"
                      : task.type === "call"
                        ? "Appel"
                        : task.type === "meeting"
                          ? "Réunion"
                          : "Autre"}
                  </span>
                  <span className="task-date">{formatDate(task.dueDate)}</span>
                </div>
              </div>
            ))}
            {completedTasks.length === 0 && <div className="empty-column">Aucune tâche terminée</div>}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nouvelle tâche</h2>
              <button onClick={closeModal} className="btn-close">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label>Titre *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Détails de la tâche..."
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                  >
                    <option value="email">Email</option>
                    <option value="call">Appel</option>
                    <option value="meeting">Réunion</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Priorité *</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    required
                  >
                    <option value="low">Basse</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Haute</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Date d'échéance</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
              <div className="modal-footer">
                <button type="button" onClick={closeModal} className="btn-secondary">
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Tasks
