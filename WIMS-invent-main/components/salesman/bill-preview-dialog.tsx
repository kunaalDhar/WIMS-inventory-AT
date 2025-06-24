import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download } from "lucide-react";
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import { InvoicePDF } from "./InvoicePDF";
import type { Order, Bill } from "@/contexts/order-context";

interface BillPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill: Bill;
  order: Order;
}

export function BillPreviewDialog({ open, onOpenChange, bill, order }: BillPreviewDialogProps) {
  if (!bill || !order) {
    console.log("BillPreviewDialog: bill or order missing", { bill, order });
    return null;
  }

  // Map bill/order data to invoiceData for InvoicePDF
  const invoiceData = {
    companyName: "Fresca Juices (Dikonia IT & Telecom Solutions)",
    companyAddress: "Building No. 803, Near Old Airport, VIP Road, Chandigarh 160102",
    companyContact: "Phone: 0124-5015000, 9915551188 | GSTIN: 04AAGFD2855A2ZO",
    companyGST: "04AAGFD2855A2ZO",
    logoLeft: "/logo.jpg",
    logoRight: "/logo.jpg",
    invoiceNo: bill.orderNumber,
    invoiceDate: new Date(bill.generatedAt).toLocaleDateString(),
    state: order.state || "Chandigarh",
    receiverName: bill.clientName,
    receiverAddress: order.clientAddress || "",
    receiverGST: bill.gstNumber || "",
    transport: bill.transport || "",
    placeOfSupply: order.state || "Chandigarh",
    consigneeName: bill.clientName,
    consigneeAddress: order.clientAddress || "",
    consigneeGST: bill.gstNumber || "",
    items: bill.items.map((item: any) => ({
      name: item.name,
      hsn: item.hsn || "",
      uom: item.unit || "",
      qty: item.requestedQuantity,
      rate: item.unitPrice,
      amount: item.unitPrice * item.requestedQuantity,
      taxable: item.taxable || item.unitPrice * item.requestedQuantity,
      cgst: item.cgst || 0,
      sgst: item.sgst || 0,
      igst: item.igst || 0,
      total: item.total || item.unitPrice * item.requestedQuantity,
    })),
    totalBeforeTax: bill.subtotal,
    totalTax: bill.tax,
    totalAfterTax: bill.total,
    amountInWords: bill.amountInWords || "",
    bankDetails: "State Bank of India, A/C: 123456789, IFSC: SBIN0000001",
    terms: "1. Bank and other charges will be borne by the client. 2. 100% Advance Payment on delivery.",
  };

  console.log("BillPreviewDialog: bill", bill);
  console.log("BillPreviewDialog: order", order);
  console.log("BillPreviewDialog: invoiceData", invoiceData);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Invoice Preview - {bill.orderNumber}</span>
            {bill.billType === "gst" && <Badge className="bg-green-600">GST Invoice</Badge>}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-end space-x-2">
            <PDFDownloadLink
              document={<InvoicePDF invoiceData={invoiceData} />}
              fileName={`Invoice-${bill.orderNumber}.pdf`}
            >
              {({ loading }) => (
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  {loading ? "Preparing PDF..." : "Download PDF"}
                </Button>
              )}
            </PDFDownloadLink>
          </div>
          <div style={{ width: "100%", height: "80vh", minHeight: 500 }}>
            <PDFViewer width="100%" height="100%" showToolbar>
              <InvoicePDF invoiceData={invoiceData} />
            </PDFViewer>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
