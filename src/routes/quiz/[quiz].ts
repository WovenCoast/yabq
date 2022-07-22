import type { RequestEvent, RequestHandlerOutput } from "@sveltejs/kit";
import {
  convertToSecureQuiz,
  convertToSecureSubmissions,
} from "../../../lib/Quiz";
import type { Quiz, QuizSecure, QuizSubmission } from "../../../lib/Quiz";
import mongo from "../../../lib/Mongo";

export async function GET({
  request,
  params,
}: RequestEvent): Promise<RequestHandlerOutput> {
  if (!mongo.connected) await mongo.connect();
  const quiz: QuizSecure | null = convertToSecureQuiz(
    await mongo.db?.collection<Quiz>("quizzes").findOne({
      alias: params.quiz,
    }),
    request.headers.get("cookie") || ""
  );
  if (!quiz) return { status: 404 };
  const submissions = await convertToSecureSubmissions(
    await mongo.db
      ?.collection<QuizSubmission>("submissions")
      .find({
        quizId: quiz._id,
      })
      .toArray(),
    request.headers.get("cookie") || ""
  );
  return {
    status: 200,
    body: {
      quiz,
      submissions,
      submission: submissions.find((s) => s.isUser) || null,
      hasDoneQuiz: submissions.some((s) => s.isUser),
      // isMaker: quiz.maker,
    },
  };
}
