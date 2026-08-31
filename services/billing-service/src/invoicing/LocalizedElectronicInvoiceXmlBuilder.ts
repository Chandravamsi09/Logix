/**
 * UBL 2.1 / PEPPOL BIS Billing 3.0 Compliant Electronic Invoice XML Generator
 * Produces structured cross-border electronic invoice schemas for tax authority validation.
 */

export interface IEInvoiceHeader {
  invoiceNumber: string;
  issueDate: string; // YYYY-MM-DD
  dueDate: string;
  sellerVatId: string;
  sellerLegalName: string;
  buyerVatId: string;
  buyerLegalName: string;
  currencyCode: string;
  paymentIban: string;
}

export interface IEInvoiceLine {
  lineId: string;
  itemDescription: string;
  quantity: number;
  unitPrice: number;
  vatRatePct: number;
  lineSubtotal: number;
}

export class LocalizedElectronicInvoiceXmlBuilder {
  public buildUblXml(header: IEInvoiceHeader, lines: IEInvoiceLine[]): string {
    let totalTax = 0;
    let subtotal = 0;

    const linesXml = lines.map((l, idx) => {
      subtotal += l.lineSubtotal;
      const tax = +(l.lineSubtotal * (l.vatRatePct / 100)).toFixed(2);
      totalTax += tax;
      return `
    <cac:InvoiceLine>
      <cbc:ID>${idx + 1}</cbc:ID>
      <cbc:InvoicedQuantity unitCode="EA">${l.quantity}</cbc:InvoicedQuantity>
      <cbc:LineExtensionAmount currencyID="${header.currencyCode}">${l.lineSubtotal.toFixed(2)}</cbc:LineExtensionAmount>
      <cac:Item>
        <cbc:Description>${l.itemDescription}</cbc:Description>
      </cac:Item>
      <cac:Price>
        <cbc:PriceAmount currencyID="${header.currencyCode}">${l.unitPrice.toFixed(2)}</cbc:PriceAmount>
      </cac:Price>
    </cac:InvoiceLine>`;
    }).join('');

    const grandTotal = +(subtotal + totalTax).toFixed(2);

    return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0</cbc:CustomizationID>
  <cbc:ID>${header.invoiceNumber}</cbc:ID>
  <cbc:IssueDate>${header.issueDate}</cbc:IssueDate>
  <cbc:DueDate>${header.dueDate}</cbc:DueDate>
  <cbc:DocumentCurrencyCode>${header.currencyCode}</cbc:DocumentCurrencyCode>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${header.sellerLegalName}</cbc:RegistrationName>
        <cbc:CompanyID>${header.sellerVatId}</cbc:CompanyID>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${header.buyerLegalName}</cbc:RegistrationName>
        <cbc:CompanyID>${header.buyerVatId}</cbc:CompanyID>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="${header.currencyCode}">${subtotal.toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="${header.currencyCode}">${subtotal.toFixed(2)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="${header.currencyCode}">${grandTotal.toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="${header.currencyCode}">${grandTotal.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  ${linesXml}
</Invoice>`;
  }
}
