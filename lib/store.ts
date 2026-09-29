import {Lead,Message} from "./types";
export const seedLeads:Lead[]=[
{id:"L-1042",company:"Atlas Habitat",contact:"Nadia",role:"Directrice",channel:"Instagram",need:"Site immobilier premium + catalogue",budget:"10k–15k DH",stage:"handoff",score:94,lastMessage:"Pouvez-vous me montrer un exemple ?",createdAt:"2026-09-29"},
{id:"L-1041",company:"Casa Market",contact:"Youssef",role:"Fondateur",channel:"WhatsApp",need:"E-commerce + paiement",budget:"8k–12k DH",stage:"qualified",score:88,lastMessage:"Je veux surtout vendre en ligne.",createdAt:"2026-09-29"},
{id:"L-1039",company:"Noura Studio",contact:"Noura",role:"Fondatrice",channel:"Email",need:"Refonte du site vitrine",budget:"5k–8k DH",stage:"contacted",score:71,lastMessage:"Envoyez-moi les détails.",createdAt:"2026-09-28"},
{id:"L-1036",company:"Riad Atlas",contact:"Omar",role:"Manager",channel:"Instagram",need:"Réservations directes",budget:"À définir",stage:"new",score:64,lastMessage:"",createdAt:"2026-09-27"}
];
export const seedMessages:Message[]=[
{id:"m1",leadId:"L-1042",sender:"ai",text:"Bonjour Nadia. J’ai regardé votre présence en ligne. Je peux vous montrer une approche simple pour transformer vos visiteurs en demandes de visite. Vous cherchez plutôt un site vitrine ou un catalogue de biens ?",at:"17:42"},
{id:"m2",leadId:"L-1042",sender:"lead",text:"Un catalogue de biens, avec une présentation vraiment premium.",at:"17:44"},
{id:"m3",leadId:"L-1042",sender:"ai",text:"Parfait. Je note donc catalogue + image premium. Quel est votre délai idéal ?",at:"17:45"}
];
