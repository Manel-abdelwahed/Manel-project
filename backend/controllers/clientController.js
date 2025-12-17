import Client from "../models/Client.js"

export const getClients = async (req, res) => {
  try {
    console.log("[v0] Getting clients for user:", req.user?.id)
    // Get all clients (removed createdBy filter to show all clients)
    const clients = await Client.find()
    console.log("[v0] Found clients:", clients.length)
    res.json(clients)
  } catch (err) {
    console.error("[v0] Error getting clients:", err)
    res.status(500).json({ message: err.message })
  }
}

export const createClient = async (req, res) => {
  try {
    console.log("[v0] Creating client with data:", req.body)
    console.log("[v0] User:", req.user)

    const clientData = {
      ...req.body,
      createdBy: req.user?.id,
    }

    const client = await Client.create(clientData)
    console.log("[v0] Client created successfully:", client._id)
    res.status(201).json(client)
  } catch (err) {
    console.error("[v0] Error creating client:", err)
    res.status(400).json({ message: err.message })
  }
}

export const updateClient = async (req, res) => {
  try {
    console.log("[v0] Updating client:", req.params.id)
    const { id } = req.params
    const updated = await Client.findByIdAndUpdate(id, req.body, { new: true })
    if (!updated) {
      console.log("[v0] Client not found:", id)
      return res.status(404).json({ message: "Client non trouvé" })
    }
    console.log("[v0] Client updated successfully")
    res.json({ message: "Client mis à jour", client: updated })
  } catch (err) {
    console.error("[v0] Error updating client:", err)
    res.status(500).json({ message: err.message })
  }
}

export const deleteClient = async (req, res) => {
  try {
    console.log("[v0] Deleting client:", req.params.id)
    const { id } = req.params
    const deleted = await Client.findByIdAndDelete(id)
    if (!deleted) {
      console.log("[v0] Client not found:", id)
      return res.status(404).json({ message: "Client non trouvé" })
    }
    console.log("[v0] Client deleted successfully")
    res.json({ message: "Client supprimé avec succès" })
  } catch (err) {
    console.error("[v0] Error deleting client:", err)
    res.status(500).json({ message: err.message })
  }
}
