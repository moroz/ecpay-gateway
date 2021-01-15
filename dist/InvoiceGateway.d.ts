import InvoiceCarrierType from "./enums/InvoiceCarrierType";
import { AllowanceInvoiceArguments, InvalidInvoiceArguments, IssueInvoiceResponseAllowanceResponse, IssueInvoiceResponse, InvalidAllowanceArguments, IssueInvoiceArguments } from "./interfaces/IssueInvoice";
interface InvoiceGatewayConstructorOptions {
    MERCHANT_ID: string;
    HASH_KEY: string;
    HASH_IV: string;
    DEVELOPMENT?: boolean;
}
export declare class InvoiceGateway {
    HOST: string;
    MERCHANT_ID: string;
    HASH_KEY: string;
    HASH_IV: string;
    constructor(args?: Partial<InvoiceGatewayConstructorOptions>);
    static genericRequest(endpoint: string, payload: any, args?: Partial<InvoiceGatewayConstructorOptions>): Promise<any>;
    static getCarrierTypeCode(type: InvoiceCarrierType): string;
    static normalizeArgs(args?: Partial<InvoiceGatewayConstructorOptions>): {
        HOST: string;
        MERCHANT_ID: string;
        HASH_IV: string;
        HASH_KEY: string;
    };
    static encrypt(data: any): string;
    encrypt(data: any): string;
    static decrypt(encryptedData: string): any;
    decrypt(encryptedData: string): any;
    getValidCarrierNumber(type: InvoiceCarrierType, number: string | null | undefined): Promise<string> | string;
    getValidLoveCode(loveCode: string | null | undefined): Promise<string>;
    static normalizeMobileCarrierBarcode(BarCode: string, args?: Partial<InvoiceGatewayConstructorOptions>): Promise<string>;
    sendNotification(invoiceNumber: string, email: string): Promise<boolean>;
    invalidAllowance({ invoiceNumber, allowanceNumber, reason }: InvalidAllowanceArguments): Promise<boolean>;
    invalidInvoice({ invoiceNumber, invoiceDate, reason }: InvalidInvoiceArguments): Promise<true>;
    allowanceInvoice({ invoiceNumber, invoiceDate, items, email }: AllowanceInvoiceArguments): Promise<IssueInvoiceResponseAllowanceResponse>;
    issueInvoice({ orderId, customer: { memberId, VATNumber, name, address, mobilePhone, email }, carrier: { type: carrierType, loveCode, number: carrierNumber }, items }: IssueInvoiceArguments): Promise<IssueInvoiceResponse>;
}
export {};
