import Task from "../models/Task.js"

export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })

    res.json(tasks)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")

    if (!task) {
      return res.status(404).json({ message: "Tâche non trouvée" })
    }

    res.json(task)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createTask = async (req, res) => {
  try {
    const { title, description, type, priority, dueDate, assignedTo } = req.body

    const task = await Task.create({
      title,
      description,
      type,
      priority,
      dueDate,
      assignedTo,
      createdBy: req.user.id,
    })

    res.status(201).json(task)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

    if (!task) {
      return res.status(404).json({ message: "Tâche non trouvée" })
    }

    res.json(task)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id)

    if (!task) {
      return res.status(404).json({ message: "Tâche non trouvée" })
    }

    res.json({ message: "Tâche supprimée avec succès" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
