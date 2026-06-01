import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import "./style.css";
import "./var.css";
import HomeNarrative from "./components/HomeNarrative.vue";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("HomeNarrative", HomeNarrative);
  },
} satisfies Theme;
