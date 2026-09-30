import {generateAI} from "./ai";
import {EXTRACTION_SYSTEM,SALES_SYSTEM} from "./prompts";
import {scoreLead,shouldHandoff} from "./scoring";
import {isOptOut,needsHuman,withinQuietHours,POLICY} from "./policy";
import {dbQuery,saveEvent} from "./db";
import {sendMessage} from "./providers";
export async function ingestMessage(input:{leadId:string;text:string;sender:"lead"|"human"|"ai";channel?:string;externalId?:string}){
  await dbQuery("insert into miobzou_messages(id,lead_id,sender,text,channel,external_id) values($1,$2,$3,$4,$5,$6) on conflict do nothing",[crypto.randomUUID(),input.leadId,input.sender,input.text,input.channel||null,input.externalId||null]);
  if(input.sender!=="lead")return{handoff:false};
  if(isOptOut(input.text)){await dbQuery("update miobzou_leads set opted_out=true,stage='lost',updated_at=now() where id=$1",[input.leadId]);await dbQuery("insert into miobzou_suppressions(identifier,reason) select coalesce(recipient,id),'user_opt_out' from miobzou_leads where id=$1 on conflict do nothing",[input.leadId]);await saveEvent("prospect.opted_out","system",input.leadId,{});return{handoff:false,optedOut:true}}
  const lead=(await dbQuery<any>("select * from miobzou_leads where id=$1",[input.leadId]))[0];if(!lead)return{handoff:false};
  const history=await dbQuery<any>("select sender,text from miobzou_messages where lead_id=$1 order by created_at asc",[input.leadId]);
  const extracted=await generateAI({system:EXTRACTION_SYSTEM,messages:[{role:"user",content:JSON.stringify(history)}],temperature:0});let data:any={};try{data=JSON.parse(extracted)}catch{}
  const score=scoreLead({...lead,need:data.need||lead.need,budget:data.budget||lead.budget,stage:data.handoff?"handoff":lead.stage});
  const handoff=Boolean(data.handoff)||needsHuman(input.text)||shouldHandoff(score,[input.text]);
  await dbQuery("update miobzou_leads set need=coalesce($2,need),budget=coalesce($3,budget),timeline=coalesce($4,timeline),score=$5,stage=$6,updated_at=now() where id=$1",[input.leadId,data.need||null,data.budget||null,data.timeline||null,score,handoff?"handoff":"qualified"]);
  await saveEvent(handoff?"lead.handoff_required":"lead.qualified","ai",input.leadId,{score,summary:data.summary});
  if(handoff)return{handoff:true,score,summary:data.summary};
  const reply=await generateAI({system:SALES_SYSTEM,messages:history.map((m:any)=>({role:m.sender==="lead"?"user":"assistant",content:m.text}))});
  return{handoff:false,score,reply};
}
export async function executeOutbound(leadId:string,message:string,channel:string,recipient:string){
  if((await dbQuery("select 1 from miobzou_suppressions where identifier=$1",[recipient])).length)throw new Error("Recipient is suppressed");
  const lead=(await dbQuery<any>("select opted_out,stage from miobzou_leads where id=$1",[leadId]))[0];if(lead?.opted_out)throw new Error("Lead is opted out");if(lead?.stage==="handoff")throw new Error("Human handoff required before further automated sales action");if(withinQuietHours())throw new Error("Quiet hours: outbound blocked");
  const recent=await dbQuery<any>("select count(*)::int as count from miobzou_messages where channel=$1 and created_at>now()-interval '1 hour' and lead_id=$2 and sender='ai'",[channel,leadId]);if(Number(recent[0]?.count||0)>=POLICY.maxMessagesPerRecipientPerHour)throw new Error("Hourly recipient rate limit reached");
  const last=await dbQuery<any>("select created_at from miobzou_messages where lead_id=$1 and sender='ai' order by created_at desc limit 1",[leadId]);if(last[0]&&Date.now()-new Date(last[0].created_at).getTime()<POLICY.minOutreachDelayMs)throw new Error("Minimum outreach delay not reached");
  const r=await sendMessage({channel:channel as any,recipient,message});await dbQuery("insert into miobzou_messages(id,lead_id,sender,text,channel) values($1,$2,'ai',$3,$4)",[crypto.randomUUID(),leadId,message,channel]);await saveEvent("outreach.sent","ai",leadId,{channel,recipient});return r;
}
