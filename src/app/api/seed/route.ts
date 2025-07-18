import db from "../../../db";
import { advocates } from "../../../db/schema";
import { advocateData } from "../../../db/seed/advocates";

export async function POST() {
  try {
    // Check if database is properly configured
    if (!db) {
      return Response.json(
        { 
          error: "Database not configured. Please set DATABASE_URL environment variable and ensure the database is running.",
          instructions: [
            "1. Create a .env file with: DATABASE_URL=<postgres connection string>",
            "2. Start the database: docker compose up -d",
            "3. Run migrations: npx drizzle-kit push",
            "4. Try seeding again"
          ]
        },
        { status: 400 }
      );
    }

    const records = await db.insert(advocates).values(advocateData).returning();
    return Response.json({ advocates: records });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Unknown error seeding database");
    console.error("Error seeding database:", error);
    return Response.json(
      { 
        error: "Failed to seed database",
        details: error.message
      },
      { status: 500 }
    );
  }
}
