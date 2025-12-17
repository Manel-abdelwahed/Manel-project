"use client"

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import Login from "./pages/Login"
import DashboardLayout from "./components/DashboardLayout"
import Dashboard from "./pages/Dashboard"
import Campaigns from "./pages/Campaigns"
import Clients from "./pages/Clients"
import Leads from "./pages/Leads"
import Users from "./pages/Users"
import Analytics from "./pages/Analytics"
import Settings from "./pages/Settings"
import "./App.css"

function AppRoutes() {
  const { user, loading, logout } = useAuth()

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          fontSize: "1.2rem",
          color: "#5b5fed",
        }}
      >
        Chargement...
      </div>
    )
  }

  const handleLogin = (userData) => {
    console.log("User logged in:", userData)
  }

  const getAvailableRoutes = () => {
    const routes = [
      <Route key="dashboard" index element={<Dashboard user={user} />} />,
      <Route key="settings" path="settings" element={<Settings user={user} />} />,
    ]

    // Admin can access everything
    if (user?.role === "admin") {
      routes.push(
        <Route key="campaigns" path="campaigns" element={<Campaigns user={user} />} />,
        <Route key="clients" path="clients" element={<Clients user={user} />} />,
        <Route key="leads" path="leads" element={<Leads user={user} />} />,
        <Route key="users" path="users" element={<Users user={user} />} />,
        <Route key="analytics" path="analytics" element={<Analytics user={user} />} />,
      )
    }

    // Marketing can access campaigns, leads and analytics
    if (user?.role === "marketing") {
      routes.push(
        <Route key="campaigns" path="campaigns" element={<Campaigns user={user} />} />,
        <Route key="clients" path="clients" element={<Clients user={user} />} />,
        <Route key="leads" path="leads" element={<Leads user={user} />} />,
        <Route key="analytics" path="analytics" element={<Analytics user={user} />} />,
      )
    }

    // Commercial can access clients and leads
    if (user?.role === "commercial") {
      routes.push(
        <Route key="clients" path="clients" element={<Clients user={user} />} />,
        <Route key="leads" path="leads" element={<Leads user={user} />} />,
      )
    }

    return routes
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />} />
      <Route
        path="/dashboard/*"
        element={user ? <DashboardLayout user={user} onLogout={logout} /> : <Navigate to="/login" replace />}
      >
        {getAvailableRoutes()}
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

export default App
