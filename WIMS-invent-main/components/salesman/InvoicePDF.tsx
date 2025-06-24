'use client';
import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  Font,
  PDFViewer,
} from "@react-pdf/renderer";

// Utility to convert numbers to words (simple version for INR)
function numberToWords(num: number): string {
  const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  function inWords(n: number): string {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
    if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + inWords(n % 100) : "");
    if (n < 100000) return inWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + inWords(n % 1000) : "");
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + inWords(n % 100000) : "");
    return inWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + inWords(n % 10000000) : "");
  }
  return inWords(Math.floor(num)) + " Rupees Only";
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#fff",
    padding: 16,
    fontSize: 8,
    lineHeight: 1.2,
    fontFamily: "Helvetica",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    borderBottom: "1 solid #000",
    paddingBottom: 4,
  },
  logo: {
    width: 60,
    height: 30,
    objectFit: "contain",
    marginHorizontal: 8,
  },
  companyBlock: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
  companyInfo: {
    fontWeight: "bold",
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
  },
  companySub: {
    fontSize: 8,
    textAlign: "center",
  },
  gstin: {
    fontWeight: "bold",
    fontSize: 8,
    textAlign: "center",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 2,
  },
  metaBox: {
    flex: 1,
    border: "1 solid #000",
    padding: 4,
    marginHorizontal: 1,
    fontSize: 8,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 2,
  },
  detailsBox: {
    border: "1 solid #000",
    padding: 4,
    fontSize: 8,
    marginBottom: 2,
    flex: 1,
    marginHorizontal: 1,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 9,
    marginBottom: 2,
    fontFamily: "Helvetica-Bold",
    textDecoration: "underline",
  },
  table: {
    width: "100%",
    border: "1 solid #000",
    marginVertical: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #000",
  },
  tableColHeader: {
    fontWeight: "bold",
    backgroundColor: "#fff",
    borderRight: "1 solid #000",
    padding: 2,
    textAlign: "center",
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
  },
  tableCol: {
    borderRight: "1 solid #000",
    padding: 2,
    textAlign: "center",
    fontSize: 8,
  },
  colSr: { width: "4%" },
  colName: { width: "16%" },
  colHSN: { width: "8%" },
  colUOM: { width: "6%" },
  colQty: { width: "6%" },
  colRate: { width: "8%" },
  colAmt: { width: "8%" },
  colDisc: { width: "8%" },
  colTaxable: { width: "8%" },
  colTax: { width: "6%" },
  colTaxAmt: { width: "6%" },
  colTotal: { width: "8%" },
  summaryBox: {
    border: "1 solid #000",
    padding: 6,
    marginTop: 6,
    fontSize: 8,
    width: "45%",
    alignSelf: "flex-end",
  },
  bankBox: {
    border: "1 solid #000",
    padding: 6,
    marginTop: 6,
    fontSize: 8,
    width: "45%",
  },
  termsBox: {
    border: "1 solid #000",
    padding: 6,
    marginTop: 6,
    fontSize: 8,
    width: "100%",
  },
  signature: {
    marginTop: 10,
    textAlign: "right",
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
  },
  certText: {
    marginTop: 8,
    fontSize: 8,
    textAlign: "left",
  },
});

