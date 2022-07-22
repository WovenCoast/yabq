<script lang="ts">
  import { goto } from "$app/navigation";
  import type { QuizSecure, QuizSubmission } from "#lib/Quiz";
  import Head from "../../../components/Head.svelte";
  import Footer from "../../../components/Footer.svelte";
  import { onMount } from "svelte";
  export let quiz: QuizSecure;
  export let name: string;

  onMount(() => {
    document.getElementById("focusShift")?.focus();
    document.getElementById("focusShift")?.remove();
  });

  // let userId = document.cookie.includes("YABQUserId")
  //   ? document.cookie
  //       .split(";")
  //       .find((c) => c.includes("YABQUserId"))
  //       ?.split("=")[1]
  //   : null;
  let answers: number[] = [];

  let currentQ = 0;
  let showAnswer = false;

  function _submit(submission: Partial<QuizSubmission>) {
    // console.log(submission);
    fetch(`/api/submit/${quiz.alias}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(submission),
    })
      .then((res) => res.json())
      .then((res) => {
        // console.log(res);
        goto(`/quiz/${quiz.alias}`, { replaceState: true });
      });
  }

  function answerQ(choice: number) {
    // console.log(choice);
    if (currentQ < quiz.questions.length) {
      answers[currentQ] = choice;
      // console.log(answers);
      showAnswer = true;
      setTimeout(() => {
        currentQ++;
        showAnswer = false;
        if (currentQ === quiz.questions.length) {
          _submit({
            name,
            answers,
          });
        }
      }, 1500);
    }
  }
</script>

<Head title={`${name} is doing ${quiz.title}'s bestie quiz :p`} />

<div class="progress bg-secondary" style="border-radius: 0">
  <div
    class="progress-bar bg-primary progress-bar-striped progress-bar-animated"
    role="progressbar"
    style={`width: ${(currentQ / quiz.questions.length) * 100}%`}
    aria-valuenow={currentQ}
    aria-valuemin={0}
    aria-valuemax={quiz.questions.length}
  />
</div>
{#if currentQ < quiz.questions.length}
  <div class="container-fluid py-5 text-center">
    <h1 class="display-5 fw-bold">{quiz.questions[currentQ].title}</h1>
  </div>
  <div class="container">
    <div class="list-group">
      <button class="list-group-item list-group-item-action" id="focusShift">
        bruh
      </button>
      {#each quiz.questions[currentQ].choices as choice, id}
        <button
          class={`list-group-item text-start ${
            showAnswer && quiz.questions[currentQ].correct === id
              ? "bg-success text-white"
              : ""
          } ${
            showAnswer &&
            answers[currentQ] !== quiz.questions[currentQ].correct &&
            answers[currentQ] === id
              ? "bg-danger text-white"
              : ""
          }`}
          on:click={() => answerQ(id)}
        >
          {choice}
        </button>
      {/each}
      <!-- <button
      type="button"
      class="list-group-item list-group-item-action bg-danger text-white"
      aria-current="true"
    >
      The current button
    </button> -->
    </div>
  </div>
{:else}
  <div class="container-fluid py-5 text-center">
    <h1 class="display-5 fw-bold">Submitting...</h1>
  </div>
{/if}

<Footer />
