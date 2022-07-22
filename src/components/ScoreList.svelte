<script lang="ts">
  import type { QuizSecure, QuizSubmissionSecure } from "#lib/Quiz";

  export let quiz: QuizSecure;
  const isMaker = !!quiz.maker;
  export let submissions: any[]; // QuizSubmissionSecure[]; but leaving it out for sanity

  function getColorForScore(score: number): string {
    if (score < 4) {
      return "bg-danger";
    } else if (score < 7) {
      return "bg-warning";
    } else {
      return "bg-success";
    }
  }

  //@ts-ignore
  const sortByScore = (a, b) => {
    return b.score - a.score;
  };
  //@ts-ignore
  const sortByDate = (a, b) => {
    return b.timestamp - a.timestamp;
  };

  let sortMethod = "score";
  let sortEl;

  $: submissionsParsedAndSorted = submissions
    .map((s) => {
      s.score = Math.round(
        ((s as QuizSubmissionSecure).answers.reduce((acc: number, answer) => {
          return acc + (answer.correct ? 1 : 0);
        }, 0) /
          s.answers.length) *
          10
      );
      return s;
    })
    .sort(sortMethod === "score" ? sortByScore : sortByDate);
  // console.log(submissionsParsedAndSorted);
</script>

<div class="container">
  <div class="d-grid gap-2">
    <button
      class="btn btn-primary"
      bind:this={sortEl}
      on:click={() => {
        sortMethod = sortMethod === "score" ? "date" : "score";
        submissionsParsedAndSorted.sort(
          sortMethod === "score" ? sortByScore : sortByDate
        );
      }}
    >
      Sort by {sortMethod === "score" ? "score" : "submitted time"}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="1em"
        height="1em"
        viewBox="0 0 320 512"
        ><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path
          d="M310.6 246.6l-127.1 128C176.4 380.9 168.2 384 160 384s-16.38-3.125-22.63-9.375l-127.1-128C.2244 237.5-2.516 223.7 2.438 211.8S19.07 192 32 192h255.1c12.94 0 24.62 7.781 29.58 19.75S319.8 237.5 310.6 246.6z"
        /></svg
      ></button
    >
  </div>
  <br />
  {#each submissionsParsedAndSorted as submission, i}
    <ul class="list-group">
      {#if isMaker || submission.isUser}
        <button
          class={`list-group-item text-secondary ${
            submission.isUser ? "list-group-item-primary" : ""
          } d-flex justify-content-between align-items-center`}
          data-bs-toggle="collapse"
          data-bs-target={`#submission${i}`}
          aria-controls={`submission${i}`}
        >
          {submission.name}
          <span>
            <span
              class={`badge rounded-pill ${getColorForScore(submission.score)}`}
              >{submission.score}</span
            >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="10"
              height="10"
              viewBox="0 0 320 512"
              ><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path
                d="M96 480c-8.188 0-16.38-3.125-22.62-9.375c-12.5-12.5-12.5-32.75 0-45.25L242.8 256L73.38 86.63c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0l192 192c12.5 12.5 12.5 32.75 0 45.25l-192 192C112.4 476.9 104.2 480 96 480z"
              /></svg
            >
          </span>
        </button>

        <div class="collapse" id={`submission${i}`}>
          <div class="card card-body">
            <ol class="list-group list-group-numbered">
              {#each quiz.questions as question, qi}
                <li
                  class={`list-group-item rounded d-flex justify-content-between align-items-start ${
                    submission.answers[qi].correct
                      ? "list-group-item-success"
                      : "list-group-item-danger"
                  }`}
                >
                  <div class="ms-2 me-auto">
                    <div class="fw-bold">{question.title}</div>
                    Correct Answer: {question.choices[
                      submission.answers[qi].actual
                    ]}<br />
                    Given Answer: {question.choices[
                      submission.answers[qi].choice
                    ]}
                  </div>
                </li>
                <br />
              {/each}
            </ol>
          </div>
        </div>
      {:else}
        <button
          class="text-secondary list-group-item d-flex justify-content-between align-items-center"
        >
          {submission.name}
          <span
            class={`badge rounded-pill ${getColorForScore(submission.score)}`}
            >{submission.score}</span
          >
        </button>
      {/if}
    </ul>
  {/each}
</div>

<!-- <div class="container flex flex-col mx-auto w-full items-center justify-center">
  <ul class="flex flex-col">
    {#each submissionsParsedAndSorted as submission}
      <li class="border-gray-400 flex flex-row mb-2">
        <div
          class="transition duration-500 shadow ease-in-out transform hover:-translate-y-1 hover:shadow-lg select-none cursor-pointer bg-white dark:bg-gray-800 rounded-md flex flex-1 items-center p-4"
        >
          <div class="flex-1 pl-1 md:mr-16">
            <div class="font-medium dark:text-white">{submission.name}</div>
          </div>
          <div class={`text-xl ${getColorForScore(submission.score)}`}>
            {submission.score}
          </div>
          {#if isMaker}
            <button class="w-24 text-right flex justify-end">
              <svg
                width="12"
                fill="currentColor"
                height="12"
                class="hover:text-gray-800 dark:hover:text-white dark:text-gray-200 text-gray-500"
                viewBox="0 0 1792 1792"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1363 877l-742 742q-19 19-45 19t-45-19l-166-166q-19-19-19-45t19-45l531-531-531-531q-19-19-19-45t19-45l166-166q19-19 45-19t45 19l742 742q19 19 19 45t-19 45z"
                />
              </svg>
            </button>
          {/if}
        </div>
      </li>
    {/each}
  </ul>
</div> -->
