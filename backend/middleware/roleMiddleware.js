// middleware/roleMiddleware.js
export default function authorize(requiredRole) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== requiredRole) {
      return res.status(403).json({ message: "Accès refusé : rôle non autorisé" });
    }
    next();
  };
}
