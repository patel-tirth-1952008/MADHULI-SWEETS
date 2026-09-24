import { MongoClient } from "mongodb";

let client: MongoClient | null = null;

/**
 * Direct MongoDB driver access for the few things Prisma's Mongo connector
 * can't do (case-insensitive search). Lazy single connection.
 */
export async function getMongo() {
  if (!client) {
    client = new MongoClient(process.env.DATABASE_URL ?? "mongodb://127.0.0.1:27017/madhuli", {
      serverSelectionTimeoutMS: 5000,
    });
    await client.connect();
  }
  return client;
}
