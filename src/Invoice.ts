import crypto from "crypto";
import parse from "date-fns/parse";
import format from "date-fns/format";
import getYear from "date-fns/getYear";
import getMonth from "date-fns/getMonth";
import { InvoiceItem } from "./interfaces/IssueInvoice";

export interface InvoiceConstructorOptions {
  number: string;
  prefix: string;
  randomCode: string;
  createdAt: string; // YYYY-MM-DD HH:mm:ss
  buyerVAT?: string;
  sellerVAT: string;
  items: Array<InvoiceItem>;
}

export class Invoice {
  taxRatio: number = 0.05;
  yearMonth: string;
  number: string;
  prefix: string;
  randomCode: string;
  createdAt: string; // YYYY-MM-DD HH:mm:ss
  buyerVAT: string | undefined;
  sellerVAT: string;
  items: Array<InvoiceItem>;

  hashKey: string = "INVOICE_HASH_KEY";
  hashIv: string = "INVOICE_HASH_IV_";

  constructor({ number, prefix, randomCode, createdAt, buyerVAT, sellerVAT, items }: InvoiceConstructorOptions) {
    this.number = number;
    this.prefix = prefix.toUpperCase();
    this.randomCode = randomCode;
    this.createdAt = createdAt;
    this.buyerVAT = buyerVAT;
    this.sellerVAT = sellerVAT;
    this.items = items;
  }

  get totalTaxFreePrice() {
    return this.items.reduce((sum, item) => sum + Math.round(item.unitPrice / (1 + this.taxRatio)) * item.amount, 0);
  }

  get totalPrice() {
    return this.items.reduce((sum, item) => sum + item.unitPrice * item.amount, 0);
  }

  get yearMonthText(): string {
    const date = parse(this.createdAt, "yyyy-MM-dd HH:mm:ss", new Date());

    const year = getYear(date) - 1911;
    const month = getMonth(date) + 1;
    const endMonth = Math.ceil(month / 2) * 2;
    const startMonth = endMonth - 1;

    return `${year}年${`${startMonth}`.padStart(2, "0")}-${`${endMonth}`.padStart(2, "0")}月`;
  }

  get barcodeText(): string {
    const date = parse(this.createdAt, "yyyy-MM-dd HH:mm:ss", new Date());

    const year = getYear(date) - 1911;
    const month = getMonth(date) + 1;
    const endMonth = Math.ceil(month / 2) * 2;

    return `${year}${`${endMonth}`.padStart(2, "0")}${this.prefix}${this.number}${this.randomCode}`;
  }

  get invoiceNumber() {
    return `${this.prefix}-${this.number}`;
  }

  get firstQRCodeText() {
    const cipher = crypto.createCipheriv("aes-128-cbc", this.hashKey, this.hashIv);
    cipher.setAutoPadding(true);

    return `${this.prefix}${this.number}${
      getYear(parse(this.createdAt, "yyyy-MM-dd HH:mm:ss", new Date())) - 1911
    }${format(parse(this.createdAt, "yyyy-MM-dd HH:mm:ss", new Date()), "MMdd")}${
      this.randomCode
    }${`${this.totalTaxFreePrice}`.padStart(8, "0")}${`${this.totalPrice}`.padStart(8, "0")}${
      this.buyerVAT || "00000000"
    }${this.sellerVAT}${[
      cipher.update(`${this.prefix}${this.number}${this.randomCode}`, "utf8", "base64"),
      cipher.final("base64")
    ].join("")}:**********:${this.items.length}:${Math.max(this.items.length, 2)}:1:${this.items
      .slice(0, 2)
      .map(item => `${item.name}:${item.amount}:${item.unitPrice}`)
      .join(":")}`.padEnd(180, " ");
  }

  get secondQRCodeText() {
    const cipher = crypto.createCipheriv("aes-128-cbc", this.hashKey, this.hashIv);
    cipher.setAutoPadding(true);

    return `**${this.items
      .slice(2)
      .map(item => `${item.name}:${item.amount}:${item.unitPrice}`)
      .join(":")}`.padEnd(180, " ");
  }
}
