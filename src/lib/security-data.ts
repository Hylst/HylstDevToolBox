export interface Vulnerability {
  id: string;
  name: string;
  severity: "critical" | "high" | "medium";
  description: string;
  vulnerable: string;
  secure: string;
}

export interface SecurityHeader {
  name: string;
  value: string;
  desc: string;
  importance: "critical" | "recommended" | "optional";
}

export interface AuthBestPractice {
  title: string;
  category: "jwt" | "session" | "oauth" | "password" | "2fa";
  description: string;
  bad: string;
  good: string;
}

export const OWASP_TOP_10: Vulnerability[] = [
  {
    id: "A01", name: "Broken Access Control", severity: "critical",
    description: "Restrictions non appliquées : un utilisateur peut accéder à des ressources non autorisées.",
    vulnerable: `// ❌ Pas de vérification côté serveur
app.get('/api/users/:id', (req, res) => {
  const user = db.findUser(req.params.id);
  res.json(user); // N'importe qui peut voir n'importe quel profil
});`,
    secure: `// ✅ Vérification de l'identité
app.get('/api/users/:id', authMiddleware, (req, res) => {
  if (req.user.id !== req.params.id && !req.user.isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const user = db.findUser(req.params.id);
  res.json(user);
});`,
  },
  {
    id: "A02", name: "Cryptographic Failures", severity: "critical",
    description: "Données sensibles exposées par manque de chiffrement ou algorithmes faibles.",
    vulnerable: `// ❌ Mot de passe en clair
const user = { email, password: req.body.password };
db.save(user);

// ❌ HTTP pour des données sensibles
fetch('http://api.example.com/payment', { body: cardData });`,
    secure: `// ✅ Hashage avec bcrypt
import bcrypt from 'bcrypt';
const hash = await bcrypt.hash(req.body.password, 12);
const user = { email, password: hash };

// ✅ HTTPS obligatoire + headers
app.use(helmet());
app.use((req, res, next) => {
  if (!req.secure) return res.redirect('https://' + req.hostname + req.url);
  next();
});`,
  },
  {
    id: "A03", name: "Injection", severity: "critical",
    description: "Données non validées interprétées comme du code (SQL, NoSQL, OS, LDAP).",
    vulnerable: `// ❌ SQL Injection
const query = \`SELECT * FROM users WHERE email = '\${email}'\`;
db.execute(query);

// ❌ eval() avec input utilisateur
eval(req.body.expression);`,
    secure: `// ✅ Requêtes paramétrées
const query = 'SELECT * FROM users WHERE email = $1';
db.execute(query, [email]);

// ✅ ORM (Prisma, Drizzle)
const user = await prisma.user.findUnique({ where: { email } });

// ✅ Jamais eval() — utiliser des parsers sûrs
const result = safeParser.evaluate(req.body.expression);`,
  },
  {
    id: "A04", name: "Insecure Design", severity: "high",
    description: "Failles de conception : absence de limites, pas de rate limiting, logique métier exploitable.",
    vulnerable: `// ❌ Pas de rate limiting sur le login
app.post('/login', async (req, res) => {
  const user = await authenticate(req.body);
  res.json(user);
});

// ❌ Pas de limite sur le reset password
app.post('/reset-password', (req, res) => { ... });`,
    secure: `// ✅ Rate limiting
import rateLimit from 'express-rate-limit';
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 5, // 5 tentatives
  message: 'Trop de tentatives'
});
app.post('/login', loginLimiter, authenticate);

// ✅ CAPTCHA + délai exponentiel
app.post('/reset-password', captcha, exponentialBackoff, resetHandler);`,
  },
  {
    id: "A05", name: "Security Misconfiguration", severity: "high",
    description: "Configurations par défaut, ports ouverts, headers manquants, stack traces exposées.",
    vulnerable: `// ❌ Stack trace en production
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.stack });
});

// ❌ CORS trop permissif
app.use(cors({ origin: '*' }));`,
    secure: `// ✅ Erreurs génériques en production
app.use((err, req, res, next) => {
  logger.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// ✅ CORS restrictif + Security headers
app.use(cors({ origin: ['https://myapp.com'] }));
app.use(helmet());
app.disable('x-powered-by');`,
  },
  {
    id: "A06", name: "Vulnerable Components", severity: "high",
    description: "Utilisation de bibliothèques ou frameworks avec des vulnérabilités connues non corrigées.",
    vulnerable: `// ❌ Pas de suivi des dépendances
// package.json avec des versions anciennes
"lodash": "^4.17.11"  // CVE-2019-10744
"express": "^4.16.0"  // Multiples CVE

// ❌ Pas d'audit automatique
npm install some-random-package`,
    secure: `// ✅ Audit régulier des dépendances
npm audit --production
npx npm-check-updates

// ✅ Automatiser les mises à jour (Dependabot, Renovate)
// .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    schedule: { interval: "weekly" }

// ✅ Lockfile versionné + npm ci en CI
npm ci --production`,
  },
  {
    id: "A07", name: "XSS (Cross-Site Scripting)", severity: "high",
    description: "Injection de scripts malveillants dans les pages web via des inputs non sanitisés.",
    vulnerable: `// ❌ Injection HTML directe
element.innerHTML = userInput;

// ❌ React dangerouslySetInnerHTML sans sanitization
<div dangerouslySetInnerHTML={{ __html: userComment }} />`,
    secure: `// ✅ Utiliser textContent
element.textContent = userInput;

// ✅ Sanitizer (DOMPurify)
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ 
  __html: DOMPurify.sanitize(userComment) 
}} />

// ✅ CSP Header
Content-Security-Policy: default-src 'self'; script-src 'self'`,
  },
  {
    id: "A08", name: "Software & Data Integrity", severity: "high",
    description: "Absence de vérification d'intégrité sur les mises à jour, pipelines CI/CD ou données sérialisées.",
    vulnerable: `// ❌ CDN sans vérification d'intégrité
<script src="https://cdn.example.com/lib.js"></script>

// ❌ Désérialisation non sécurisée
const data = JSON.parse(untrustedInput);
eval(data.callback);`,
    secure: `// ✅ Subresource Integrity (SRI)
<script src="https://cdn.example.com/lib.js"
  integrity="sha384-abc123..."
  crossorigin="anonymous"></script>

// ✅ Validation stricte des données
const schema = z.object({ name: z.string(), age: z.number() });
const data = schema.parse(JSON.parse(untrustedInput));`,
  },
  {
    id: "A09", name: "Logging & Monitoring Failures", severity: "medium",
    description: "Absence de logs de sécurité et de monitoring empêchant la détection d'attaques.",
    vulnerable: `// ❌ Aucun log des événements de sécurité
app.post('/login', async (req, res) => {
  const user = await authenticate(req.body);
  if (!user) return res.status(401).json({ error: 'Invalid' });
  res.json({ token: generateToken(user) });
});`,
    secure: `// ✅ Logging structuré des événements de sécurité
app.post('/login', async (req, res) => {
  const user = await authenticate(req.body);
  if (!user) {
    logger.warn('login_failed', { 
      ip: req.ip, email: req.body.email, 
      timestamp: new Date().toISOString() 
    });
    return res.status(401).json({ error: 'Invalid' });
  }
  logger.info('login_success', { userId: user.id, ip: req.ip });
  res.json({ token: generateToken(user) });
});`,
  },
  {
    id: "A10", name: "SSRF (Server-Side Request Forgery)", severity: "high",
    description: "L'application effectue des requêtes HTTP côté serveur vers des URL fournies par l'utilisateur sans validation.",
    vulnerable: `// ❌ URL utilisateur non validée
app.get('/fetch', async (req, res) => {
  const response = await fetch(req.query.url);
  res.json(await response.json());
  // Peut accéder à http://169.254.169.254 (metadata cloud)
  // Peut scanner le réseau interne
});`,
    secure: `// ✅ Whitelist de domaines autorisés
const ALLOWED = ['api.github.com', 'api.stripe.com'];

app.get('/fetch', async (req, res) => {
  const url = new URL(req.query.url);
  if (!ALLOWED.includes(url.hostname)) {
    return res.status(403).json({ error: 'Domain not allowed' });
  }
  // Vérifier que ce n'est pas une IP privée
  if (isPrivateIP(url.hostname)) {
    return res.status(403).json({ error: 'Private IPs blocked' });
  }
  const response = await fetch(url.toString());
  res.json(await response.json());
});`,
  },
];

