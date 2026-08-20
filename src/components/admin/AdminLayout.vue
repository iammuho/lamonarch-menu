<script setup lang="ts">
import { useRouter } from "vue-router"
import { LayoutGrid, Tag, Settings, LogOut, ExternalLink } from "@lucide/vue"
import { useAuthStore } from "@/stores/auth"

const router = useRouter()
const auth = useAuthStore()

async function logout() {
  await auth.signOut()
  router.push({ name: "admin-login" })
}
</script>

<template>
  <div class="flex min-h-screen bg-cream-dark">
    <aside class="flex w-60 shrink-0 flex-col border-r border-ink/10 bg-cream">
      <div class="px-5 py-5 font-display text-xl font-semibold">Admin</div>
      <nav class="flex flex-1 flex-col gap-1 px-3">
        <RouterLink
          :to="{ name: 'admin-categories' }"
          class="flex items-center gap-2 rounded px-3 py-2 text-sm font-medium text-ink hover:bg-cream-dark"
          active-class="bg-navy text-cream hover:bg-navy"
        >
          <LayoutGrid :size="18" />
          {{ $t("admin.nav.categories") }}
        </RouterLink>
        <RouterLink
          :to="{ name: 'admin-allergens' }"
          class="flex items-center gap-2 rounded px-3 py-2 text-sm font-medium text-ink hover:bg-cream-dark"
          active-class="bg-navy text-cream hover:bg-navy"
        >
          <Tag :size="18" />
          {{ $t("admin.nav.allergens") }}
        </RouterLink>
        <RouterLink
          :to="{ name: 'admin-settings' }"
          class="flex items-center gap-2 rounded px-3 py-2 text-sm font-medium text-ink hover:bg-cream-dark"
          active-class="bg-navy text-cream hover:bg-navy"
        >
          <Settings :size="18" />
          {{ $t("admin.nav.settings") }}
        </RouterLink>
      </nav>
      <div class="flex flex-col gap-1 border-t border-ink/10 px-3 py-3">
        <a
          href="/"
          target="_blank"
          class="flex items-center gap-2 rounded px-3 py-2 text-sm font-medium text-ink hover:bg-cream-dark"
        >
          <ExternalLink :size="18" />
          {{ $t("admin.nav.viewSite") }}
        </a>
        <button
          type="button"
          class="flex items-center gap-2 rounded px-3 py-2 text-left text-sm font-medium text-ink hover:bg-cream-dark"
          @click="logout"
        >
          <LogOut :size="18" />
          {{ $t("admin.nav.logout") }}
        </button>
      </div>
    </aside>

    <main class="flex-1 overflow-y-auto p-6 sm:p-8">
      <RouterView />
    </main>
  </div>
</template>
