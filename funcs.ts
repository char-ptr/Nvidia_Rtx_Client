import { devWHUrl, WebhookUrl } from "./globalData.ts";
import type { RootObject } from "./types/stockAPI.ts";

export async function alertDev(req: string) {
    let f = fetch(devWHUrl, {
        method: 'POST',
        headers: [['Content-Type', 'application/json']],
        body: JSON.stringify({
            content: `${req}`,
        }),
    });
    f.then(
        async (res) =>
            console.log(
                res.ok
                    ? `[DEV] Should of sucessfully sent webhook ${res.status}`
                    : `[DEV] response seems not to be "ok" ${
                            res.status
                      },\n${await res.text()} `
            ),
        (rea) => console.log(`[DEV] webhook failed. reason : ${rea}`)
    );
}
export async function AlertWebhook(status: string) {
    let f = fetch(WebhookUrl, {
        method: 'POST',
        headers: [['Content-Type', 'application/json']],
        body: JSON.stringify({
            content: `Rtx 3080 may be on sale. // status ⟶ ${status} \\\\\\ @everyone\n URL to cart may be 🠒 https://store.nvidia.com/store?Action=AddItemToRequisition&SiteID=nvidia&Locale=en_US&productID=5438792800&quantity=1 🠐\nIf not use https://www.nvidia.com/en-gb/shop/geforce/gpu/?page=1&limit=9&locale=en-gb&category=GPU&gpu=RTX%203080`,
        }),
    });
    f.then(
        async (res) =>
            console.log(
                res.ok
                    ? `Should of sucessfully sent webhook ${res.status}`
                    : `response seems not to be "ok" ${
                            res.status
                      },\n${await res.text()} `
            ),
        (rea) => console.log(`webhook failed. reason : ${rea}`)
    );
}

export async function SafeDataFetch(url : string) {

    return new Promise<RootObject>((resolv, rej) => {
        let f = fetch(url);
    
        f.then((v) => {

            if (!v.ok) {
                rej(`new http error. status: ${v.status}, url : ${v.url}`)
            }

            let jsn = v.json();
            jsn.then((val: RootObject) => {
                if (!v.ok) {
                    if (val.status == "failure")
                        rej(`failure making request. status : ${v.status}, "msg" : ${val.errors?.errorMessage ?? "no message?"}`)
                }
                return resolv(val);
            }, reason => rej(`had invalid json (${reason})`) );
        }, (rej2) => {
            console.log('Unable to fetch, r : ' + rej2);
            rej('Fetch Failed! reason : ' + rej2);
        });
    });
}