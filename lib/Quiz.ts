import { v4 } from "uuid";
import mongo from "./Mongo";

type Question = {
  title: string;
  choices: string[];
  correct: number;
};

type QuizBase = {
  title: string;
  alias: string;
  description: string | null | undefined;
  questions: Question[];
};
type Quiz = QuizBase & {
  maker: string | null | undefined;
};
type QuizWithId = Quiz & { _id: string };
type QuizSecure = QuizBase & { _id: string; maker: boolean };
type QuizSubmissionBase = {
  quizId: string;
  name: string;
  timestamp: number;
};
type QuizSubmission = QuizSubmissionBase & {
  userId: string | undefined;
  answers: number[];
};
type QuizSubmissionSecure = QuizSubmissionBase & {
  isUser: boolean;
  answers: {
    choice: number;
    correct: boolean;
  }[];
};

function convertToSecureQuiz(
  quiz: Quiz | undefined | null,
  cookie: string
): QuizSecure | null {
  if (!quiz) return null;
  return {
    ...quiz,
    maker:
      cookie
        .split(";")
        .find((s) => s.includes("YABQMakerId"))
        ?.split("=")[1] === quiz.maker,
    // questions: quiz.questions.map((question) => ({
    //   title: question.title,
    //   choices: question.choices,
    // })),
  } as unknown as QuizSecure;
}

async function convertToSecureSubmissions(
  submissions: QuizSubmission[] | undefined | null,
  cookie: string
): Promise<QuizSubmissionSecure[]> {
  if (!submissions || !submissions.length) return [];
  const userIdCookie = cookie
    .split(";")
    .find((s) => s.includes("YABQUserId"))
    ?.split("=")[1];
  const quiz = await mongo.db?.collection("quizzes").findOne({
    _id: submissions[0].quizId,
  });
  if (!quiz) return [];
  return submissions.map((submission: QuizSubmission): QuizSubmissionSecure => {
    //@ts-ignore
    submission.isUser = userIdCookie === submission.userId;
    //@ts-ignore
    delete submission.userId;
    submission.answers.forEach((a, index) => {
      //@ts-ignore
      submission.answers[index] = {
        choice: a,
        actual: quiz.questions[index].correct,
        correct: quiz.questions[index].correct === a,
      };
    });
    return submission as unknown as QuizSubmissionSecure;
  });
}

async function submissionValidator(
  submission: Partial<QuizSubmission>
): Promise<string | QuizSubmission> {
  if (!submission.userId) submission.userId = v4();
  if (!submission.timestamp) submission.timestamp = Date.now();
  if (!submission.quizId) return "Quiz ID is required";
  const quiz = (await mongo.db?.collection("quizzes").findOne({
    _id: submission.quizId,
  })) as unknown as Quiz;
  if (!submission.name) return "Name is required";
  if (!submission.answers) return "Answers are required";
  if (submission.answers.length !== submission.answers.length)
    return "Answers length is incorrect";
  if (
    submission.answers.some(
      (answer, index) =>
        answer < 0 || answer > quiz.questions[index].choices.length
    )
  )
    return "Answers must be between 0 and amount of question choices";
  return submission as QuizSubmission;
}

async function quizValidator(quiz: Partial<Quiz>): Promise<string | Quiz> {
  if (!quiz.maker) quiz.maker = v4();
  if (!quiz.alias) quiz.alias = v4().split("-")[0];
  // let error: string | null = null;
  // if (!quiz.title) {
  //   error = "Title is required";
  // } else if (!quiz.questions || quiz.questions.length === 0) {
  //   error = "Questions are required";
  // } else if (quiz.questions.length > 10) {
  //   error = "Questions cannot be more than 10";
  // } else if (quiz.questions.some((question) => !question.title)) {
  //   error = "Question title is required";
  // } else if (quiz.questions.some((question) => !question.choices)) {
  //   error = "Question choices are required";
  // } else if (
  //   quiz.questions.some(
  //     (question) =>
  //       !(question.correct + 1) ||
  //       !(question.correct >= 0) ||
  //       !(question.correct < question.choices.length)
  //   )
  // ) {
  //   error = "Question correct answer is required";
  // } else if (quiz.questions.some((question) => question.choices.length > 8)) {
  //   error = "Question choices cannot be more than 8";
  // }
  // if (error) return error;
  if (!quiz.title) return "Title is required";
  if (!quiz.questions || quiz.questions.length === 0)
    return "Questions are required";
  if (quiz.questions.length > 20) return "Questions cannot be more than 20";
  // if (quiz.questions.some((question) => !question.title))
  //   return "Question title is required";
  // if (quiz.questions.some((question) => !question.choices))
  //   return "Question choices are required";
  // if (
  //   quiz.questions.some((question) => !(question.correct + 1)) ||
  //   !quiz.questions.some((question) => question.correct >= 0) ||
  //   !quiz.questions.some(
  //     (question) => question.correct < question.choices.length
  //   )
  // )
  //   return "Question correct answer is required";
  // if (quiz.questions.some((question) => question.choices.length > 8))
  //   return "Question choices cannot be more than 8";
  let error: string | boolean = false;
  quiz.questions.forEach((question, i) => {
    if (!question.title) error = `Question ${i + 1} title is required`;
    if (!question.choices) error = `Question ${i + 1} choices are required`;
    if (question.choices.length > 8)
      error = `Question ${i + 1} choices cannot be more than 8`;
    if (question.correct < 0 || question.correct > question.choices.length)
      error = `Question ${i + 1} correct answer is required`;
  });
  if (error) return error;

  if (!mongo.connected) await mongo.connect();
  const existingQuiz = await mongo.db?.collection("quizzes").findOne({
    alias: quiz.alias,
  });
  if (existingQuiz) return `Quiz with alias ${quiz.alias} already exists`;

  return quiz as Quiz;
}

export {
  quizValidator,
  submissionValidator,
  convertToSecureQuiz,
  convertToSecureSubmissions,
};
export type {
  Question,
  Quiz,
  QuizWithId,
  QuizSecure,
  QuizSubmission,
  QuizSubmissionSecure,
};
