import { cookies } from "next/headers";

export const LEARNER_COOKIE = "fluentia_learner";
export const UI_LANG_COOKIE = "fluentia_lang";

export async function getLearnerId(): Promise<string> {
  const store = await cookies();
  return store.get(LEARNER_COOKIE)?.value || "guest-learner";
}

export async function getUiLangCookie(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(UI_LANG_COOKIE)?.value;
}
