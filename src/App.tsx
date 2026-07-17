import { useEffect, useState } from "react";
import { api } from "./api";
import type { Deck } from "./types";
import { Home } from "./Home";
import { DeckView } from "./DeckView";

export default function App() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [active, setActive] = useState<Deck | null>(null);
  const [home, setHome] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.list().then(setDecks).catch((cause: Error) => setError(cause.message));
  }, []);

  const create = async (name: string) => {
    setBusy(true);
    try {
      const deck = await api.create(name);
      setDecks((current) => [deck, ...current]);
      setActive(deck);
      setHome(false);
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const open = async (id: string) => {
    if (active?.id === id) {
      setHome(false);
      return;
    }
    setBusy(true);
    try {
      setActive(await api.get(id));
      setHome(false);
    }
    catch (cause) { setError((cause as Error).message); }
    finally { setBusy(false); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this stored deck and stop its terminals?")) return;
    await api.remove(id);
    setDecks((current) => current.filter((deck) => deck.id !== id));
    if (active?.id === id) setActive(null);
  };

  const stored = (deck: Deck) => setDecks((current) => [deck, ...current.filter((item) => item.id !== deck.id)]);

  return <>{home && <Home decks={decks} busy={busy} onCreate={create} onOpen={open} onDelete={remove} />}{active && <div className={home ? "parked-deck" : "active-deck"}><DeckView key={active.id} initial={active} onHome={() => setHome(true)} onStored={stored} /></div>}{error && <button className="global-error" onClick={() => setError("")}>{error}<span>×</span></button>}</>;
}
