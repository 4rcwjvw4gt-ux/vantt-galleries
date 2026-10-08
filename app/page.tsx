"use client";

import { useEffect, useState } from "react";

type Data = { clients: any[]; albums: any[] };

export default function Home() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [data, setData] = useState<Data | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function refresh() {
    try {
      const r = await fetch("/api/admin", { cache: "no-store" });
      if (!r.ok) {
        setAuthed(false);
        setChecking(false);
        return;
      }
      setData(await r.json());
      setAuthed(true);
    } catch {
      setError("Não foi possível ligar ao servidor.");
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const r = await fetch("/api/admin", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "login", password })
    });
    const j = await r.json();
    if (!r.ok) {
      setError(j.error || "Password incorreta");
      return;
    }
    setPassword("");
    setChecking(true);
    await refresh();
  }

  async function logout() {
    await fetch("/api/admin", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "logout" })
    });
    setAuthed(false);
    setData(null);
  }

  if (checking) {
    return <main className="login"><div className="box"><div className="eyebrow">VANTT GALLERIES</div><h1>A ligar...</h1></div></main>;
  }

  if (!authed) {
    return (
      <>
        <header className="top"><div className="logo">VANTT <span className="purple">GALLERIES</span></div></header>
        <main className="login">
          <form className="box" onSubmit={login}>
            <div className="eyebrow">PRIVATE ACCESS</div>
            <h1>VANTT Galleries</h1>
            <div className="field">
              <label>PASSWORD</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} autoFocus />
            </div>
            {error && <div className="error">{error}</div>}
            <button className="btn" style={{ width: "100%", marginTop: 15 }}>ENTRAR</button>
          </form>
        </main>
      </>
    );
  }

  return (
    <div className="shell">
      <header className="top">
        <div className="logo">VANTT <span className="purple">GALLERIES</span></div>
        <button className="btn secondary" onClick={logout}>SAIR</button>
      </header>
      <main className="main">
        <div className="head">
          <div><div className="eyebrow">PRIVATE ADMIN</div><div className="title">Galerias</div></div>
        </div>
        <div className="grid">
          {(data?.albums || []).map((a: any) => (
            <div className="card" key={a.id}>
              <div className="cover"><b>{a.title}</b></div>
              <div className="body"><div className="meta">{a.event_date || "Sem data"} · {a.photoCount || 0} FOTOS</div></div>
            </div>
          ))}
        </div>
        {!data?.albums?.length && <p className="notice">O painel abriu. Ainda não existem álbuns.</p>}
      </main>
    </div>
  );
}