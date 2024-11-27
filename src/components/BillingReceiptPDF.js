import jsPDF from 'jspdf';
import 'jspdf-autotable';
import dayjs from 'dayjs';

export const generateReceiptPDF = (billing) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;
  const lineHeight = 7;
  const leftMargin = 20;
  
  // Helper function for centered text
  const addCenteredText = (text, y, fontSize = 12) => {
    doc.setFontSize(fontSize);
    const textWidth = doc.getTextWidth(text);
    const x = (pageWidth - textWidth) / 2;
    doc.text(text, x, y);
    return doc;
  };

  // Helper function for adding left-aligned text with label
  const addLabelValuePair = (label, value, y, valueXPos = 80) => {
    doc.setFontSize(10);
    doc.text(label, leftMargin, y);
    doc.text(': ' + value, valueXPos, y);
    return doc;
  };

  // Hospital Header
  addCenteredText('CHANRE HOSPITAL', yPos, 16);
  yPos += lineHeight;
  addCenteredText('123 Hospital Street, City - 123456', yPos, 10);
  yPos += lineHeight;
  addCenteredText('Phone: +91 1234567890 | Email: info@chanre.com', yPos, 10);
  yPos += lineHeight * 1.5;

  // Receipt Title
  addCenteredText('RECEIPT', yPos, 14);
  yPos += lineHeight * 1.5;

  // Basic Information
  addLabelValuePair('Receipt No', billing.receiptNumber, yPos);
  addLabelValuePair('Date', dayjs(billing.date).format('DD/MM/YYYY'), yPos, 150);
  yPos += lineHeight;

  addLabelValuePair('Patient Name', billing.patientId?.name || '', yPos);
  addLabelValuePair('Patient ID', billing.patientId?._id || '', yPos, 150);
  yPos += lineHeight;

  addLabelValuePair('Doctor Name', billing.doctorId?.name || '', yPos);
  yPos += lineHeight * 1.5;

  // Billing Items Table
  const tableColumns = [
    { header: 'Item Description', dataKey: 'name' },
    { header: 'Qty', dataKey: 'quantity' },
    { header: 'Price', dataKey: 'price' },
    { header: 'Tax', dataKey: 'tax' },
    { header: 'Total', dataKey: 'total' }
  ];

  const tableRows = billing.billingItems?.map(item => ({
    name: item.name,
    quantity: item.quantity,
    price: item.price?.toFixed(2),
    tax: item.tax?.toFixed(2),
    total: item.total?.toFixed(2)
  })) || [];

  doc.autoTable({
    columns: tableColumns,
    body: tableRows,
    startY: yPos,
    margin: { left: leftMargin },
    headStyles: { 
      fillColor: [220, 220, 220], 
      textColor: [0, 0, 0], 
      fontStyle: 'bold' 
    },
    styles: { 
      fontSize: 10,
      cellPadding: 3
    },
    theme: 'grid'
  });

  yPos = doc.lastAutoTable.finalY + 10;

  // Payment Summary
  const addSummaryLine = (label, value) => {
    addLabelValuePair(label, value, yPos, 150);
    yPos += lineHeight;
  };

  addSummaryLine('Subtotal', `₹ ${billing.totals?.subtotal?.toFixed(2) || '0.00'}`);
  addSummaryLine('Total Tax', `₹ ${billing.totals?.totalTax?.toFixed(2) || '0.00'}`);
  addSummaryLine('Discount', `${billing.discount?.value || '0'} ${billing.discount?.type === 'percent' ? '%' : 'INR'}`);
  addSummaryLine('Grand Total', `₹ ${billing.totals?.grandTotal?.toFixed(2) || '0.00'}`);
  addSummaryLine('Amount Paid', `₹ ${billing.payment?.paid?.toFixed(2) || '0.00'}`);
  addSummaryLine('Balance', `₹ ${billing.totals?.balance?.toFixed(2) || '0.00'}`);
  yPos += lineHeight;

  // Footer
  addLabelValuePair('Payment Mode', (billing.payment?.type || '').toUpperCase(), yPos);
  yPos += lineHeight;
  addLabelValuePair('Payment Status', (billing.remarks || '').toUpperCase(), yPos);

  // Save the PDF
  doc.save(`Receipt-${billing.receiptNumber}.pdf`);
};

export default generateReceiptPDF;