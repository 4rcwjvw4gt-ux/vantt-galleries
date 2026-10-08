"use client";

import {useEffect,useState} from "react";
import {useParams} from "next/navigation";

export default function ClientGallery(){
  const params=useParams<{client:string}>();
  const [d,setD]=useState<any>(null);
  const [error,setError]=useState("");

  useEffect(()=>{
    if(!params.client)return;
    fetch("/api/client?client="+encodeURIComponent(params.client))
      .then(async r=>{const j=await r.json();if(!r.ok)throw new Error(j.error||"Cliente não encontrado");setD(j)})
      .catch(e=>setError(e.message));
  },[params.client]);

  if(error)return <main className="password"><div><h2>Galeria não encontrada</h2><p className="notice">{error}</p></div></main>;
  if(!d)return <main className="password"><p className="notice">A carregar galerias...</p></main>;

  return <>
    <header className="top">
      <div className="logo">VANTT <span className="purple">×</span> GALLERY</div>
      <div className="meta">{d.client.name}</div>
    </header>
    <main>
      <section className="galleryHero">
        <div className="eyebrow">VANTT · EVENT PHOTOGRAPHY</div>
        <h1>{d.client.name}</h1>
        <p className="meta">ESCOLHE UM EVENTO PARA VER AS FOTOGRAFIAS</p>
      </section>
      <section className="albumGrid">
        {(d.albums||[]).map((a:any)=>(
          <a className="albumCard" key={a.id} href={"/g/"+encodeURIComponent(d.client.name)+"/"+encodeURIComponent(a.slug)}>
            <div className="albumCover">
              {a.coverUrl?<img src={a.coverUrl} alt="" loading="lazy"/>:<div className="albumPlaceholder"/>}
            </div>
            <div className="albumInfo">
              <div className="eyebrow">{a.event_date||"EVENTO"}</div>
              <h2>{a.title}</h2>
              <p className="meta">{a.photoCount} FOTOS</p>
            </div>
          </a>
        ))}
      </section>
      {!d.albums?.length&&<p className="notice" style={{textAlign:"center"}}>Ainda não existem galerias públicas.</p>}
    </main>
  </>;
}