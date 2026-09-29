import {Lead} from "../types";
export function scoreLead(input:Partial<Lead>){let score=35;if(input.need&&input.need.length>12)score+=15;if(input.budget&&/\\d/.test(input.budget))score+=15;if(input.role&&/founder|owner|director|manager|decideur|directeur|fondateur/i.test(input.role))score+=15;if(input.stage==="qualified")score+=10;if(input.channel)score+=5;return Math.max(0,Math.min(100,score))}
export function shouldHandoff(score:number,signals:string[]=[]){return score>=82||signals.some(s=>/prix|budget|devis|commencer|commande|payment|paiement|ready|interesse/i.test(s))}
