export function errorMiddleware(error, req, res, next) {
  console.error("Erreur interne de l’API :", error.message);

  if (res.headersSent) {
    return next(error);
  }

  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({
      message: "Les données fournies sont invalides.",
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      message: "Une ressource avec ces informations existe déjà.",
    });
  }

  return res.status(500).json({
    message: "Une erreur interne est survenue.",
  });
}
