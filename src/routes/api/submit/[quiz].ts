import type { RequestEvent, RequestHandlerOutput } from "@sveltejs/kit";
import { submissionValidator } from "../../../../lib/Quiz";
import type { QuizSubmission } from "../../../../lib/Quiz";
import mongo from "../../../../lib/Mongo";

export async function POST({
  request,
  params,
}: RequestEvent): Promise<RequestHandlerOutput> {
  if (!mongo.connected) mongo.connect();
  const submissionRaw = await request.json();
  const quiz = await mongo.db?.collection("quizzes").findOne({
    alias: params.quiz,
  });
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
  submissionRaw.quizId = quiz._id;
  if ((request.headers.get("cookie") || "").includes("YABQUserId"))
    submissionRaw.userId = request.headers
      .get("cookie")
      ?.split(";")
      .find((s) => s.includes("YABQUserId"))
      ?.split("=")[1];
  const existingSubmission = await mongo.db?.collection("submissions").findOne({
    quizId: quiz._id,
    userId: submissionRaw.userId,
  });
  if (existingSubmission)
    return {
      status: 403,
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        error: "Already submitted this quiz",
      },
    };

  const makerId = request.headers.get("cookie")?.includes("YABQMakerId")
    ? request.headers
        .get("cookie")
        ?.split(";")
        .find((c) => c.includes("YABQMakerId"))
        ?.split("=")[1]
    : null;
  if (makerId === quiz.maker)
    return {
      status: 403,
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        error: "Quiz maker can't make submissions",
      },
    };

  if (!submissionRaw)
    return {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
      body: { error: "No submission data provided" },
    };
  const submission = await submissionValidator(submissionRaw);
  if (typeof submission === "string")
    return {
      status: 400,
      body: { error: submission },
    };

  if (!mongo.connected) await mongo.connect();
  const db = mongo.db;
  if (!db)
    return {
      status: 418,
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        error:
          "Failed to brew a database connection due to lack of coffee for the developer",
      },
    };

  const collection = db.collection<QuizSubmission>("submissions");
  const result = await collection.insertOne(submission);

  return {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": `YABQUserId=${submission.userId}; Path=/`,
    },
    body: {
      id: result.insertedId,
      answers: submission.answers.map((a, index) => {
        return {
          user: a,
          correct: quiz.questions[index].correct,
          isCorrect: a === quiz.questions[index].correct,
        };
      }),
    },
  };
}
