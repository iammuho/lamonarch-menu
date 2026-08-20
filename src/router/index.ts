import { createRouter, createWebHistory } from "vue-router"
import { useAuthStore } from "@/stores/auth"
import { useLocaleStore } from "@/stores/locale"
import { i18n } from "@/i18n"

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("@/views/HomeView.vue"),
    },
    {
      path: "/category/:slug",
      name: "category",
      component: () => import("@/views/CategoryView.vue"),
      props: true,
    },
    {
      path: "/allergens",
      name: "allergens",
      component: () => import("@/views/AllergensLegendView.vue"),
    },
    {
      path: "/admin/login",
      name: "admin-login",
      component: () => import("@/views/admin/LoginView.vue"),
      meta: { public: true },
    },
    {
      path: "/admin",
      component: () => import("@/components/admin/AdminLayout.vue"),
      children: [
        { path: "", redirect: { name: "admin-categories" } },
        {
          path: "categories",
          name: "admin-categories",
          component: () => import("@/views/admin/CategoriesView.vue"),
        },
        {
          path: "categories/:categoryId/subcategories",
          name: "admin-subcategories",
          component: () => import("@/views/admin/CategoriesView.vue"),
          props: (route) => ({ parentId: route.params.categoryId }),
        },
        {
          path: "categories/:categoryId/items",
          name: "admin-category-items",
          component: () => import("@/views/admin/CategoryItemsView.vue"),
          props: true,
        },
        {
          path: "allergens",
          name: "admin-allergens",
          component: () => import("@/views/admin/AllergensView.vue"),
        },
        {
          path: "settings",
          name: "admin-settings",
          component: () => import("@/views/admin/SettingsView.vue"),
        },
      ],
    },
  ],
})

router.beforeEach((to) => {
  // The admin UI is always Turkish, regardless of the public menu's language toggle.
  const localeStore = useLocaleStore()
  i18n.global.locale.value = to.path.startsWith("/admin") ? "tr" : localeStore.locale
})

router.beforeEach(async (to) => {
  if (!to.path.startsWith("/admin") || to.meta.public) return true

  const auth = useAuthStore()
  if (!auth.isReady) await auth.init()

  if (!auth.session) {
    return { name: "admin-login", query: { redirect: to.fullPath } }
  }

  return true
})

export default router
