import jsYaml from "js-yaml";

export type Format = 'csv' | 'json' | 'tsv' | 'markdown' | 'yaml' | 'xml' | 'sql';

export const FORMAT_LABELS: Record<Format, string> = {
  csv: 'CSV',
  json: 'JSON',
  tsv: 'TSV',
  markdown: 'Markdown',
  yaml: 'YAML',
  xml: 'XML',
  sql: 'SQL INSERT',
};

export const FORMAT_EXTENSIONS: Record<Format, string> = {
  csv: 'csv',
  json: 'json',
  tsv: 'tsv',
  markdown: 'md',
  yaml: 'yaml',
  xml: 'xml',
  sql: 'sql',
};

// ---- Auto-detection ----
export function detectFormat(text: string): Format | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  // JSON
  if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
    try { JSON.parse(trimmed); return 'json'; } catch {}
  }

  // XML
  if (trimmed.startsWith('<?xml') || (trimmed.startsWith('<') && trimmed.endsWith('>'))) {
    return 'xml';
  }

  // YAML (has colons but no commas on first line, or starts with ---)
  if (trimmed.startsWith('---') || (trimmed.includes(':') && !trimmed.startsWith('|') && !trimmed.includes(','))) {
    try { const parsed = jsYaml.load(trimmed); if (typeof parsed === 'object' && parsed !== null) return 'yaml'; } catch {}
  }

  // SQL INSERT
  if (/^INSERT\s+INTO/i.test(trimmed)) return 'sql';

  // Markdown table
  const lines = trimmed.split('\n');
  if (lines.length >= 2 && lines[0].includes('|') && /^[-|: ]+$/.test(lines[1].trim())) {
    return 'markdown';
  }

  // TSV (tabs present)
  if (lines[0].includes('\t')) return 'tsv';

  // CSV (commas present)
  if (lines[0].includes(',')) return 'csv';

  return null;
}

// ---- Parsers ----
export function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] || ''; });
    return row;
  });
}

export function parseTSV(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split('\t').map(h => h.trim());
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const values = line.split('\t').map(v => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] || ''; });
    return row;
  });
}

export function parseJSON(text: string): Record<string, string>[] {
  const parsed = JSON.parse(text);
  const arr = Array.isArray(parsed) ? parsed : [parsed];
  return arr.map(item => {
    const row: Record<string, string> = {};
    Object.entries(item).forEach(([k, v]) => { row[k] = String(v ?? ''); });
    return row;
  });
}

export function parseMarkdown(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n').filter(l => l.trim() && !/^[-|: ]+$/.test(l.trim()));
  if (lines.length < 2) return [];
  const headers = lines[0].split('|').map(h => h.trim()).filter(Boolean);
  return lines.slice(1).map(line => {
    const values = line.split('|').map(v => v.trim()).filter(v => v !== '');
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] || ''; });
    return row;
  });
}

export function parseYAML(text: string): Record<string, string>[] {
  const parsed = jsYaml.load(text);
  const arr = Array.isArray(parsed) ? parsed : [parsed];
  return arr.map(item => {
    const row: Record<string, string> = {};
    if (typeof item === 'object' && item !== null) {
      Object.entries(item).forEach(([k, v]) => { row[k] = String(v ?? ''); });
    }
    return row;
  });
}

export function parseXML(text: string): Record<string, string>[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/xml');
  const errorNode = doc.querySelector('parsererror');
  if (errorNode) throw new Error('XML invalide');
  
  const root = doc.documentElement;
  const items = root.children;
  const data: Record<string, string>[] = [];
  
  for (let i = 0; i < items.length; i++) {
    const row: Record<string, string> = {};
    const children = items[i].children;
    for (let j = 0; j < children.length; j++) {
      row[children[j].tagName] = children[j].textContent || '';
    }
    if (Object.keys(row).length > 0) data.push(row);
  }
  return data;
}

