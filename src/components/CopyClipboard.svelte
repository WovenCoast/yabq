<script lang="ts">
  import { onMount } from "svelte";

  export let content: string;

  let textarea: HTMLTextAreaElement;

  onMount(() => {
    textarea.select();
    document.execCommand("copy");
  });
</script>

<textarea bind:value={content} bind:this={textarea} />
