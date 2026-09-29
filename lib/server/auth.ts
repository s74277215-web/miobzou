import {createHash,timingSafeEqual} from "node:crypto";
const cookieName="miobzou_session";
function digest(value:string){return createHash("sha256").update(value).digest("hex")}
export function authConfigured(){return Boolean(process.env.DASHBOARD_PASSWORD)}
export function sessionValue(){return digest(process.env.DASHBOARD_PASSWORD||"")}
export function isValidSession(value:string|null){if(!value||!authConfigured())return false;const a=Buffer.from(value);const b=Buffer.from(sessionValue());return a.length===b.length&&timingSafeEqual(a,b)}
export {cookieName};