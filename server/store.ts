import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Deck } from "./types.js";

const dataDir = path.join(process.cwd(), "data");
const storeFile = path.join(dataDir, "decks.json");

async function readAll(): Promise<Deck[]> {
  try {
    return JSON.parse(await readFile(storeFile, "utf8")) as Deck[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function writeAll(decks: Deck[]) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(storeFile, `${JSON.stringify(decks, null, 2)}\n`, "utf8");
}

export async function listDecks() {
  return (await readAll()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getDeck(id: string) {
  return (await readAll()).find((deck) => deck.id === id);
}

export async function saveDeck(deck: Deck) {
  const decks = await readAll();
  const index = decks.findIndex((item) => item.id === deck.id);
  if (index === -1) decks.push(deck);
  else decks[index] = deck;
  await writeAll(decks);
  return deck;
}

export async function deleteDeck(id: string) {
  const decks = await readAll();
  await writeAll(decks.filter((deck) => deck.id !== id));
}
