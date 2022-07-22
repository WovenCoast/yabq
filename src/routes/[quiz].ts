import type { RequestEvent, RequestHandlerOutput } from "@sveltejs/kit";

export async function GET({
  params,
}: RequestEvent): Promise<RequestHandlerOutput> {
  // console.log(params);
  return {
    status: 301,
    headers: {
      "Cache-Control": "no-store",
      location: `/quiz/${params.quiz}`,
    },
  };
}
