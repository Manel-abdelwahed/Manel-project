"use client"

import { useState, useEffect } from "react"
import { leadsAPI, usersAPI } from "../services/api"
import "../styles/Leads.css"


function Leads({ user }) {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingLead, setEditingLead] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [error, setError] = useState(null)
  const [commercials, setCommercials] = useState([])
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    status: "new",
    source: "",
    notes: "",
    leadScore: 0,
    dealAmount: 0,
    commercial: "",
    needType: "",
    powerKW: "",
  })

  useEffect(() => {
    fetchLeads()
    fetchCommercials()
  }, [])

const fetchCommercials = async () => {
  const res = await usersAPI.getCommercials()
  setCommercials(res.data)
}


  const fetchLeads = async () => {
    try {
      setError(null)
      const response = await leadsAPI.getAll()
      setLeads(Array.isArray(response.data) ? response.data : [])
      console.log("[v0] Leads fetched successfully:", response.data.length)
    } catch (error) {
      console.error("[v0] Error fetching leads:", error)
      setError(error.response?.data?.message || "Erreur lors du chargement des leads")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log("[v0] Submitting lead form:", formData)

    if (!formData.name.trim()) {
      alert("Le nom du lead est requis")
      return
    }

    try {
      setError(null)
      if (editingLead) {
        console.log("[v0] Updating lead:", editingLead._id)
        await leadsAPI.update(editingLead._id, formData)
      } else {
        console.log("[v0] Creating new lead")
        await leadsAPI.create(formData)
      }

      console.log("[v0] Lead operation successful")
      fetchLeads()
      closeModal()
    } catch (error) {
      console.error("[v0] Error in lead operation:", error)
      setError(error.response?.data?.message || "Erreur lors de l'opération")
      alert(error.response?.data?.message || "Erreur lors de l'opération")
    }
  }

  const handleDelete = async (leadId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce lead ?")) {
      return
    }

    try {
      setError(null)
      await leadsAPI.delete(leadId)
      console.log("[v0] Lead deleted successfully")
      fetchLeads()
    } catch (error) {
      console.error("[v0] Error deleting lead:", error)
      setError(error.response?.data?.message || "Erreur lors de la suppression")
      alert("Erreur lors de la suppression")
    }
  }

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      setError(null)
      await leadsAPI.updateStatus(leadId, newStatus)
      console.log("[v0] Lead status updated successfully")
      fetchLeads()
    } catch (error) {
      console.error("[v0] Error updating status:", error)
      setError(error.response?.data?.message || "Erreur lors de la mise à jour du statut")
      alert("Erreur lors de la mise à jour du statut")
    }
  }

  const openModal = (leadToEdit = null) => {
    if (leadToEdit) {
      setEditingLead(leadToEdit)
      setFormData({
        name: leadToEdit.name,
        email: leadToEdit.email,
        phone: leadToEdit.phone || "",
        company: leadToEdit.company || "",
        status: leadToEdit.status,
        source: leadToEdit.source || "",
        notes: leadToEdit.notes || "",
        leadScore: leadToEdit.leadScore || 0,
        dealAmount: leadToEdit.dealAmount || 0,
        commercial: leadToEdit.commercial?._id || "",
        needType: leadToEdit.needType || "",
        powerKW: leadToEdit.powerKW || "",
      })
    } else {
      setEditingLead(null)
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        status: "new",
        source: "",
        notes: "",
        leadScore: 0,
        dealAmount: 0,
        commercial: "",
        needType: "",
        powerKW: "",
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingLead(null)
    setError(null)
  }

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.company && lead.company.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = filterStatus === "all" || lead.status === filterStatus

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status) => {
    const colors = {
      new: "#3b82f6",
      contacted: "#f59e0b",
      qualified: "#8b5cf6",
      converted: "#10b981",
      lost: "#ef4444",
    }
    return colors[status] || "#6b7280"
  }

  if (loading) {
    return <div className="loading">Chargement...</div>
  }

  return (
    <div className="leads-page">
      {error && <div className="error-banner">{error}</div>}

      <div className="page-header">
        <div>
          <h1>Gestion des Leads</h1>
          <p>Suivi des prospects</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Ajouter Lead
        </button>
      </div>

      <div className="leads-toolbar">
        <div className="search-bar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Recherche par nom, email ou entreprise"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="toolbar-actions">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="btn-secondary">
            <option value="all">Tous les statuts</option>
            <option value="new">Nouveau</option>
            <option value="contacted">Contacté</option>
            <option value="qualified">Qualifié</option>
            <option value="converted">Converti</option>
            <option value="lost">Perdu</option>
          </select>
        </div>
      </div>

      <div className="leads-stats">
        <div className="stat-card">
          <div className="stat-value">{leads.filter((l) => l.status === "new").length}</div>
          <div className="stat-label">Nouveaux</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{leads.filter((l) => l.status === "contacted").length}</div>
          <div className="stat-label">Contactés</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{leads.filter((l) => l.status === "qualified").length}</div>
          <div className="stat-label">Qualifiés</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{leads.filter((l) => l.status === "converted").length}</div>
          <div className="stat-label">Convertis</div>
        </div>
      </div>

      <div className="leads-table-wrapper">
        <div className="table-header-label">PROSPECTS</div>
        <table className="leads-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Entreprise</th>
              <th>Commercial</th>
              <th>Besoin</th>
              <th>Puissance</th>
              <th>Source</th>
              <th>Statut</th>
              <th>Score</th>
              <th>Montant (DT)</th>
              <th>Date de création</th>
              <th>Actions</th>
            </tr>
          </thead>
        <tbody>
  {filteredLeads.map((lead) => (
    <tr key={lead._id}>
      {/* Nom */}
      <td className="lead-name-cell">{lead.name}</td>

      {/* Email */}
      <td>{lead.email || "-"}</td>

      {/* Téléphone */}
      <td>{lead.phone || "-"}</td>

      {/* Entreprise */}
      <td>{lead.company || "-"}</td>

      {/* Commercial */}
      <td>{lead.commercial?.name || "-"}</td>

      {/* Besoin */}
      <td>
        {lead.needType ? (
          <span className="badge">{lead.needType}</span>
        ) : (
          "-"
        )}
      </td>

      {/* Puissance */}
      <td>{lead.powerKW ? `${lead.powerKW} kW` : "-"}</td>

      {/* Source */}
      <td>{lead.source || "-"}</td>

      {/* Statut */}
      <td>
        <select
          value={lead.status}
          onChange={(e) =>
            handleStatusChange(lead._id, e.target.value)
          }
          className="status-select"
          style={{ borderColor: getStatusColor(lead.status) }}
        >
          <option value="new">Nouveau</option>
          <option value="contacted">Contacté</option>
          <option value="qualified">Qualifié</option>
          <option value="converted">Converti</option>
          <option value="lost">Perdu</option>
        </select>
      </td>

      {/* Score */}
      <td>
        <div className="score-badge">{lead.leadScore}</div>
      </td>

      {/* Montant */}
      <td>
        {lead.status === "converted" && lead.dealAmount
          ? `${lead.dealAmount} Dt`
          : "-"}
      </td>

      {/* Date */}
      <td>
        {new Date(lead.createdAt).toLocaleDateString("fr-FR")}
      </td>

      {/* Actions */}
      <td className="actions-cell">
        <button
          onClick={() => openModal(lead)}
          className="btn-icon"
          title="Modifier"
        >
          ✏️
        </button>
        <button
          onClick={() => handleDelete(lead._id)}
          className="btn-icon btn-danger"
          title="Supprimer"
        >
          🗑️
        </button>
      </td>
    </tr>
  ))}
</tbody>

        </table>
        {filteredLeads.length === 0 && (
          <div className="empty-state">
            <p>Aucun lead trouvé</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal lead-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingLead ? "MODIFIER LEAD" : "AJOUTER LEAD"}</h2>
              <button onClick={closeModal} className="btn-close">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label>NOM *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>EMAIL</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>TÉLÉPHONE</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>ENTREPRISE</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>
                <div className="form-group">
                <label>COMMERCIAL</label>
                <input
                type="text"
                placeholder="Nom du commercial"
                value={formData.commercial}
                onChange={(e) =>
                setFormData({ ...formData, commercial: e.target.value })
                }
               />
              </div>
              <div className="form-row">
              <div className="form-group">
               <label>BESOIN</label>
               <select
               value={formData.needType}
               onChange={(e) =>
               setFormData({ ...formData, needType: e.target.value })
              }
              >
      <option value="">--</option>
      <option value="pompage">Pompage</option>
      <option value="raccordement">Raccorde</option>
    </select>
  </div>

  <div className="form-group">
    <label>PUISSANCE (kW)</label>
    <input
      type="number"
      min="0"
      value={formData.powerKW}
      onChange={(e) =>
        setFormData({ ...formData, powerKW: e.target.value })
      }
    />
  </div>
</div>


                <div className="form-group">
                  <label>SOURCE</label>
                  <input
                    type="text"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
              <div className="form-group">
              <label>STATUT</label>
              <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
               <option value="new">Nouveau</option>
               <option value="contacted">Contacté</option>
               <option value="qualified">Qualifié</option>
               <option value="converted">Converti</option>
               <option value="lost">Perdu</option>
               </select>
               </div>

              {/* Montant يظهر كان وقت Converti */}
              {formData.status === "converted" ? (
              <div className="form-group">
              <label>MONTANT (DT)</label>
              <input
              type="number"
              min="0"
              placeholder="Montant de la vente"
              value={formData.dealAmount || ""}
              onChange={(e) =>
              setFormData({ ...formData, dealAmount: Number(e.target.value) })}/>
              </div>
              ) : (
              <div className="form-group">
              <label>SCORE DE LEAD</label>
              <input
        type="number"
        min="0"
        max="100"
        value={formData.leadScore}
        onChange={(e) =>
          setFormData({ ...formData, leadScore: Number.parseInt(e.target.value) })
        }
      />
    </div>
  )}
</div>

              <div className="form-group">
                <label>NOTES</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="4"
                />
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn-primary">
                  {editingLead ? "Mettre à jour" : "Créer"}
                </button>
                <button type="button" onClick={closeModal} className="btn-secondary">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Leads