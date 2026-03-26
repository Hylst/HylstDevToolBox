// ---- Field type definitions ----

export interface FieldType {
  value: string;
  label: string;
  category: string;
}

export const fieldTypes: FieldType[] = [
  // Identité
  { value: "firstName", label: "Prénom", category: "Identité" },
  { value: "lastName", label: "Nom", category: "Identité" },
  { value: "fullName", label: "Nom complet", category: "Identité" },
  { value: "gender", label: "Genre", category: "Identité" },
  { value: "age", label: "Âge", category: "Identité" },
  // Contact
  { value: "email", label: "Email", category: "Contact" },
  { value: "phone", label: "Téléphone", category: "Contact" },
  { value: "address", label: "Adresse", category: "Contact" },
  { value: "city", label: "Ville", category: "Contact" },
  { value: "country", label: "Pays", category: "Contact" },
  { value: "zipCode", label: "Code postal", category: "Contact" },
  { value: "gps", label: "Coordonnées GPS", category: "Contact" },
  // Identifiants
  { value: "uuid", label: "UUID", category: "Identifiants" },
  { value: "id", label: "ID numérique", category: "Identifiants" },
  { value: "username", label: "Username", category: "Identifiants" },
  { value: "password", label: "Mot de passe", category: "Identifiants" },
  { value: "slug", label: "Slug", category: "Identifiants" },
  // Dates
  { value: "date", label: "Date", category: "Dates" },
  { value: "datetime", label: "Date/Heure", category: "Dates" },
  { value: "pastDate", label: "Date passée", category: "Dates" },
  { value: "futureDate", label: "Date future", category: "Dates" },
  { value: "timestamp", label: "Timestamp Unix", category: "Dates" },
  // Nombres
  { value: "number", label: "Nombre", category: "Nombres" },
  { value: "float", label: "Décimal", category: "Nombres" },
  { value: "price", label: "Prix", category: "Nombres" },
  { value: "percentage", label: "Pourcentage", category: "Nombres" },
  // Texte
  { value: "lorem", label: "Lorem Ipsum", category: "Texte" },
  { value: "sentence", label: "Phrase", category: "Texte" },
  { value: "paragraph", label: "Paragraphe", category: "Texte" },
  { value: "title", label: "Titre", category: "Texte" },
  { value: "hashtag", label: "Hashtag", category: "Texte" },
  { value: "emoji", label: "Emoji", category: "Texte" },
  // Business
  { value: "company", label: "Entreprise", category: "Business" },
  { value: "jobTitle", label: "Poste", category: "Business" },
  { value: "iban", label: "IBAN", category: "Business" },
  { value: "siret", label: "SIRET", category: "Business" },
  // Web / Tech
  { value: "url", label: "URL", category: "Web" },
  { value: "avatar", label: "Avatar URL", category: "Web" },
  { value: "image", label: "Image URL", category: "Web" },
  { value: "ip", label: "Adresse IP", category: "Web" },
  { value: "ipv6", label: "Adresse IPv6", category: "Web" },
  { value: "mac", label: "Adresse MAC", category: "Web" },
  { value: "userAgent", label: "User Agent", category: "Web" },
  // Autres
  { value: "boolean", label: "Booléen", category: "Autres" },
  { value: "color", label: "Couleur HEX", category: "Autres" },
  { value: "enum", label: "Valeur fixe (enum)", category: "Autres" },
];

// ---- Field definition ----

export interface FieldDefinition {
  name: string;
  type: string;
  options?: string;
  relatedTo?: string; // field name to derive from
}

// ---- Generators ----

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const firstNames = ["Alice", "Bob", "Charlie", "Diana", "Emma", "François", "Gabriel", "Hélène", "Ivan", "Julia", "Kevin", "Laura", "Michel", "Nathalie", "Olivier", "Patricia", "Quentin", "Rachel", "Sophie", "Thomas"];
const lastNames = ["Martin", "Bernard", "Dubois", "Thomas", "Robert", "Richard", "Petit", "Durand", "Leroy", "Moreau", "Simon", "Laurent", "Lefebvre", "Michel", "Garcia", "David", "Roux", "Fournier", "Girard", "Bonnet"];