// Props: invoiceData (object with all fields needed)
export function InvoicePDF({ invoiceData }: { invoiceData: any }) {
  const items = invoiceData.items || [];
  const totalBoxes = items.reduce((sum: number, item: any) => sum + (item.qty || 0), 0);
  const amountInWords = invoiceData.amountInWords || numberToWords(invoiceData.totalAfterTax || 0);

  if (!Array.isArray(items) || items.length === 0) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={{ color: 'red', fontWeight: 'bold', fontSize: 12 }}>
            No items to display in this invoice.
          </Text>
        </Page>
      </Document>
    );
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with both logos and single-line company info */}
        <View style={styles.headerRow}>
          <Image style={styles.logo} src="/logo.jpg" />
          <View style={styles.companyBlock}>
            <Text style={styles.companyInfo}>{invoiceData.companyName || "Company Name"}</Text>
            <Text style={styles.companySub}>{invoiceData.companyAddress || "Company Address"} | {invoiceData.companyContact || "Phone/Email"}</Text>
            <Text style={styles.gstin}>GSTIN: {invoiceData.companyGST || "GSTIN123"}</Text>
          </View>
          <Image style={styles.logo} src="/logo.jpg" />
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <Text style={{ fontWeight: "bold", fontSize: 11, fontFamily: "Helvetica-Bold" }}>INVOICE</Text>
          <Text style={{ border: "1 solid #000", padding: 2, fontSize: 8 }}>Original for Recipient</Text>
        </View>

        {/* Meta Fields Row */}
        <View style={styles.metaRow}>
          <View style={styles.metaBox}>
            <Text>Reverse Charge: No</Text>
            <Text>Invoice No.: {invoiceData.invoiceNo || "123"}</Text>
            <Text>Invoice Date: {invoiceData.invoiceDate || "01/01/2024"}</Text>
            <Text>State: {invoiceData.state || "State"}</Text>
            <Text>State Code: 04</Text>
          </View>
          <View style={styles.metaBox}>
            <Text>Transportation Mode: {invoiceData.transport || "-"}</Text>
            <Text>Vehicle Number: {invoiceData.vehicleNo || "-"}</Text>
            <Text>Supply Date: {invoiceData.supplyDate || invoiceData.invoiceDate || "-"}</Text>
            <Text>Place of Supply: {invoiceData.placeOfSupply || "-"}</Text>
          </View>
        </View>

        {/* Details of Receiver/Consignee */}
        <View style={styles.detailsRow}>
          <View style={styles.detailsBox}>
            <Text style={styles.sectionTitle}>Details of Receiver</Text>
            <Text>Name: {invoiceData.receiverName || "Receiver Name"}</Text>
            <Text>Address: {invoiceData.receiverAddress || "Receiver Address"}</Text>
            <Text>PO Number: {invoiceData.poNumber || "NA"}</Text>
            <Text>GSTIN: {invoiceData.receiverGST || "GSTIN"}</Text>
            <Text>State: {invoiceData.state || "State"}</Text>
            <Text>State Code: 04</Text>
          </View>
          <View style={styles.detailsBox}>
            <Text style={styles.sectionTitle}>Details of Consignee</Text>
            <Text>Name: {invoiceData.consigneeName || "Consignee Name"}</Text>
            <Text>Address: {invoiceData.consigneeAddress || "Consignee Address"}</Text>
            <Text>GSTIN: {invoiceData.consigneeGST || "GSTIN"}</Text>
            <Text>State: {invoiceData.state || "State"}</Text>
            <Text>State Code: 04</Text>
          </View>
        </View>

        {/* Table Header */}
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={[styles.tableColHeader, styles.colSr]}>Sr. No.</Text>
            <Text style={[styles.tableColHeader, styles.colName]}>Name of Product/Service</Text>
            <Text style={[styles.tableColHeader, styles.colHSN]}>HSN/ACS</Text>
            <Text style={[styles.tableColHeader, styles.colUOM]}>UOM</Text>
            <Text style={[styles.tableColHeader, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableColHeader, styles.colRate]}>Rate</Text>
            <Text style={[styles.tableColHeader, styles.colAmt]}>Amount</Text>
            <Text style={[styles.tableColHeader, styles.colDisc]}>Less:Discount</Text>
            <Text style={[styles.tableColHeader, styles.colTaxable]}>Taxable Value</Text>
            <Text style={[styles.tableColHeader, styles.colTax]}>CGST</Text>
            <Text style={[styles.tableColHeader, styles.colTax]}>Rate</Text>
            <Text style={[styles.tableColHeader, styles.colTaxAmt]}>Amt.</Text>
            <Text style={[styles.tableColHeader, styles.colTax]}>SGST/UTGST</Text>
            <Text style={[styles.tableColHeader, styles.colTax]}>Rate</Text>
            <Text style={[styles.tableColHeader, styles.colTaxAmt]}>Amt.</Text>
            <Text style={[styles.tableColHeader, styles.colTax]}>IGST</Text>
            <Text style={[styles.tableColHeader, styles.colTax]}>Rate</Text>
            <Text style={[styles.tableColHeader, styles.colTaxAmt]}>Amt.</Text>
            <Text style={[styles.tableColHeader, styles.colTotal]}>Total</Text>
          </View>
          {items.map((item: any, idx: number) => (
            <View style={styles.tableRow} key={idx}>
              <Text style={[styles.tableCol, styles.colSr]}>{idx + 1}</Text>
              <Text style={[styles.tableCol, styles.colName]}>{item.name}</Text>
              <Text style={[styles.tableCol, styles.colHSN]}>{item.hsn}</Text>
              <Text style={[styles.tableCol, styles.colUOM]}>{item.uom}</Text>
              <Text style={[styles.tableCol, styles.colQty]}>{item.qty}</Text>
              <Text style={[styles.tableCol, styles.colRate]}>{item.rate}</Text>
              <Text style={[styles.tableCol, styles.colAmt]}>{item.amount}</Text>
              <Text style={[styles.tableCol, styles.colDisc]}>{item.discount || "-"}</Text>
              <Text style={[styles.tableCol, styles.colTaxable]}>{item.taxable || item.amount}</Text>
              <Text style={[styles.tableCol, styles.colTax]}>{item.cgst || "-"}</Text>
              <Text style={[styles.tableCol, styles.colTax]}>{item.cgstRate || "-"}</Text>
              <Text style={[styles.tableCol, styles.colTaxAmt]}>{item.cgstAmt || "-"}</Text>
              <Text style={[styles.tableCol, styles.colTax]}>{item.sgst || "-"}</Text>
              <Text style={[styles.tableCol, styles.colTax]}>{item.sgstRate || "-"}</Text>
              <Text style={[styles.tableCol, styles.colTaxAmt]}>{item.sgstAmt || "-"}</Text>
              <Text style={[styles.tableCol, styles.colTax]}>{item.igst || "-"}</Text>
              <Text style={[styles.tableCol, styles.colTax]}>{item.igstRate || "-"}</Text>
              <Text style={[styles.tableCol, styles.colTaxAmt]}>{item.igstAmt || "-"}</Text>
              <Text style={[styles.tableCol, styles.colTotal]}>{item.total}</Text>
            </View>
          ))}
        </View>

        {/* Totals Section and Summary Box */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 12 }}>
          <View style={{ flex: 1 }}>
            <Text>Total Number of Boxes: {totalBoxes}</Text>
            <Text>Total Invoice Amount in Words: {amountInWords}</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text>Total Amount Before Tax: {invoiceData.totalBeforeTax}</Text>
            <Text>Add: CGST/SGST/IGST: {invoiceData.totalTax}</Text>
            <Text>Total Amount After Tax: {invoiceData.totalAfterTax}</Text>
          </View>
        </View>

        {/* Bank Details, Terms, Signature */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 12 }}>
          <View style={styles.bankBox}>
            <Text style={{ fontWeight: "bold", marginBottom: 2 }}>Bank Details:</Text>
            <Text>{invoiceData.bankDetails || "Bank Name, Account No, IFSC"}</Text>
          </View>
          <View style={styles.termsBox}>
            <Text style={{ fontWeight: "bold", marginBottom: 2 }}>Terms and Conditions:</Text>
            <Text>{invoiceData.terms || "1. Bank and other charges will be borne by the client. 2. 100% Advance Payment on delivery."}</Text>
          </View>
        </View>

        <Text style={styles.certText}>
          Certified that the particulars given above are true and correct.
        </Text>
        <Text style={styles.signature}>
          For {invoiceData.companyName || "Company Name"}
          {"\n"}
          (Authorised Signatory)
        </Text>
      </Page>
    </Document>
  );
}

