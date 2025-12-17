import Lead from "../models/Lead.js"

/**
 * =========================
 * GET ALL LEADS
 * =========================
 */
export const getLeads = async (req, res) => {
  try {
    const leads = await Lead.find()
      .populate("assignedTo", "name email")
      .populate("commercial", "name email") // ✅ مهم
      .populate("createdBy", "name email")
      .populate("campaignId", "name")

    res.json(leads)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

/**
 * =========================
 * GET LEAD BY ID
 * =========================
 */
export const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate("assignedTo", "name email")
      .populate("commercial", "name email") // ✅
      .populate("createdBy", "name email")
      .populate("campaignId", "name")

    if (!lead) {
      return res.status(404).json({ message: "Lead non trouvé" })
    }

    res.json(lead)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

/**
 * =========================
 * CREATE LEAD
 * =========================
 */
export const createLead = async (req, res) => {
  try {
    if (!req.body.name) {
      return res.status(400).json({ message: "Le nom du lead est requis" })
    }

    // commercial / powerKW / needType يجيوا من req.body عادي
    const lead = await Lead.create({
      ...req.body,
      createdBy: req.user?.id,
    })

    res.status(201).json(lead)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

/**
 * =========================
 * UPDATE LEAD (FULL UPDATE)
 * =========================
 */
export const updateLead = async (req, res) => {
  try {
    const { id } = req.params
    const { status, dealAmount } = req.body

    // règle métier
    if (status === "converted" && (!dealAmount || dealAmount <= 0)) {
      return res.status(400).json({
        message: "Le montant est obligatoire pour un lead converti",
      })
    }

    const updateData = { ...req.body }

    if (status === "converted") {
      updateData.convertedAt = new Date()
    }

    const updated = await Lead.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("assignedTo", "name email")
      .populate("commercial", "name email") // ✅
      .populate("createdBy", "name email")
      .populate("campaignId", "name")

    if (!updated) {
      return res.status(404).json({ message: "Lead non trouvé" })
    }

    res.json({ message: "Lead mis à jour", lead: updated })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

/**
 * =========================
 * UPDATE LEAD STATUS
 * =========================
 */
export const updateLeadStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status, dealAmount } = req.body

    if (!["new", "contacted", "qualified", "converted", "lost"].includes(status)) {
      return res.status(400).json({ message: "Statut invalide" })
    }

    if (status === "converted" && (!dealAmount || dealAmount <= 0)) {
      return res.status(400).json({
        message: "Veuillez saisir le montant de la vente",
      })
    }

    const updateData = { status }

    if (status === "converted") {
      updateData.dealAmount = dealAmount
      updateData.convertedAt = new Date()
    }

    const updated = await Lead.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })

    if (!updated) {
      return res.status(404).json({ message: "Lead non trouvé" })
    }

    res.json({ message: "Statut mis à jour", lead: updated })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

/**
 * =========================
 * DELETE LEAD
 * =========================
 */
export const deleteLead = async (req, res) => {
  try {
    const deleted = await Lead.findByIdAndDelete(req.params.id)

    if (!deleted) {
      return res.status(404).json({ message: "Lead non trouvé" })
    }

    res.json({ message: "Lead supprimé avec succès" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

/**
 * =========================
 * ADD INTERACTION
 * =========================
 */
export const addInteraction = async (req, res) => {
  try {
    const { type, notes } = req.body

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          interactions: {
            type,
            date: new Date(),
            notes,
          },
        },
        lastContactDate: new Date(),
      },
      { new: true },
    )

    if (!lead) {
      return res.status(404).json({ message: "Lead non trouvé" })
    }

    res.json({ message: "Interaction ajoutée", lead })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

/**
 * =========================
 * GET LEADS BY STATUS
 * =========================
 */
export const getLeadsByStatus = async (req, res) => {
  try {
    const { status } = req.query
    const query = status ? { status } : {}

    const leads = await Lead.find(query)
      .populate("assignedTo", "name email")
      .populate("commercial", "name email") // ✅
      .populate("createdBy", "name email")

    res.json(leads)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}