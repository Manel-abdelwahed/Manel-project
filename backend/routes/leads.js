import express from "express"
import auth from "../middleware/authMiddleware.js"
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  updateLeadStatus,
  addInteraction,
  getLeadsByStatus,
} from "../controllers/leadController.js"
const router = express.Router()

/**
 * =========================
 * LEADS CRUD
 * =========================
 */

// 🔹 routes spécifiques 
router.get("/filter/status", auth, getLeadsByStatus)

// 🔹 CRUD général
router.get("/", auth, getLeads)
router.post("/", auth, createLead)

// 🔹 routes dynamiques
router.get("/:id", auth, getLeadById)
router.put("/:id", auth, updateLead)
router.delete("/:id", auth, deleteLead)

/**
 * =========================
 * BUSINESS ACTIONS
 * =========================
 */

// changement de statut (dropdown)
router.patch("/:id/status", auth, updateLeadStatus)

// ajout interaction
router.post("/:id/interactions", auth, addInteraction)

export default router