const cityZipMap: Record<string, string> = {
  "Paris": "75001", "Lyon": "69001", "Marseille": "13001", "Toulouse": "31000",
  "Nice": "06000", "Nantes": "44000", "Strasbourg": "67000", "Montpellier": "34000",
  "Bordeaux": "33000", "Lille": "59000",
};
const cities = Object.keys(cityZipMap);

const emojis = ["😀", "🚀", "🔥", "✨", "💡", "🎯", "⚡", "🌟", "💻", "📊", "🎉", "🧪", "🔧", "📱", "🌍"];
const hashtags = ["#tech", "#dev", "#coding", "#webdev", "#javascript", "#react", "#design", "#startup", "#AI", "#data", "#cloud", "#open_source", "#fullstack", "#frontend", "#backend"];

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148",
];

function genUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function genIban(): string {
  const country = pick(["FR", "DE", "ES", "IT", "BE"]);
  const digits = Array.from({ length: 22 }, () => Math.floor(Math.random() * 10)).join('');
  return `${country}${digits}`;
}

function genSiret(): string {
  return Array.from({ length: 14 }, () => Math.floor(Math.random() * 10)).join('');
}

function genIp(): string {
  return `${Math.floor(Math.random() * 223) + 1}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
}

function genIpv6(): string {
  return Array.from({ length: 8 }, () => Math.floor(Math.random() * 65536).toString(16).padStart(4, '0')).join(':');
}

function genMac(): string {
  return Array.from({ length: 6 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(':');
}

function toSlug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Generate a single value, optionally using context from the current record for relations
export function generateValue(
  type: string,
  options?: string,
  record?: Record<string, unknown>,
  relatedTo?: string,
): unknown {
  // Handle relations
  if (relatedTo && record) {
    const related = record[relatedTo];
    if (related !== undefined && related !== null) {
      switch (type) {
        case 'email': {
          const name = String(related).toLowerCase().replace(/\s+/g, '.').normalize("NFD").replace(/[\u0300-\u036f]/g, '');
          return `${name}@${pick(["gmail.com", "outlook.com", "yahoo.fr", "example.com"])}`;
        }
        case 'zipCode': {
          const zip = cityZipMap[String(related)];
          return zip || String(Math.floor(Math.random() * 90000) + 10000);
        }
        case 'username': {
          const name = String(related).toLowerCase().replace(/\s+/g, '').normalize("NFD").replace(/[\u0300-\u036f]/g, '');
          return `${name}${Math.floor(Math.random() * 1000)}`;
        }
        case 'slug': {
          return toSlug(String(related));
        }
      }
    }
  }

  switch (type) {
    case 'firstName': return pick(firstNames);
    case 'lastName': return pick(lastNames);
    case 'fullName': return `${pick(firstNames)} ${pick(lastNames)}`;
    case 'gender': return pick(["Homme", "Femme", "Non-binaire"]);
    case 'age': return Math.floor(Math.random() * 60) + 18;
    case 'email': return `${pick(firstNames).toLowerCase()}.${pick(lastNames).toLowerCase()}@${pick(["gmail.com", "yahoo.fr", "outlook.com", "example.com"])}`;
    case 'phone': return `+33 ${Math.floor(Math.random() * 9) + 1} ${String(Math.floor(Math.random() * 100)).padStart(2, '0')} ${String(Math.floor(Math.random() * 100)).padStart(2, '0')} ${String(Math.floor(Math.random() * 100)).padStart(2, '0')} ${String(Math.floor(Math.random() * 100)).padStart(2, '0')}`;
    case 'address': return `${Math.floor(Math.random() * 200) + 1} ${pick(["rue", "avenue", "boulevard", "place"])} ${pick(["de la Paix", "Victor Hugo", "des Lilas", "Jean Jaurès", "du Commerce", "de la République"])}`;
    case 'city': return pick(cities);
    case 'country': return pick(["France", "Belgique", "Suisse", "Canada", "Luxembourg"]);
    case 'zipCode': return String(Math.floor(Math.random() * 90000) + 10000);
    case 'gps': return `${(Math.random() * 180 - 90).toFixed(6)}, ${(Math.random() * 360 - 180).toFixed(6)}`;
    case 'uuid': return genUuid();
    case 'id': return Math.floor(Math.random() * 100000) + 1;
    case 'username': return `${pick(firstNames).toLowerCase()}${Math.floor(Math.random() * 1000)}`;
    case 'password': return Array(12).fill(0).map(() => "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%"[Math.floor(Math.random() * 68)]).join('');
    case 'slug': return toSlug(pick(["Le Guide Ultime", "Innovation Tech", "Nouveautés 2024", "Solution Pro", "Collection Premium"]));
    case 'date': return new Date(Date.now() - Math.random() * 730 * 86400000).toISOString().split('T')[0];
    case 'datetime': return new Date(Date.now() - Math.random() * 730 * 86400000).toISOString();
    case 'pastDate': return new Date(Date.now() - Math.random() * 1095 * 86400000).toISOString().split('T')[0];
    case 'futureDate': return new Date(Date.now() + Math.random() * 365 * 86400000).toISOString().split('T')[0];
    case 'timestamp': return Math.floor(Date.now() / 1000 - Math.random() * 730 * 86400);
    case 'number': return Math.floor(Math.random() * 10000);
    case 'float': return +(Math.random() * 1000).toFixed(2);
    case 'price': return +(Math.random() * 500 + 10).toFixed(2);
    case 'percentage': return Math.floor(Math.random() * 101);
    case 'boolean': return Math.random() > 0.5;
    case 'lorem': return "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
    case 'sentence': return pick(["Un service de qualité exceptionnelle.", "Innovation et créativité au rendez-vous.", "Solution parfaite pour vos besoins.", "Expérience utilisateur optimale garantie.", "Performance et fiabilité assurées."]);
    case 'paragraph': return "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.";
    case 'title': return `${pick(["Le Guide Ultime", "Nouveautés 2024", "Innovation Tech", "Solution Pro", "Édition Limitée", "Collection Premium"])} ${pick(["Alpha", "Beta", "Gamma", "Delta", "Omega"])}`;
    case 'hashtag': return pick(hashtags);
    case 'emoji': return pick(emojis);
    case 'company': return pick(["TechCorp", "DataSoft", "InnoVision", "CloudScale", "DigitalWave", "SmartSolutions", "FutureTech", "GlobalServices"]);
    case 'jobTitle': return pick(["Développeur Senior", "Chef de Projet", "Designer UX", "Data Analyst", "Product Manager", "DevOps Engineer", "CTO", "Consultant"]);
    case 'iban': return genIban();
    case 'siret': return genSiret();
    case 'url': return `https://www.${pick(["example", "test", "demo", "sample"])}.com/${pick(firstNames).toLowerCase()}`;
    case 'avatar': return `https://i.pravatar.cc/150?u=${genUuid()}`;
    case 'image': return `https://picsum.photos/seed/${genUuid()}/400/300`;
    case 'ip': return genIp();
    case 'ipv6': return genIpv6();
    case 'mac': return genMac();
    case 'userAgent': return pick(userAgents);
    case 'color': return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    case 'enum': {
      const opts = options?.split(',').map(o => o.trim()).filter(Boolean) || ['A', 'B', 'C'];
      return pick(opts);
    }
    default: return '';
  }
}

