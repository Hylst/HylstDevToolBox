export interface ErrorEntry {
  id: string;
  name: string;
  message: string;
  cause: string;
  solution: string;
  codeExample?: string;
  fixExample?: string;
  docs?: string;
  tags: string[];
}

export interface Language {
  id: string;
  name: string;
  color: string;
  errors: ErrorEntry[];
}
