import { CartUrl, localeMap } from "./globalData.ts";
import type { checkReturn, clientProps } from "./types/clientTypes.ts";
import type {Product, RootObject } from "./types/stockAPI.ts";

export class Client {

    public Url  :string;
    public Locale : "en-us" | "en-gb"
    public WebhookUrl : string;
    public DevWebhookUrl? : string 
    private NLocale : string
    private Dev : boolean
    private _Attempts : number;
    private _Errors : number;

    protected OnInStock (product: Product) {
        this.AlertOnStockWebhook(product.inventoryStatus.status, product)
    }
    protected OnOutStock (product: Product) {
        console.log(`Still out of stock // ${product.inventoryStatus.status}`)
    }

    constructor( data : clientProps ) {

        // from constructor data
        this.Locale = data.Locale
        this.Url = localeMap[this.Locale]
        this.WebhookUrl = data.WebhookUrl
        this.DevWebhookUrl = data.DevWebhookUrl

        // method updates

        this.OnInStock = data.OnInStock ?? this.OnInStock;
        this.OnOutStock = data.OnOutStock ?? this.OnOutStock;

        // internal
        this.NLocale = this.Locale.replace("-","_")
        this.Dev = data.Dev ?? false
        this._Attempts = 0;
        this._Errors = 0;

    }

    private async SafeDataFetch(url : string) {

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

    private async AlertDevWebhook(req: string) {
        if (! this.DevWebhookUrl || !this.Dev) return;
        let f = fetch(this.DevWebhookUrl, {
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

    private async AlertOnStockWebhook(status: string, Product?: Product) {
        let NewCartUrl = CartUrl.replace('%LOCALE%', this.NLocale).replace('%PRODUCTID%', (Product?.id ?? localeMap["en-gb"].slice(localeMap["en-gb"].lastIndexOf('/'))).toString() )
        let f = fetch(this.WebhookUrl, {
            method: 'POST',
            headers: [['Content-Type', 'application/json']],
            body: JSON.stringify({
                content: `Rtx 3080 may be on sale. // status ⟶ ${status} \\\\\\ @everyone\n URL to cart may be 🠒 ${NewCartUrl} 🠐\nIf not use https://www.nvidia.com/en-gb/shop/geforce/gpu/?page=1&limit=9&locale=en-gb&category=GPU&gpu=RTX%203080`,
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


    private DataCatch (rej:string) {
        console.log(`Got rejection from getData : ${rej}`)
        this._Errors++
        if (this.Dev)
            this.AlertDevWebhook(`[DEV] Got rejection from getData : ${rej} `)
        return {Completed : true, Error: rej}
    }
    private DataResolved (value : RootObject) {
		let defData = value?.products?.product[0];
		let inv = defData.inventoryStatus;
		if (inv.status != 'PRODUCT_INVENTORY_OUT_OF_STOCK') {
			console.log('In stock! || ' + inv.status);
            this.OnInStock(value.products.product[0])
            
		} else {
            console.log(`Out of stock, status : ${inv.status}`);
            this.OnOutStock(value.products.product[0])
        }
        return {Completed : true}
	}

    public Check() : Promise<checkReturn> {

        Deno.permissions.request({name:"net"})

        this._Attempts++
        let promise = this.SafeDataFetch(this.Url)
        return promise.then(this.DataResolved.bind(this),this.DataCatch.bind(this) )

    }

    get Attempts():number {
        return this._Attempts
    }
    get Errors():number {
        return this._Errors
    }
    
}