// ---- Data generation ----

export function generateDataSet(
  fields: FieldDefinition[],
  count: number,
  includeNull: boolean,
  nullProbability: number,
): Record<string, unknown>[] {
  const data: Record<string, unknown>[] = [];
  for (let i = 0; i < count; i++) {
    const record: Record<string, unknown> = {};
    for (const field of fields) {
      if (includeNull && Math.random() * 100 < nullProbability) {
        record[field.name] = null;
      } else {
        record[field.name] = generateValue(field.type, field.options, record, field.relatedTo);
      }
    }
    data.push(record);
  }
  return data;
}

// ---- Output formatters ----

export function formatOutput(
  data: Record<string, unknown>[],
  fields: FieldDefinition[],
  format: string,
  includeNull: boolean,
): string {
  switch (format) {
    case 'json':
      return JSON.stringify(data, null, 2);
    case 'csv': {
      const headers = fields.map(f => f.name).join(',');
      const rows = data.map(row =>
        fields.map(f => {
          const val = row[f.name];
          if (val === null) return '';
          if (typeof val === 'string' && (val.includes(',') || val.includes('"')))
            return `"${val.replace(/"/g, '""')}"`;
          return String(val);
        }).join(',')
      );
      return [headers, ...rows].join('\n');
    }
    case 'sql': {
      const cols = fields.map(f => f.name).join(', ');
      return data.map(row => {
        const values = fields.map(f => {
          const val = row[f.name];
          if (val === null) return 'NULL';
          if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
          if (typeof val === 'number') return val;
          return `'${String(val).replace(/'/g, "''")}'`;
        }).join(', ');
        return `INSERT INTO data_table (${cols}) VALUES (${values});`;
      }).join('\n');
    }
    case 'typescript': {
      const typeMap: Record<string, string> = {
        firstName: 'string', lastName: 'string', fullName: 'string', email: 'string',
        phone: 'string', address: 'string', city: 'string', country: 'string', zipCode: 'string',
        gps: 'string', uuid: 'string', id: 'number', username: 'string', password: 'string',
        slug: 'string', date: 'string', datetime: 'string', pastDate: 'string', futureDate: 'string',
        timestamp: 'number', number: 'number', float: 'number', price: 'number', percentage: 'number',
        boolean: 'boolean', lorem: 'string', sentence: 'string', paragraph: 'string', title: 'string',
        hashtag: 'string', emoji: 'string', company: 'string', jobTitle: 'string', iban: 'string',
        siret: 'string', url: 'string', avatar: 'string', image: 'string', ip: 'string',
        ipv6: 'string', mac: 'string', userAgent: 'string', color: 'string', enum: 'string',
        gender: 'string', age: 'number',
      };
      const iFields = fields.map(f =>
        `  ${f.name}${includeNull ? '?' : ''}: ${typeMap[f.type] || 'string'}${includeNull ? ' | null' : ''};`
      ).join('\n');
      return `interface DataRecord {\n${iFields}\n}\n\nconst data: DataRecord[] = ${JSON.stringify(data, null, 2)};`;
    }
    default:
      return JSON.stringify(data, null, 2);
  }
}

