import {
  createRouter,
  createWebHistory,
  createMemoryHistory,
  Router,
} from "vue-router";
import { defineAsyncComponent as def } from "vue";

export const getRouter = (options: { engine: "client" | "server" }): Router => {
  const routerHistory =
    options.engine === "client" ? createWebHistory() : createMemoryHistory();

  return createRouter({
    history: routerHistory,
    routes: [
      {
        path: "/",
        component: def(() => import("./components/Homepage.vue")),
      },
      {
        path: "/a",
        component: def(() => import("./components/PageA.vue")),
      },
    ],
  });
};
