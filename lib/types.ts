export type Stage="new"|"contacted"|"qualified"|"handoff"|"won"|"lost";
export type Lead={id:string;company:string;contact:string;role:string;channel:string;need:string;budget:string;stage:Stage;score:number;lastMessage:string;createdAt:string};
export type Message={id:string;leadId:string;sender:"ai"|"lead"|"human";text:string;at:string};
