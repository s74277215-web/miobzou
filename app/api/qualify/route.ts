import {scoreLead} from "../../../lib/server/scoring";import {audit} from "../../../lib/server/audit";
export async function POST(req:Request){const body=await req.json();const score=scoreLead(body);const event=audit({type:"lead.qualified",leadId:body.id,actor:"system",metadata:{score}});return Response.json({score,event})}
