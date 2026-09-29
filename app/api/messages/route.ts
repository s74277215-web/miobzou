import {ensureSchema,dbQuery} from "../../../lib/server/db";
import {ingestMessage} from "../../../lib/server/orchestrator";

export async function GET(req:Request){
  try{
    await ensureSchema();
    const id=new URL(req.url).searchParams.get("leadId");
    if(!id)return Response.json({error:"leadId is required"},{status:400});
    const messages=await dbQuery<any>("select id,lead_id as \"leadId\",sender,text,channel,external_id as \"externalId\",created_at as at from miobzou_messages where lead_id=$1 order by created_at asc",[id]);
    return Response.json({messages});
  }catch(e){
    return Response.json({error:e instanceof Error?e.message:"Unable to load messages"},{status:500});
  }
}

export async function POST(req:Request){
  try{
    await ensureSchema();
    const body=await req.json();
    if(!body.leadId||!body.text||!body.sender)return Response.json({error:"leadId, text and sender are required"},{status:400});
    if(!["lead","human","ai"].includes(body.sender))return Response.json({error:"Invalid sender"},{status:400});
    const result=await ingestMessage({
      leadId:body.leadId,
      text:String(body.text),
      sender:body.sender,
      channel:body.channel,
      externalId:body.externalId
    });
    return Response.json({ok:true,...result});
  }catch(e){
    return Response.json({error:e instanceof Error?e.message:"Unable to save message"},{status:500});
  }
}
