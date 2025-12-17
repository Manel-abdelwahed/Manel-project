"use client"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import api from "../services/api"
import "../styles/Dashboard.css"

function Dashboard({ user }) {
  const navigate = useNavigate()
  const [analytics, setAnalytics] = useState(null)
  const [metaStats, setMetaStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) {
      navigate("/login")
      return
    }

    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const response = await api.get("/analytics/dashboard")
        console.log("[v0] Dashboard data received:", response.data)

        setAnalytics({
          internal: {
            totalLeads: 0,
            convertedLeads: 0,
            conversionRate: 0,
            totalCampaigns: response.data.totalCampaigns,
            totalUsers: 0,
            totalClients: response.data.totalClients,
          },
          external: {
            traffic: { rows: [] },
            sources: { rows: [] },
          },
        })

        if (response.data.metaAds) {
          setMetaStats(response.data.metaAds)
          console.log("[v0] Meta Ads stats loaded:", response.data.metaAds)
        }

        setError(null)
      } catch (err) {
        console.error("[v0] Error fetching analytics:", err)
        setError("Impossible de charger les données - " + (err.response?.data?.message || err.message))
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [user, navigate])

  if (!user) {
    navigate("/login")
    return null
  }

  const renderDashboardContent = () => {
    if (user.role === "admin") {
      return renderAdminDashboard()
    } else if (user.role === "marketing") {
      return renderMarketingDashboard()
    } else if (user.role === "commercial") {
      return renderCommercialDashboard()
    }
  }

  // Admin Dashboard - Sees everything
  const renderAdminDashboard = () => (
    <>
      <div className="dashboard-header">
        <div>
          <h2>Tableau de bord Administrateur</h2>
          <p className="subtitle">Vue complète du système CRM</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading">Chargement des données...</div>}

      {analytics && (
        <>
          {/* Internal CRM Stats */}
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-label">Total Leads</span>
                <span className="kpi-period">MOIS</span>
              </div>
              <div className="kpi-value">{analytics.internal?.totalLeads || 0}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-label">Leads Convertis</span>
                <span className="kpi-period">MOIS</span>
              </div>
              <div className="kpi-value">{analytics.internal?.convertedLeads || 0}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-label">Taux de Conversion</span>
                <span className="kpi-period">%</span>
              </div>
              <div className="kpi-value">{analytics.internal?.conversionRate || 0}%</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-label">Campagnes Actives</span>
                <span className="kpi-period">TOTAL</span>
              </div>
              <div className="kpi-value">{analytics.internal?.totalCampaigns || 0}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-label">Utilisateurs</span>
                <span className="kpi-period">TOTAL</span>
              </div>
              <div className="kpi-value">{analytics.internal?.totalUsers || 0}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-label">Clients</span>
                <span className="kpi-period">TOTAL</span>
              </div>
              <div className="kpi-value">{analytics.internal?.totalClients || 0}</div>
            </div>
          </div>

          {metaStats && (
            <div className="analytics-section">
              <h3 className="section-title">Statistiques Meta Ads</h3>
              <div className="kpi-grid">
                <div className="kpi-card meta-card">
                  <div className="kpi-header">
                    <span className="kpi-label">Impressions</span>
                    <span className="kpi-period">TOTAL</span>
                  </div>
                  <div className="kpi-value">{metaStats.totalImpressions || 0}</div>
                </div>
                <div className="kpi-card meta-card">
                  <div className="kpi-header">
                    <span className="kpi-label">Clics</span>
                    <span className="kpi-period">TOTAL</span>
                  </div>
                  <div className="kpi-value">{metaStats.totalClicks || 0}</div>
                </div>
                <div className="kpi-card meta-card">
                  <div className="kpi-header">
                    <span className="kpi-label">Dépenses</span>
                    <span className="kpi-period">USD</span>
                  </div>
                  <div className="kpi-value">${(metaStats.totalSpend || 0).toFixed(2)}</div>
                </div>
                <div className="kpi-card meta-card">
                  <div className="kpi-header">
                    <span className="kpi-label">Conversions</span>
                    <span className="kpi-period">TOTAL</span>
                  </div>
                  <div className="kpi-value">{metaStats.totalConversions || 0}</div>
                </div>
                <div className="kpi-card meta-card">
                  <div className="kpi-header">
                    <span className="kpi-label">CPC Moyen</span>
                    <span className="kpi-period">USD</span>
                  </div>
                  <div className="kpi-value">${(metaStats.avgCPC || 0).toFixed(2)}</div>
                </div>
                <div className="kpi-card meta-card">
                  <div className="kpi-header">
                    <span className="kpi-label">CPM Moyen</span>
                    <span className="kpi-period">USD</span>
                  </div>
                  <div className="kpi-value">${(metaStats.avgCPM || 0).toFixed(2)}</div>
                </div>
                <div className="kpi-card meta-card">
                  <div className="kpi-header">
                    <span className="kpi-label">Portée</span>
                    <span className="kpi-period">TOTAL</span>
                  </div>
                  <div className="kpi-value">{metaStats.totalReach || 0}</div>
                </div>
              </div>
            </div>
          )}

          {/* Google Analytics Section */}
          <div className="analytics-section">
            <h3 className="section-title">Données Google Analytics</h3>
            <div className="charts-grid">
              <div className="chart-card">
                <div className="chart-header">
                  <h4>Utilisateurs Actifs (30 jours)</h4>
                </div>
                <div className="chart-content">
                  {analytics.external?.traffic?.rows?.length > 0 ? (
                    <div className="data-table">
                      <p>Utilisateurs: {analytics.external.traffic.rows[0]?.metricValues[0]?.value || 0}</p>
                      <p>Sessions: {analytics.external.traffic.rows[0]?.metricValues[1]?.value || 0}</p>
                      <p>Pages vues: {analytics.external.traffic.rows[0]?.metricValues[2]?.value || 0}</p>
                    </div>
                  ) : (
                    <p>Aucune donnée disponible</p>
                  )}
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header">
                  <h4>Sources de Trafic</h4>
                </div>
                <div className="chart-content">
                  {analytics.external?.sources?.rows?.length > 0 ? (
                    <div className="data-table">
                      {analytics.external.sources.rows.map((row, idx) => (
                        <p key={idx}>
                          {row.dimensionValues[0]?.value}: {row.metricValues[0]?.value} sessions
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p>Aucune donnée disponible</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Commercial Charts Section */}
          <div className="charts-grid">
            <div className="chart-card">
              <div className="chart-header">
                <h3>Activité Commercial (chiffre d'affaire)</h3>
              </div>
              <div className="chart-content">
                <svg viewBox="0 0 400 200" className="line-chart">
                  <polyline
                    points="20,150 80,120 140,130 200,100 260,90 320,80 380,70"
                    fill="none"
                    stroke="#60d5dd"
                    strokeWidth="3"
                  />
                  <polyline
                    points="20,180 80,160 140,165 200,140 260,130 320,120 380,110"
                    fill="none"
                    stroke="#5b5fed"
                    strokeWidth="3"
                    strokeDasharray="5,5"
                  />
                </svg>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3>Valeur moyenne des contrats Fermée</h3>
              </div>
              <div className="chart-content">
                <div className="bar-chart">
                  <div className="bar-group">
                    <div className="bar" style={{ height: "60%", background: "#60d5dd" }}></div>
                    <span className="bar-label">Année 40</span>
                  </div>
                  <div className="bar-group">
                    <div className="bar" style={{ height: "85%", background: "#5b5fed" }}></div>
                    <span className="bar-label">Année 41</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3>Activité Commercial (Heures)</h3>
              </div>
              <div className="chart-content">
                <svg viewBox="0 0 400 200" className="line-chart">
                  <polyline
                    points="20,160 80,140 140,145 200,120 260,110 320,100 380,90"
                    fill="none"
                    stroke="#60d5dd"
                    strokeWidth="3"
                  />
                </svg>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3>Ratio</h3>
              </div>
              <div className="chart-content">
                <div className="pie-chart">
                  <svg viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="80" fill="#60d5dd" />
                    <path d="M100,100 L100,20 A80,80 0 0,1 180,100 Z" fill="#5b5fed" />
                    <path d="M100,100 L180,100 A80,80 0 0,1 140,170 Z" fill="#a5b4fc" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )

  // Marketing Dashboard - Sees campaigns and analytics
  const renderMarketingDashboard = () => (
    <>
      <div className="dashboard-header">
        <div>
          <h2>Tableau de bord Marketing</h2>
          <p className="subtitle">Suivi des campagnes et performances</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading">Chargement des données...</div>}

      {analytics && (
        <>
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-label">Campagnes Actives</span>
                <span className="kpi-period">TOTAL</span>
              </div>
              <div className="kpi-value">{analytics.internal?.totalCampaigns || 0}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-label">Total Leads</span>
                <span className="kpi-period">MOIS</span>
              </div>
              <div className="kpi-value">{analytics.internal?.totalLeads || 0}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-label">Taux de Conversion</span>
                <span className="kpi-period">%</span>
              </div>
              <div className="kpi-value">{analytics.internal?.conversionRate || 0}%</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-label">Leads Convertis</span>
                <span className="kpi-period">MOIS</span>
              </div>
              <div className="kpi-value">{analytics.internal?.convertedLeads || 0}</div>
            </div>
          </div>

          <div className="analytics-section">
            <h3 className="section-title">Données Google Analytics</h3>
            <div className="charts-grid">
              <div className="chart-card">
                <div className="chart-header">
                  <h4>Utilisateurs Actifs (30 jours)</h4>
                </div>
                <div className="chart-content">
                  {analytics.external?.traffic?.rows?.length > 0 ? (
                    <div className="data-table">
                      <p>Utilisateurs: {analytics.external.traffic.rows[0]?.metricValues[0]?.value || 0}</p>
                      <p>Sessions: {analytics.external.traffic.rows[0]?.metricValues[1]?.value || 0}</p>
                      <p>Pages vues: {analytics.external.traffic.rows[0]?.metricValues[2]?.value || 0}</p>
                    </div>
                  ) : (
                    <p>Aucune donnée disponible</p>
                  )}
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header">
                  <h4>Sources de Trafic</h4>
                </div>
                <div className="chart-content">
                  {analytics.external?.sources?.rows?.length > 0 ? (
                    <div className="data-table">
                      {analytics.external.sources.rows.map((row, idx) => (
                        <p key={idx}>
                          {row.dimensionValues[0]?.value}: {row.metricValues[0]?.value} sessions
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p>Aucune donnée disponible</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <h3>Performance des Campagnes</h3>
          </div>
          <div className="chart-content">
            <svg viewBox="0 0 400 200" className="line-chart">
              <polyline
                points="20,150 80,120 140,130 200,100 260,90 320,80 380,70"
                fill="none"
                stroke="#60d5dd"
                strokeWidth="3"
              />
            </svg>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3>Engagement par Canal</h3>
          </div>
          <div className="chart-content">
            <div className="pie-chart">
              <svg viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="80" fill="#60d5dd" />
                <path d="M100,100 L100,20 A80,80 0 0,1 180,100 Z" fill="#5b5fed" />
                <path d="M100,100 L180,100 A80,80 0 0,1 140,170 Z" fill="#a5b4fc" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </>
  )

  // Commercial Dashboard - Sees clients and sales
  const renderCommercialDashboard = () => (
    <>
      <div className="dashboard-header">
        <div>
          <h2>Tableau de bord Commercial</h2>
          <p className="subtitle">Suivi des clients et opportunités</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading">Chargement des données...</div>}

      {analytics && (
        <>
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-label">Total Clients</span>
                <span className="kpi-period">TOTAL</span>
              </div>
              <div className="kpi-value">{analytics.internal?.totalClients || 0}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-label">Total Leads</span>
                <span className="kpi-period">MOIS</span>
              </div>
              <div className="kpi-value">{analytics.internal?.totalLeads || 0}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-label">Leads Convertis</span>
                <span className="kpi-period">MOIS</span>
              </div>
              <div className="kpi-value">{analytics.internal?.convertedLeads || 0}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-label">Taux de Conversion</span>
                <span className="kpi-period">%</span>
              </div>
              <div className="kpi-value">{analytics.internal?.conversionRate || 0}%</div>
            </div>
          </div>
        </>
      )}

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <h3>Activité Commercial (chiffre d'affaire)</h3>
          </div>
          <div className="chart-content">
            <svg viewBox="0 0 400 200" className="line-chart">
              <polyline
                points="20,150 80,120 140,130 200,100 260,90 320,80 380,70"
                fill="none"
                stroke="#60d5dd"
                strokeWidth="3"
              />
            </svg>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3>Valeur moyenne des contrats Fermée</h3>
          </div>
          <div className="chart-content">
            <div className="bar-chart">
              <div className="bar-group">
                <div className="bar" style={{ height: "60%", background: "#60d5dd" }}></div>
                <span className="bar-label">Année 40</span>
              </div>
              <div className="bar-group">
                <div className="bar" style={{ height: "85%", background: "#5b5fed" }}></div>
                <span className="bar-label">Année 41</span>
              </div>
            </div>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3>Opportunités par Statut</h3>
          </div>
          <div className="chart-content">
            <div className="pie-chart">
              <svg viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="80" fill="#60d5dd" />
                <path d="M100,100 L100,20 A80,80 0 0,1 180,100 Z" fill="#5b5fed" />
                <path d="M100,100 L180,100 A80,80 0 0,1 140,170 Z" fill="#a5b4fc" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </>
  )

  return <div className="dashboard-page">{renderDashboardContent()}</div>
}

export default Dashboard