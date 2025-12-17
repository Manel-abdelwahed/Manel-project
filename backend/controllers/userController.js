import User from "../models/User.js"
import bcrypt from "bcryptjs"

export const getUsers = async (req, res) => {
  try {
    console.log("[v0] Getting all users")
    const users = await User.find().select("-password")
    console.log("[v0] Found users:", users.length)
    res.json(users)
  } catch (err) {
    console.error("[v0] Error getting users:", err)
    res.status(500).json({ message: err.message })
  }
}

export const createUser = async (req, res) => {
  try {
    console.log("[v0] Creating user with data:", { ...req.body, password: "***" })
    const { name, email, password, role } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      console.log("[v0] User already exists:", email)
      return res.status(400).json({ message: "Un utilisateur avec cet email existe déjà" })
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10)

    // Create user
    const user = await User.create({ name, email, password: hashed, role })
    console.log("[v0] User created successfully:", user._id)

    res.status(201).json({
      message: "Utilisateur créé",
      user: { _id: user._id, name, email, role },
    })
  } catch (err) {
    console.error("[v0] Error creating user:", err)
    res.status(400).json({ message: err.message })
  }
}

export const updateUser = async (req, res) => {
  try {
    console.log("[v0] Updating user:", req.params.id)
    const { name, email, password, role } = req.body

    const updateData = { name, email, role }

    // Only update password if provided
    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10)
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select("-password")

    if (!user) {
      console.log("[v0] User not found:", req.params.id)
      return res.status(404).json({ message: "Utilisateur non trouvé" })
    }

    console.log("[v0] User updated successfully")
    res.json({ message: "Utilisateur mis à jour", user })
  } catch (err) {
    console.error("[v0] Error updating user:", err)
    res.status(400).json({ message: err.message })
  }
}

export const updateOwnProfile = async (req, res) => {
  try {
    console.log("[v0] User updating own profile:", req.user.id)
    const { name, email, password } = req.body

    const updateData = { name, email }

    // Only update password if provided
    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10)
    }

    const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true }).select("-password")

    if (!user) {
      console.log("[v0] User not found:", req.user.id)
      return res.status(404).json({ message: "Utilisateur non trouvé" })
    }

    console.log("[v0] User profile updated successfully")
    res.json({ message: "Profil mis à jour", user })
  } catch (err) {
    console.error("[v0] Error updating user profile:", err)
    res.status(400).json({ message: err.message })
  }
}

export const deleteUser = async (req, res) => {
  try {
    console.log("[v0] Deleting user:", req.params.id)
    await User.findByIdAndDelete(req.params.id)
    console.log("[v0] User deleted successfully")
    res.json({ message: "Utilisateur supprimé" })
  } catch (err) {
    console.error("[v0] Error deleting user:", err)
    res.status(500).json({ message: err.message })
  }
}
