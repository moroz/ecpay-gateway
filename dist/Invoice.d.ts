import { InvoiceItem } from "./interfaces/IssueInvoice";
export interface InvoiceConstructorOptions {
    number: string;
    prefix: string;
    randomCode: string;
    createdAt: string;
    buyerVAT?: string;
    sellerVAT: string;
    items: Array<InvoiceItem>;
}
export declare class Invoice {
    taxRatio: number;
    yearMonth: string;
    number: string;
    prefix: string;
    randomCode: string;
    createdAt: string;
    buyerVAT: string | undefined;
    sellerVAT: string;
    items: Array<InvoiceItem>;
    hashKey: string;
    hashIv: string;
    constructor({ number, prefix, randomCode, createdAt, buyerVAT, sellerVAT, items }: InvoiceConstructorOptions);
    get totalTaxFreePrice(): number;
    get totalPrice(): number;
    get yearMonthText(): string;
    get barcodeText(): string;
    get invoiceNumber(): string;
    get firstQRCodeText(): string;
    get secondQRCodeText(): string;
}
