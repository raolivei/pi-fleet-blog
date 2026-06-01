import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import "./style.css";
import "./var.css";
import HomePage from "./components/HomePage.vue";
import HomeNarrative from "./components/HomeNarrative.vue";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("HomePage", HomePage);
    app.component("HomeNarrative", HomeNarrative);
  },
} satisfies Theme;