export const SECURITY_HEADERS: SecurityHeader[] = [
  { name: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'", desc: "Contrôle les sources de contenu autorisées — la protection la plus importante contre les XSS", importance: "critical" },
  { name: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload", desc: "Force HTTPS pendant 2 ans, inclut les sous-domaines, et demande l'inscription dans les listes preload des navigateurs", importance: "critical" },
  { name: "X-Content-Type-Options", value: "nosniff", desc: "Empêche le navigateur de deviner le type MIME — bloque les attaques par confusion de type", importance: "critical" },
  { name: "X-Frame-Options", value: "DENY", desc: "Empêche l'embedding en iframe — protège contre le clickjacking", importance: "critical" },
  { name: "Referrer-Policy", value: "strict-origin-when-cross-origin", desc: "Limite les informations envoyées dans le header Referer aux sites tiers", importance: "recommended" },
  { name: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()", desc: "Restreint l'accès aux APIs sensibles du navigateur (caméra, micro, géoloc, paiement)", importance: "recommended" },
  { name: "Cross-Origin-Opener-Policy", value: "same-origin", desc: "Isole le contexte de navigation — empêche les attaques cross-origin comme Spectre", importance: "recommended" },
  { name: "Cross-Origin-Resource-Policy", value: "same-origin", desc: "Empêche d'autres sites de charger vos ressources (images, scripts, etc.)", importance: "recommended" },
  { name: "Cross-Origin-Embedder-Policy", value: "require-corp", desc: "Requiert que les ressources cross-origin déclarent explicitement leur politique de partage", importance: "optional" },
  { name: "X-XSS-Protection", value: "0", desc: "Désactiver — le filtre XSS des navigateurs peut être exploité. CSP est la protection recommandée", importance: "optional" },
  { name: "Cache-Control", value: "no-store, no-cache, must-revalidate, private", desc: "Pour les pages sensibles (profil, paiement) : empêche la mise en cache des données privées", importance: "recommended" },
];

export const AUTH_BEST_PRACTICES: AuthBestPractice[] = [
  {
    title: "Stockage du JWT", category: "jwt",
    description: "Ne jamais stocker un JWT dans localStorage — vulnérable aux attaques XSS.",
    bad: `// ❌ localStorage — accessible par n'importe quel script
localStorage.setItem('token', jwt);

// ❌ Inclure des données sensibles dans le payload
const payload = { userId: 1, password: 'secret', role: 'admin' };`,
    good: `// ✅ Cookie HttpOnly — inaccessible au JavaScript
res.cookie('token', jwt, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 15 * 60 * 1000 // 15 min
});

// ✅ Payload minimal
const payload = { sub: userId, iat: now, exp: now + 900 };`,
  },
  {
    title: "Expiration et Refresh", category: "jwt",
    description: "Access token court (15 min) + refresh token long (7 jours) en rotation.",
    bad: `// ❌ Token qui n'expire jamais
const token = jwt.sign({ userId }, SECRET);
// Pas de champ exp → token valide indéfiniment

// ❌ Même token pour tout
const token = jwt.sign({ userId }, SECRET, { expiresIn: '30d' });`,
    good: `// ✅ Access token court + refresh token en rotation
const accessToken = jwt.sign({ sub: userId }, SECRET, { expiresIn: '15m' });
const refreshToken = crypto.randomUUID();

// Stocker le refresh token hashé en base
await db.refreshTokens.create({
  userId, tokenHash: hash(refreshToken),
  expiresAt: addDays(new Date(), 7)
});

// ✅ Rotation : invalider l'ancien refresh token à chaque usage
app.post('/refresh', async (req, res) => {
  const old = await db.refreshTokens.findAndDelete(req.cookies.rt);
  if (!old || old.expiresAt < new Date()) return res.status(401);
  // Émettre une nouvelle paire
});`,
  },
  {
    title: "Hashage des mots de passe", category: "password",
    description: "Toujours utiliser bcrypt ou argon2 — jamais MD5, SHA1 ou SHA256 seuls.",
    bad: `// ❌ MD5 / SHA256 — trop rapide, crackable par brute-force
const hash = crypto.createHash('sha256').update(password).digest('hex');

// ❌ Pas de salt
const hash = md5(password);`,
    good: `// ✅ bcrypt avec coût élevé (12+)
import bcrypt from 'bcrypt';
const hash = await bcrypt.hash(password, 12);
const isValid = await bcrypt.compare(input, hash);

// ✅ Argon2id (recommandé OWASP 2024)
import argon2 from 'argon2';
const hash = await argon2.hash(password, {
  type: argon2.argon2id,
  memoryCost: 65536, timeCost: 3, parallelism: 4
});`,
  },
  {
    title: "Protection CSRF", category: "session",
    description: "Les cookies de session nécessitent une protection CSRF avec des tokens synchronisés.",
    bad: `// ❌ Pas de protection CSRF
app.post('/transfer', authMiddleware, (req, res) => {
  transferMoney(req.user.id, req.body.to, req.body.amount);
  // Un site malveillant peut soumettre ce formulaire !
});`,
    good: `// ✅ Token CSRF synchronisé
import csrf from 'csurf';
app.use(csrf({ cookie: { httpOnly: true, sameSite: 'strict' } }));

// Dans le formulaire React
<form>
  <input type="hidden" name="_csrf" value={csrfToken} />
  ...
</form>

// ✅ Alternative : SameSite=Strict sur les cookies
res.cookie('session', id, { sameSite: 'strict', httpOnly: true });

// ✅ Vérifier l'en-tête Origin
if (req.headers.origin !== 'https://myapp.com') return res.status(403);`,
  },
  {
    title: "OAuth 2.0 / OpenID Connect", category: "oauth",
    description: "Utiliser le flow Authorization Code + PKCE, jamais le flow implicite.",
    bad: `// ❌ Flow implicite — token dans l'URL
window.location = 'https://auth.example.com/authorize'
  + '?response_type=token'  // Token dans le fragment !
  + '&client_id=xxx'
  + '&redirect_uri=https://myapp.com/callback';
// Le token est visible dans l'historique et les logs`,
    good: `// ✅ Authorization Code + PKCE
const codeVerifier = generateRandomString(128);
const codeChallenge = base64url(sha256(codeVerifier));

// 1. Redirection vers le provider
window.location = 'https://auth.example.com/authorize'
  + '?response_type=code'
  + '&code_challenge=' + codeChallenge
  + '&code_challenge_method=S256'
  + '&client_id=xxx';

// 2. Échange du code côté serveur
const { access_token } = await fetch('https://auth/token', {
  method: 'POST',
  body: { grant_type: 'authorization_code', code, code_verifier }
});`,
  },
  {
    title: "2FA / MFA", category: "2fa",
    description: "Ajouter un second facteur (TOTP, WebAuthn) sur les comptes sensibles.",
    bad: `// ❌ SMS comme seul 2FA — vulnérable au SIM swapping
sendSMS(user.phone, \`Code: \${code}\`);

// ❌ Code 2FA sans expiration
const code = Math.random().toString().slice(2, 8);
db.save({ userId, code }); // Valide indéfiniment`,
    good: `// ✅ TOTP (Google Authenticator, Authy)
import { authenticator } from 'otplib';
const secret = authenticator.generateSecret();
const uri = authenticator.keyuri(user.email, 'MyApp', secret);
// Afficher le QR code avec le URI

// ✅ Vérification avec fenêtre temporelle
const isValid = authenticator.verify({ token: userCode, secret });

// ✅ WebAuthn / Passkeys (le plus sécurisé)
const credential = await navigator.credentials.create({
  publicKey: { challenge, rp: { name: 'MyApp' }, user: { ... } }
});`,
  },
];

export const SECURITY_CHECKLIST = [
  { category: "Transport", items: [
    "Utiliser HTTPS partout (certificat valide, redirection HTTP→HTTPS)",
    "Activer HSTS avec includeSubDomains et preload",
    "Configurer TLS 1.2+ minimum (désactiver TLS 1.0/1.1)",
    "Vérifier la chaîne de certificats complète",
  ]},
  { category: "Headers & CSP", items: [
    "Implémenter un Content-Security-Policy strict",
    "Ajouter X-Content-Type-Options: nosniff",
    "Ajouter X-Frame-Options: DENY",
    "Configurer Referrer-Policy et Permissions-Policy",
    "Désactiver X-Powered-By",
  ]},
  { category: "Authentification", items: [
    "Hasher les mots de passe avec bcrypt (coût 12+) ou argon2id",
    "Implémenter le rate limiting sur login (5 tentatives / 15 min)",
    "Utiliser des tokens JWT courts (15 min) + refresh tokens en rotation",
    "Stocker les tokens dans des cookies HttpOnly/Secure/SameSite",
    "Implémenter la 2FA (TOTP ou WebAuthn) pour les comptes sensibles",
    "Politique de mots de passe : 12+ caractères, vérifier Have I Been Pwned",
  ]},
  { category: "Entrées & Injection", items: [
    "Valider toutes les entrées côté serveur (Zod, Joi, class-validator)",
    "Utiliser des requêtes paramétrées (jamais de concaténation SQL)",
    "Sanitizer les sorties HTML (DOMPurify)",
    "Utiliser textContent au lieu de innerHTML",
    "Jamais eval(), Function(), ou new Function() avec des données utilisateur",
  ]},
  { category: "CORS & CSRF", items: [
    "Configurer CORS avec une whitelist de domaines précise",
    "Implémenter des tokens CSRF pour les formulaires",
    "Utiliser SameSite=Strict sur les cookies de session",
    "Vérifier l'en-tête Origin sur les requêtes sensibles",
  ]},
  { category: "Données & Chiffrement", items: [
    "Chiffrer les données sensibles au repos (AES-256-GCM)",
    "Ne jamais logger de données sensibles (mots de passe, tokens, PII)",
    "Anonymiser/pseudonymiser les données personnelles en dev/staging",
    "Implémenter une politique de rétention et suppression des données",
  ]},
  { category: "Dépendances & CI/CD", items: [
    "Auditer les dépendances régulièrement (npm audit, Snyk)",
    "Automatiser les mises à jour (Dependabot, Renovate)",
    "Scanner les images Docker (Trivy, Grype)",
    "Signer les commits et vérifier l'intégrité du pipeline",
    "Ne jamais committer de secrets dans le code source",
  ]},
  { category: "Monitoring & Réponse", items: [
    "Logger tous les événements de sécurité (login, échecs, admin)",
    "Configurer des alertes sur les comportements suspects",
    "Avoir un plan de réponse aux incidents documenté",
    "Tester régulièrement avec des scans de vulnérabilités",
  ]},
];

export const SECURITY_TOOLS = [
  { name: "OWASP ZAP", url: "https://www.zaproxy.org/", desc: "Scanner de vulnérabilités web open-source" },
  { name: "Snyk", url: "https://snyk.io/", desc: "Analyse de vulnérabilités des dépendances et du code" },
  { name: "Trivy", url: "https://trivy.dev/", desc: "Scanner de sécurité pour conteneurs, IaC et dépendances" },
  { name: "Burp Suite", url: "https://portswigger.net/burp", desc: "Plateforme de tests de sécurité web (pentest)" },
  { name: "ESLint Security", url: "https://github.com/eslint-community/eslint-plugin-security", desc: "Règles ESLint pour détecter les failles de sécurité dans le code" },
  { name: "Mozilla Observatory", url: "https://observatory.mozilla.org/", desc: "Analyse gratuite des headers de sécurité de votre site" },
  { name: "Have I Been Pwned", url: "https://haveibeenpwned.com/", desc: "Vérifier si des mots de passe ont fuité dans des breaches" },
  { name: "Helmet.js", url: "https://helmetjs.github.io/", desc: "Middleware Express pour configurer les headers de sécurité" },
];

export const CATEGORY_LABELS: Record<string, string> = {
  jwt: "JWT / Tokens",
  session: "Sessions",
  oauth: "OAuth 2.0",
  password: "Mots de passe",
  "2fa": "2FA / MFA",
};
