import {env} from "./env";

export type AIRequest={system:string;messages:{role:"user"|"assistant";content:string}[];temperature?:number};

async function openaiRequest(body:Record<string,unknown>){
  const key=env("OPENAI_API_KEY",true);
  const model=env("OPENAI_MODEL")||"gpt-5.6-luna";
  const r=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"content-type":"application/json",authorization:`Bearer ${key}`},body:JSON.stringify({...body,model})});
  if(!r.ok)throw new Error(`OpenAI request failed: ${r.status} ${await r.text()}`);
  return r.json();
}

async function openrouterRequest(body:Record<string,unknown>){
  const key=env("OPENROUTER_API_KEY",true);
  const model=env("OPENROUTER_MODEL")||"openrouter/free";
  const r=await fetch("https://openrouter.ai/api/v1/chat/completions",{method:"POST",headers:{"content-type":"application/json",authorization:`Bearer ${key}`,"http-referer":"https://miobzou.vercel.app","x-title":"Miobzou"},body:JSON.stringify({...body,model})});
  if(!r.ok)throw new Error(`OpenRouter request failed: ${r.status} ${await r.text()}`);
  return r.json();
}

function openrouterText(d:any){return d?.choices?.[0]?.message?.content||"";}

export async function generateAI(req:AIRequest){
  const provider=env("AI_PROVIDER")||"openai";
  if(provider==="openrouter"){
    const d=await openrouterRequest({messages:[{role:"system",content:req.system},...req.messages],temperature:req.temperature??0.4});
    return openrouterText(d).trim();
  }
  if(provider==="anthropic")return anthropic(req);
  if(provider==="custom")return custom(req);
  const d=await openaiRequest({instructions:req.system,input:req.messages.map(m=>({role:m.role,content:[{type:"input_text",text:m.content}]})),temperature:req.temperature??0.4});
  return d.output_text||"";
}
async function anthropic(req:AIRequest){
  const key=env("ANTHROPIC_API_KEY",true),model=env("ANTHROPIC_MODEL")||"claude-sonnet-4-5";
  const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"content-type":"application/json","x-api-key":key,"anthropic-version":"2023-06-01"},body:JSON.stringify({model,max_tokens:1200,system:req.system,messages:req.messages})});
  if(!r.ok)throw new Error(`Anthropic request failed: ${r.status}`);
  const d=await r.json();return d.content?.map((x:{text?:string})=>x.text||"").join("")||"";
}
async function custom(req:AIRequest){
  const url=env("AI_WEBHOOK_URL",true);
  const r=await fetch(url,{method:"POST",headers:{"content-type":"application/json","x-miobzou-secret":env("AI_WEBHOOK_SECRET")},body:JSON.stringify(req)});
  if(!r.ok)throw new Error(`AI webhook failed: ${r.status}`);
  const d=await r.json();return d.text||d.output||"";
}
export type Prospect={company:string;website:string|null;contact:string|null;role:string|null;channel:"whatsapp"|"instagram"|"email"|null;recipient:string|null;need:string;digitalGap:string;evidence:string[];sources:string[];confidence:number};

export async function researchProspects(query:string){
  const d=await openaiRequest({
    instructions:`You are the prospect-research engine for Miobzou, a web-development sales system. Search the public web for real businesses matching the target. Return only legitimate businesses that plausibly need website, e-commerce, booking, lead-generation or digital modernization services.
Never infer private personal data. Use only public business information and public business contact channels. Prefer official websites, official social profiles and reputable business directories. Do not invent emails, phone numbers, URLs, needs or facts.
For each business identify a concrete observable digital gap and evidence. If no public contact channel is available, set channel and recipient to null. Output only JSON matching the schema.`,
    input:query,
    tools:[{type:"web_search",search_context_size:"high"}],
    text:{format:{type:"json_schema",name:"prospect_research",strict:true,schema:{type:"object",properties:{prospects:{type:"array",items:{type:"object",properties:{
      company:{type:"string"},website:{type:["string","null"]},contact:{type:["string","null"]},role:{type:["string","null"]},
      channel:{type:["string","null"],enum:["whatsapp","instagram","email",null]},recipient:{type:["string","null"]},
      need:{type:"string"},digitalGap:{type:"string"},evidence:{type:"array",items:{type:"string"}},sources:{type:"array",items:{type:"string"}},confidence:{type:"number"}
    },required:["company","website","contact","role","channel","recipient","need","digitalGap","evidence","sources","confidence"],additionalProperties:false}},},required:["prospects"],additionalProperties:false}}}
  });
  try{return JSON.parse(d.output_text||'{"prospects":[]}') as {prospects:Prospect[]};}catch{throw new Error("Research returned invalid structured data");}
}
export async function draftOutreach(prospect:Prospect){
  return (await generateAI({system:`You write the first outreach message for Miobzou, a professional web-development agency. Use only verified facts supplied below. Be concise, specific and human. Lead with a relevant observation, explain business value briefly, and ask one low-friction question. Never claim guaranteed results. Never invent clients, prices, scarcity, authority or personal familiarity. Never pressure. Respect opt-outs.`,messages:[{role:"user",content:JSON.stringify(prospect)}],temperature:0.5})).trim();
}
