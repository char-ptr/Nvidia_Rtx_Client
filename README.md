# Nvidia_Rtx_Client
~~my [other project](https://github.com/pozm/rtx3080) but supposed to be ran on a server with improvements.~~
this is a better version of that project.
Some of the improvements include
- united states support.
- on in stock & out of stock functions to be ran on said events.
- webhook for discord notifications 
- support for multiple cards.

## Some things you might want to know
~~This will only give data about the RTX 3080 FE.~~
	- ~~i cba adding support for the other cards at the moment and this is the only card i currently care about.~~
* there is now support for rtx 3090 aswell as 3080.
	- i'll consider a update for rtx 3070.
* before using you must supply unstable.
	- this project uses [deno](https://deno.land/), NOT node.
	
# example usage
```ts
import Client from "./mod.ts";
let rtxClient = new Client(
	{ 
	Locale:"en-gb",
	Dev:false,
	GPU: "3080"
    }
);
// 
let {Completed, Error} = await rtxClient.Check();
if (Error) console.log(Error);
```
importing from deno.land
```
import Clint from "https://deno.land/x/nvidia_rtx_client@1.0.1/mod.ts"
```
