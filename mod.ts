import { CartUrl, localeCurrency, localeMap, ProductAPI } from './globalData.ts';
import type { checkReturn, clientProps, KnownGPUs, KnownLocales } from './types/clientTypes.ts';
import type { Product, RootObject } from './types/stockAPI.ts';

export default class RTXClient {
	public Url: string;
	public Locale: keyof KnownLocales
	public WebhookUrl?: string;
	public DevWebhookUrl?: string;
	public InStock : boolean
	public KnownProducts : (Product|undefined)[];
	public GPU : keyof KnownGPUs
	public Sku : string
	public currency : string;
	private NLocale: string;
	private Dev: boolean;
	private _Attempts: number;
	private _Errors: number;

	protected OnFail(reeason: string) {

	} 

	protected OnInStock(product: Product) {
		console.log(`in stock // ${product.inventoryStatus.status}`)

	}
	protected OnOutStock(product: Product) {
		console.log(`out of stock // ${product.inventoryStatus.status}`);
	}

	constructor(data: clientProps) {

		//throw any error found
		if (!this.CheckIfValidLocale(data.Locale))
			throw new Error("Locale must be either " + Object.keys(localeMap[3080]).join('" | "'))
		if (!this.CheckIfValidGPU(data.GPU))
			throw new Error("GPU must be either " + Object.keys(localeMap).join('" | "'))
		// from constructor data
		
		this.Locale = data.Locale;
		this.GPU = data.GPU
		this.Sku = localeMap[this.GPU][this.Locale];
		this.currency = localeCurrency[this.Locale]

		this.Url = this.FormatString(ProductAPI,[{name:"locale",value:this.Locale},{name:"currency",value:this.currency},{name:"sku",value:this.Sku}])

		this.WebhookUrl = data.WebhookUrl;
		this.DevWebhookUrl = data.DevWebhookUrl;

		// static construction
		this.InStock = false;
		this.KnownProducts = [];

		// method updates
		this.OnInStock = data.OnInStock ?? this.OnInStock;
		this.OnOutStock = data.OnOutStock ?? this.OnOutStock;
		this.OnFail = data.OnFail ?? this.OnFail

		// internal
		this.NLocale = this.Locale.replace('-', '_');
		this.Dev = data.Dev ?? false;
		this._Attempts = 0;
		this._Errors = 0;
	}
	private CheckIfValidLocale = (locale: string) => Object.values(localeMap).some(v=>Object.keys(v).includes(locale))
	private CheckIfValidGPU = (GPU: string) => Object.keys(localeMap).includes(GPU)

	private FormatString(str :string , formatter : {name : string, value:string}[] ) :string {
		let NewStr = str
		for (let obj of formatter) {
			NewStr = NewStr.replace(`{${obj.name}}`,obj.value)
		}
		return NewStr
	}
	// safe fetch. fetches the data from nvidia handling all possible errors.
	private async SafeDataFetch(url: string) {
		return new Promise<RootObject>((resolv, rej) => {
			let f = fetch(url);

			f.then(
				(v) => {
					if (!v.ok) {
						rej(
							`new http error. status: ${v.status}, url : ${v.url}`
						);
					}

					let jsn = v.json();
					jsn.then(
						(val: RootObject) => {
							if (!v.ok) {
								if (val.status == 'failure')
									rej(
										`failure making request. status : ${
											v.status
										}, "msg" : ${
											val.errors?.errorMessage ??
											'no message?'
										}`
									);
							}
							return resolv(val);
						},
						(reason) => rej(`had invalid json (${reason})`)
					);
				},
				(rej2) => {
					console.log('Unable to fetch, r : ' + rej2);
					rej('Fetch Failed! reason : ' + rej2);
				}
			);
		});
	}
	// alerts the dev webhook, will alert for caught errors etc.
	private async AlertDevWebhook(req: string) {
		if (!this.DevWebhookUrl || !this.Dev) return;
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
	// webhook which is fired when the product is in stock.
	public async AlertWebhook(Product?: Product,Custom?:string) {
		if (!this.WebhookUrl) return;
		let NewCartUrl = CartUrl.replace('%LOCALE%', this.NLocale).replace(
			'%PRODUCTID%',
			(
				Product?.id ??
				localeMap["3080"]['en-gb'].slice(localeMap["3080"]['en-gb'].lastIndexOf('/'))
			).toString()
		);
		let f = fetch(this.WebhookUrl, {
			method: 'POST',
			headers: [['Content-Type', 'application/json']],
			body: JSON.stringify({
				content: Custom ?? `Rtx 3080 may be on sale. @everyone\n URL to cart may be 🠒 ${NewCartUrl} 🠐\nIf not use https://www.nvidia.com/en-gb/shop/geforce/gpu/?page=1&limit=9&locale=en-gb&category=GPU&gpu=RTX%203080`,
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
	// when the returned promise is rejected.
	private DataCatch(rej: string) : checkReturn {
		this._Errors++;
		this.OnFail(rej)
		if (this.Dev)
			console.log(`Got rejection from getData : ${rej}`);
			this.AlertDevWebhook(`[DEV] Got rejection from getData : ${rej} `);
		return { Completed: true, Error: rej, IsInStock: this.InStock };
	}
	// when the returned promise is resolved.
	private DataResolved(value: RootObject) : checkReturn {
		let defData = value?.products?.product[0];
		if (!this.KnownProducts.includes(defData))
			this.KnownProducts.push(defData)
		let inv = defData.inventoryStatus;
		if (inv.status != 'PRODUCT_INVENTORY_OUT_OF_STOCK') {
			if (this.Dev)
				console.log('In stock! || ' + inv.status);
			this.InStock = true
			this.OnInStock(value.products.product[0]);
		} else {
			if (this.Dev)
				console.log(`Out of stock, status : ${inv.status}`);
			this.InStock = false
			this.OnOutStock(value.products.product[0]);
		}
		return { Completed: true, IsInStock: this.InStock, Product : defData };
	}
	// check to see if the product is on sale.
	public Check(): Promise<checkReturn> {
		Deno.permissions.request({ name: 'net' });

		this._Attempts++;
		let promise = this.SafeDataFetch(this.Url);
		return promise.then(
			this.DataResolved.bind(this),
			this.DataCatch.bind(this)
		);
	}
	// see how many attempts the client has tried to see if its on stock.
	get Attempts(): number {
		return this._Attempts;
	}
	// how many errors has the client accumlated?
	get Errors(): number {
		return this._Errors;
	}
}
