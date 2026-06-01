import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import "./style.css";
import "./var.css";
import EldertreeControlCenter from "./components/EldertreeControlCenter.vue";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("EldertreeControlCenter", EldertreeControlCenter);
  },
} satisfies Theme;

