import express from "express"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
import connectDB from "./config/db.js"



const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, "..", ".env") })

if (!process.env.JWT_SECRET) {
  console.error("❌ ERREUR: JWT_SECRET n'est pas défini dans le fichier .env")
  process.exit(1)
}

// Connexion à la base de données
connectDB()

const app = express()

// Middleware
app.use(express.json())

// Routes
import authRoutes from "./routes/auth.js"
import userRoutes from "./routes/users.js"
import campaignRoutes from "./routes/campaigns.js"
import clientRoutes from "./routes/clients.js"
import analyticsRoutes from "./routes/analytics.js"
import taskRoutes from "./routes/tasks.js"
import leadRoutes from "./routes/leads.js"

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/campaigns", campaignRoutes)
app.use("/api/clients", clientRoutes)
app.use("/api/analytics", analyticsRoutes)
app.use("/api/tasks", taskRoutes)
app.use("/api/leads", leadRoutes)



// Lancement du serveur
const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`))
