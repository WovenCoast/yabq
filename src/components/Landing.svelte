<script lang="ts">
  import { goto } from "$app/navigation";
  import type { QuizSecure } from "#lib/Quiz";
  import CopyClipboard from "./CopyClipboard.svelte";

  export let quiz: QuizSecure;
  const isMaker = !!quiz.maker;

  const copyToClipboard = (content: string) => {
    const clip = new CopyClipboard({
      target: document.body,
      props: { content },
    });
    clip.$destroy();
  };

  function _delete() {
    if (confirm("Are you doubly bubbly sure you want to delete this quiz???")) {
      fetch("/api/delete/" + quiz.alias, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.success) {
            goto("/", { replaceState: true });
          } else {
            alert("Failed to delete quiz");
          }
        });
    }
  }

  let shareEl: HTMLButtonElement;

  function share() {
    copyToClipboard(`${window.location.origin}/quiz/${quiz.alias}`);
    shareEl.classList.remove("btn-primary");
    shareEl.classList.add("btn-success");
    shareEl.innerText = "Copied!";
    setTimeout(() => {
      shareEl.classList.remove("btn-success");
      shareEl.classList.add("btn-primary");
      shareEl.innerText = "Share this quiz with your friends!";
    }, 500);
  }
</script>

<div class="p-5 mb-4 bg-light rounded-3">
  <div class="container-fluid py-5">
    <h1 class="display-6 fw-bold text-center">
      <span>{quiz.title}</span>'s bestie quiz
    </h1>
    <br />
    {#if isMaker}
      <div class="d-grid gap-2">
        <button
          bind:this={shareEl}
          class="btn btn-primary"
          type="button"
          on:click={() => share()}
        >
          Share this quiz with your friends!
        </button>
      </div>
      <br />
      <p class="text-center">
        Since this is your quiz, you can't submit a response to it :p
      </p>
      <p class="text-center">Here's your questions though</p>
      <br />
      <div class="container">
        <div class="list-group">
          {#each quiz.questions as question, i}
            <button
              type="button"
              class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
              data-bs-toggle="collapse"
              data-bs-target={`#question-${i}`}
              aria-expanded="false"
              aria-controls={`question-${i}`}
              ><span>{i + 1}: {question.title}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 384 512"
                width="1em"
                height="1em"
                ><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path
                  d="M192 384c-8.188 0-16.38-3.125-22.62-9.375l-160-160c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0L192 306.8l137.4-137.4c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25l-160 160C208.4 380.9 200.2 384 192 384z"
                /></svg
              ></button
            >
            <div class="collapse" id={`question-${i}`}>
              <div class="container">
                <ul class="card-body list-group">
                  {#each question.choices as choice, ic}
                    <li
                      class={`list-group-item ${
                        question.correct === ic
                          ? "bg-success text-white"
                          : "bg-danger bg-opacity-10 border border-danger"
                      }`}
                    >
                      {choice}
                    </li>
                  {/each}
                </ul>
              </div>
            </div>
          {/each}
        </div>
        <br />
        <div class="d-grid gap-2">
          <button
            class="btn btn-danger"
            on:click={() => {
              confirm("Are you sure you want to delete this quiz?") &&
                _delete();
            }}
          >
            Delete this quiz
          </button>
        </div>
      </div>
    {:else}
      <form action={`/quiz/${quiz.alias}/questions`} method="get">
        <div class="mb-3">
          <!-- <label for="exampleFormControlInput1" class="form-label">Name</label> -->
          <input
            type="text"
            class="form-control"
            id="name"
            name="name"
            placeholder="Ben Dover"
          />
        </div>
        <div class="d-grid gap-2">
          <button class="btn btn-primary btn-block" type="submit"
            >Start {quiz.title}'s quiz!</button
          >
        </div>
      </form>
    {/if}
  </div>
</div>

<!-- 
<div class="bg-white dark:bg-gray-800 ">
  <div
    class="text-center w-full mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 z-20"
  >
    <h2 class="text-3xl font-extrabold text-black dark:text-white sm:text-4xl">
      <span class="block">
        <span class="text-fuchsia-500">{quiz.title}</span>'s bestie quiz
      </span>
    </h2>
    <br />
    <div class="relative">
      <input
        type="text"
        id="required-text-input"
        class=" rounded-lg border-transparent flex-1 appearance-none border border-gray-300 w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
        name="name"
        placeholder="Your name"
      />
    </div>
    <div class="lg:mt-0 lg:flex-shrink-0">
      <div class="mt-6 inline-flex rounded-md shadow">
        <button
          type="button"
          class="py-4 px-6  bg-fuchsia-600 hover:bg-fuchsia-700 focus:ring-fuchsia-500 focus:ring-offset-fuchsia-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg "
        >
          Get started
        </button>
      </div>
    </div>
  </div>
</div> -->
