import {NextRequest,NextResponse} from "next/server";
import {admin} from "@/lib/supabase-admin";
export const runtime="nodejs";

export async function GET(req:NextRequest){
  const client=req.nextUrl.searchParams.get("client");
  if(!client)return NextResponse.json({error:"Cliente inválido"},{status:400});
  try{
    const s=admin();
    const {data:c,error:ce}=await s.from("clients").select("*").eq("name",client).maybeSingle();
    if(ce||!c)return NextResponse.json({error:"Cliente não encontrado"},{status:404});
    const {data:albums,error:ae}=await s.from("albums").select("id,title,slug,event_date,description,client_id,is_public,created_at").eq("client_id",c.id).eq("is_public",true).order("event_date",{ascending:false});
    if(ae)throw ae;
    const ids=(albums||[]).map(a=>a.id);
    const {data:photos}=ids.length?await s.from("photos").select("album_id,url,created_at").in("album_id",ids).order("created_at",{ascending:true}):{data:[]};
    const result=(albums||[]).map(a=>({...a,coverUrl:(photos||[]).find(p=>p.album_id===a.id)?.url||null,photoCount:(photos||[]).filter(p=>p.album_id===a.id).length}));
    return NextResponse.json({client:c,albums:result});
  }catch(e){
    const msg=e instanceof Error?e.message:String(e);
    return NextResponse.json({error:msg},{status:500});
  }
}