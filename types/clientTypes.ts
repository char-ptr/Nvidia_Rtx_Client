import type {Product } from "./stockAPI.ts";

export interface clientProps {
    Locale : "en-us" | "en-gb"
    Dev? : boolean
	OnInStock? : (Product : Product) => void
	OnOutStock? : (Product : Product) => void
}
export interface checkReturn {
    Completed : boolean;
    Error?: string;
}