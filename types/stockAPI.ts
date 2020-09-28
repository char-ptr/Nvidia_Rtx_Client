export interface Attribute {
	name: string;
	type: string;
	value: string;
}

export interface CustomAttributes {
	attribute: Attribute[];
}

export interface ListPrice {
	currency: string;
	value: number;
}

export interface ListPriceWithoutVat {
	currency: string;
	value: number;
}

export interface ListPriceWithQuantity {
	currency: string;
	value: number;
}

export interface SalePriceWithQuantity {
	currency: string;
	value: number;
}

export interface TotalDiscountWithQuantity {
	currency: string;
	value: number;
}

export interface Tax {
	vatPercentage: number;
}

export interface SalePriceWithFeesAndQuantity {
	currency: string;
	value: number;
}

export interface FeePricing {
	salePriceWithFeesAndQuantity: SalePriceWithFeesAndQuantity;
	formattedSalePriceWithFeesAndQuantity: string;
}

export interface Pricing {
	uri: string;
	listPrice: ListPrice;
	listPriceWithoutVat: ListPriceWithoutVat;
	listPriceWithQuantity: ListPriceWithQuantity;
	salePriceWithQuantity: SalePriceWithQuantity;
	formattedListPrice: string;
	formattedListPriceWithoutVat: string;
	formattedListPriceWithQuantity: string;
	formattedSalePriceWithQuantity: string;
	totalDiscountWithQuantity: TotalDiscountWithQuantity;
	formattedTotalDiscountWithQuantity: string;
	listPriceIncludesTax: string;
	tax: Tax;
	feePricing: FeePricing;
}

export interface InventoryStatus {
	uri: string;
	availableQuantityIsEstimated: string;
	productIsInStock: string;
	productIsAllowsBackorders: string;
	productIsTracked: string;
	requestedQuantityAvailable: string;
	status: string;
	statusIsEstimated: string;
}

export interface RelatedProduct {
	id: number;
	name: string;
	image: string;
}

export interface Product {
	id: number;
	name: string;
	displayName: string;
	sku: string;
	displayableProduct: string;
	manufacturerPartNumber: string;
	maximumQuantity: number;
	thumbnailImage: string;
	customAttributes: CustomAttributes;
	pricing: Pricing;
	inventoryStatus: InventoryStatus;
	relatedProducts: RelatedProduct[];
	viewStyle: string;
}

export interface Products {
	product: Product[];
}

export interface RootObject {
	status? : string,
	errors? : {
		"errorCode": string,
		"errorMessage" : string
	}
	products: Products;
}
