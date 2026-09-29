const protectedMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function getAllowedOrigin() {
  const frontendUrl = process.env.FRONTEND_URL;

  if (!frontendUrl) {
    return null;
  }

  try {
    return new URL(frontendUrl).origin;
  } catch {
    throw new Error("L'URL du frontend est invalide.");
  }
}

export function csrfProtectionMiddleware(req, res, next) {
  if (!protectedMethods.has(req.method)) {
    return next();
  }

  const allowedOrigin = getAllowedOrigin();
  const requestOrigin = req.get("origin");

  if (!requestOrigin && process.env.NODE_ENV !== "production") {
    return next();
  }

  if (!allowedOrigin || requestOrigin !== allowedOrigin) {
    return res.status(403).json({
      message: "L'origine de la requête n'est pas autorisée.",
    });
  }

  return next();
}
