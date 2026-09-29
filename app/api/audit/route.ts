import {getAudit} from "../../../lib/server/audit";export async function GET(){return Response.json({events:getAudit()})}
