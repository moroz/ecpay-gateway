export enum InvoiceCarrierType {
  PRINT,
  LOVE_CODE,
  GERRN_WORLD,
  NATURAL,
  MOBILE
}

export const InvoiceCarrierTypeToCode: Record<InvoiceCarrierType, string> = {
  [InvoiceCarrierType.PRINT]: "",
  [InvoiceCarrierType.GERRN_WORLD]: "1",
  [InvoiceCarrierType.NATURAL]: "2",
  [InvoiceCarrierType.LOVE_CODE]: "",
  [InvoiceCarrierType.MOBILE]: "3"
};

export default InvoiceCarrierType;
