import type { Theme } from "vitepress";
import { h } from "vue";
import DefaultTheme from "vitepress/theme";
import "./style.css";
import HomePage from "./components/HomePage.vue";
import ChapterLog from "./components/ChapterLog.vue";
import ChapterMeta from "./components/ChapterMeta.vue";
import RecordPanel from "./components/RecordPanel.vue";
import StatusBar from "./components/StatusBar.vue";
import SiteFooter from "./components/SiteFooter.vue";

export default {
  extends: DefaultTheme,
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      "layout-top": () => h(StatusBar),
      "doc-before": () => h(ChapterMeta),
      "layout-bottom": () => h(SiteFooter),
    }),
  enhanceApp({ app }) {
    app.component("HomePage", HomePage);
    app.component("ChapterLog", ChapterLog);
    app.component("RecordPanel", RecordPanel);
  },
} satisfies Theme;
