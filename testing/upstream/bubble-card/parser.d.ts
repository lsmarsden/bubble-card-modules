// Types for the vendored Bubble Card store parser (parser.js), covering what the contract tests use.
export interface StoreModule {
  id: string;
  name: string;
  description: string;
  creator: string;
  version: string;
  moduleLink: string;
  type: string;
  imageUrl: string;
  supportedCards: string[] | undefined;
  unsupportedCards: string[];
  yamlContent?: string;
}

export interface RestDiscussion {
  number: number;
  title: string;
  html_url: string;
  body: string;
  user?: { login: string; avatar_url?: string };
  category?: { name: string };
  created_at?: string;
  updated_at?: string;
}

export function parseDiscussionsREST(discussions: RestDiscussion[]): StoreModule[];
export function extractYamlFromMarkdown(markdown: string, moduleLink?: string | null): string;
