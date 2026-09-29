import {ensureSchema} from "../../../../lib/server/db";export async function GET(){return Response.json({ok:true,database:await ensureSchema()})}
