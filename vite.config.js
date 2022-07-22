import { sveltekit } from "@sveltejs/kit/vite";
import path from "path";

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [sveltekit()],

  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@use "src/variables.scss" as *;',
      },
    },
  },
};

export default config;
