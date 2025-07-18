import type { ApiResponse } from "@/types";
import db from "../../../db";
import { advocates } from "../../../db/schema";

export async function GET(): Promise<Response> {
  try {
    if (!db) {
      return Response.json(
        { error: "Database not configured. Please and ensure the database is running." },
        { status: 400 }
      );
    }

    const data = await db.select().from(advocates);

    const response: ApiResponse<typeof data> = { data };
    return Response.json(response);
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Unknown error Getting advocates");
    console.error("Error fetching advocates:", error);
    const errorResponse: ApiResponse<never> = {
      data: [] as never,
      error: "Failed to fetch advocates",
      message: error.message
    };
    return Response.json(errorResponse, { status: 500 });
  }
}
