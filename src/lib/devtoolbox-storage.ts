// Cles de stockage de la boite a outils. L'origine hylst.fr est partagee par toutes les apps
// de la plateforme : la reinitialisation ne doit retirer que ces cles, jamais tout le stockage.
// Le theme (`theme`) n'y figure pas : d'autres apps de la plateforme lisent la meme cle.
import { API_TESTER_KEYS } from "./sensitive-storage";

export const CLIPBOARD_HISTORY_KEY = "hylst-clipboard-history";

export const DEVTOOLBOX_LOCAL_KEYS = [
  "devtoolbox-onboarding-seen",
  "devtoolbox-favorites",
  "devtoolbox-recent",
  CLIPBOARD_HISTORY_KEY,
  "hylst-favorites",
  API_TESTER_KEYS.COLLECTIONS,
  API_TESTER_KEYS.ENVIRONMENTS,
  API_TESTER_KEYS.HISTORY,
  API_TESTER_KEYS.ACTIVE_ENV,
  "best-practices-progress",
  "best-practices-bookmarks",
  "data-generator-custom-schemas",
  "diffviewer-data",
  "format-converter-history",
  "git-commit-history",
  "glossary-favorites",
  "glossary-flashcard-known",
  "glossary-quiz-best",
  "glossary-quiz-score",
  "keyboard-shortcuts-favorites",
  "markdown-content",
  "mermaid-editor-diagrams",
  "personal-notes",
  "prompt-engineer-saved",
  "security-checklist-state",
  "snippets-library-custom",
];

export const DEVTOOLBOX_SESSION_KEYS = [CLIPBOARD_HISTORY_KEY, API_TESTER_KEYS.SESSION_SECRETS];

type StorageLike = Pick<Storage, "removeItem">;

/** Retire les donnees de la boite a outils, et elles seules. */
export function clearDevToolboxData(local: StorageLike, session: StorageLike) {
  for (const key of DEVTOOLBOX_LOCAL_KEYS) local.removeItem(key);
  for (const key of DEVTOOLBOX_SESSION_KEYS) session.removeItem(key);
}
