import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import menuBg from "@/assets/menu-bg.jpg";
import type { Game, Hud, Note } from "@/game/Game";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Забытый Парк — 3D хоррор" },
      { name: "description", content: "Хоррор от первого лица в заброшенном парке аттракционов." },
      { property: "og:title", content: "Забытый Парк — 3D хоррор" },
      { property: "og:description", content: "Почините щитки и сбегите от аниматроника." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  const box = useRef<HTMLDivElement>(null);
  const game = useRef<Game | null>(null);
  const [screen, setScreen] = useState<"menu" | "play" | "over" | "win">("menu");
  const [hud, setHud] = useState<Hud | null>(null);
  const [note, setNote] = useState<Note | null>(null);

  const start = async () => {
    const { Game } = await import("@/game/Game");
    game.current?.dispose();
    setScreen("play");
    game.current = new Game(box.current!, {
      onHud: setHud,
      onNote: setNote,
      onArcade: () => {},
      onInventory: () => {},
      onEnd: (r) => setScreen(r),
    });
    game.current.lock();
  };
  useEffect(() => () => game.current?.dispose(), []);

  return (
    <div className="fixed inset-0 bg-background text-foreground">
      <div ref={box} className="absolute inset-0" />
      {screen === "play" && hud && (
        <div className="pointer-events-none absolute inset-0 p-4 text-sm">
          <div>Фонарик {hud.battery}% · Щитки {hud.gens}/3</div>
          <div>{hud.slots.map((s) => `${s.label}×${s.count}`).join(" · ")}</div>
          {hud.prompt && <div className="absolute bottom-24 w-full text-center">[E] {hud.prompt}</div>}
          {hud.message && <div className="absolute top-16 w-full text-center">{hud.message}</div>}
          {hud.paused && <div className="absolute inset-0 grid place-items-center">Кликните, чтобы продолжить</div>}
        </div>
      )}
      {note && (
        <div className="absolute inset-0 grid place-items-center bg-background/80">
          <div className="max-w-md bg-card p-6 whitespace-pre-line">
            <h2 className="mb-2 font-bold">{note.title}</h2>
            {note.text}
            <button className="mt-4 block underline" onClick={() => { setNote(null); game.current?.closeModal(); }}>Закрыть</button>
          </div>
        </div>
      )}
      {screen !== "play" && (
        <div className="absolute inset-0 grid place-items-center bg-cover bg-center" style={{ backgroundImage: `url(${menuBg})` }}>
          <div className="bg-background/70 p-8 text-center">
            <h1 className="text-4xl font-bold">{screen === "over" ? "ВАС ПОЙМАЛИ" : screen === "win" ? "ВЫ СБЕЖАЛИ" : "ЗАБЫТЫЙ ПАРК"}</h1>
            <p className="mt-2 text-muted-foreground">WASD, Shift, E, F, мышь</p>
            <button className="mt-6 bg-primary px-6 py-2 text-primary-foreground" onClick={start}>Играть</button>
          </div>
        </div>
      )}
    </div>
  );
}
