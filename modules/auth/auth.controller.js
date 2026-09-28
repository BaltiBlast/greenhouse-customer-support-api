import {
  authenticateUser,
  getCurrentUser,
} from "./auth.service.js";
import { loginValidationSchema } from "./auth.validation.js";

function regenerateSession(req) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((error) => (error ? reject(error) : resolve()));
  });
}

function saveSession(req) {
  return new Promise((resolve, reject) => {
    req.session.save((error) => (error ? reject(error) : resolve()));
  });
}

function destroySession(req) {
  return new Promise((resolve, reject) => {
    req.session.destroy((error) => (error ? reject(error) : resolve()));
  });
}

export async function loginController(req, res, next) {
  const validationResult = loginValidationSchema.safeParse(req.body);

  if (!validationResult.success) {
    return res.status(400).json({
      message: "Les identifiants sont invalides.",
    });
  }

  try {
    const user = await authenticateUser(
      validationResult.data.email,
      validationResult.data.password,
    );

    if (!user) {
      return res.status(401).json({
        message: "L'adresse email ou le mot de passe est incorrect.",
      });
    }

    await regenerateSession(req);
    req.session.userId = user.id;
    await saveSession(req);

    return res.status(200).json(user);
  } catch (error) {
    return next(error);
  }
}

export async function getCurrentUserController(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Aucune session active." });
  }

  try {
    const user = await getCurrentUser(req.session.userId);

    if (!user) {
      await destroySession(req);
      res.clearCookie("greenhouse.sid");
      return res.status(401).json({ message: "Aucune session active." });
    }

    return res.status(200).json(user);
  } catch (error) {
    return next(error);
  }
}

export async function logoutController(req, res, next) {
  try {
    await destroySession(req);
    res.clearCookie("greenhouse.sid");
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}
