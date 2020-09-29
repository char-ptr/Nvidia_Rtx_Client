# rtx3080_Server
~~my [other project](https://github.com/pozm/rtx3080) but supposed to be ran on a server with improvements.~~
this is a better version of that project.
Some of the improvements include
- united states support.
- on in stock & out of stock functions to be ran on said events.
- webhook for discord notifications 

## Some things you might want to know
* This will only give data about the RTX 3080 FE. 
	- i cba adding support for the other cards at the moment and this is the only card i currently care about.
* usage, it's pretty simple. but you must run with the --unstable parameter.
	- other parameters can be accessed using --dev and --loop, --dev will send data to a webhook with caught errors, loop will make it continuously check to see if it's on sale.
	- this project uses [deno](https://deno.land/), NOT node.
