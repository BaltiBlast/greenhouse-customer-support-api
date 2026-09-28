export function errorMiddleware(error, req, res, next) {
  console.error("Erreur interne de l’API :", error.message);

  if (res.headersSent) {
    return next(error);
  }

  return res.status(500).json({
    message: "Une erreur interne est survenue.",
  });
}
