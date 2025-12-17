import Campaign from "../models/Campaign.js"

export const getCampaigns = async (req, res) => {
  try {
    console.log("[v0] Getting all campaigns")
    const campaigns = await Campaign.find()
    console.log("[v0] Found campaigns:", campaigns.length)
    res.json(campaigns)
  } catch (err) {
    console.error("[v0] Error getting campaigns:", err)
    res.status(500).json({ message: err.message })
  }
}

export const createCampaign = async (req, res) => {
  try {
    console.log("[v0] Creating campaign with data:", req.body)
    // Ensure both name and title are set
    const campaignData = {
      ...req.body,
      title: req.body.title || req.body.name,
      name: req.body.name || req.body.title,
    }
    const campaign = await Campaign.create(campaignData)
    console.log("[v0] Campaign created successfully:", campaign._id)
    res.status(201).json(campaign)
  } catch (err) {
    console.error("[v0] Error creating campaign:", err)
    res.status(400).json({ message: err.message })
  }
}

export const updateCampaign = async (req, res) => {
  try {
    console.log("[v0] Updating campaign:", req.params.id)
    const campaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!campaign) {
      console.log("[v0] Campaign not found:", req.params.id)
      return res.status(404).json({ message: "Campagne non trouvée" })
    }
    console.log("[v0] Campaign updated successfully")
    res.json(campaign)
  } catch (err) {
    console.error("[v0] Error updating campaign:", err)
    res.status(400).json({ message: err.message })
  }
}

export const deleteCampaign = async (req, res) => {
  try {
    console.log("[v0] Deleting campaign:", req.params.id)
    const campaign = await Campaign.findByIdAndDelete(req.params.id)
    if (!campaign) {
      console.log("[v0] Campaign not found:", req.params.id)
      return res.status(404).json({ message: "Campagne non trouvée" })
    }
    console.log("[v0] Campaign deleted successfully")
    res.json({ message: "Campagne supprimée" })
  } catch (err) {
    console.error("[v0] Error deleting campaign:", err)
    res.status(500).json({ message: err.message })
  }
}