export function parseSQL(text: string): Record<string, string>[] {
  const data: Record<string, string>[] = [];
  const regex = /INSERT\s+INTO\s+\w+\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/gi;
  let match;
  let headers: string[] = [];
  
  while ((match = regex.exec(text)) !== null) {
    if (headers.length === 0) {
      headers = match[1].split(',').map(h => h.trim().replace(/[`"]/g, ''));
    }
    const values = match[2].split(',').map(v => v.trim().replace(/^'|'$/g, ''));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] || ''; });
    data.push(row);
  }
  return data;
}

// ---- Generators ----
export function toCSV(data: Record<string, string>[]): string {
  if (!data.length) return '';
  const headers = Object.keys(data[0]);
  const rows = data.map(row =>
    headers.map(h => {
      const v = row[h] || '';
      return v.includes(',') ? `"${v}"` : v;
    }).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

export function toTSV(data: Record<string, string>[]): string {
  if (!data.length) return '';
  const headers = Object.keys(data[0]);
  return [headers.join('\t'), ...data.map(row => headers.map(h => row[h] || '').join('\t'))].join('\n');
}

export function toJSON(data: Record<string, string>[]): string {
  return JSON.stringify(data, null, 2);
}

export function toMarkdown(data: Record<string, string>[]): string {
  if (!data.length) return '';
  const headers = Object.keys(data[0]);
  return [
    '| ' + headers.join(' | ') + ' |',
    '|' + headers.map(() => '---').join('|') + '|',
    ...data.map(row => '| ' + headers.map(h => row[h] || '').join(' | ') + ' |'),
  ].join('\n');
}

export function toYAML(data: Record<string, string>[]): string {
  return jsYaml.dump(data, { indent: 2, lineWidth: -1 });
}

export function toXML(data: Record<string, string>[], rootTag = 'data', itemTag = 'item'): string {
  const lines = ['<?xml version="1.0" encoding="UTF-8"?>', `<${rootTag}>`];
  data.forEach(row => {
    lines.push(`  <${itemTag}>`);
    Object.entries(row).forEach(([k, v]) => {
      lines.push(`    <${k}>${escapeXml(v)}</${k}>`);
    });
    lines.push(`  </${itemTag}>`);
  });
  lines.push(`</${rootTag}>`);
  return lines.join('\n');
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function toSQL(data: Record<string, string>[], tableName = 'my_table'): string {
  if (!data.length) return '';
  const headers = Object.keys(data[0]);
  return data.map(row => {
    const values = headers.map(h => `'${(row[h] || '').replace(/'/g, "''")}'`);
    return `INSERT INTO ${tableName} (${headers.join(', ')}) VALUES (${values.join(', ')});`;
  }).join('\n');
}

// ---- Unified parse/generate ----
export function parseData(text: string, format: Format): Record<string, string>[] {
  switch (format) {
    case 'csv': return parseCSV(text);
    case 'tsv': return parseTSV(text);
    case 'json': return parseJSON(text);
    case 'markdown': return parseMarkdown(text);
    case 'yaml': return parseYAML(text);
    case 'xml': return parseXML(text);
    case 'sql': return parseSQL(text);
  }
}

export function generateData(data: Record<string, string>[], format: Format): string {
  switch (format) {
    case 'csv': return toCSV(data);
    case 'tsv': return toTSV(data);
    case 'json': return toJSON(data);
    case 'markdown': return toMarkdown(data);
    case 'yaml': return toYAML(data);
    case 'xml': return toXML(data);
    case 'sql': return toSQL(data);
  }
}

// ---- Validation ----
export function validateInput(text: string, format: Format): { valid: boolean; error?: string; line?: number } {
  const trimmed = text.trim();
  if (!trimmed) return { valid: true };

  try {
    switch (format) {
      case 'json':
        JSON.parse(trimmed);
        return { valid: true };
      case 'xml': {
        const doc = new DOMParser().parseFromString(trimmed, 'text/xml');
        const err = doc.querySelector('parsererror');
        if (err) {
          const msg = err.textContent || 'XML invalide';
          const lineMatch = msg.match(/line (\d+)/i);
          return { valid: false, error: 'XML invalide : vérifiez les balises', line: lineMatch ? parseInt(lineMatch[1]) : undefined };
        }
        return { valid: true };
      }
      case 'yaml':
        jsYaml.load(trimmed);
        return { valid: true };
      case 'csv': {
        const lines = trimmed.split('\n').filter(l => l.trim());
        if (lines.length < 2) return { valid: false, error: 'CSV nécessite au moins un en-tête et une ligne de données' };
        const colCount = lines[0].split(',').length;
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').length;
          if (cols !== colCount) return { valid: false, error: `Ligne ${i + 1} : ${cols} colonnes au lieu de ${colCount}`, line: i + 1 };
        }
        return { valid: true };
      }
      case 'tsv': {
        const lines = trimmed.split('\n').filter(l => l.trim());
        if (lines.length < 2) return { valid: false, error: 'TSV nécessite au moins un en-tête et une ligne de données' };
        const colCount = lines[0].split('\t').length;
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split('\t').length;
          if (cols !== colCount) return { valid: false, error: `Ligne ${i + 1} : ${cols} colonnes au lieu de ${colCount}`, line: i + 1 };
        }
        return { valid: true };
      }
      case 'markdown': {
        const lines = trimmed.split('\n');
        if (lines.length < 2 || !lines[0].includes('|')) return { valid: false, error: 'Table Markdown invalide : il faut un en-tête avec | et une ligne de séparation' };
        if (!/^[-|: ]+$/.test(lines[1].trim())) return { valid: false, error: 'Ligne 2 : séparateur Markdown manquant (ex: |---|---|)', line: 2 };
        return { valid: true };
      }
      case 'sql': {
        if (!/INSERT\s+INTO/i.test(trimmed)) return { valid: false, error: 'SQL INSERT attendu : INSERT INTO table (...) VALUES (...)' };
        return { valid: true };
      }
    }
  } catch (e: any) {
    const msg = e.message || 'Erreur de syntaxe';
    const lineMatch = msg.match(/line (\d+)/i);
    return { valid: false, error: msg.slice(0, 120), line: lineMatch ? parseInt(lineMatch[1]) : undefined };
  }
  return { valid: true };
}

