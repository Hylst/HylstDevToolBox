// Stockage du testeur d'API : les valeurs sensibles (cles, jetons, mots de passe, cookies)
// ne vont jamais dans localStorage. Elles restent dans sessionStorage, le temps de l'onglet.
// L'origine hylst.fr est partagee par toutes les apps de la plateforme : tout ce qui est
// ecrit dans localStorage y reste lisible et survit a la fermeture du navigateur.

export interface KeyValue {
  key: string;
  value: string;
}

export interface ApiEnvironment {
  id: string;
  name: string;
  variables: Record<string, string>;
}

export interface ApiSavedRequest {
  id: string;
  name: string;
  method: string;
  url: string;
  headers: KeyValue[];
  queryParams: (KeyValue & { enabled: boolean })[];
  body: string;
  timestamp: number;
}

export interface ApiCollection {
  id: string;
  name: string;
  requests: ApiSavedRequest[];
}

export interface ApiHistoryItem {
  id: string;
  method: string;
  url: string;
  status: number;
  timestamp: number;
  responseTime: number;
}

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export const API_TESTER_KEYS = {
  COLLECTIONS: "api-tester-collections",
  ENVIRONMENTS: "api-tester-environments",
  HISTORY: "api-tester-history",
  ACTIVE_ENV: "api-tester-active-env",
  SESSION_SECRETS: "api-tester-session-secrets",
};

const SENSITIVE_NAME = /auth|cookie|key|token|secret|passw|pwd|credential|session|signature/i;
const TEMPLATE_REF = /\{\{[^{}]*\}\}/g;
const AUTH_SCHEME = /^(bearer|basic|token|digest)$/i;

/** Nom de variable, d'en-tete ou de parametre dont la valeur est a proteger. */
export function isSensitiveName(name: string): boolean {
  return SENSITIVE_NAME.test(name);
}

/** Valeur qui contient un secret : pas seulement des references {{VARIABLE}} et un schema. */
export function isSecretValue(value: string): boolean {
  if (!value) return false;
  const rest = value.replace(TEMPLATE_REF, " ").trim().split(/\s+/).filter((w) => w && !AUTH_SCHEME.test(w));
  return rest.length > 0;
}

function mustProtect(name: string, value: string): boolean {
  return isSensitiveName(name) && isSecretValue(value);
}

function decodeName(raw: string): string {
  try {
    return decodeURIComponent(raw.replace(/\+/g, " "));
  } catch {
    return raw;
  }
}

/** Vide la valeur des parametres sensibles de la chaine de requete d'une URL. */
export function redactUrl(url: string): string {
  const q = url.indexOf("?");
  if (q < 0) return url;
  const hashAt = url.indexOf("#", q);
  const query = hashAt < 0 ? url.slice(q + 1) : url.slice(q + 1, hashAt);
  const hash = hashAt < 0 ? "" : url.slice(hashAt);
  const parts = query.split("&").map((part) => {
    const eq = part.indexOf("=");
    if (eq < 0) return part;
    const name = decodeName(part.slice(0, eq));
    const value = decodeName(part.slice(eq + 1));
    return mustProtect(name, value) ? part.slice(0, eq + 1) : part;
  });
  return url.slice(0, q + 1) + parts.join("&") + hash;
}

interface RequestSecrets {
  url?: string;
  headers?: Record<string, string>;
  params?: Record<string, string>;
}

export interface SessionSecrets {
  env: Record<string, Record<string, string>>;
  req: Record<string, RequestSecrets>;
}

const requestKey = (collectionId: string, requestId: string) => `${collectionId}:${requestId}`;

/** Separe l'etat en une copie durable sans secret et les secrets de la session. */
export function splitSecrets(collections: ApiCollection[], environments: ApiEnvironment[]) {
  const secrets: SessionSecrets = { env: {}, req: {} };

  const durableEnvs = environments.map((env) => {
    const variables: Record<string, string> = {};
    for (const [name, value] of Object.entries(env.variables || {})) {
      if (mustProtect(name, value)) {
        (secrets.env[env.id] ||= {})[name] = value;
        variables[name] = "";
      } else {
        variables[name] = value;
      }
    }
    return { ...env, variables };
  });

  const durableCollections = collections.map((col) => ({
    ...col,
    requests: (col.requests || []).map((req) => {
      const found: RequestSecrets = {};
      const url = redactUrl(req.url || "");
      if (url !== req.url) found.url = req.url;
      const headers = (req.headers || []).map((h, i) => {
        if (!mustProtect(h.key, h.value)) return h;
        (found.headers ||= {})[i] = h.value;
        return { ...h, value: "" };
      });
      const queryParams = (req.queryParams || []).map((p, i) => {
        if (!mustProtect(p.key, p.value)) return p;
        (found.params ||= {})[i] = p.value;
        return { ...p, value: "" };
      });
      if (found.url !== undefined || found.headers || found.params) {
        secrets.req[requestKey(col.id, req.id)] = found;
      }
      return { ...req, url, headers, queryParams };
    }),
  }));

  return { collections: durableCollections, environments: durableEnvs, secrets };
}

