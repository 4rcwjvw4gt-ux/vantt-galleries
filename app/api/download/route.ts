import {NextRequest,NextResponse} from "next/server";
import {admin} from "@/lib/supabase-admin";
export const runtime="nodejs";

export async function POST(req:NextRequest){
  try{
    const body=await req.json();
    if(!body.album_id||!body.photo_id)return NextResponse.json({error:"Dados inválidos"},{status:400});
    const s=admin();
    const {error}=await s.from("download_events").insert({album_id:body.album_id,photo_id:body.photo_id});
    if(error)throw error;
    return NextResponse.json({ok:true});
  }catch(e){
    return NextResponse.json({error:e instanceof Error?e.message:"Erro ao registar download"},{status:500});
  }
}