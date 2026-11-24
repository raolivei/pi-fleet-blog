import type { Theme } from "vitepress";
import { h } from "vue";
import DefaultTheme from "vitepress/theme";
import "./style.css";
import "./var.css";
import HomePage from "./components/HomePage.vue";
import HomeNarrative from "./components/HomeNarrative.vue";
import SiteFooter from "./components/SiteFooter.vue";

export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, {
    "layout-bottom": () => h(SiteFooter),
  }),
  enhanceApp({ app }) {
    app.component("HomePage", HomePage);
    app.component("HomeNarrative", HomeNarrative);
  },
} satisfies Theme;
