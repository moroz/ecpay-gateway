"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceCarrierTypeToCode = exports.InvoiceCarrierType = void 0;
var InvoiceCarrierType;
(function (InvoiceCarrierType) {
    InvoiceCarrierType[InvoiceCarrierType["PRINT"] = 0] = "PRINT";
    InvoiceCarrierType[InvoiceCarrierType["LOVE_CODE"] = 1] = "LOVE_CODE";
    InvoiceCarrierType[InvoiceCarrierType["GERRN_WORLD"] = 2] = "GERRN_WORLD";
    InvoiceCarrierType[InvoiceCarrierType["NATURAL"] = 3] = "NATURAL";
    InvoiceCarrierType[InvoiceCarrierType["MOBILE"] = 4] = "MOBILE";
})(InvoiceCarrierType = exports.InvoiceCarrierType || (exports.InvoiceCarrierType = {}));
exports.InvoiceCarrierTypeToCode = {
    [InvoiceCarrierType.PRINT]: "",
    [InvoiceCarrierType.GERRN_WORLD]: "1",
    [InvoiceCarrierType.NATURAL]: "2",
    [InvoiceCarrierType.LOVE_CODE]: "",
    [InvoiceCarrierType.MOBILE]: "3"
};
exports.default = InvoiceCarrierType;
//# sourceMappingURL=InvoiceCarrierType.js.map