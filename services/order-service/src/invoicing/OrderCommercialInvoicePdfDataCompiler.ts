/**
 * International Order Commercial Invoice Data Compiler
 * Aggregates customs item descriptions, country of origin codes, Incoterms 2020 rules, and currency conversion lines.
 */

export interface ICommercialInvoiceData {
  invoiceNumber: string;
  orderReference: string;
  incoterms: 'FOB' | 'CIF' | 'DDP' | 'EXW' | 'DAP';
  shipperDetails: { name: string; address: string; taxId: string };
  consigneeDetails: { name: string; address: string; taxId: string };
  currency: string;
  exchangeRateToUSD: number;
  lineItems: Array<{
    lineNumber: number;
    sku: string;
    description: string;
    hsTariffCode: string;
    countryOfOrigin: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    weightKg: number;
  }>;
  grossWeightKg: number;
  netWeightKg: number;
  subtotalAmount: number;
  freightCharge: number;
  insuranceCharge: number;
  grandTotalAmount: number;
  declarationStatement: string;
}

export class OrderCommercialInvoicePdfDataCompiler {
  public compileInvoice(
    orderId: string,
    incoterms: ICommercialInvoiceData['incoterms'],
    shipper: ICommercialInvoiceData['shipperDetails'],
    consignee: ICommercialInvoiceData['consigneeDetails'],
    items: ICommercialInvoiceData['lineItems'],
    freightUSD: number,
    insuranceUSD: number
  ): ICommercialInvoiceData {
    let subtotal = 0;
    let netWeight = 0;

    items.forEach((item, idx) => {
      item.lineNumber = idx + 1;
      item.totalPrice = +(item.unitPrice * item.quantity).toFixed(2);
      subtotal += item.totalPrice;
      netWeight += item.weightKg;
    });

    const grandTotal = +(subtotal + freightUSD + insuranceUSD).toFixed(2);
    const grossWeight = +(netWeight * 1.08).toFixed(2); // 8% tare packaging allowance

    return {
      invoiceNumber: 'INV-COMM-' + Date.now().toString(36).toUpperCase(),
      orderReference: orderId,
      incoterms,
      shipperDetails: shipper,
      consigneeDetails: consignee,
      currency: 'USD',
      exchangeRateToUSD: 1.0,
      lineItems: items,
      grossWeightKg: grossWeight,
      netWeightKg: netWeight,
      subtotalAmount: +subtotal.toFixed(2),
      freightCharge: freightUSD,
      insuranceCharge: insuranceUSD,
      grandTotalAmount: grandTotal,
      declarationStatement: 'We hereby certify that this commercial invoice is true and correct, and the products originate from the specified jurisdictions.'
    };
  }
}
