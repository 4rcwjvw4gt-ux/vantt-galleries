"use client";
import{useEffect,useState}from"react";
import{useParams}from"next/navigation";
import JSZip from"jszip";

export default function Gallery(){
 const params=useParams<{client:string;album:string}>(),[d,setD]=useState<any>(null),[pw,setPw]=useState(""),[error,setError]=useState(""),[zipping,setZipping]=useState(false);
 async function load(password=""){const r=await fetch("/api/gallery?client="+encodeURIComponent(params.client)+"&album="+encodeURIComponent(params.album)+"&password="+encodeURIComponent(password));const j=await r.json();if(r.ok)setD(j);else setError(j.error||"Galeria não encontrada")}
 useEffect(()=>{if(params.client&&params.album)load()},[params.client,params.album]);
 async function downloadAll(){
   if(!d?.photos?.length||zipping)return;
   setZipping(true);setError("");
   try{
     const zip=new JSZip();
     for(let i=0;i<d.photos.length;i++){
       const p=d.photos[i];
       const res=await fetch(p.url);
       if(!res.ok)throw new Error("Não foi possível descarregar "+p.filename);
       zip.file(p.filename,await res.blob());
     }
     const blob=await zip.generateAsync({type:"blob"});
     const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=(d.album.title||"galeria").replace(/[^a-z0-9-_]+/gi,"-").toLowerCase()+".zip";a.click();URL.revokeObjectURL(url);
   }catch(e){setError(e instanceof Error?e.message:"Não foi possível criar o ZIP.");}
   finally{setZipping(false)}
 }
 if(error&&!d)return <main className="password"><div><h2>Galeria não encontrada</h2><p className="notice">{error}</p></div></main>;
 if(!d)return <main className="password"><p className="notice">A carregar galeria...</p></main>;
 if(d.locked)return <main className="password"><form className="box" onSubmit={e=>{e.preventDefault();load(pw)}}><div className="eyebrow">PRIVATE GALLERY</div><h2>{d.album.title}</h2><p className="notice">Esta galeria está protegida.</p><div className="field"><label>PASSWORD</label><input type="password" value={pw} onChange={e=>setPw(e.target.value)}/></div><button className="btn" style={{width:"100%"}}>ABRIR GALERIA</button></form></main>;
 return <><header className="top"><a className="logo" href={"/c/"+encodeURIComponent(d.client?.name||"")}>VANTT <span className="purple">×</span> GALLERY</a><a className="backLink" href={"/c/"+encodeURIComponent(d.client?.name||"")}>TODOS OS ÁLBUNS</a></header>
 <main><section className="galleryHero"><div className="eyebrow">{d.client?.name} · EVENT PHOTOGRAPHY</div><h1>{d.album.title}</h1><p className="meta">{d.album.event_date||""} · PHOTOGRAPHY BY VANTT</p><div className="galleryActions"><button className="btn" onClick={downloadAll} disabled={zipping}>{zipping?"A CRIAR ZIP...":"↓ DOWNLOAD TODAS AS FOTOS"}</button><span className="meta">{d.photos?.length||0} FOTOS</span></div>{error&&<p className="error">{error}</p>}</section>
 <section className="photoGrid">{(d.photos||[]).map((p:any)=><div className="photo" key={p.id}><img src={p.url} alt={p.filename} loading="lazy"/><a className="download" href={p.url} download={p.filename}>↓ DOWNLOAD</a></div>)}</section></main></>
}