export function env(name:string, required=false){const value=process.env[name];if(required&&!value)throw new Error(`Missing environment variable: ${name}`);return value||""}
