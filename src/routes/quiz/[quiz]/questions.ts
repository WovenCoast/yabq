import mongo from "../../../../lib/Mongo";
import type { Quiz } from "../../../../lib/Quiz";
import type { RequestEvent, RequestHandlerOutput } from "@sveltejs/kit";

export async function GET({
  params,
  request,
  url,
}: RequestEvent): Promise<RequestHandlerOutput> {
  const name = url.searchParams.get("name");
  if (!mongo.connected) await mongo.connect();
  const quiz: Quiz = (await mongo.db?.collection<Quiz>("quizzes").findOne({
    alias: params.quiz,
  })) as Quiz;
  if (!quiz) return { status: 404 };
  if (request.headers.get("cookie")?.includes(`YABQMakerId=${quiz.maker}`))
    return { status: 403 };
  delete quiz?.maker;

  return {
    status: 200,
    body: {
      name,
      quiz,
    },
  };
}
