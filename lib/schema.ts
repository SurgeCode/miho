import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Schema for the miho_invited table
 * 
 * This table stores addresses that have been invited to the application.
 * Each address can only appear once as it's the primary key.
 */
export const mihoInvited = pgTable("miho_invited", {
  address: text("address").primaryKey(),
}); 