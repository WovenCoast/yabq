import type { RequestEvent, RequestHandlerOutput } from "@sveltejs/kit";
import { quizValidator } from "../../../lib/Quiz";
import type { Quiz } from "../../../lib/Quiz";
import mongo from "../../../lib/Mongo";

export async function POST({
  request,
}: RequestEvent): Promise<RequestHandlerOutput> {
  if (!mongo.connected) mongo.connect();
  const quizRaw = await request.json();
  if ((request.headers.get("cookie") || "").includes("YABQMakerId"))
    quizRaw.maker = request.headers
      .get("cookie")
      ?.split(";")
      .find((s) => s.includes("YABQMakerId"))
      ?.split("=")[1];
  // return { status: 200 };
  // console.log(quizRaw);

  if (!quizRaw)
    return {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
      body: { error: "No quiz data provided" },
    };
  const quiz = await quizValidator(quizRaw);
  if (typeof quiz === "string")
    return {
      status: 400,
      body: { error: quiz },
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

  const collection = db.collection<Quiz>("quizzes");
  const result = await collection.insertOne(quiz);

  return {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": `YABQMakerId=${quiz.maker}; Path=/`,
    },
    body: {
      id: result.insertedId,
    },
  };
}
