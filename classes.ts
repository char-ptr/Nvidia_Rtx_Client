import { alertDev, AlertWebhook, SafeDataFetch } from "./funcs.ts";
import { localeMap } from "./globalData.ts";
import type { checkReturn, clientProps } from "./types/clientTypes.ts";
import type {Product, RootObject } from "./types/stockAPI.ts";

export class Client {

    public Url  :string;
    public Locale : "en-us" | "en-gb"
    private Dev : boolean
    private _Attempts : number;
    private _Errors : number;

    protected OnInStock (product: Product) {
        AlertWebhook(product.inventoryStatus.status)
    }
    protected OnOutStock (product: Product) {
        console.log(`Still out of stock // ${product.inventoryStatus.status}`)
    }

    constructor( data : clientProps ) {

        // from constructor data
        this.Locale = data.Locale
        this.Url = localeMap[this.Locale]

        this.OnInStock = data.OnInStock ?? this.OnInStock;
        this.OnOutStock = data.OnOutStock ?? this.OnOutStock;

        // internal

        this.Dev = data.Dev ?? false
        this._Attempts = 0;
        this._Errors = 0;

    }

    private DataCatch (rej:string) {
        console.log(`Got rejection from getData : ${rej}`)
        this._Errors++
        if (this.Dev)
            alertDev(`[DEV] Got rejection from getData : ${rej} `)
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
        let promise = SafeDataFetch(this.Url)
        return promise.then(this.DataResolved.bind(this),this.DataCatch.bind(this) )

    }

    get Attempts():number {
        return this._Attempts
    }
    get Errors():number {
        return this._Errors
    }
    
}