<script context="module">
  //@ts-ignore
  export function load({ error, status }) {
    return {
      props: {
        message: error.message,
        status,
      },
    };
  }
</script>

<script lang="ts">
  export let message: string;
  export let status: number;
</script>

<div class="container-fluid py-3">
  <!-- <h1 class="display-5 fw-bold text-center">Custom jumbotron</h1> -->
  <div class="fs-1 text-center">Oh no! An error has occured :(</div>

  <br />
  <p class="fs-5 text-center">
    {status}: {message}
  </p>
  <br />
  <p class="text-center text-primary">
    WTF does that mean?? It means either one of:
  </p>
  <ul class="list-group">
    <li class="list-group-item text-center text-secondary">
      The quiz you're looking for has been deleted
    </li>
    <li class="list-group-item text-center text-secondary">
      The quiz you're looking for never existed
    </li>
    <li class="list-group-item text-center text-secondary">
      The world is ending
    </li>
  </ul>

  <br />

  <div class="d-grid gap-2">
    <a href="/" class="btn btn-primary" type="button">Back to home page</a>
  </div>
</div>
