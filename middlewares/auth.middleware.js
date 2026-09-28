export function requireAuthentication(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({
      message: "Une authentification est requise.",
    });
  }

  return next();
}
