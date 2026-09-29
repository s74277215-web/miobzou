const cookieName="miobzou_session";
async function digest(value:string){const data=new TextEncoder().encode(value);const hash=await crypto.subtle.digest("SHA-256",data);return Array.from(new Uint8Array(hash)).map(x=>x.toString(16).padStart(2,"0")).join("")}
export function authConfigured(){return Boolean(process.env.DASHBOARD_PASSWORD)}
export async function sessionValue(){return digest(process.env.DASHBOARD_PASSWORD||"")}
export async function isValidSession(value:string|null){if(!value||!authConfigured())return false;return value===(await sessionValue())}
export {cookieName};