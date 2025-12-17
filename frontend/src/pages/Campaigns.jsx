"use client"

import { useState, useEffect } from "react"
import { campaignsAPI } from "../services/api"
import "../styles/Campaigns.css"

const API_URL = "http://localhost:5000/api"

function Campaigns({ user }) {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    budget: "",
    startDate: "",
    endDate: "",
    status: "active",
    platform: "",
    targetAudience: "",
  })

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      const response = await campaignsAPI.getAll()
      setCampaigns(response.data)
    } catch (error) {
      console.error("Erreur lors du chargement des campagnes:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log("[v0] Submitting campaign form:", formData)
    try {
      if (editingCampaign) {
        console.log("[v0] Updating campaign:", editingCampaign._id)
        await campaignsAPI.update(editingCampaign._id, formData)
      } else {
        console.log("[v0] Creating new campaign")
        await campaignsAPI.create(formData)
      }

      console.log("[v0] Campaign operation successful")
      fetchCampaigns()
      closeModal()
    } catch (error) {
      console.error("[v0] Error in campaign operation:", error)
      console.error("[v0] Error response:", error.response?.data)
      alert(error.response?.data?.message || "Erreur lors de l'opération")
    }
  }

  const handleDelete = async (campaignId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette campagne ?")) {
      return
    }

    try {
      await campaignsAPI.delete(campaignId)
      fetchCampaigns()
    } catch (error) {
      console.error("Erreur lors de la suppression:", error)
      alert("Erreur lors de la suppression")
    }
  }

  const openModal = (campaignToEdit = null) => {
    if (campaignToEdit) {
      setEditingCampaign(campaignToEdit)
      setFormData({
        name: campaignToEdit.name,
        description: campaignToEdit.description || "",
        budget: campaignToEdit.budget,
        startDate: campaignToEdit.startDate ? campaignToEdit.startDate.split("T")[0] : "",
        endDate: campaignToEdit.endDate ? campaignToEdit.endDate.split("T")[0] : "",
        status: campaignToEdit.status,
        platform: campaignToEdit.platform || "",
        targetAudience: campaignToEdit.targetAudience || "",
      })
    } else {
      setEditingCampaign(null)
      setFormData({
        name: "",
        description: "",
        budget: "",
        startDate: "",
        endDate: "",
        status: "active",
        platform: "",
        targetAudience: "",
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingCampaign(null)
  }

  const formatDate = (dateString) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR")
  }

  if (loading) {
    return <div className="loading">Chargement...</div>
  }

  return (
    <div className="campaigns-page">
      <div className="page-header">
        <div>
          <h1>Campagnes Marketing</h1>
          <p>Gérer vos campagnes publicitaires</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Créer une campagne
        </button>
      </div>

      <div className="campaigns-grid">
        {campaigns.map((campaign) => (
          <div key={campaign._id} className="campaign-card">
            <div className="campaign-header">
              <div className="campaign-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 2L2 7l10 5 10-5-10-5z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 17l10 5 10-5M2 12l10 5 10-5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="campaign-actions">
                <button onClick={() => openModal(campaign)} className="btn-icon" title="Modifier">
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
                <button onClick={() => handleDelete(campaign._id)} className="btn-icon btn-danger" title="Supprimer">
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
            <div className="campaign-body">
              <h3>{campaign.name}</h3>
              <p className="campaign-description">{campaign.description || "Aucune description"}</p>
              <div className="campaign-meta">
                <div className="meta-item">
                  <span className="meta-label">Budget:</span>
                  <span className="meta-value">{campaign.budget} TND</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Période:</span>
                  <span className="meta-value">
                    {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                  </span>
                </div>
                {campaign.platform && (
                  <div className="meta-item">
                    <span className="meta-label">Plateforme:</span>
                    <span className="meta-value">{campaign.platform}</span>
                  </div>
                )}
              </div>
              <div className={`status-badge status-${campaign.status}`}>
                {campaign.status === "active" ? "Active" : campaign.status === "paused" ? "En pause" : "Terminée"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {campaigns.length === 0 && (
        <div className="empty-state-large">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2L2 7l10 5 10-5-10-5z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 17l10 5 10-5M2 12l10 5 10-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h3>Aucune campagne</h3>
          <p>Créez votre première campagne marketing</p>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCampaign ? "Modifier la campagne" : "Nouvelle campagne"}</h2>
              <button onClick={closeModal} className="btn-close">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label>Nom de la campagne *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Décrivez votre campagne..."
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Budget (TND) *</label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    required
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Statut *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="paused">En pause</option>
                    <option value="completed">Terminée</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date de début</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Date de fin</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Plateforme</label>
                  <input
                    type="text"
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    placeholder="Ex: Facebook, Google Ads, Instagram..."
                  />
                </div>
                <div className="form-group">
                  <label>Audience cible</label>
                  <input
                    type="text"
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    placeholder="Ex: Particuliers, Entreprises..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={closeModal} className="btn-secondary">
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  {editingCampaign ? "Mettre à jour" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Campaigns
