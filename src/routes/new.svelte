<script lang="ts">
  import { goto } from "$app/navigation";
  export let redirect: string | null = null;
  import Head from "../components/Head.svelte";
  import Footer from "../components/Footer.svelte";
  import { onMount } from "svelte";

  let ls: Storage;
  let forceUpdate: boolean = false;
  function update(cb?: Function | null | undefined) {
    const scrollPosition = window.scrollY;
    forceUpdate = true;
    setTimeout(() => {
      forceUpdate = false;
      setTimeout(() => {
        typeof cb === "function" && cb();
        window.scroll({
          left: 0,
          top: scrollPosition,
          //@ts-ignore
          behavior: "instant",
        });
        // window.scrollTo(0, document.body.scrollHeight);
      }, 2);
    }, 1);
  }
  let quiz = {
    title: "",
    questions: [
      {
        title: "",
        choices: [],
        correct: 0,
      },
    ],
  };
  onMount(() => {
    if (redirect) return goto(redirect, { replaceState: true });

    typeof localStorage !== `undefined` && (ls = localStorage);
    quiz =
      JSON.parse(window.localStorage.getItem("YABQDraft") || "null") || quiz;
    // console.log(quiz);
  });

  function updateDraft() {
    ls.setItem("YABQDraft", JSON.stringify(quiz));
  }

  function relayPlaceholder(e: any) {
    const { value, placeholder } = e.target;

    if (!value) {
      e.target.value = placeholder;
      // console.log(e.target.id);
      const titleReg = /question(\d+)Title/;
      const choiceReg = /question(\d+)Choice(\d+)/;
      if (titleReg.test(e.target.id)) {
        const [_, questionIndex] = e.target.id.match(titleReg);
        quiz.questions[questionIndex].title = placeholder;
      } else if (choiceReg.test(e.target.id)) {
        const [_, questionIndex, choiceIndex] = e.target.id.match(choiceReg);
        if (!quiz.questions[questionIndex])
          //@ts-ignore
          quiz.questions[questionIndex] = {
            title: "",
            choices: [],
          };
        //@ts-ignore
        quiz.questions[questionIndex].choices[choiceIndex] = placeholder;
      }
      // console.log(quiz);
      updateDraft();
      e.target.select();
    }
    // update();
  }

  let nameEl: HTMLInputElement;

  function randomFromArr<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  //@ts-ignore
  String.prototype.format = function (...args) {
    // use replace to iterate over the string
    // select the match and check if related argument is present
    // if yes, replace the match with the argument
    return this.replace(/{([0-9]+)}/g, function (match, index) {
      // check if the argument is present
      return typeof args[index] == "undefined" ? match : args[index];
    });
  };

  const lookupTable = {
    "What is the answer to life, the universe, and everything?": [
      "42",
      "49",
      "69",
      "420",
      "360",
      "🥸 Nerd",
      "💡 Light Bulb",
      "🏆 Trophy",
      "🥒 A pickle",
    ],
    "What is {0}'s favourite food?": [
      "🍔 Burger",
      "🍟 Fries",
      "🍕 Pizza",
      "🍗 Fish",
      "🍝 Pasta",
      "🍛 Salad",
      "🍱 Sandwich",
      "🍲 Cake",
    ],
    "What is {0}'s favourite colour?": [
      "❤ Red",
      "💚 Green",
      "💙 Blue",
      "💜 Purple",
      "💖 Pink",
      "💛 Yellow",
      "🖤 Black",
    ],
    "What is {0}'s favourite animal?": [
      "🐶 Dog",
      "🐱 Cat",
      "🐭 Lion",
      "🐹 Tiger",
      "🐯 Lion",
      "🐰 Cow",
      "🐻 Bear",
      "🐴 Horse",
    ],
    "Where does {0} want to go the most?": [
      "🇰🇷 Korea",
      "🇯🇵 Japan",
      "🇬🇧 Britain",
      "🇺🇸 USA",
      "🇫🇷 France",
      "🇪🇸 Spain",
      "🇮🇹 Italy",
      "🇨🇦 Canada",
    ],
    "What does {0} like doing the most?": [
      "🎤 Listening to music",
      "🎨 Drawing",
      "🎭 Acting",
      "📺 Watching Netflix",
      "📱 Calling your mom",
      "🏌‍️ Playing sports",
      "🎧 Listening to music",
      "🎴 Playing games",
    ],
  };
  let lastPickedQuestion: string = randomFromArr(Object.keys(lookupTable));

  function generateRandomQuestion() {
    lastPickedQuestion = randomFromArr(Object.keys(lookupTable));
    // console.log(lastPickedQuestion);
    //@ts-ignore
    return lastPickedQuestion.format(quiz.title);
  }
  function getFormattedQuestion() {
    //@ts-ignore
    return lastPickedQuestion.format(quiz.title);
  }
  function generateRandomChoice() {
    // console.log(lastPickedQuestion);
    //@ts-ignore
    const choices = lookupTable[lastPickedQuestion];
    return randomFromArr<string>(choices);
  }

  function _submit() {
    fetch("/api/new", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(quiz),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.error) {
          alert(`Error: ${res.error}`);
        } else {
          goto("/");
        }
      });
  }
