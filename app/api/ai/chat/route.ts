import {generateAI} from "../../../../lib/server/ai";
import {SALES_SYSTEM} from "../../../../lib/server/prompts";
import {audit} from "../../../../lib/server/audit";
import {dbQuery} from "../../../../lib/server/db";

export async function POST(req:Request){
  try{
    const body=await req.json();
    if(!body.leadId||!Array.isArray(body.messages))return Response.json({error:"leadId and messages required"},{status:400});
    const text=await generateAI({system:SALES_SYSTEM,messages:body.messages});
    await dbQuery("insert into miobzou_messages(id,lead_id,sender,text,channel) values($1,$2,'ai',$3,$4)",[crypto.randomUUID(),body.leadId,text,body.channel||"dashboard"]);
    await audit({type:"ai.response",leadId:body.leadId,actor:"ai",metadata:{length:text.length,source:"dashboard"}});
    return Response.json({text});
  }catch(e){
    return Response.json({error:e instanceof Error?e.message:"AI error"},{status:500});
  }
}
