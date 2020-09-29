import { Client } from './classes.ts';
import { localeMap } from './globalData.ts';

let Locale = (Deno.args[0] ?? 'en-gb') as 'en-gb' | 'en-us'; // from argument 1
let Dev = Deno.args.includes('--dev');
let Loop = Deno.args.includes('--loop');

if (!Object.keys(localeMap).includes(Locale)) {
	console.log('Provided invalid locale, exiting...');
	Deno.exit(0);
}

let rtxClient = new Client(
    { 
        Locale, 
        Dev,
        WebhookUrl : "https://canary.discordapp.com/api/webhooks/760208968772616266/jUwz7LpPD3Q2tfQ22Yl30K14x4OJweBcKWMJEDK2Zk7maxMf9DV5BhGvtg3bpSeFmFAu"
    }
);
await rtxClient.Check();
if (!Loop) Deno.exit(1);
else setInterval(rtxClient.Check.bind(rtxClient), 10e3);
