"use client";
import {useMemo,useState} from "react";
import {Lead,Message,Stage} from "../lib/types";
import {seedLeads,seedMessages} from "../lib/store";
import {LayoutDashboard,Users,MessageSquare,Settings,Search,Plus,ArrowUpRight,Bot,ShieldCheck,Send,UserRoundCheck,Activity} from "lucide-react";

const stages:Stage[]=["new","contacted","qualified","handoff","won","lost"];
const stageLabel:Record<Stage,string>={new:"Nouveau",contacted:"Contacté",qualified:"Qualifié",handoff:"Handoff",won:"Gagné",lost:"Perdu"};

export default function Home(){
 const [section,setSection]=useState("overview");
 const [leads,setLeads]=useState<Lead[]>(seedLeads);
 const [selected,setSelected]=useState<Lead>(seedLeads[0]);
 const [messages,setMessages]=useState<Message[]>(seedMessages);
 const [query,setQuery]=useState("");
 const [toast,setToast]=useState("");
 const notify=(s:string)=>{setToast(s);setTimeout(()=>setToast(""),2400)};
 const filtered=useMemo(()=>leads.filter(l=>(l.company+" "+l.contact+" "+l.need).toLowerCase().includes(query.toLowerCase())),[leads,query]);
 const stats={all:leads.length,qualified:leads.filter(x=>x.stage==="qualified"||x.stage==="handoff").length,handoff:leads.filter(x=>x.stage==="handoff").length,score:Math.round(leads.reduce((a,x)=>a+x.score,0)/leads.length)};
 const addLead=()=>{const l:Lead={id:"L-"+(1043+leads.length),company:"Nouveau prospect",contact:"Contact",role:"Décideur",channel:"Manual",need:"À découvrir",budget:"À définir",stage:"new",score:50,lastMessage:"",createdAt:"2026-09-29"};setLeads([l,...leads]);setSelected(l);setSection("leads");notify("Prospect créé")};
 const updateStage=(stage:Stage)=>{setLeads(leads.map(l=>l.id===selected.id?{...l,stage}:l));setSelected({...selected,stage});notify("Statut mis à jour")};
 const send=(text:string)=>{if(!text.trim())return;setMessages([...messages,{id:Date.now().toString(),leadId:selected.id,sender:"human",text,at:"18:00"}]);notify("Message ajouté à la conversation")};

 return <div className="app">
  <aside className="sidebar"><div className="brand">miobzou<span>·</span></div><div className="nav">
   <button className={section==="overview"?"active":""} onClick={()=>setSection("overview")}><LayoutDashboard size={16}/> Overview</button>
   <button className={section==="leads"?"active":""} onClick={()=>setSection("leads")}><Users size={16}/> Prospects</button>
   <button className={section==="inbox"?"active":""} onClick={()=>setSection("inbox")}><MessageSquare size={16}/> Conversations</button>
   <button className={section==="settings"?"active":""} onClick={()=>setSection("settings")}><Settings size={16}/> Settings</button>
  </div><div style={{position:"absolute",bottom:22,left:16,right:16}} className="card"><div style={{display:"flex",gap:8,alignItems:"center"}}><ShieldCheck size={16}/><span style={{fontSize:12}}>Human control enabled</span></div><div className="muted" style={{fontSize:11,marginTop:6}}>AI stops before payment.</div></div></aside>
  <main className="main">
   <div className="top"><div><div className="eyebrow">Revenue operating system</div><div className="title">{section==="overview"?"Command Center":section==="leads"?"Prospects":section==="inbox"?"AI Inbox":"System Settings"}</div><div className="muted">Prospecting → qualification → human handoff</div></div><div className="actions"><input className="search" placeholder="Search prospects..." value={query} onChange={e=>setQuery(e.target.value)}/><button className="btn primary" onClick={addLead}><Plus size={15}/> New lead</button></div></div>

   {section==="overview"&&<><div className="grid">
    <Metric label="Total prospects" value={stats.all} icon={<Users size={17}/>}/>
    <Metric label="Qualified" value={stats.qualified} icon={<UserRoundCheck size={17}/>}/>
    <Metric label="Human handoff" value={stats.handoff} icon={<ArrowUpRight size={17}/>}/>
    <Metric label="Avg. intent score" value={stats.score+"/100"} icon={<Activity size={17}/>}/>
   </div><div className="layout"><div className="card"><div className="sectionTitle">Pipeline</div><table className="table"><thead><tr><th>Prospect</th><th>Need</th><th>Intent</th><th>Stage</th></tr></thead><tbody>{filtered.map(l=><tr key={l.id} onClick={()=>{setSelected(l);setSection("inbox")}} style={{cursor:"pointer"}}><td><b>{l.company}</b><div className="muted">{l.contact} · {l.channel}</div></td><td>{l.need}</td><td><span className={"pill "+(l.score>85?"hot":"blue")}>{l.score}</span></td><td><span className={"pill "+(l.stage==="handoff"?"green":"")}>{stageLabel[l.stage]}</span></td></tr>)}</tbody></table></div><div className="card"><div className="sectionTitle">AI activity</div><div style={{display:"grid",gap:16}}><ActivityItem title="Lead qualified" text="Atlas Habitat crossed the handoff threshold." time="2m"/><ActivityItem title="Intent detected" text="Casa Market mentioned online payments." time="19m"/><ActivityItem title="Follow-up ready" text="Noura Studio asked for details." time="1h"/></div></div></div></>}

   {section==="leads"&&<div className="card"><div className="sectionTitle">Lead database <span className="muted">({filtered.length})</span></div><table className="table"><thead><tr><th>ID</th><th>Company</th><th>Channel</th><th>Need</th><th>Budget</th><th>Score</th><th>Stage</th></tr></thead><tbody>{filtered.map(l=><tr key={l.id}><td>{l.id}</td><td><b>{l.company}</b><div className="muted">{l.contact} · {l.role}</div></td><td>{l.channel}</td><td>{l.need}</td><td>{l.budget}</td><td><span className="pill blue">{l.score}</span></td><td><select value={l.stage} onChange={e=>{const s=e.target.value as Stage;setLeads(leads.map(x=>x.id===l.id?{...x,stage:s}:x));notify("Stage updated")}} style={{background:"#10151d",color:"white",border:"1px solid #27303d",padding:"6px",borderRadius:7}}>{stages.map(s=><option key={s} value={s}>{stageLabel[s]}</option>)}</select></td></tr>)}</tbody></table></div>}

   {section==="inbox"&&<div className="layout"><div className="card chat"><div className="sectionTitle"><Bot size={16}/> AI conversation · {selected.company}</div><div className="messages">{messages.filter(m=>m.leadId===selected.id).map(m=><div key={m.id} className={"msg "+(m.sender==="lead"?"lead":"ai")}><b>{m.sender==="lead"?selected.contact:m.sender==="human"?"You":"AI"}</b><br/>{m.text}<div className="muted" style={{fontSize:10,marginTop:4}}>{m.at}</div></div>)}</div><div className="composer"><input id="composer" placeholder="Write a human message..." onKeyDown={e=>{if(e.key==="Enter"){send(e.currentTarget.value);e.currentTarget.value=""}}}/><button className="btn primary" onClick={()=>{const el=document.getElementById("composer") as HTMLInputElement;send(el.value);el.value=""}}><Send size={15}/></button></div></div><div className="card"><div className="sectionTitle">Lead intelligence</div><div className="field"><label>Need</label><input value={selected.need} readOnly/></div><div className="two"><div className="field"><label>Intent score</label><input value={selected.score+"/100"} readOnly/></div><div className="field"><label>Budget</label><input value={selected.budget} readOnly/></div></div><div className="field"><label>Pipeline stage</label><select value={selected.stage} onChange={e=>updateStage(e.target.value as Stage)}>{stages.map(s=><option key={s} value={s}>{stageLabel[s]}</option>)}</select></div><button className="btn primary" style={{width:"100%"}} onClick={()=>updateStage("handoff")}><UserRoundCheck size={15}/> Request human handoff</button><div className="muted" style={{fontSize:11,marginTop:10}}>Handoff is the hard boundary before pricing/payment.</div></div></div>}

   {section==="settings"&&<div className="layout"><div className="card"><div className="sectionTitle">AI provider</div><div className="field"><label>Provider</label><select defaultValue="openai"><option value="openai">OpenAI</option><option value="anthropic">Anthropic</option><option value="custom">Custom webhook</option></select></div><div className="field"><label>API key</label><input type="password" placeholder="Stored server-side in production"/></div><div className="field"><label>Model</label><input defaultValue="gpt-5.6"/></div><button className="btn primary" onClick={()=>notify("Configuration saved locally")}>Save configuration</button></div><div className="card"><div className="sectionTitle">Autonomy policy</div><p className="muted">The agent can research, personalize outreach, qualify needs, handle ordinary objections and schedule a handoff.</p><p className="success">✓ No fabricated claims</p><p className="success">✓ No hidden impersonation</p><p className="success">✓ Stop before payment / contract</p><p className="success">✓ Full activity trail</p></div></div>}
  </main>{toast&&<div className="toast">{toast}</div>}
 </div>
}
function Metric({label,value,icon}:{label:string,value:string|number,icon:React.ReactNode}){return <div className="card"><div className="muted" style={{display:"flex",gap:7,alignItems:"center"}}>{icon}{label}</div><div className="metric">{value}</div><div className="success" style={{fontSize:11}}>Live workspace</div></div>}
function ActivityItem({title,text,time}:{title:string,text:string,time:string}){return <div style={{display:"flex",gap:10}}><div style={{width:8,height:8,borderRadius:99,background:"#7c9cff",marginTop:6}}/><div><b style={{fontSize:13}}>{title}</b><div className="muted" style={{fontSize:12,marginTop:3}}>{text}</div><div className="muted" style={{fontSize:10,marginTop:3}}>{time} ago</div></div></div>}