</script>

<Head title="Make a new quiz" />

<div class="p-5 mb-4 bg-light rounded-3">
  <div class="container-fluid py-5">
    <h1 class="display-5 fw-bold text-center">Make your own quiz</h1>
    <p class="fs-5 text-center">
      Click the box to make the suggestion come alive
    </p>
    <p class="fs-5 text-center">
      Hit the refresh button to generate new suggestions
    </p>
  </div>
</div>

{#if !forceUpdate}
  <div class="container">
    <div class="mb-3">
      <label for="name" class="form-label">Your name</label>
      <input
        bind:this={nameEl}
        type="text"
        class="form-control"
        id="name"
        bind:value={quiz.title}
        on:change={() => updateDraft()}
        placeholder="Ben Dover"
      />
    </div>
    {#each quiz.questions || [] as question, i}
      <br />
      <div class="card border-secondary">
        <div class="card-header bg-secondary bg-opacity-50">
          Question {i + 1}
        </div>
        <div class="card-body">
          <h6 class="card-title">Title</h6>
          <div class="d-flex flex-row">
            <input
              type="text"
              bind:value={question.title}
              on:change={() => updateDraft()}
              on:click={relayPlaceholder}
              class="form-control rounded-0 rounded-start"
              id={`question${i}Title`}
              placeholder={getFormattedQuestion()}
            />
            <button
              class="btn btn-danger rounded-0 rounded-end"
              on:click={() => {
                quiz.questions.splice(i, 1);
                update();
                updateDraft();
              }}
              ><svg
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                viewBox="0 0 320 512"
                ><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path
                  d="M310.6 361.4c12.5 12.5 12.5 32.75 0 45.25C304.4 412.9 296.2 416 288 416s-16.38-3.125-22.62-9.375L160 301.3L54.63 406.6C48.38 412.9 40.19 416 32 416S15.63 412.9 9.375 406.6c-12.5-12.5-12.5-32.75 0-45.25l105.4-105.4L9.375 150.6c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0L160 210.8l105.4-105.4c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25l-105.4 105.4L310.6 361.4z"
                /></svg
              ></button
            >
          </div>
          <br />

          <!-- svelte-ignore a11y-label-has-associated-control -->
          <!-- <label>Question {i + 1} answers</label> -->
          <h6 class="card-title mb-1">Choices</h6>
          {#each quiz.questions[i].choices || [""] as choice, ic}
            <div class="form-check">
              <input
                class="form-check-input"
                type="radio"
                name={`question${i}Correct`}
                id={`question${i}Choice${ic}Check`}
                value={ic}
                bind:group={question.correct}
                on:change={() => updateDraft()}
              />
              <label class="form-check-label w-100" for={`question${i}Correct`}>
                <div class="d-flex flex-row">
                  <!-- <input type="text" name="" id={`question${i}Text`} /> -->
                  <input
                    type="text"
                    class="form-control rounded-0 rounded-start"
                    id={`question${i}Choice${ic}`}
                    bind:value={choice}
                    on:change={() => updateDraft()}
                    on:click={relayPlaceholder}
                    placeholder={generateRandomChoice()}
                  />
                  {#if !choice}
                    <button
                      class="btn btn-secondary rounded-0"
                      on:click={() => update()}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="1em"
                        height="1em"
                        color="white"
                        viewBox="0 0 512 512"
                        ><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path
                          d="M464 16c-17.67 0-32 14.31-32 32v74.09C392.1 66.52 327.4 32 256 32C161.5 32 78.59 92.34 49.58 182.2c-5.438 16.81 3.797 34.88 20.61 40.28c16.89 5.5 34.88-3.812 40.3-20.59C130.9 138.5 189.4 96 256 96c50.5 0 96.26 24.55 124.4 64H336c-17.67 0-32 14.31-32 32s14.33 32 32 32h128c17.67 0 32-14.31 32-32V48C496 30.31 481.7 16 464 16zM441.8 289.6c-16.92-5.438-34.88 3.812-40.3 20.59C381.1 373.5 322.6 416 256 416c-50.5 0-96.25-24.55-124.4-64H176c17.67 0 32-14.31 32-32s-14.33-32-32-32h-128c-17.67 0-32 14.31-32 32v144c0 17.69 14.33 32 32 32s32-14.31 32-32v-74.09C119.9 445.5 184.6 480 255.1 480c94.45 0 177.4-60.34 206.4-150.2C467.9 313 458.6 294.1 441.8 289.6z"
                        /></svg
                      >
                    </button>
                  {/if}
                  <button
                    class="btn btn-danger rounded-0 rounded-end"
                    on:click={() => {
                      quiz.questions[i].choices.splice(ic, 1);
                      if (ic <= quiz.questions[i].correct) {
                        quiz.questions[i].correct--;
                        if (quiz.questions[i].correct < 0)
                          quiz.questions[i].correct = 0;
                      }
                      update();
                      updateDraft();
                    }}
                    ><svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="1em"
                      height="1em"
                      viewBox="0 0 320 512"
                      ><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path
                        d="M310.6 361.4c12.5 12.5 12.5 32.75 0 45.25C304.4 412.9 296.2 416 288 416s-16.38-3.125-22.62-9.375L160 301.3L54.63 406.6C48.38 412.9 40.19 416 32 416S15.63 412.9 9.375 406.6c-12.5-12.5-12.5-32.75 0-45.25l105.4-105.4L9.375 150.6c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0L160 210.8l105.4-105.4c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25l-105.4 105.4L310.6 361.4z"
                      /></svg
                    ></button
                  >
                </div>
              </label>
            </div>
          {/each}
          {#if !(question.choices.length >= 8)}
            <br />
            <div class="d-grid gap-2">
              <button
                class="btn btn-primary"
                type="button"
                on:click={() => {
                  //@ts-ignore
                  quiz.questions[i].choices?.push("");
                  update(() => {
                    document
                      .getElementById(
                        `question${i}Choice${question.choices.length - 1}`
                      )
                      ?.focus();
                  });
                  updateDraft();
                }}>Add choice</button
              >
            </div>
          {/if}
        </div>
      </div>
    {/each}
    {#if !(quiz.questions.length >= 20)}
      <br />
      <div class="d-grid gap-2">
        <button
          class="btn btn-primary"
          type="button"
          on:click={() => {
            generateRandomQuestion();
            if (!quiz.questions) quiz.questions = [];
            quiz.questions.push({
              //@ts-ignore
              title: "",
              //@ts-ignore
              choices: [""],
              correct: 0,
            });
            update(() => {
              document
                .getElementById(`question${quiz.questions.length - 1}Title`)
                ?.focus();
            });
          }}>Add Question</button
        >
      </div>
    {/if}
    <br />
    <div class="d-grid gap-2">
      <button
        class="btn btn-secondary text-white"
        type="button"
        on:click={() => _submit()}
      >
        Submit
      </button>
    </div>
  </div>
{:else}
  <div style="margin: 100000000px;" class="align-bottom">bruh</div>
{/if}

<Footer />
