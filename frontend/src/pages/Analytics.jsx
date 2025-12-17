"use client"

import { useState, useEffect } from "react"
import { analyticsAPI } from "../services/api"
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import "../styles/Analytics.css"

function Analytics({ user }) {
  const [analytics, setAnalytics] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalClients: 0,
    totalRevenue: 0,
    campaignPerformance: [],
    clientsBySource: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await analyticsAPI.getDashboardStats()
      setAnalytics(response.data)
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Chargement des analytiques...</div>
  }

  const COLORS = ["#5B5FED", "#60D5DD", "#FF6B9D", "#FFA94D", "#4ECDC4"]

  return (
    <div className="analytics-page">
      <div className="page-header">
        <h2>Analytiques</h2>
        <p>Vue d'ensemble des performances</p>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card">
          <div className="card-icon" style={{ backgroundColor: "#5B5FED" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2L2 7l10 5 10-5-10-5z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="card-content">
            <h3>Total Campagnes</h3>
            <p className="card-value">{analytics.totalCampaigns}</p>
            <span className="card-label">Toutes les campagnes</span>
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-icon" style={{ backgroundColor: "#60D5DD" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
              <path d="M12 6v6l4 2" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="card-content">
            <h3>Campagnes Actives</h3>
            <p className="card-value">{analytics.activeCampaigns}</p>
            <span className="card-label">En cours</span>
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-icon" style={{ backgroundColor: "#FF6B9D" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="8.5" cy="7" r="4" stroke="white" strokeWidth="2" />
              <path d="M20 8v6M23 11h-6" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="card-content">
            <h3>Total Clients</h3>
            <p className="card-value">{analytics.totalClients}</p>
            <span className="card-label">Clients enregistrés</span>
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-icon" style={{ backgroundColor: "#FFA94D" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="card-content">
            <h3>Budget Total</h3>
            <p className="card-value">{analytics.totalRevenue.toLocaleString()} Dt</p>
            <span className="card-label">Dépenses marketing</span>
          </div>
        </div>
      </div>

      <div className="analytics-charts">
        <div className="chart-card">
          <h3>Budget des Campagnes</h3>
          {analytics.campaignPerformance.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.campaignPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="budget" fill="#5B5FED" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-placeholder">
              <p>Aucune donnée disponible</p>
            </div>
          )}
        </div>

        <div className="chart-card">
          <h3>Clients par Source</h3>
          {analytics.clientsBySource.length > 0 ? (
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
            <div className="chart-placeholder">
              <p>Aucune donnée disponible</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Analytics
