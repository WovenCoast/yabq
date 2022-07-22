import type { RequestEvent, RequestHandlerOutput } from "@sveltejs/kit";
import { submissionValidator } from "../../../../lib/Quiz";
import type { QuizSubmission } from "../../../../lib/Quiz";
import mongo from "../../../../lib/Mongo";

export async function GET({
  request,
  params,
}: RequestEvent): Promise<RequestHandlerOutput> {
  if (!mongo.connected) mongo.connect();
  const quiz = await mongo.db?.collection("quizzes").findOne({
    alias: params.quiz,
  });
  // console.log(quiz);
  if (!quiz)
    return {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        error: "Quiz not found",
      },
    };

  const makerId = request.headers.get("cookie")?.includes("YABQMakerId")
    ? request.headers
        .get("cookie")
        ?.split(";")
        .find((c) => c.includes("YABQMakerId"))
        ?.split("=")[1]
    : null;
  if (makerId !== quiz.maker)
    return {
      status: 403,
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        error: "You're not the maker of this quiz",
      },
    };

  await mongo.db?.collection("quizzes").deleteOne({
    _id: quiz._id,
  });
  await mongo.db?.collection("submissions").deleteMany({
    quizId: quiz._id,
  });

  return {
    status: 200,
    body: {
      success: true,
    },
  };
}
