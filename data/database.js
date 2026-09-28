import mongoose from "mongoose";

export async function connectDatabase(uri) {
  if (!uri) {
    throw new Error("L'URI de connexion à la base de données est requise.");
  }

  await mongoose.connect(uri);
  return mongoose.connection;
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
