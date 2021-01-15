import { InvoiceCarrierType } from "../enums/InvoiceCarrierType";

export interface InvoiceCustomer {
  memberId: number;
  VATNumber?: string;
  name: string;
  address?: string | null;
  mobilePhone: string;
  email: string;
}

export interface InvoiceCarrier {
  type: InvoiceCarrierType;
  loveCode?: string | null;
  number?: string | null;
}

export interface InvoiceItem {
  amount: number;
  unitPrice: number;
  name: string;
  unit?: string;
}

export interface IssueInvoiceResponse {
  orderId: string;
  invoiceNumber: string;
  date: string;
  randomNumber: string;
}

export interface IssueInvoiceResponseAllowanceResponse {
  allowanceNumber: string;
  invoiceNumber: string;
  date: string;
  remainingAmount: number;
}

export interface IssueInvoiceArguments {
  orderId: string;
  customer: InvoiceCustomer;
  carrier: InvoiceCarrier;
  items: Array<InvoiceItem>;
}

export interface AllowanceInvoiceArguments {
  invoiceNumber: string;
  invoiceDate: string;
  items: Array<InvoiceItem>;
  email: string | undefined;
}

export interface InvalidInvoiceArguments {
  invoiceNumber: string;
  invoiceDate: string;
  reason: string;
}

export interface InvalidAllowanceArguments {
  invoiceNumber: string;
  allowanceNumber: string;
  reason: string;
}
