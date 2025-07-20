import { AdvocateController } from "@/lib/controllers/AdvocateController";

export async function GET(request: Request): Promise<Response> {
  return AdvocateController.getAdvocates(request);
}
