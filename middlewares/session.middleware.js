import MongoStore from "connect-mongo";
import session from "express-session";

const sessionSecret = process.env.SESSION_SECRET;
const mongoUrl = process.env.MONGODB_URI;

if (!sessionSecret) {
  throw new Error("Le secret de session est requis.");
}

if (!mongoUrl) {
  throw new Error("L'URI de connexion à la base de données est requise pour les sessions.");
}

const sessionMiddleware = session({
  name: "greenhouse.sid",
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl }),
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 8,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: "auto",
  },
});

export default sessionMiddleware;
