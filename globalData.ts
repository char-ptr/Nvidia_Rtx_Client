import type { KnownGPUs } from "./types/clientTypes.ts"

export const CartUrl = "https://store.nvidia.com/store?Action=AddItemToRequisition&SiteID=nvidia&Locale={locale}&productID={prodID}&quantity=1"

//nvidia APIs

export const ProductAPI = "https://api-prod.nvidia.com/direct-sales-shop/DR/products/{locale}/{currency}/{sku}"

//currency mapped by locale

export const localeCurrency = {
    "en-gb" : "GBP",
    "en-us" : "USD"
}

// nvidia product sku mapped by locale, GPU

export const localeMap : KnownGPUs = {
    "3080": {
        "en-us":"5438481700",
        "en-gb":"5438792800"
    },
    "3090": {
        "en-gb" : "5438793000",
        "en-us" : ""
    }
}