// ---- History ----
export interface ConversionHistoryEntry {
  id: string;
  timestamp: number;
  inputFormat: Format;
  outputFormat: Format;
  inputPreview: string;
  outputPreview: string;
  input: string;
  output: string;
}

const HISTORY_KEY = 'format-converter-history';
const MAX_HISTORY = 20;

export function loadHistory(): ConversionHistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch { return []; }
}

export function saveToHistory(entry: Omit<ConversionHistoryEntry, 'id' | 'timestamp'>): ConversionHistoryEntry[] {
  const history = loadHistory();
  const newEntry: ConversionHistoryEntry = {
    ...entry,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  const updated = [newEntry, ...history].slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  return updated;
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

export const EXAMPLE_DATA: Record<Format, string> = {
  csv: `nom,age,ville\nAlice,25,Paris\nBob,30,Lyon\nCharlie,35,Marseille`,
  json: `[\n  {"nom": "Alice", "age": "25", "ville": "Paris"},\n  {"nom": "Bob", "age": "30", "ville": "Lyon"}\n]`,
  tsv: `nom\tage\tville\nAlice\t25\tParis\nBob\t30\tLyon\nCharlie\t35\tMarseille`,
  markdown: `| nom | age | ville |\n|---|---|---|\n| Alice | 25 | Paris |\n| Bob | 30 | Lyon |`,
  yaml: `- nom: Alice\n  age: 25\n  ville: Paris\n- nom: Bob\n  age: 30\n  ville: Lyon`,
  xml: `<?xml version="1.0" encoding="UTF-8"?>\n<data>\n  <item>\n    <nom>Alice</nom>\n    <age>25</age>\n    <ville>Paris</ville>\n  </item>\n  <item>\n    <nom>Bob</nom>\n    <age>30</age>\n    <ville>Lyon</ville>\n  </item>\n</data>`,
  sql: `INSERT INTO users (nom, age, ville) VALUES ('Alice', '25', 'Paris');\nINSERT INTO users (nom, age, ville) VALUES ('Bob', '30', 'Lyon');`,
};
