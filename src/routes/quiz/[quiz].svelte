<script lang="ts">
  import Head from "../../components/Head.svelte";
  import Score from "../../components/Score.svelte";
  import Landing from "../../components/Landing.svelte";
  import type { QuizSecure, QuizSubmissionSecure } from "#lib/Quiz";
  import ScoreList from "../../components/ScoreList.svelte";
  import Footer from "../../components/Footer.svelte";

  export let quiz: QuizSecure;
  // console.log(quiz);
  export let submissions: QuizSubmissionSecure[];
  // console.log(submissions);
  export let submission: QuizSubmissionSecure;
  // console.log(submission);
  export let hasDoneQuiz: boolean;
  // console.log(hasDoneQuiz);
</script>

<Head title={`${quiz.title}'s bestie quiz`} />

{#if hasDoneQuiz}
  <Score {quiz} {submission} />
{:else}
  <Landing {quiz} />
{/if}

<ScoreList {submissions} {quiz} />

<Footer />
