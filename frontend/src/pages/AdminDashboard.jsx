"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { analyticsAPI, campaignsAPI } from "../services/api"
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import "../styles/AdminDashboard.css"

function AdminDashboard() {
  const [user, setUser] = useState(null)
  const [analytics, setAnalytics] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalClients: 0,
    totalRevenue: 0,
    campaignPerformance: [],
    clientsBySource: [],
  })
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncingCampaigns, setSyncingCampaigns] = useState(new Set())
  const [googleAnalyticsData, setGoogleAnalyticsData] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      navigate("/login")
      return
    }
    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== "admin") {
      navigate("/dashboard")
      return
    }
    setUser(parsedUser)

    fetchDashboardData()
  }, [navigate])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      // Récupérer les stats du dashboard
      const statsResponse = await analyticsAPI.getDashboardStats()
      setAnalytics(statsResponse.data)

      // Récupérer toutes les campagnes
      const campaignsResponse = await campaignsAPI.getAll()
      setCampaigns(campaignsResponse.data)

      // Synchroniser les données Google Analytics pour chaque campagne
      if (campaignsResponse.data.length > 0) {
        syncAllGoogleAnalytics(campaignsResponse.data)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const syncAllGoogleAnalytics = async (campaignsList) => {
    const googleData = []
    for (const campaign of campaignsList) {
      try {
        setSyncingCampaigns((prev) => new Set(prev).add(campaign._id))
        const response = await analyticsAPI.syncGoogle(campaign._id)
        googleData.push({
          campaignName: campaign.name,
          ...response.data,
        })
      } catch (error) {
        console.error(`Error syncing Google Analytics for campaign ${campaign._id}:`, error)
      } finally {
        setSyncingCampaigns((prev) => {
          const newSet = new Set(prev)
          newSet.delete(campaign._id)
          return newSet
        })
      }
    }
    setGoogleAnalyticsData(googleData)
  }

  const handleSyncGoogleAnalytics = async (campaignId) => {
    try {
      setSyncingCampaigns((prev) => new Set(prev).add(campaignId))
      const response = await analyticsAPI.syncGoogle(campaignId)
      console.log("[v0] Google Analytics sync successful:", response.data)
      // Refresh dashboard data
      fetchDashboardData()
    } catch (error) {
      console.error("Error syncing Google Analytics:", error)
      alert("Erreur lors de la synchronisation Google Analytics")
    } finally {
      setSyncingCampaigns((prev) => {
        const newSet = new Set(prev)
        newSet.delete(campaignId)
        return newSet
      })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    navigate("/login")
  }

  if (!user) return null

  const COLORS = ["#5B5FED", "#60D5DD", "#FF6B9D", "#FFA94D", "#4ECDC4"]

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav admin">
        <h1>Manel Project - Admin</h1>
        <button onClick={handleLogout} className="logout-btn">
          Déconnexion
        </button>
      </nav>

      <div className="dashboard-content">
        <div className="welcome-card admin">
          <h2>Tableau de bord Administrateur</h2>
          <p className="user-role">
            Connecté en tant que: <span className="role-badge admin">{user.role}</span>
          </p>
          <p className="user-email">{user.email}</p>
        </div>

        <div className="analytics-grid">
          <div className="analytics-card">
            <div className="card-icon" style={{ backgroundColor: "#5B5FED" }}>
              📊
            </div>
            <div className="card-content">
              <h3>Total Campagnes</h3>
              <p className="card-value">{analytics.totalCampaigns}</p>
            </div>
          </div>

          <div className="analytics-card">
            <div className="card-icon" style={{ backgroundColor: "#60D5DD" }}>
              🚀
            </div>
            <div className="card-content">
              <h3>Campagnes Actives</h3>
              <p className="card-value">{analytics.activeCampaigns}</p>
            </div>
          </div>

          <div className="analytics-card">
            <div className="card-icon" style={{ backgroundColor: "#FF6B9D" }}>
              👥
            </div>
            <div className="card-content">
              <h3>Total Clients</h3>
              <p className="card-value">{analytics.totalClients}</p>
            </div>
          </div>

          <div className="analytics-card">
            <div className="card-icon" style={{ backgroundColor: "#FFA94D" }}>
              💰
            </div>
            <div className="card-content">
              <h3>Revenu Total</h3>
              <p className="card-value">{analytics.totalRevenue.toLocaleString()} DH</p>
            </div>
          </div>
        </div>

        <div className="google-analytics-section">
          <h3>Synchronisation Google Analytics</h3>
          <p>Mettez à jour les données depuis Google Analytics pour chaque campagne</p>

          {campaigns.length > 0 ? (
            <div className="campaigns-sync-grid">
              {campaigns.map((campaign) => (
                <div key={campaign._id} className="campaign-sync-card">
                  <h4>{campaign.name}</h4>
                  <p className="campaign-budget">Budget: {campaign.budget} DH</p>
                  <button
                    onClick={() => handleSyncGoogleAnalytics(campaign._id)}
                    disabled={syncingCampaigns.has(campaign._id)}
                    className="sync-btn"
                  >
                    {syncingCampaigns.has(campaign._id) ? "Synchronisation..." : "Syncer Google Analytics"}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">Aucune campagne disponible</p>
          )}
        </div>

        <div className="analytics-charts">
          <div className="chart-card">
            <h3>Performance des Campagnes</h3>
            {analytics.campaignPerformance && analytics.campaignPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.campaignPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="budget" fill="#5B5FED" name="Budget" />
                  <Bar dataKey="spent" fill="#FF6B9D" name="Dépensé" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-placeholder">Aucune donnée disponible</div>
            )}
          </div>

          <div className="chart-card">
            <h3>Répartition par Source</h3>
            {analytics.clientsBySource && analytics.clientsBySource.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.clientsBySource}
                    dataKey="count"
                    nameKey="source"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {analytics.clientsBySource.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-placeholder">Aucune donnée disponible</div>
            )}
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card admin">
            <h3>Gestion des utilisateurs</h3>
            <p>Créer, modifier et supprimer des utilisateurs</p>
          </div>
          <div className="dashboard-card admin">
            <h3>Toutes les campagnes</h3>
            <p>Vue complète de toutes les campagnes</p>
          </div>
          <div className="dashboard-card admin">
            <h3>Tous les clients</h3>
            <p>Base de données complète des clients</p>
          </div>
          <div className="dashboard-card admin">
            <h3>Configuration</h3>
            <p>Paramètres système et configuration</p>
          </div>
          <div className="dashboard-card admin">
            <h3>Logs et audit</h3>
            <p>Historique des actions et logs système</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