// ---- Templates ----

export interface SchemaTemplate {
  name: string;
  fields: FieldDefinition[];
  isCustom?: boolean;
}

export const builtInTemplates: SchemaTemplate[] = [
  {
    name: "Utilisateurs",
    fields: [
      { name: "id", type: "uuid" },
      { name: "firstName", type: "firstName" },
      { name: "lastName", type: "lastName" },
      { name: "email", type: "email", relatedTo: "firstName" },
      { name: "avatar", type: "avatar" },
      { name: "createdAt", type: "pastDate" },
    ],
  },
  {
    name: "Produits",
    fields: [
      { name: "id", type: "uuid" },
      { name: "name", type: "title" },
      { name: "slug", type: "slug", relatedTo: "name" },
      { name: "description", type: "sentence" },
      { name: "price", type: "price" },
      { name: "category", type: "enum", options: "Electronics,Clothing,Food,Books" },
      { name: "inStock", type: "boolean" },
      { name: "image", type: "image" },
    ],
  },
  {
    name: "Commandes",
    fields: [
      { name: "orderId", type: "uuid" },
      { name: "customerName", type: "fullName" },
      { name: "email", type: "email", relatedTo: "customerName" },
      { name: "total", type: "price" },
      { name: "status", type: "enum", options: "pending,processing,shipped,delivered" },
      { name: "orderDate", type: "pastDate" },
    ],
  },
  {
    name: "Articles de blog",
    fields: [
      { name: "id", type: "id" },
      { name: "title", type: "title" },
      { name: "slug", type: "slug", relatedTo: "title" },
      { name: "excerpt", type: "sentence" },
      { name: "content", type: "paragraph" },
      { name: "author", type: "fullName" },
      { name: "publishedAt", type: "pastDate" },
      { name: "tags", type: "enum", options: "tech,design,business,lifestyle" },
    ],
  },
  {
    name: "Transactions",
    fields: [
      { name: "transactionId", type: "uuid" },
      { name: "amount", type: "price" },
      { name: "currency", type: "enum", options: "EUR,USD,GBP" },
      { name: "type", type: "enum", options: "credit,debit" },
      { name: "status", type: "enum", options: "completed,pending,failed" },
      { name: "date", type: "datetime" },
      { name: "description", type: "sentence" },
    ],
  },
  {
    name: "Employés",
    fields: [
      { name: "employeeId", type: "id" },
      { name: "firstName", type: "firstName" },
      { name: "lastName", type: "lastName" },
      { name: "email", type: "email", relatedTo: "firstName" },
      { name: "department", type: "enum", options: "Engineering,Marketing,Sales,HR,Finance" },
      { name: "jobTitle", type: "jobTitle" },
      { name: "salary", type: "price" },
      { name: "hireDate", type: "pastDate" },
    ],
  },
  {
    name: "Réseau / Infra",
    fields: [
      { name: "hostname", type: "slug" },
      { name: "ip", type: "ip" },
      { name: "ipv6", type: "ipv6" },
      { name: "mac", type: "mac" },
      { name: "userAgent", type: "userAgent" },
      { name: "lastSeen", type: "datetime" },
    ],
  },
];

