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
          behavior: "auto",
        });
      }, 1);
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

  let nameEl: HTMLInputElement;

  function generateRandomQuestion() {
    // return "What is the answer to life, the universe, and everything?";
    const options = [
      "What is the answer to life, the universe, and everything?",
      "",
    ];
    return options[Math.floor(Math.random() * options.length)];
  }
  function generateRandomChoice() {
    const options = [
      "42",
      "🥒 A pickle",
      "49",
      "🥸 Nerd",
      "💡 Light Bulb",
      "🏆 Trophy",
      "🇰🇷 Korea",
      "🇬🇧 Britain",
      "🇺🇸 USA",
      "🇫🇷 France",
      "🇪🇸 Spain",
      "🇮🇹 Italy",
      "🇨🇦 Canada",
      "📺 Watch Netflix",
      "📱 Call your mom",
      "🏌‍️ Go and play sports",
      "🎧 Listen to music",
      "💻 Use a computer",
      "🍔 Burger",
      "🍟 Fries",
      "🍕 Pizza",
      "🍗 Fish",
      "🍝 Pasta",
      "🍛 Salad",
      "🍱 Sandwich",
      "🍲 Cake",
    ];
    return options[Math.floor(Math.random() * options.length)];
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
          <h5 class="card-title">Title</h5>
          <div class="d-flex flex-row">
            <input
              type="text"
              bind:value={question.title}
              on:change={() => updateDraft()}
              class="form-control rounded-0 rounded-start"
              id={`question${i}Title`}
              placeholder={generateRandomQuestion()}
            />
            <button
              class="btn btn-danger rounded-0 rounded-end"
              on:click={() => {
                quiz.questions.splice(i, 1);
                update();
                updateDraft();
              }}>X</button
            >
          </div>
          <br />

          <!-- svelte-ignore a11y-label-has-associated-control -->
          <!-- <label>Question {i + 1} answers</label> -->
          <h5 class="card-title">Choices</h5>
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
                    placeholder={generateRandomChoice()}
                  />
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
                    }}>X</button
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
  <div style="min-height: 100000000em;" />
{/if}

<Footer />
