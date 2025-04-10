import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

// Ensure DATABASE_URL is defined
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

// Create SQL client using the Neon serverless driver
const sql = neon(process.env.DATABASE_URL);

// Initialize Drizzle ORM with the SQL client
export const db = drizzle(sql); 