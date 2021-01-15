"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceGateway = void 0;
const tslib_1 = require("tslib");
const InvoiceCarrierType_1 = tslib_1.__importDefault(require("./enums/InvoiceCarrierType"));
const axios_1 = tslib_1.__importDefault(require("axios"));
const uuid_1 = require("uuid");
const Payment_1 = require("./errors/Payment");
const crypto_1 = tslib_1.__importDefault(require("crypto"));
class InvoiceGateway {
    constructor({ merchantId, hashKey, hashIv, development } = {
        merchantId: "2000132",
        hashKey: "ejCk326UnaZWKisg",
        hashIv: "q9jcZX8Ib9LM8wYk",
        development: true
    }) {
        this.HOST = development
            ? "https://einvoice-stage.ecpay.com.tw/B2CInvoice"
            : "https://einvoice.ecpay.com.tw/B2CInvoice";
        this.MERCHANT_ID = merchantId;
        this.HASH_KEY = hashKey;
        this.HASH_IV = hashIv;
    }
    static getCarrierTypeCode(type) {
        switch (type) {
            case InvoiceCarrierType_1.default.GERRN_WORLD:
                return "1";
            case InvoiceCarrierType_1.default.NATURAL:
                return "2";
            case InvoiceCarrierType_1.default.MOBILE:
                return "3";
            case InvoiceCarrierType_1.default.LOVE_CODE:
            default:
                return "";
        }
    }
    encrypt(data) {
        const encodedData = encodeURIComponent(JSON.stringify(data));
        const cipher = crypto_1.default.createCipheriv("aes-128-cbc", this.HASH_KEY, this.HASH_IV);
        cipher.setAutoPadding(true);
        return [cipher.update(encodedData, "utf8", "base64"), cipher.final("base64")].join("");
    }
    decrypt(encryptedData) {
        const decipher = crypto_1.default.createDecipheriv("aes-128-cbc", this.HASH_KEY, this.HASH_IV);
        return JSON.parse(decodeURIComponent([decipher.update(encryptedData, "base64", "utf8"), decipher.final("utf8")].join("")));
    }
    getValidCarrierNumber(type, number) {
        switch (type) {
            case InvoiceCarrierType_1.default.MOBILE:
                if (!number || !/^\/[0-9A-Z+-.]{7}$/.test(number))
                    throw new Payment_1.InvalidMobileCarrierNumberType();
                return this.getValidMobileCarrierNumber(number);
            case InvoiceCarrierType_1.default.NATURAL:
                if (!number || !/^[A-Z]{2}\d{14}$/.test(number))
                    throw new Payment_1.InvalidNaturalCarrierNumberType();
                return number;
            case InvoiceCarrierType_1.default.GERRN_WORLD:
            case InvoiceCarrierType_1.default.LOVE_CODE:
            default:
                return "";
        }
    }
    getValidLoveCode(loveCode) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!loveCode)
                throw new Payment_1.InvalidLoveCode();
            const ts = Math.floor(Date.now() / 1000);
            const id = uuid_1.v4();
            const { data: { Data } } = yield axios_1.default({
                method: "post",
                url: `${this.HOST}/CheckLoveCode`,
                data: {
                    MerchantID: this.MERCHANT_ID,
                    RqHeader: {
                        Timestamp: ts,
                        RqId: id,
                        Revision: "3.0.0"
                    },
                    Data: this.encrypt({
                        MerchantID: this.MERCHANT_ID,
                        LoveCode: loveCode
                    })
                }
            });
            const { RtnCode, IsExist } = this.decrypt(Data);
            switch (RtnCode) {
                case 1:
                    if (IsExist === "Y")
                        return loveCode;
                    throw new Payment_1.InvalidLoveCode();
                case 100000100:
                    throw new Payment_1.LoveCodeVerificationSystemInMaintenance();
                default:
                    throw new Payment_1.LoveCodeVerificationSystemError();
            }
        });
    }
    getValidMobileCarrierNumber(number) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const ts = Math.floor(Date.now() / 1000);
            const id = uuid_1.v4();
            const { data: { Data } } = yield axios_1.default({
                method: "post",
                url: `${this.HOST}/CheckBarcode`,
                data: {
                    MerchantID: this.MERCHANT_ID,
                    RqHeader: {
                        Timestamp: ts,
                        RqId: id,
                        Revision: "3.0.0"
                    },
                    Data: this.encrypt({
                        MerchantID: this.MERCHANT_ID,
                        BarCode: number
                    })
                }
            });
            const { RtnCode, IsExist } = this.decrypt(Data);
            switch (RtnCode) {
                case 1:
                    if (IsExist === "Y")
                        return number;
                    throw new Payment_1.InvalidMobileBarcode();
                case 100000100:
                    throw new Payment_1.MobileBarcodeVerificationSystemInMaintenance();
                default:
                    throw new Payment_1.MobileBarcodeVerificationSystemError();
            }
        });
    }
    sendNotification(invoiceNumber, email) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const ts = Math.floor(Date.now() / 1000);
            const id = uuid_1.v4();
            const { data: { Data } } = yield axios_1.default({
                method: "post",
                url: `${this.HOST}/InvoiceNotify`,
                data: {
                    MerchantID: this.MERCHANT_ID,
                    RqHeader: {
                        Timestamp: ts,
                        RqId: id,
                        Revision: "3.0.0"
                    },
                    Data: this.encrypt({
                        MerchantID: this.MERCHANT_ID,
                        InvoiceNo: invoiceNumber,
                        NotifyMail: email,
                        Notify: "E",
                        InvoiceTag: "I",
                        Notified: "A"
                    })
                }
            });
            const { RtnCode, RtnMsg } = this.decrypt(Data);
            if (RtnCode === 1)
                return true;
            else
                throw new Payment_1.SendInvoiceNotificationFailed(RtnMsg);
        });
    }
    invalidAllowance({ invoiceNumber, allowanceNumber, reason }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const timestamp = Math.floor(Date.now() / 1000);
            const id = uuid_1.v4();
            const { data: { Data } } = yield axios_1.default({
                method: "post",
                url: `${this.HOST}/AllowanceInvalid`,
                data: {
                    MerchantID: this.MERCHANT_ID,
                    RqHeader: {
                        Timestamp: timestamp,
                        RqID: id,
                        Revision: "3.0.0"
                    },
                    Data: this.encrypt({
                        MerchantID: this.MERCHANT_ID,
                        InvoiceNo: invoiceNumber,
                        AllowanceNo: allowanceNumber,
                        Reason: reason
                    })
                }
            });
            const { RtnCode, RtnMsg } = this.decrypt(Data);
            if (RtnCode === 1)
                return true;
            else
                throw new Payment_1.InvalidAllowanceFailed(RtnMsg);
        });
    }
    invalidInvoice({ invoiceNumber, invoiceDate, reason }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const timestamp = Math.floor(Date.now() / 1000);
            const id = uuid_1.v4();
            const { data: { Data } } = yield axios_1.default({
                method: "post",
                url: `${this.HOST}/Invalid`,
                data: {
                    MerchantID: this.MERCHANT_ID,
                    RqHeader: {
                        Timestamp: timestamp,
                        RqID: id,
                        Revision: "3.0.0"
                    },
                    Data: this.encrypt({
                        MerchantID: this.MERCHANT_ID,
                        InvoiceNo: invoiceNumber,
                        InvoiceDate: invoiceDate,
                        Reason: reason
                    })
                }
            });
            const { RtnCode, RtnMsg } = this.decrypt(Data);
            if (RtnCode === 1)
                return true;
            else
                throw new Payment_1.InvalidInvoiceFailed(RtnMsg);
        });
    }
    allowanceInvoice({ invoiceNumber, invoiceDate, items, email }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const timestamp = Math.floor(Date.now() / 1000);
            const id = uuid_1.v4();
            const { data: { Data } } = yield axios_1.default({
                method: "post",
                url: `${this.HOST}/Allowance`,
                data: {
                    MerchantID: this.MERCHANT_ID,
                    RqHeader: {
                        Timestamp: timestamp,
                        RqID: id,
                        Revision: "3.0.0"
                    },
                    Data: this.encrypt(Object.assign(Object.assign({ MerchantID: this.MERCHANT_ID, InvoiceNo: invoiceNumber, InvoiceDate: invoiceDate }, (email
                        ? {
                            AllowanceNotify: "E",
                            NotifyMail: email
                        }
                        : {
                            AllowanceNotify: "N"
                        })), { AllowanceAmount: items.reduce((sum, item) => sum + item.unitPrice * item.amount, 0), Items: items.map((item, index) => ({
                            ItemSeq: index,
                            ItemName: item.name,
                            ItemCount: item.amount,
                            ItemWord: item.unit || "式",
                            ItemPrice: item.unitPrice,
                            ItemTaxType: "1",
                            ItemAmount: item.amount * item.unitPrice,
                            ItemRemark: ""
                        })) }))
                }
            });
            const { RtnCode, RtnMsg, IA_Allow_No: allowanceNumber, IA_Date: date, IA_Remain_Allowance_Amt: remainingAmount } = this.decrypt(Data);
            switch (RtnCode) {
                case 1:
                    return {
                        allowanceNumber,
                        invoiceNumber,
                        date,
                        remainingAmount
                    };
                default:
                    console.debug(`${RtnCode} ${RtnMsg}`);
                    throw new Payment_1.AllowanceInvoiceFailed();
            }
        });
    }
    issueInvoice({ orderId, customer: { memberId, VATNumber, name, address, mobilePhone, email }, carrier: { type: carrierType, loveCode, number: carrierNumber }, items }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const timestamp = Math.floor(Date.now() / 1000);
            const id = uuid_1.v4();
            const { data: { Data } } = yield axios_1.default({
                method: "post",
                url: `${this.HOST}/Issue`,
                data: {
                    MerchantID: this.MERCHANT_ID,
                    RqHeader: {
                        Timestamp: timestamp,
                        RqID: id,
                        Revision: "3.0.0"
                    },
                    Data: this.encrypt({
                        MerchantID: this.MERCHANT_ID,
                        RelateNumber: orderId,
                        CustomerID: `${memberId}`,
                        CustomerIdentifier: VATNumber || "",
                        CustomerName: name,
                        CustomerAddr: address || "",
                        CustomerPhone: mobilePhone,
                        CustomerEmail: email,
                        Print: carrierType === InvoiceCarrierType_1.default.PRINT ? "1" : "0",
                        Donation: carrierType === InvoiceCarrierType_1.default.LOVE_CODE ? "1" : "0",
                        LoveCode: carrierType === InvoiceCarrierType_1.default.LOVE_CODE ? yield this.getValidLoveCode(loveCode) : "",
                        CarrierType: InvoiceGateway.getCarrierTypeCode(carrierType),
                        CarrierNum: yield this.getValidCarrierNumber(carrierType, carrierNumber),
                        TaxType: "1",
                        SalesAmount: items.reduce((sum, item) => sum + item.unitPrice * item.amount, 0),
                        InvoiceRemark: "",
                        Items: items.map((item, index) => ({
                            ItemSeq: index,
                            ItemName: item.name,
                            ItemCount: item.amount,
                            ItemWord: item.unit || "式",
                            ItemPrice: item.unitPrice,
                            ItemTaxType: "1",
                            ItemAmount: item.amount * item.unitPrice,
                            ItemRemark: ""
                        })),
                        InvType: "07",
                        vat: "1"
                    })
                }
            });
            const { RtnCode, RtnMsg, InvoiceNo, InvoiceDate, RandomNumber } = this.decrypt(Data);
            switch (RtnCode) {
                case 1:
                    if (InvoiceNo && InvoiceDate && RandomNumber) {
                        if (process.env.NODE_ENV !== "production") {
                            this.sendNotification(InvoiceNo, email);
                        }
                        return {
                            orderId,
                            invoiceNumber: InvoiceNo,
                            date: InvoiceDate,
                            randomNumber: RandomNumber
                        };
                    }
                    throw new Payment_1.IssueInvoiceFailed();
                default:
                    console.debug(`${RtnCode} ${RtnMsg}`);
                    throw new Payment_1.IssueInvoiceFailed();
            }
        });
    }
}
exports.InvoiceGateway = InvoiceGateway;
//# sourceMappingURL=InvoiceGateway.js.map