export default function InvoicePreview() {
  const testData = {
    companyName: "Firani Enterprises",
    companyAddress: "123 Main St, City, State",
    companyContact: "9876543210, email@company.com",
    companyGST: "22AAAAA0000A1Z5",
    invoiceNo: "OID002",
    invoiceDate: "2024-06-24",
    state: "Delhi",
    transport: "Road",
    placeOfSupply: "Delhi",
    receiverName: "Test Client",
    receiverAddress: "Client Address",
    receiverGST: "22BBBBB0000B1Z5",
    consigneeName: "Test Consignee",
    consigneeAddress: "Consignee Address",
    consigneeGST: "22CCCCC0000C1Z5",
    items: [
      { name: "Product A", hsn: "1234", uom: "pcs", qty: 10, rate: 100, amount: 1000, taxable: 1000, cgst: 90, sgst: 90, igst: 0, total: 1180 },
      { name: "Product B", hsn: "5678", uom: "pcs", qty: 5, rate: 200, amount: 1000, taxable: 1000, cgst: 90, sgst: 90, igst: 0, total: 1180 }
    ],
    totalBeforeTax: 2000,
    totalTax: 360,
    totalAfterTax: 2360,
    bankDetails: "Bank: XYZ Bank, A/C: 123456789, IFSC: XYZB0000001",
    terms: "1. Payment due on delivery. 2. Goods once sold will not be taken back.",
  };

  return (
    <PDFViewer width="100%" height="800">
      <InvoicePDF invoiceData={testData} />
    </PDFViewer>
  );
} 