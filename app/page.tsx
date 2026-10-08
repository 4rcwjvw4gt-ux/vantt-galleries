"use client";

import { useEffect, useState } from "react";

type Data = { clients: any[]; albums: any[] };

export default function Home() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [data, setData] = useState<Data | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [clientName, setClientName] = useState("");
  const [albumTitle, setAlbumTitle] = useState("");
  const [albumDate, setAlbumDate] = useState("");
  const [albumDescription, setAlbumDescription] = useState("");
  const [clientId, setClientId] = useState("");
  const [saving, setSaving] = useState(false);

  async function refresh() {
    try {
      const r = await fetch("/api/admin", { cache: "no-store" });
      if (!r.ok) { setAuthed(false); setChecking(false); return; }
      setData(await r.json());
      setAuthed(true);
    } catch { setError("Não foi possível ligar ao servidor."); }
    finally { setChecking(false); }
  }

  useEffect(() => { refresh(); }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault(); setError("");
    const r = await fetch("/api/admin", { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify({action:"login",password}) });
    const j = await r.json();
    if (!r.ok) { setError(j.error || "Password incorreta"); return; }
    setPassword(""); setChecking(true); await refresh();
  }

  async function logout() {
    await fetch("/api/admin",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action:"logout"})});
    setAuthed(false); setData(null);
  }

  async function createClient(e: React.FormEvent) {
    e.preventDefault(); setError(""); setSaving(true);
    try {
      const r=await fetch("/api/admin",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action:"client",name:clientName})});
      const j=await r.json(); if(!r.ok) throw new Error(j.error||"Erro ao criar cliente");
      setClientName(""); await refresh(); setClientId(j.id);
    } catch(e){setError(e instanceof Error?e.message:"Erro ao criar cliente");}
    finally{setSaving(false);}
  }

  async function createAlbum(e: React.FormEvent) {
    e.preventDefault(); setError("");
    if(!clientId){setError("Escolhe primeiro um cliente.");return;}
    setSaving(true);
    try {
      const r=await fetch("/api/admin",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action:"album",client_id:clientId,title:albumTitle,event_date:albumDate,description:albumDescription})});
      const j=await r.json(); if(!r.ok) throw new Error(j.error||"Erro ao criar álbum");
      setAlbumTitle(""); setAlbumDate(""); setAlbumDescription(""); await refresh();
    } catch(e){setError(e instanceof Error?e.message:"Erro ao criar álbum");}
    finally{setSaving(false);}
  }

  if (checking) return <main className="login"><div className="box"><div className="eyebrow">VANTT GALLERIES</div><h1>A ligar...</h1></div></main>;

  if (!authed) return <>
    <header className="top"><div className="logo">VANTT <span className="purple">GALLERIES</span></div></header>
    <main className="login"><form className="box" onSubmit={login}>
      <div className="eyebrow">PRIVATE ACCESS</div><h1>VANTT Galleries</h1>
      <div className="field"><label>PASSWORD</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoFocus /></div>
      {error&&<div className="error">{error}</div>}<button className="btn" style={{width:"100%",marginTop:15}}>ENTRAR</button>
    </form></main>
  </>;

  return <div className="shell">
    <header className="top"><div className="logo">VANTT <span className="purple">GALLERIES</span></div><button className="btn secondary" onClick={logout}>SAIR</button></header>
    <main className="main">
      <div className="head"><div><div className="eyebrow">PRIVATE ADMIN</div><div className="title">Galerias</div></div></div>
      {error&&<div className="error">{error}</div>}
      <div className="grid" style={{marginBottom:32}}>
        <form className="card" onSubmit={createClient} style={{padding:24}}>
          <div className="eyebrow">01 · CLIENTE</div><h2 style={{margin:"10px 0 18px"}}>Novo cliente</h2>
          <div className="field"><label>NOME</label><input value={clientName} onChange={e=>setClientName(e.target.value)} placeholder="Ex.: DELUX" /></div>
          <button className="btn" disabled={saving} style={{marginTop:15}}>{saving?"A GUARDAR...":"CRIAR CLIENTE"}</button>
        </form>
        <form className="card" onSubmit={createAlbum} style={{padding:24}}>
          <div className="eyebrow">02 · ÁLBUM</div><h2 style={{margin:"10px 0 18px"}}>Novo álbum</h2>
          <div className="field"><label>CLIENTE</label><select value={clientId} onChange={e=>setClientId(e.target.value)}><option value="">Selecionar cliente</option>{(data?.clients||[]).map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div className="field"><label>NOME DO EVENTO</label><input value={albumTitle} onChange={e=>setAlbumTitle(e.target.value)} placeholder="Ex.: DeLux · Halloween" /></div>
          <div className="field"><label>DATA</label><input type="date" value={albumDate} onChange={e=>setAlbumDate(e.target.value)} /></div>
          <div className="field"><label>DESCRIÇÃO</label><input value={albumDescription} onChange={e=>setAlbumDescription(e.target.value)} placeholder="Opcional" /></div>
          <button className="btn" disabled={saving} style={{marginTop:15}}>{saving?"A GUARDAR...":"CRIAR ÁLBUM"}</button>
        </form>
      </div>
      <div className="eyebrow">ÁLBUNS EXISTENTES</div>
      <div className="grid">
        {(data?.albums||[]).map((a:any)=><div className="card" key={a.id}><div className="cover"><b>{a.title}</b></div><div className="body"><div className="meta">{a.event_date||"Sem data"} · {a.photoCount||0} FOTOS</div></div></div>)}
      </div>
      {!data?.albums?.length&&<p className="notice">Ainda não existem álbuns. Cria o primeiro acima.</p>}
    </main>
  </div>;
}