import { defineStore } from "pinia"
import { ref } from "vue"
import type { Session } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

export const useAuthStore = defineStore("auth", () => {
  const session = ref<Session | null>(null)
  const isReady = ref(false)

  async function init() {
    const { data } = await supabase.auth.getSession()
    session.value = data.session
    isReady.value = true

    supabase.auth.onAuthStateChange((_event, newSession) => {
      session.value = newSession
    })
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    session.value = data.session
  }

  async function signOut() {
    await supabase.auth.signOut()
    session.value = null
  }

  return { session, isReady, init, signIn, signOut }
})
