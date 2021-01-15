"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Invoice = void 0;
const tslib_1 = require("tslib");
const crypto_1 = tslib_1.__importDefault(require("crypto"));
const parse_1 = tslib_1.__importDefault(require("date-fns/parse"));
const format_1 = tslib_1.__importDefault(require("date-fns/format"));
const getYear_1 = tslib_1.__importDefault(require("date-fns/getYear"));
const getMonth_1 = tslib_1.__importDefault(require("date-fns/getMonth"));
class Invoice {
    constructor({ number, prefix, randomCode, createdAt, buyerVAT, sellerVAT, items }) {
        this.taxRatio = 0.05;
        this.hashKey = "INVOICE_HASH_KEY";
        this.hashIv = "INVOICE_HASH_IV_";
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
    get yearMonthText() {
        const date = parse_1.default(this.createdAt, "yyyy-MM-dd HH:mm:ss", new Date());
        const year = getYear_1.default(date) - 1911;
        const month = getMonth_1.default(date) + 1;
        const endMonth = Math.ceil(month / 2) * 2;
        const startMonth = endMonth - 1;
        return `${year}年${`${startMonth}`.padStart(2, "0")}-${`${endMonth}`.padStart(2, "0")}月`;
    }
    get barcodeText() {
        const date = parse_1.default(this.createdAt, "yyyy-MM-dd HH:mm:ss", new Date());
        const year = getYear_1.default(date) - 1911;
        const month = getMonth_1.default(date) + 1;
        const endMonth = Math.ceil(month / 2) * 2;
        return `${year}${`${endMonth}`.padStart(2, "0")}${this.prefix}${this.number}${this.randomCode}`;
    }
    get invoiceNumber() {
        return `${this.prefix}-${this.number}`;
    }
    get firstQRCodeText() {
        const cipher = crypto_1.default.createCipheriv("aes-128-cbc", this.hashKey, this.hashIv);
        cipher.setAutoPadding(true);
        return `${this.prefix}${this.number}${getYear_1.default(parse_1.default(this.createdAt, "yyyy-MM-dd HH:mm:ss", new Date())) - 1911}${format_1.default(parse_1.default(this.createdAt, "yyyy-MM-dd HH:mm:ss", new Date()), "MMdd")}${this.randomCode}${`${this.totalTaxFreePrice}`.padStart(8, "0")}${`${this.totalPrice}`.padStart(8, "0")}${this.buyerVAT || "00000000"}${this.sellerVAT}${[
            cipher.update(`${this.prefix}${this.number}${this.randomCode}`, "utf8", "base64"),
            cipher.final("base64")
        ].join("")}:**********:${this.items.length}:${Math.max(this.items.length, 2)}:1:${this.items
            .slice(0, 2)
            .map(item => `${item.name}:${item.amount}:${item.unitPrice}`)
            .join(":")}`.padEnd(180, " ");
    }
    get secondQRCodeText() {
        const cipher = crypto_1.default.createCipheriv("aes-128-cbc", this.hashKey, this.hashIv);
        cipher.setAutoPadding(true);
        return `**${this.items
            .slice(2)
            .map(item => `${item.name}:${item.amount}:${item.unitPrice}`)
            .join(":")}`.padEnd(180, " ");
    }
}
exports.Invoice = Invoice;
//# sourceMappingURL=Invoice.js.map