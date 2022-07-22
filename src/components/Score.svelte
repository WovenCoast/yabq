<script lang="ts">
  import type { QuizSecure, QuizSubmissionSecure } from "#lib/Quiz";

  export let quiz: QuizSecure;
  export let submission: QuizSubmissionSecure;

  const score = Math.round(
    (submission.answers.reduce((acc, answer) => {
      return acc + (answer.correct ? 1 : 0);
    }, 0) /
      quiz.questions.length) *
      10
  );
  // const score = 7;

  function getColorForScore(): string {
    if (score < 4) {
      return "text-danger";
    } else if (score < 7) {
      return "text-warning";
    } else {
      return "text-success";
    }
  }

  function messageForScore(): string {
    return [
      "You should be ashamed of yourself 😡",
      "You're a bad person 😡",
      "You should work a bit to know more 😡",
      "Lucky guesses? 🤔",
      "Did we meet yesterday? 🤨",
      "Lucky guesses? 🤔",
      "Meh, average 🙂",
      "You're a good person. Keep it up! 😁",
      "I'll remember you for sure 😁",
      "Besties forever ✨",
      "You know me better than I do 🤔",
    ][score];
  }
</script>

<div class="p-5 mb-4 bg-light rounded-3">
  <div class="progress bg-secondary">
    <div
      class="progress-bar bg-primary progress-bar-striped progress-bar-animated"
      role="progressbar"
      style={`width: ${score * 10}%`}
      aria-valuenow={score}
      aria-valuemin={0}
      aria-valuemax={10}
    />
  </div>
  <!-- <br /> -->
  <div class="container-fluid py-3">
    <!-- <h1 class="display-5 fw-bold text-center">Custom jumbotron</h1> -->
    <div class="fs-1 text-center card">
      <div class="card-body">
        You got a score of <span class={getColorForScore()}>{score}</span> out
        of
        <span class="text-success">10</span>{score > 7 ? "!" : "."}
      </div>
    </div>

    <br />

    <!-- <p class="fs-1 text-center">
      You got a score of <span class={getColorForScore()}>{score}</span> out of
      <span class="text-success">10</span>{score > 7 ? "!" : "."}
    </p> -->
    <p class="text-center">
      {messageForScore()}
    </p>
    <br />

    <div class="d-grid gap-2">
      <a href="/new" class="btn btn-primary" type="button"
        >Make your own quiz!</a
      >
    </div>
  </div>
</div>
