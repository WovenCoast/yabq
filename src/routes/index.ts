import mongo from "../../lib/Mongo";
import type { RequestEvent, RequestHandlerOutput } from "@sveltejs/kit";

export async function GET({
  request,
}: RequestEvent): Promise<RequestHandlerOutput> {
  return {
    status: 301,
    headers: {
      location: `/new`,
    },
  };
}
