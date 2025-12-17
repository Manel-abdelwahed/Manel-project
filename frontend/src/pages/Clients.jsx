"use client"

import { useState, useEffect } from "react"
import { clientsAPI } from "../services/api"
import "../styles/Clients.css"

function Clients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  // 🔹 Modal
  const [showModal, setShowModal] = useState(false)
  const [editingClient, setEditingClient] = useState(null)

  // 🔹 Form
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    besoin: "",
    puissance_ch: "",
    prix: "",
    commercial: "",
    contact1: "",
    contact2: "",
    contact3: "",
    notes: "",
  })

  // 🔹 Filters
  const [filterOpen, setFilterOpen] = useState(false)
  const [filters, setFilters] = useState({
    commercial: "",
    source: "",
    besoin: "",
  })

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const res = await clientsAPI.getAll()
      setClients(res.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  /* =========================
     MODAL
  ========================= */

  const openModal = (client = null) => {
    if (client) {
      setEditingClient(client)
      setFormData({
        name: client.name || "",
        phone: client.phone || "",
        besoin: client.besoin || "",
        puissance_ch: client.puissance_ch || "",
        prix: client.prix || "",
        commercial: client.commercial || "",
        contact1: client.contact1 || "",
        contact2: client.contact2 || "",
        contact3: client.contact3 || "",
        notes: client.notes || "",
      })
    } else {
      setEditingClient(null)
      setFormData({
        name: "",
        phone: "",
        besoin: "",
        puissance_ch: "",
        prix: "",
        commercial: "",
        contact1: "",
        contact2: "",
        contact3: "",
        notes: "",
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingClient(null)
  }

  /* =========================
     CRUD
  ========================= */

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingClient) {
        await clientsAPI.update(editingClient._id, formData)
      } else {
        await clientsAPI.create(formData)
      }
      fetchClients()
      closeModal()
    } catch (err) {
      console.error(err)
      alert("Erreur lors de l'enregistrement")
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce client ?")) return
    try {
      await clientsAPI.delete(id)
      fetchClients()
    } catch (err) {
      console.error(err)
      alert("Erreur lors de la suppression")
    }
  }

  /* =========================
     FILTER + SEARCH
  ========================= */

  const filteredClients = clients.filter((c) => {
    const searchMatch =
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone?.includes(searchTerm)

    const commercialMatch = filters.commercial
      ? c.commercial
          ?.toLowerCase()
          .includes(filters.commercial.toLowerCase())
      : true

    const besoinMatch = filters.besoin
      ? c.besoin?.toLowerCase().includes(filters.besoin.toLowerCase())
      : true

    return searchMatch && commercialMatch && besoinMatch
  })

  /* =========================
     EXPORT CSV
  ========================= */

  const exportExcel = () => {
    const headers = [
      "Nom",
      "Téléphone",
      "Besoin",
      "Puissance",
      "Prix",
      "Commercial",
      "DA",
      "DC",
    ]

    const rows = filteredClients.map((c) => [
      c.name || "",
      c.phone || "",
      c.besoin || "",
      c.puissance_ch || "",
      c.prix || "",
      c.DA || "",
      c.DC || "",

    ])

    const csv =
      headers.join(",") + "\n" + rows.map((r) => r.join(",")).join("\n")

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "clients.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) return <div className="loading">Chargement...</div>

  return (
    <div className="clients-page">
      {/* HEADER */}
      <div className="page-header">
        <h1>Gestion de client Potentiel</h1>
        <button className="btn-primary" onClick={() => openModal()}>
          + Ajouter Client
        </button>
      </div>

      {/* SEARCH + ACTIONS */}
      <div className="clients-toolbar">
        <div className="search-bar">
          <input
            placeholder="Recherche par nom / téléphone"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="toolbar-actions">
          <button
            className="btn-secondary"
            onClick={() => setFilterOpen(!filterOpen)}
          >
            Filtre
          </button>
          <button className="btn-secondary" onClick={exportExcel}>
            Exporter
          </button>
        </div>
      </div>

      {/* FILTER */}
      {filterOpen && (
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <input
            placeholder="Commercial"
            value={filters.commercial}
            onChange={(e) =>
              setFilters({ ...filters, commercial: e.target.value })
            }
          />
          <input
            placeholder="Besoin"
            value={filters.besoin}
            onChange={(e) =>
              setFilters({ ...filters, besoin: e.target.value })
            }
          />
        </div>
      )}

      {/* TABLE */}
      <div className="clients-table-wrapper">
        <table className="clients-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Téléphone</th>
              <th>Besoin</th>
              <th>Puissance</th>
              <th>Prix</th>
              <th>Commercial</th> 
              <th>DC</th>
              <th>DA</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((c) => (
              <tr key={c._id}>
                <td>{c.name}</td>
                <td>{c.phone}</td>
                <td>{c.besoin || "-"}</td>
                <td>{c.puissance_ch || "-"}</td>
                <td>{c.prix || "-"}</td>
                <td>{c.commercial || "-"}</td>
                <td>{c.DC || "-"}</td>
                <td>{c.DA || "-"}</td>
                <td className="actions-cell">
                  <button onClick={() => openModal(c)}>✏️</button>
                  <button onClick={() => handleDelete(c._id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal client-modal" onClick={(e) => e.stopPropagation()}>
         <form onSubmit={handleSubmit} className="modal-body">

  {/* Ligne 1 */}
  <div className="form-row">
    <div className="form-group">
      <label>Nom *</label>
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
    </div>

    <div className="form-group">
      <label>Téléphone *</label>
      <input
        type="tel"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        required
      />
    </div>
  </div>

  {/* Ligne 2 */}
  <div className="form-row">
    <div className="form-group">
      <label>Besoin</label>
      <select
        value={formData.besoin}
        onChange={(e) => setFormData({ ...formData, besoin: e.target.value })}
      >
        <option value="">--</option>
        <option value="pompage">Pompage</option>
        <option value="raccordement">Raccorde</option>
      </select>
    </div>

    <div className="form-group">
      <label>Puissance (kW)</label>
      <input
        type="number"
        value={formData.puissance}
        onChange={(e) => setFormData({ ...formData, puissance: e.target.value })}
      />
    </div>
  </div>

  {/* Ligne 3 */}
  <div className="form-row">
    <div className="form-group">
      <label>Prix (DT)</label>
      <input
        type="number"
        value={formData.prix}
        onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
      />
    </div>

    <div className="form-group">
      <label>Commercial</label>
      <input
        type="text"
        value={formData.commercial}
        onChange={(e) =>
          setFormData({ ...formData, commercial: e.target.value })
        }
      />
    </div>
  </div>

  {/* Ligne 4 */}
  <div className="form-row">
    <div className="form-group">
      <label>Date DC</label>
      <input
        type="date"
        value={formData.dc}
        onChange={(e) => setFormData({ ...formData, dc: e.target.value })}
      />
    </div>

    <div className="form-group">
      <label>Date DA</label>
      <input
        type="date"
        value={formData.da}
        onChange={(e) => setFormData({ ...formData, da: e.target.value })}
      />
    </div>
  </div>

  {/* Contacts */}
  <div className="form-row">
    <div className="form-group">
      <label>Contact 1</label>
      <input
        type="text"
        value={formData.contact1}
        onChange={(e) =>
          setFormData({ ...formData, contact1: e.target.value })
        }
      />
    </div>

    <div className="form-group">
      <label>Contact 2</label>
      <input
        type="text"
        value={formData.contact2}
        onChange={(e) =>
          setFormData({ ...formData, contact2: e.target.value })
        }
      />
    </div>
  </div>

  <div className="form-group">
    <label>Contact 3</label>
    <input
      type="text"
      value={formData.contact3}
      onChange={(e) =>
        setFormData({ ...formData, contact3: e.target.value })
      }
    />
  </div>

  {/* Notes */}
  <div className="form-group">
    <label>Notes</label>
    <textarea
      rows="3"
      value={formData.notes}
      onChange={(e) =>
        setFormData({ ...formData, notes: e.target.value })
      }
    />
  </div>

  {/* Footer */}
  <div className="modal-footer">
    <button type="submit" className="btn-primary">
      Enregistrer
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

export default Clients
