import type { Deck, LayoutNode, TerminalInfo } from "./types";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error || `Request failed (${response.status})`);
  }
  return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
}

export const api = {
  list: () => request<Deck[]>("/api/decks"),
  opencodeSessions: (cwd: string) => request<Array<{ id: string; title: string; timeUpdated: number }>>(`/api/opencode/sessions?cwd=${encodeURIComponent(cwd)}`),
  get: (id: string) => request<Deck>(`/api/decks/${id}`),
  create: (name: string) => request<Deck>("/api/decks", { method: "POST", body: JSON.stringify({ name }) }),
  save: (id: string, name: string, layout: LayoutNode, terminals: Record<string, TerminalInfo>) =>
    request<Deck>(`/api/decks/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name, layout, terminals }),
    }),
  recreate: (id: string) => request<void>(`/api/decks/${id}/recreate`, { method: "POST" }),
  remove: (id: string) => request<void>(`/api/decks/${id}`, { method: "DELETE" }),
};
