import Client from "./mod.ts";
let Locale = (Deno.args[0] ?? 'en-gb') as 'en-gb' | 'en-us'; // from argument 1
let Dev = Deno.args.includes('--dev');
let Loop = Deno.args.includes('--loop');

let rtxClient = new Client(
    { 
        Locale, 
        Dev,
        WebhookUrl : "Your webhook",
        GPU: "3080"
    }
);

await rtxClient.Check();
if (!Loop) Deno.exit(1);
else setInterval(rtxClient.Check.bind(rtxClient), 10e3);
