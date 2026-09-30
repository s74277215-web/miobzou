import {researchProspects,draftOutreach,Prospect} from "../../../../lib/server/ai";
import {ensureSchema,dbQuery,saveEvent} from "../../../../lib/server/db";
import {scoreLead} from "../../../../lib/server/scoring";

function normalizeRecipient(value:string|null){return value?.trim().toLowerCase()||null}

export async function POST(req:Request){
  try{
    await ensureSchema();
    const body=await req.json().catch(()=>({}));
    const query=String(body.query||process.env.PROSPECTING_DEFAULT_QUERY||"Morocco local businesses that plausibly need a professional website or e-commerce improvement");
    const limit=Math.min(Math.max(Number(body.limit||process.env.PROSPECTING_MAX_LEADS||10),1),25);
    const autoOutreach=Boolean(body.autoOutreach??(process.env.PROSPECTING_AUTO_OUTREACH==="true"));
    const result=await researchProspects(query);
    const prospects=(result.prospects||[]).slice(0,limit);
    const created=[];const skipped=[];const queued=[];
    for(const p of prospects as Prospect[]){
      const recipient=normalizeRecipient(p.recipient);
      const existing=(await dbQuery<any>(
        "select id from miobzou_leads where (recipient is not null and lower(recipient)=lower($1)) or (website is not null and website=$2) limit 1",
        [recipient,p.website||null]
      ))[0];
      if(existing){skipped.push({company:p.company,reason:"already_exists",leadId:existing.id});continue;}
      const id="L-"+crypto.randomUUID().slice(0,8);
      const score=scoreLead({need:p.need,role:p.role||"",channel:p.channel||""});
      const metadata={digitalGap:p.digitalGap,evidence:p.evidence,sources:p.sources,confidence:p.confidence,discoveredBy:"ai_web_research",query};
      await dbQuery(
        "insert into miobzou_leads(id,company,contact,role,channel,recipient,website,need,budget,score,stage,metadata) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'new',$11)",
        [id,p.company,p.contact,p.role,p.channel,recipient,p.website,p.need,"À définir",score,JSON.stringify(metadata)]
      );
      created.push({id,company:p.company,channel:p.channel,recipient});
      if(autoOutreach&&p.channel&&recipient){
        const message=await draftOutreach(p);
        if(message){
          await dbQuery(
            "insert into miobzou_jobs(id,type,status,payload,run_at) values($1,'send_message','queued',$2,now())",
            [crypto.randomUUID(),JSON.stringify({leadId:id,message,channel:p.channel,recipient})]
          );
          queued.push({leadId:id,company:p.company,channel:p.channel});
        }
      }
      await saveEvent("prospect.discovered","ai",id,{query,confidence:p.confidence,autoOutreach,hasContact:Boolean(recipient)});
    }
    return Response.json({ok:true,query,found:prospects.length,created,skipped,queued});
  }catch(e){
    return Response.json({error:e instanceof Error?e.message:"Prospecting failed"},{status:500});
  }
}
