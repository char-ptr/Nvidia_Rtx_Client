import type {Product } from "./stockAPI.ts";

export interface clientProps {
    Locale : "en-us" | "en-gb",
    GPU : keyof KnownGPUs
    WebhookUrl? : string
    Dev? : boolean
    DevWebhookUrl? : string
	OnInStock? : (Product : Product) => void
	OnOutStock? : (Product : Product) => void
}
export interface checkReturn {
    Completed : boolean;
    Error?: string;
}

export interface KnownLocales {
    ["en-gb"] : string
    ["en-us"] : string
}

export interface KnownGPUs {
    ["3080"] : KnownLocales
    ["3090"] : KnownLocales
}