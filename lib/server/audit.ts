export type AuditEvent={id:string;type:string;leadId?:string;at:string;actor:"system"|"ai"|"human";metadata?:Record<string,unknown>};
const events:AuditEvent[]=[];export function audit(event:Omit<AuditEvent,"id"|"at">){const item={...event,id:crypto.randomUUID(),at:new Date().toISOString()};events.unshift(item);return item}export function getAudit(){return events}
