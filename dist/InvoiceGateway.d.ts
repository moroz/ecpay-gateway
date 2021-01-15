import InvoiceCarrierType from "./enums/InvoiceCarrierType";
import { AllowanceInvoiceArguments, InvalidInvoiceArguments, IssueInvoiceResponseAllowanceResponse, IssueInvoiceResponse, InvalidAllowanceArguments, IssueInvoiceArguments } from "./interfaces/IssueInvoice";
interface InvoiceGatewayConstructorOptions {
    merchantId: string;
    hashKey: string;
    hashIv: string;
    development?: boolean;
}
export declare class InvoiceGateway {
    HOST: string;
    MERCHANT_ID: string;
    HASH_KEY: string;
    HASH_IV: string;
    static getCarrierTypeCode(type: InvoiceCarrierType): string;
    constructor({ merchantId, hashKey, hashIv, development }?: InvoiceGatewayConstructorOptions);
    encrypt(data: any): string;
    decrypt(encryptedData: string): any;
    getValidCarrierNumber(type: InvoiceCarrierType, number: string | null | undefined): Promise<string> | string;
    getValidLoveCode(loveCode: string | null | undefined): Promise<string>;
    getValidMobileCarrierNumber(number: string): Promise<string>;
    sendNotification(invoiceNumber: string, email: string): Promise<boolean>;
    invalidAllowance({ invoiceNumber, allowanceNumber, reason }: InvalidAllowanceArguments): Promise<boolean>;
    invalidInvoice({ invoiceNumber, invoiceDate, reason }: InvalidInvoiceArguments): Promise<true>;
    allowanceInvoice({ invoiceNumber, invoiceDate, items, email }: AllowanceInvoiceArguments): Promise<IssueInvoiceResponseAllowanceResponse>;
    issueInvoice({ orderId, customer: { memberId, VATNumber, name, address, mobilePhone, email }, carrier: { type: carrierType, loveCode, number: carrierNumber }, items }: IssueInvoiceArguments): Promise<IssueInvoiceResponse>;
}
export {};