// ---- Custom schema storage ----

const SCHEMAS_KEY = 'data-generator-custom-schemas';

export function loadCustomSchemas(): SchemaTemplate[] {
  try {
    return JSON.parse(localStorage.getItem(SCHEMAS_KEY) || '[]');
  } catch { return []; }
}

export function saveCustomSchema(schema: SchemaTemplate): SchemaTemplate[] {
  const schemas = loadCustomSchemas();
  const existing = schemas.findIndex(s => s.name === schema.name);
  if (existing >= 0) {
    schemas[existing] = { ...schema, isCustom: true };
  } else {
    schemas.push({ ...schema, isCustom: true });
  }
  localStorage.setItem(SCHEMAS_KEY, JSON.stringify(schemas));
  return schemas;
}

export function deleteCustomSchema(name: string): SchemaTemplate[] {
  const schemas = loadCustomSchemas().filter(s => s.name !== name);
  localStorage.setItem(SCHEMAS_KEY, JSON.stringify(schemas));
  return schemas;
}

// ---- Relatable fields ----
// Returns which field types can be derived from which source types
export const RELATION_TARGETS: Record<string, string[]> = {
  email: ['firstName', 'fullName', 'lastName'],
  username: ['firstName', 'fullName'],
  zipCode: ['city'],
  slug: ['title', 'fullName', 'company', 'sentence'],
};

export function canRelate(fieldType: string): boolean {
  return fieldType in RELATION_TARGETS;
}

export function getRelationSources(fieldType: string): string[] {
  return RELATION_TARGETS[fieldType] || [];
}