/** Remet les secrets de la session dans la copie durable. */
export function mergeSecrets(
  collections: ApiCollection[],
  environments: ApiEnvironment[],
  secrets: SessionSecrets,
) {
  const envs = environments.map((env) => {
    const s = secrets.env[env.id];
    return s ? { ...env, variables: { ...env.variables, ...s } } : env;
  });
  const cols = collections.map((col) => ({
    ...col,
    requests: (col.requests || []).map((req) => {
      const s = secrets.req[requestKey(col.id, req.id)];
      if (!s) return req;
      return {
        ...req,
        url: s.url ?? req.url,
        headers: (req.headers || []).map((h, i) => (s.headers && i in s.headers ? { ...h, value: s.headers[i] } : h)),
        queryParams: (req.queryParams || []).map((p, i) => (s.params && i in s.params ? { ...p, value: s.params[i] } : p)),
      };
    }),
  }));
  return { collections: cols, environments: envs };
}

function readJson<T>(storage: StorageLike, key: string, fallback: T): T {
  try {
    const raw = storage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function countSecrets(secrets: SessionSecrets): number {
  let n = 0;
  for (const vars of Object.values(secrets.env)) n += Object.keys(vars).length;
  for (const r of Object.values(secrets.req)) {
    n += (r.url !== undefined ? 1 : 0) + Object.keys(r.headers || {}).length + Object.keys(r.params || {}).length;
  }
  return n;
}

/**
 * Lit l'etat du testeur. Les valeurs sensibles trouvees dans localStorage (versions
 * anterieures) sont comptees dans legacySecrets : le premier enregistrement les en retire,
 * et elles restent disponibles dans l'onglet courant.
 */
export function loadApiTesterState(
  local: StorageLike,
  session: StorageLike,
  defaults: ApiEnvironment[],
) {
  const storedCollections = readJson<ApiCollection[]>(local, API_TESTER_KEYS.COLLECTIONS, []);
  const storedEnvs = readJson<ApiEnvironment[]>(local, API_TESTER_KEYS.ENVIRONMENTS, defaults);
  const storedHistory = readJson<ApiHistoryItem[]>(local, API_TESTER_KEYS.HISTORY, []);
  const sessionSecrets = readJson<SessionSecrets>(session, API_TESTER_KEYS.SESSION_SECRETS, { env: {}, req: {} });

  const legacy = splitSecrets(storedCollections, storedEnvs).secrets;
  const legacyUrls = storedHistory.filter((h) => redactUrl(h.url || "") !== h.url).length;
  const merged = mergeSecrets(storedCollections, storedEnvs, {
    env: { ...sessionSecrets.env },
    req: { ...sessionSecrets.req },
  });

  return {
    collections: merged.collections,
    environments: merged.environments,
    history: storedHistory.map((h) => ({ ...h, url: redactUrl(h.url || "") })),
    activeEnvId: local.getItem(API_TESTER_KEYS.ACTIVE_ENV),
    legacySecrets: countSecrets(legacy) + legacyUrls,
  };
}

/** Ecrit la copie durable sans secret, et les secrets dans la session. */
export function persistApiTesterState(
  local: StorageLike,
  session: StorageLike,
  collections: ApiCollection[],
  environments: ApiEnvironment[],
) {
  const split = splitSecrets(collections, environments);
  local.setItem(API_TESTER_KEYS.COLLECTIONS, JSON.stringify(split.collections));
  local.setItem(API_TESTER_KEYS.ENVIRONMENTS, JSON.stringify(split.environments));
  if (countSecrets(split.secrets) > 0) {
    session.setItem(API_TESTER_KEYS.SESSION_SECRETS, JSON.stringify(split.secrets));
  } else {
    session.removeItem(API_TESTER_KEYS.SESSION_SECRETS);
  }
}

/** Historique : URL sans valeur de parametre sensible, 50 entrees au plus. */
export function persistApiTesterHistory(local: StorageLike, history: ApiHistoryItem[]) {
  const safe = history.slice(0, 50).map((h) => ({ ...h, url: redactUrl(h.url || "") }));
  local.setItem(API_TESTER_KEYS.HISTORY, JSON.stringify(safe));
}
