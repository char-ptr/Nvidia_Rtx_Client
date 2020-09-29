import Client from "./mod.ts";
let rtxClient = new Client(
    { 
		Locale:"en-gb",
        Dev:false,
        GPU: "3080"
    }
);

await rtxClient.Check();
