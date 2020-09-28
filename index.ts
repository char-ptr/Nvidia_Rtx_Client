import { Client } from "./classes.ts";
import { localeMap } from "./globalData.ts";

let Locale = (Deno.args[0] ?? "en-gb") as  "en-gb" | "en-us" // from argument 1
let Dev = Deno.args[1] == "true" // from argument 2

if (!Object.keys(localeMap).includes(Locale))
{
    console.log("Provided invalid locale, exiting...")
    Deno.exit(0);
}

let rtxClient = new Client({Locale, Dev})

await rtxClient.Check()