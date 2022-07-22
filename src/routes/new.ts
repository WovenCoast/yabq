import type { RequestEvent, RequestHandlerOutput } from "@sveltejs/kit";
import mongo from "../../lib/Mongo";

export async function GET({
  request,
}: RequestEvent): Promise<RequestHandlerOutput> {
  if (!request.headers.get("cookie")?.includes("YABQMakerId"))
    return {
      status: 200,
    };

  const makerId = request.headers
    .get("cookie")
    ?.split(";")
    .find((c) => c.includes("YABQMakerId"))
    ?.split("=")[1];
  if (!makerId)
    return {
      status: 200,
    };

  if (!mongo.connected) await mongo.connect();
  const quiz = await mongo.db?.collection("quizzes").findOne({
    maker: makerId,
  });
  // console.log(quiz);
  if (quiz)
    return {
      status: 200,
      body: {
        redirect: `/quiz/${quiz.alias}`,
      },
    };
  // return {
  //   status: 301,
  //   headers: {
  //     "Cache-Control": "no-store",
  //     location: `/quiz/${quiz.alias}`,
  //   },
  // };

  return {
    status: 200,
  };
}
