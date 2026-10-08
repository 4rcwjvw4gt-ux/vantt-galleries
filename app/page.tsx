"use client";

import { useEffect, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

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
  const [uploadAlbum, setUploadAlbum] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [copiedAlbum, setCopiedAlbum] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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

  async function copyGalleryLink(album: any) {
    const client = (data?.clients || []).find((c:any) => c.id === album.client_id);
    const url = `${window.location.origin}/g/${encodeURIComponent(client?.name || "")}/${encodeURIComponent(album.slug)}`;
    await navigator.clipboard.writeText(url);
    setCopiedAlbum(album.id);
    setTimeout(() => setCopiedAlbum(null), 2000);
  }

  async function uploadFiles(files: FileList | null) {
    if (!files || !uploadAlbum) return;
    setUploading(true); setError("");
    const total = files.length;
    let done = 0;
    try {
      for (const file of Array.from(files)) {
        setUploadStatus(`A enviar ${done + 1} de ${total}: ${file.name}`);
        const u = await fetch("/api/admin", {
          method:"POST",
          headers:{"content-type":"application/json"},
          body:JSON.stringify({action:"upload-url",album_id:uploadAlbum.id,filename:file.name})
        });
        const uj = await u.json();
        if (!u.ok) throw new Error(uj.error || "Não foi possível preparar o upload.");

        const { error: uploadError } = await supabaseBrowser.storage
          .from("photos")
          .uploadToSignedUrl(uj.path, uj.token, file);
        if (uploadError) throw uploadError;

        const p = await fetch("/api/admin", {
          method:"POST",
          headers:{"content-type":"application/json"},
          body:JSON.stringify({action:"photo",album_id:uploadAlbum.id,path:uj.path,filename:file.name})
        });
        const pj = await p.json();
        if (!p.ok) throw new Error(pj.error || "Não foi possível guardar a fotografia.");

        done++;
      }
      setUploadStatus(`${done} fotografias adicionadas.`);
      await refresh();
      setTimeout(() => setUploadStatus(""), 2500);
    } catch(e) {
      setError(e instanceof Error ? e.message : "Erro no upload.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
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
      {uploadStatus&&<div className="notice" style={{marginBottom:16}}>{uploadStatus}</div>}

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
        {(data?.albums||[]).map((a:any)=><div className="card" key={a.id}>
          <div className="cover"><b>{a.title}</b></div>
          <div className="body">
            <div className="meta">{a.event_date||"Sem data"} · {a.photoCount||0} FOTOS</div>
            <div className="actions">
              <button type="button" onClick={()=>{setUploadAlbum(a);setUploadStatus("");setError("");}}>ADICIONAR FOTOS</button>
              <button type="button" onClick={()=>copyGalleryLink(a)}>{copiedAlbum===a.id ? "LINK COPIADO ✓" : "COPIAR LINK"}</button>
              <a className="actionsLink" href={`/g/${encodeURIComponent((data?.clients||[]).find((c:any)=>c.id===a.client_id)?.name||"")}/${encodeURIComponent(a.slug)}`} target="_blank" rel="noreferrer">ABRIR</a>
            </div>
          </div>
        </div>)}
      </div>
      {!data?.albums?.length&&<p className="notice">Ainda não existem álbuns. Cria o primeiro acima.</p>}
    </main>

    {uploadAlbum && <div className="modal" onClick={()=>!uploading&&setUploadAlbum(null)}>
      <div className="box" onClick={e=>e.stopPropagation()}>
        <div className="eyebrow">UPLOAD · {uploadAlbum.title}</div>
        <h2 style={{margin:"10px 0"}}>Adicionar fotografias</h2>
        <p className="notice">Seleciona várias fotografias de uma vez. Podes enviar centenas, conforme o armazenamento disponível.</p>
        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={e=>uploadFiles(e.target.files)} />
        <button className="btn" disabled={uploading} style={{width:"100%",marginTop:12}} onClick={()=>fileRef.current?.click()}>
          {uploading ? "A ENVIAR..." : "ESCOLHER FOTOGRAFIAS"}
        </button>
        {uploadStatus&&<p className="notice" style={{marginTop:12}}>{uploadStatus}</p>}
        {!uploading&&<button className="btn secondary" style={{width:"100%",marginTop:10}} onClick={()=>setUploadAlbum(null)}>FECHAR</button>}
      </div>
    </div>}
  </div>;
}
