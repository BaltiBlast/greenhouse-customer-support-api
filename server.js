import "dotenv/config";
import app from "./app.js";
import { connectDatabase } from "./data/database.js";

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectDatabase(process.env.MONGODB_URI);
    console.log("Connexion à MongoDB établie.");

    app.listen(PORT, () => {
      console.log(`La broche tourne sur http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Impossible de se connecter à MongoDB :", error.message);
    process.exit(1);
  }
}

startServer();
