import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllReceipts, fetchBillDetailsByReceiptNumber } from '@/redux/actions/billingActions';
import Layout from '@/components/Layout';
import DataTable from 'react-data-table-component';
import { Calendar, IndianRupeeIcon, FileText, Loader2, ChevronRight, ChevronDown, Eye, Download, AlertTriangle } from 'lucide-react';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const CollectionReport = () => {
  const dispatch = useDispatch();
  const { receipts, receiptsLoading, receiptsError } = useSelector((state) => state.billing);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filteredCollections, setFilteredCollections] = useState([]);
  const [filteredRefunds, setFilteredRefunds] = useState([]);
  const [paymentTypeFilter, setPaymentTypeFilter] = useState('all');
  const [receiptTypeFilter, setReceiptTypeFilter] = useState('all');
  const [summary, setSummary] = useState({
    amountCollected: { cash: 0, card: 0, upi: 0, neft: 0 },
    duesCollected: { cash: 0, card: 0, upi: 0, neft: 0 },
    totalAmount: { cash: 0, card: 0, upi: 0, neft: 0 },
    refunds: { cash: 0, card: 0, upi: 0, neft: 0 },
    totalRefunds: 0,
    grossTotal: 0,
    grandTotal: 0,
    totalTransactions: 0,
    totalRefundTransactions: 0
  });

  // Fetch all receipt types including cancellations
  useEffect(() => {
    const filters = {
      page: 1,
      limit: 1000
    };
    dispatch(fetchAllReceipts(filters));
  }, [dispatch]);

  // FIXED: Updated filter and calculation logic with proper date filtering
  useEffect(() => {
    if (receipts?.receipts?.length || receipts?.length) {
      const receiptData = receipts?.receipts || receipts;

      // Filter collections (payment and creation receipts)
      let filteredCollectionsData = receiptData.filter(receipt => {
        // Include both payment and creation type receipts that have amounts
        if (!['payment', 'creation'].includes(receipt.type) || !receipt.amount || receipt.amount <= 0) {
          return false;
        }

        // FIXED: Proper date filter
        if (dateFrom && dateTo) {
          const receiptDate = dayjs(receipt.date).format('YYYY-MM-DD');
          const fromDate = dayjs(dateFrom).format('YYYY-MM-DD');
          const toDate = dayjs(dateTo).format('YYYY-MM-DD');

          if (receiptDate < fromDate || receiptDate > toDate) {
            return false;
          }
        }

        // Payment type filter
        if (paymentTypeFilter !== 'all' && receipt.paymentMethod?.type !== paymentTypeFilter) {
          return false;
        }

        // Receipt type filter
        if (receiptTypeFilter !== 'all' && receipt.type !== receiptTypeFilter) {
          return false;
        }

        return true;
      });

      // Filter refunds (cancellation receipts)
      let filteredRefundsData = receiptData.filter(receipt => {
        // Include only cancellation type receipts
        if (receipt.type !== 'cancellation') {
          return false;
        }

        // FIXED: Proper date filter for refunds
        if (dateFrom && dateTo) {
          const receiptDate = dayjs(receipt.date).format('YYYY-MM-DD');
          const fromDate = dayjs(dateFrom).format('YYYY-MM-DD');
          const toDate = dayjs(dateTo).format('YYYY-MM-DD');

          if (receiptDate < fromDate || receiptDate > toDate) {
            return false;
          }
        }

        // Payment type filter for refunds
        if (paymentTypeFilter !== 'all' && receipt.paymentMethod?.type !== paymentTypeFilter) {
          return false;
        }

        return true;
      });

      setFilteredCollections(filteredCollectionsData);
      setFilteredRefunds(filteredRefundsData);
      calculateSummary(filteredCollectionsData, filteredRefundsData);
    }
  }, [receipts, dateFrom, dateTo, paymentTypeFilter, receiptTypeFilter]);

  // FIXED: Updated calculateSummary function to properly handle refunds
  const calculateSummary = (collections, refunds) => {
    // Calculate collections summary
    const collectionsTotal = collections.reduce((acc, receipt) => {
      const paymentType = (receipt.paymentMethod?.type || 'cash').toLowerCase();
      const amount = receipt.amount || 0;

      if (receipt.type === 'creation') {
        acc.amountCollected[paymentType] += amount;
      } else if (receipt.type === 'payment') {
        acc.duesCollected[paymentType] += amount;
      }

      acc.totalAmount[paymentType] = acc.amountCollected[paymentType] + acc.duesCollected[paymentType];
      acc.totalTransactions += 1;

      return acc;
    }, {
      amountCollected: { cash: 0, card: 0, upi: 0, neft: 0 },
      duesCollected: { cash: 0, card: 0, upi: 0, neft: 0 },
      totalAmount: { cash: 0, card: 0, upi: 0, neft: 0 },
      totalTransactions: 0
    });

    // Calculate refunds summary
    const refundsTotal = refunds.reduce((acc, receipt) => {
      const paymentType = (receipt.paymentMethod?.type || 'cash').toLowerCase();
      const amount = receipt.amount || 0;

      acc.refunds[paymentType] += amount;
      acc.totalRefundTransactions += 1;

      return acc;
    }, {
      refunds: { cash: 0, card: 0, upi: 0, neft: 0 },
      totalRefundTransactions: 0
    });

    const totalRefunds = Object.values(refundsTotal.refunds).reduce((sum, amount) => sum + amount, 0);
    const grossTotal = Object.values(collectionsTotal.totalAmount).reduce((sum, amount) => sum + amount, 0);

    // FIXED: Net total excludes refunds (gross collections - refunds)
    const newSummary = {
      ...collectionsTotal,
      ...refundsTotal,
      totalRefunds,
      grossTotal, // Total including what was later refunded
      grandTotal: grossTotal - totalRefunds // Net total after excluding refunds
    };

    setSummary(newSummary);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const generateReceiptPDF = async (receipt) => {
    if (!receipt.billingId?._id) {
      console.error('No billing ID found in receipt');
      return;
    }

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPos = 20;
      const leftMargin = 15;
      const rightMargin = pageWidth - 15;
      const lineHeight = 7;

      // Enhanced number to words function
      const numberToWords = (amount) => {
        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        const thousands = ['', 'Thousand', 'Lakh', 'Crore'];

        if (amount === 0) return 'Zero';

        const convertThousands = (num) => {
          let result = '';
          let thousandCounter = 0;

          while (num > 0) {
            let remainder = num % 1000;
            if (remainder !== 0) {
              let str = convertHundreds(remainder);
              if (thousandCounter > 0) {
                str += ' ' + thousands[thousandCounter];
              }
              result = str + ' ' + result;
            }
            num = Math.floor(num / 1000);
            thousandCounter++;
          }

          return result.trim();
        };

        const convertHundreds = (num) => {
          let result = '';

          if (num >= 100) {
            result += ones[Math.floor(num / 100)] + ' Hundred ';
            num %= 100;
          }

          if (num >= 20) {
            result += tens[Math.floor(num / 10)] + ' ';
            num %= 10;
          } else if (num >= 10) {
            result += teens[num - 10] + ' ';
            return result.trim();
          }

          if (num > 0) {
            result += ones[num] + ' ';
          }

          return result.trim();
        };

        return convertThousands(Math.floor(amount));
      };

      // Helper functions
      const addText = (text, x, y, fontSize = 10, style = 'normal', align = 'left') => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', style);
        if (align === 'right') {
          const textWidth = doc.getTextWidth(text);
          x = x - textWidth;
        } else if (align === 'center') {
          const textWidth = doc.getTextWidth(text);
          x = x - (textWidth / 2);
        }
        doc.text(text, x, y);
      };

      const addCenteredText = (text, y, fontSize = 10, style = 'normal') => {
        addText(text, pageWidth / 2, y, fontSize, style, 'center');
      };

      const addLine = (y, thickness = 0.5, startX = leftMargin, endX = rightMargin) => {
        doc.setLineWidth(thickness);
        doc.line(startX, y, endX, y);
      };

      const addBox = (x, y, width, height) => {
        doc.setLineWidth(0.5);
        doc.rect(x, y, width, height);
      };

      // Calculate age from DOB
      const calculateAge = (dob) => {
        if (!dob) return 'N/A';
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();

        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
          age--;
        }

        let ageString = `${age}Y`;

        if (monthDiff >= 0) {
          const months = monthDiff + (dayDiff < 0 ? -1 : 0);
          if (months > 0) ageString += ` ${months}M`;
        }

        if (dayDiff >= 0) {
          ageString += ` ${dayDiff}D`;
        }

        return ageString;
      };

      // Extract and prepare data
      const billing = receipt.billingId;
      const patient = billing?.patientId;
      console.log(patient)
      const doctor = billing?.doctorId;
      const amount = receipt.amount || 0;
      const amountInWords = numberToWords(amount);

      // Patient details
      const patientName = patient ? `${patient.firstName || ''} ${patient.lastName || ''}`.trim() : 'N/A';
      const patientAge = calculateAge(patient?.dob);
      const patientGender = patient?.gender || 'N/A';
      const consultantName = doctor?.name || 'N/A';
      const billNumber = receipt.billNumber || billing?.billNumber || 'N/A';
      const fileNumber = patient?.patientId || 'N/A';
      const receiptNumber = receipt.receiptNumber || 'N/A';
      const visitDate = dayjs(receipt.date).format('DD-MM-YYYY hh:mm:A');
      const collectedBy = receipt.createdBy?.name || 'N/A';
      const receiptDate = dayjs(receipt.createdAt).format('DD-MM-YYYY hh:mm:A');

      // HEADER SECTION
      addCenteredText('CHANRE VEENA RHEUMATOLOGY & IMMUNOLOGY CENTER', yPos, 16, 'bold');
      yPos += 8;

      addCenteredText('#531/B, 19th Main, HSR 3rd Sector, Bengaluru-102', yPos, 10);
      yPos += 6;

      addCenteredText('PH- 080-44214500, Email: infochanreveena@chanrericr.com', yPos, 10);
      yPos += 10;

      // Add receipt type indicator
      if (receipt.type === 'cancellation') {
        addCenteredText('*** REFUND RECEIPT ***', yPos, 12, 'bold');
        yPos += 8;
      }

      // Horizontal line under header
      addLine(yPos, 1);
      yPos += 10;

      // PATIENT INFORMATION SECTION
      // Line 1
      addText(`Name : ${patientName}`, leftMargin, yPos, 9);
      addText(`Date : ${visitDate}`, leftMargin + 95, yPos, 9);
      yPos += 6;

      // Line 2  
      addText(`Consultant Name : ${consultantName}`, leftMargin, yPos, 9);
      yPos += 6;

      // Line 3
      addText(`Bill No : ${billNumber}`, leftMargin, yPos, 9);
      addText(`File No : ${fileNumber}`, leftMargin + 80, yPos, 9);
      addText(`Receipt No. : ${receiptNumber}`, leftMargin + 140, yPos, 9);
      yPos += 6;

      // Line 4
      addText(`Sex : ${patientGender.charAt(0).toUpperCase()}`, leftMargin, yPos, 9);
      addText(`Age : ${patientAge}`, leftMargin + 60, yPos, 9);
      yPos += 12;

      // PAYMENT TABLE
      const tableStartY = yPos;
      const tableHeight = 25;
      const colWidths = [50, 70, 50];
      const colPositions = [leftMargin, leftMargin + colWidths[0], leftMargin + colWidths[0] + colWidths[1]];

      // Table border
      addBox(leftMargin, tableStartY, rightMargin - leftMargin, tableHeight);

      // Header row
      addLine(tableStartY + 8, 0.5, leftMargin, rightMargin);
      addText('Payment Date', colPositions[0] + 2, tableStartY + 6, 9, 'bold');
      addText('Transaction Type', colPositions[1] + 2, tableStartY + 6, 9, 'bold');
      addText('Payment Mode', colPositions[2] + 2, tableStartY + 6, 9, 'bold');

      // Vertical lines
      addLine(tableStartY, 0.5, colPositions[1], colPositions[1]);
      addLine(tableStartY + tableHeight, 0.5, colPositions[1], colPositions[1]);
      addLine(tableStartY, 0.5, colPositions[2], colPositions[2]);
      addLine(tableStartY + tableHeight, 0.5, colPositions[2], colPositions[2]);

      // Data row
      const paymentDate = dayjs(receipt.date).format('DD-MM-YYYY');
      let transactionType;
      if (receipt.type === 'creation') {
        transactionType = 'Initial Payment';
      } else if (receipt.type === 'payment') {
        transactionType = receipt.newStatus === 'paid' ? 'Due Payment (Full)' : 'Due Payment (Partial)';
      } else if (receipt.type === 'cancellation') {
        transactionType = 'Refund';
      }

      const paymentMode = (receipt.paymentMethod?.type || 'Cash').charAt(0).toUpperCase() +
        (receipt.paymentMethod?.type || 'Cash').slice(1);

      addText(paymentDate, colPositions[0] + 2, tableStartY + 18, 9);
      addText(transactionType, colPositions[1] + 2, tableStartY + 18, 9);
      addText(paymentMode, colPositions[2] + 2, tableStartY + 18, 9);

      yPos = tableStartY + tableHeight + 8;

      // TOTAL AMOUNT
      const amountLabel = receipt.type === 'cancellation' ? 'Refund Amount' : 'Total Amount';
      addText(amountLabel, leftMargin, yPos, 11, 'bold');
      addText(`Rs. ${formatCurrency(amount)}`, rightMargin, yPos, 11, 'bold', 'right');
      yPos += 10;

      // ADDITIONAL PAYMENT DETAILS
      if (receipt.paymentMethod?.cardNumber) {
        addText(`Card Number: ****${receipt.paymentMethod.cardNumber.slice(-4)}`, leftMargin, yPos, 8);
        yPos += 6;
      }

      if (receipt.paymentMethod?.utrNumber) {
        addText(`UTR Number: ${receipt.paymentMethod.utrNumber}`, leftMargin, yPos, 8);
        yPos += 6;
      }

      if (receipt.remarks) {
        yPos += 4;
        addText('Remarks:', leftMargin, yPos, 9, 'bold');
        yPos += 6;

        // Split long remarks into multiple lines
        const remarkLines = doc.splitTextToSize(receipt.remarks, rightMargin - leftMargin - 10);
        remarkLines.forEach(line => {
          addText(line, leftMargin, yPos, 8);
          yPos += 5;
        });
      }

      // PAID AMOUNT SECTION (moved to bottom)
      yPos += 10;
      const amountText = receipt.type === 'cancellation' ? 'Refund Amount' : 'Paid Amount';
      addText(`${amountText} : (Rs.) ${amountInWords} Only`, leftMargin, yPos, 11, 'bold');
      yPos += 8;

      // COLLECTION INFO (moved to bottom)
      addText(`Processed By: ${collectedBy}`, leftMargin, yPos, 9);
      addText(receiptDate, rightMargin - 60, yPos, 9);
      yPos += 8;

      // HOME COLLECTION NOTE (moved to bottom)
      addCenteredText('"For Home Sample Collection" Miss Call Number 080-44214500', yPos, 8);
      yPos += 8;

      // FOOTER
      const footerY = pageHeight - 25;
      addLine(footerY - 5, 0.5);
      addText('Thank you for visiting us!', leftMargin, footerY, 9, 'bold');
      addText(`Receipt generated on: ${dayjs().format('DD-MM-YYYY hh:mm:A')}`, rightMargin, footerY, 8, 'normal', 'right');

      // Generate and print PDF
      const pdfOutput = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfOutput);
      const printWindow = window.open(pdfUrl);

      if (printWindow) {
        printWindow.onload = () => {
          printWindow.document.title = `Receipt-${receiptNumber}`;
          printWindow.print();
          printWindow.onafterprint = () => {
            printWindow.close();
            URL.revokeObjectURL(pdfUrl);
          };
        };
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating receipt. Please try again.');
    }
  };

  const handleExport = () => {
    const exportData = filteredCollections.map((receipt, index) => {
      const billing = receipt?.billingId;
      const patient = billing?.patientId;
      const doctor = billing?.doctorId;

      return {
        'S.No.': index + 1,
        'Date': dayjs(receipt.date).format('DD/MM/YYYY'),
        'Receipt Number': receipt.receiptNumber || 'N/A',
        'Bill Number': receipt.billNumber || billing?.billNumber || 'N/A',
        'Type': receipt.type === 'creation' ? 'Initial Payment' : 'Due Payment',
        'Patient ID': patient?.patientId || 'N/A',
        'Patient Name': patient ? `${patient.firstName || ''} ${patient.lastName || ''}`.trim() : 'N/A',
        'Doctor Name': doctor?.name || 'N/A',
        'Payment Mode': (receipt.paymentMethod?.type || 'N/A').toUpperCase(),
        'Amount': receipt.amount || 0,
        'Previous Status': receipt.previousStatus || 'N/A',
        'New Status': receipt.newStatus || 'N/A',
        'Created By': receipt.createdBy?.name || 'N/A'
      };
    });

    const refundData = filteredRefunds.map((receipt, index) => {
      const billing = receipt?.billingId;
      const patient = billing?.patientId;
      const doctor = billing?.doctorId;

      return {
        'S.No.': index + 1,
        'Date': dayjs(receipt.date).format('DD/MM/YYYY'),
        'Receipt Number': receipt.receiptNumber || 'N/A',
        'Bill Number': receipt.billNumber || billing?.billNumber || 'N/A',
        'Patient ID': patient?.patientId || 'N/A',
        'Patient Name': patient ? `${patient.firstName || ''} ${patient.lastName || ''}`.trim() : 'N/A',
        'Doctor Name': doctor?.name || 'N/A',
        'Refund Mode': (receipt.paymentMethod?.type || 'N/A').toUpperCase(),
        'Refund Amount': receipt.amount || 0,
        'Reason': receipt.remarks || 'Bill Cancelled',
        'Created By': receipt.createdBy?.name || 'N/A'
      };
    });

    const wb = XLSX.utils.book_new();

    // Collections sheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws, "Collections");

    // Refunds sheet
    if (refundData.length > 0) {
      const refundWs = XLSX.utils.json_to_sheet(refundData);
      XLSX.utils.book_append_sheet(wb, refundWs, "Refunds");
    }

    // Summary sheet
    const summaryData = [{
      'Cash Initial Payments': summary.amountCollected.cash,
      'Card Initial Payments': summary.amountCollected.card,
      'UPI Initial Payments': summary.amountCollected.upi,
      'NEFT Initial Payments': summary.amountCollected.neft,
      'Cash Due Payments': summary.duesCollected.cash,
      'Card Due Payments': summary.duesCollected.card,
      'UPI Due Payments': summary.duesCollected.upi,
      'NEFT Due Payments': summary.duesCollected.neft,
      'Cash Refunds': summary.refunds.cash,
      'Card Refunds': summary.refunds.card,
      'UPI Refunds': summary.refunds.upi,
      'NEFT Refunds': summary.refunds.neft,
      'Total Cash': summary.totalAmount.cash,
      'Total Card': summary.totalAmount.card,
      'Total UPI': summary.totalAmount.upi,
      'Total NEFT': summary.totalAmount.neft,
      'Total Refunds': summary.totalRefunds,
      'Net Collections': summary.grandTotal,
      'Total Transactions': summary.totalTransactions
    }];
    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

    XLSX.writeFile(wb, `Collection_Report_${dayjs().format('DDMMYYYY')}.xlsx`);
  };

  // Updated refresh function
  const refreshData = () => {
    const filters = {
      page: 1,
      limit: 1000,
      ...(dateFrom && dateTo && { startDate: dateFrom, endDate: dateTo })
    };
    dispatch(fetchAllReceipts(filters));
  };

  // Collections table columns
  const collectionsColumns = [
    {
      name: 'S.No.',
      selector: (row, index) => index + 1,
      sortable: false,
      width: '70px'
    },
    {
      name: 'Date',
      selector: row => dayjs(row.date).format('DD/MM/YYYY'),
      sortable: true,
      width: '110px'
    },
    {
      name: 'Receipt No',
      selector: row => row.receiptNumber || 'N/A',
      cell: row => (
        <button
          onClick={() => generateReceiptPDF(row)}
          className="text-blue-600 hover:text-blue-800 focus:outline-none hover:underline"
          title="Click to print receipt"
        >
          {row.receiptNumber || 'N/A'}
        </button>
      ),
      sortable: true,
      width: '130px'
    },
    // {
    //   name: 'Type',
    //   selector: row => row.type,
    //   cell: row => (
    //     <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.type === 'creation' ? 'bg-green-100 text-green-800' :
    //       row.type === 'payment' ? 'bg-blue-100 text-blue-800' :
    //         'bg-gray-100 text-gray-800'
    //       }`}>
    //       {row.type === 'creation' ? 'Initial' : 'Due Payment'}
    //     </span>
    //   ),
    //   sortable: true,
    //   width: '110px'
    // },
    {
      name: 'Bill No',
      selector: row => row.billNumber || row.billingId?.billNumber || 'N/A',
      sortable: true,
      width: '110px'
    },
    {
      name: 'Patient ID',
      selector: row => row.billingId?.patientId?.patientId || 'N/A',
      sortable: true,
      width: '110px'
    },
    {
      name: 'Patient Name',
      selector: row => {
        const patient = row.billingId?.patientId;
        return patient ? `${patient.firstName || ''} ${patient.lastName || ''}`.trim() : 'N/A';
      },
      sortable: true,
      width: '150px'
    },
    {
      name: 'Doctor',
      selector: row => row.billingId?.doctorId?.name || 'N/A',
      sortable: true,
      width: '130px'
    },
    {
      name: 'Payment Mode',
      selector: row => row.paymentMethod?.type || 'N/A',
      cell: row => (
        <div className={`px-3 py-1 capitalize rounded-full text-xs font-medium ${row.paymentMethod?.type === 'cash' ? 'bg-green-500 text-white text-xs' :
          row.paymentMethod?.type === 'card' ? 'bg-blue-500 text-white text-xs' :
            row.paymentMethod?.type === 'upi' ? 'bg-purple-500 text-white text-xs' :
              'bg-orange-500 text-white text-xs'
          }`}>
          {(row.paymentMethod?.type || 'N/A')}
        </div>
      ),
      sortable: true,
      width: '120px'
    },
    {
      name: 'Amount',
      selector: row => row.amount || 0,
      cell: row => (
        <div className="font-medium flex items-center gap-1 justify-end w-full">
          <IndianRupeeIcon size={14} />
          {formatCurrency(row.amount || 0)}
        </div>
      ),
      sortable: true,
      width: '120px'
    },
    {
      name: 'Status',
      selector: row => row.newStatus || 'N/A',
      cell: row => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.newStatus === 'paid' ? 'bg-green-100 text-green-800' :
          row.newStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
          {(row.newStatus || 'N/A').toUpperCase()}
        </span>
      ),
      sortable: true,
      width: '100px'
    },
    {
      name: 'Action',
      cell: row => (
        <div className="flex gap-2">
          <button
            onClick={() => generateReceiptPDF(row)}
            className="text-blue-600 hover:text-blue-800 focus:outline-none"
            title="Print Receipt"
          >
            <Eye size={16} />
          </button>
        </div>
      ),
      ignoreRowClick: true,
      width: '80px'
    }
  ];

  // Refunds table columns - Simplified layout matching the design
  const refundsColumns = [
    {
      name: 'S.No.',
      selector: (row, index) => index + 1,
      sortable: false,
      width: '80px'
    },
    {
      name: 'Date',
      selector: row => dayjs(row.date).format('DD-MM-YYYY HH:mm A'),
      sortable: true,
      width: '160px'
    },
    {
      name: 'Patient Id',
      selector: row => row.billingId?.patientId?.patientId || 'N/A',
      sortable: true,
      width: '120px'
    },
    {
      name: 'Patient Name',
      selector: row => {
        const patient = row.billingId?.patientId;
        return patient ? `${patient.firstName || ''} ${patient.lastName || ''}`.trim() : 'N/A';
      },
      sortable: true,
      width: '150px'
    },
    {
      name: 'User Name',
      selector: row => row.createdBy?.name || 'N/A',
      sortable: true,
      width: '120px'
    },
    {
      name: 'Receipt Number',
      selector: row => row.receiptNumber || 'N/A',
      cell: row => (
        <button
          onClick={() => generateReceiptPDF(row)}
          className="text-blue-600 hover:text-blue-800 focus:outline-none hover:underline"
          title="Click to print refund receipt"
        >
          {row.receiptNumber || 'N/A'}
        </button>
      ),
      sortable: true,
      width: '140px'
    },
    {
      name: 'Pay Mode',
      selector: row => row.paymentMethod?.type || 'N/A',
      cell: row => (
        <div className={`px-3 py-1 capitalize rounded-lg text-xs font-medium text-white flex items-center gap-1 ${row.paymentMethod?.type === 'cash' ? 'bg-purple-500' :
          row.paymentMethod?.type === 'card' ? 'bg-purple-500' :
            row.paymentMethod?.type === 'upi' ? 'bg-purple-500' :
              'bg-purple-500'
          }`}>
          <IndianRupeeIcon size={12} />
          {(row.paymentMethod?.type || 'Cash').charAt(0).toUpperCase() + (row.paymentMethod?.type || 'Cash').slice(1)}
        </div>
      ),
      sortable: true,
      width: '120px'
    },
    {
      name: 'Amount',
      selector: row => row.amount || 0,
      cell: row => (
        <div className="font-medium text-right">
          {formatCurrency(row.amount || 0)}
        </div>
      ),
      sortable: true,
      width: '120px'
    }
  ];

  const SummaryTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-2 border font-medium text-gray-600 text-center">Amount Collected In Cash</th>
            <th className="p-2 border font-medium text-gray-600 text-center">Amount Collected In Card</th>
            <th className="p-2 border font-medium text-gray-600 text-center">Amount Collected In UPI</th>
            <th className="p-2 border font-medium text-gray-600 text-center">Amount Collected In NEFT/IMPS</th>
            <th className="p-2 border font-medium text-gray-600 text-center">Dues Collected In Cash</th>
            <th className="p-2 border font-medium text-gray-600 text-center">Dues Collected In Card</th>
            <th className="p-2 border font-medium text-gray-600 text-center">Dues Collected In UPI</th>
            <th className="p-2 border font-medium text-gray-600 text-center">Dues Collected In NEFT/IMPS</th>
            <th className="p-2 border font-medium text-gray-600 text-center">Total Amount Collected By Card</th>
            <th className="p-2 border font-medium text-gray-600 text-center">Total Amount Collected By Cash</th>
            <th className="p-2 border font-medium text-gray-600 text-center">Total Amount Collected By UPI</th>
            <th className="p-2 border font-medium text-gray-600 text-center">Total Amount Collected By NEFT/IMPS</th>
            <th className="p-2 border font-medium text-gray-600 text-center bg-blue-50">Total (Exclude Refund/Total)</th>
            <th className="p-2 border font-medium text-gray-600 text-center bg-red-50">Refund(Total)</th>
          </tr>
        </thead>
        <tbody>
          <tr className="text-right hover:bg-gray-50">
            <td className="p-2 border text-center">{formatCurrency(summary.amountCollected.cash)}</td>
            <td className="p-2 border text-center">{formatCurrency(summary.amountCollected.card)}</td>
            <td className="p-2 border text-center">{formatCurrency(summary.amountCollected.upi)}</td>
            <td className="p-2 border text-center">{formatCurrency(summary.amountCollected.neft)}</td>
            <td className="p-2 border text-center">{formatCurrency(summary.duesCollected.cash)}</td>
            <td className="p-2 border text-center">{formatCurrency(summary.duesCollected.card)}</td>
            <td className="p-2 border text-center">{formatCurrency(summary.duesCollected.upi)}</td>
            <td className="p-2 border text-center">{formatCurrency(summary.duesCollected.neft)}</td>
            <td className="p-2 border text-center font-medium bg-gray-100">{formatCurrency(summary.totalAmount.card)}</td>
            <td className="p-2 border text-center font-medium bg-gray-100">{formatCurrency(summary.totalAmount.cash)}</td>
            <td className="p-2 border text-center font-medium bg-gray-100">{formatCurrency(summary.totalAmount.upi)}</td>
            <td className="p-2 border text-center font-medium bg-gray-100">{formatCurrency(summary.totalAmount.neft)}</td>
            <td className="p-2 border text-center font-semibold bg-blue-50">{formatCurrency(summary.grandTotal)}</td>
            <td className="p-2 border text-center font-semibold bg-red-50 text-red-600">{formatCurrency(summary.totalRefunds)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  return (
    <Layout>
      <div className="container mx-auto">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-800 mb-2">Collection Report</h1>
          <p className="text-sm text-gray-600">View and analyze payment collection data with detailed breakdown including refunds</p>
        </div>

        {/* Controls Section */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="text-gray-500" size={20} />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="border border-gray-300 p-2 text-xs rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="From Date"
              />
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="text-gray-500" size={20} />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="border border-gray-300 p-2 text-xs rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="To Date"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={paymentTypeFilter}
                onChange={(e) => setPaymentTypeFilter(e.target.value)}
                className="border border-gray-300 p-2 text-xs rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Payment Types</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="neft">NEFT</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={receiptTypeFilter}
                onChange={(e) => setReceiptTypeFilter(e.target.value)}
                className="border border-gray-300 p-2 text-xs rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Receipt Types</option>
                <option value="creation">Initial Payments</option>
                <option value="payment">Due Payments</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={refreshData}
              disabled={receiptsLoading}
              className="flex items-center text-xs gap-2 px-4 py-2 border rounded-md transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {receiptsLoading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              <span>Refresh</span>
            </button>
            <button
              onClick={handleExport}
              disabled={(!filteredCollections.length && !filteredRefunds.length) || receiptsLoading}
              className="flex items-center text-xs gap-2 px-4 py-2 bg-blue-600 text-white rounded-md transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText size={16} />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Error Display */}
        {receiptsError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm">
              Error loading collection data: {receiptsError.message || 'Please try refreshing the page'}
            </p>
          </div>
        )}

        {/* Show details only when date range is selected */}
        {dateFrom && dateTo ? (
          <>
          {/* Collection Details Table */}
            <div className="bg-white rounded-lg text-xs shadow-sm border">
              <div className="p-6 text-xs">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Collection Details</h2>
                <DataTable
                  columns={collectionsColumns}
                  data={filteredCollections}
                  pagination
                  highlightOnHover
                  responsive
                  progressPending={receiptsLoading}
                  progressComponent={
                    <div className="flex items-center justify-center p-6">
                      <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
                    </div>
                  }
                  noDataComponent={
                    <div className="text-center py-8 text-gray-500">
                      No collections found for selected date range
                    </div>
                  }
                  paginationPerPage={25}
                  paginationRowsPerPageOptions={[10, 25, 50, 100]}
                  customStyles={{
                    headRow: {
                      style: {
                        backgroundColor: '#f8fafc',
                        fontSize: '0.820rem',
                        color: '#475569',
                        fontWeight: '500',
                      },
                    },
                    rows: {
                      style: {
                        fontSize: '0.775rem',
                        color: '#1e293b',
                        minHeight: '2.5rem',
                      },
                    },
                  }}
                />
              </div>
            </div>
            {/* Refunds Table - Show first when refunds exist */}
            {filteredRefunds.length > 0 && (
              <div className="bg-white rounded-lg text-xs shadow-sm border my-6">
                <div className="p-6 text-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="text-red-500" size={20} />
                      <h2 className="text-lg font-semibold text-gray-800">
                        Refund Report {dayjs(dateFrom).format('DD-MM-YYYY')} to {dayjs(dateTo).format('DD-MM-YYYY')} 
                      </h2>
                    </div>
                  </div>
                  <DataTable
                    columns={refundsColumns}
                    data={filteredRefunds}
                    pagination={false}
                    highlightOnHover
                    responsive
                    progressPending={receiptsLoading}
                    progressComponent={
                      <div className="flex items-center justify-center p-6">
                        <Loader2 className="animate-spin h-8 w-8 text-red-500" />
                      </div>
                    }
                    noDataComponent={
                      <div className="text-center py-8 text-gray-500">
                        No refunds found for selected date range
                      </div>
                    }
                    customStyles={{
                      headRow: {
                        style: {
                          backgroundColor: '#f8fafc',
                          fontSize: '0.820rem',
                          color: '#475569',
                          fontWeight: '500',
                        },
                      },
                      rows: {
                        style: {
                          fontSize: '0.775rem',
                          color: '#1e293b',
                          minHeight: '2.5rem',
                        },
                      },
                    }}
                  />
                  {/* Total Refund Amount Row */}
                  <div className="mt-4 flex justify-end">
                    <div className="bg-gray-100 px-4 py-2 rounded-lg">
                      <span className="font-semibold text-gray-700">Total Refund Amount: </span>
                      <span className="font-bold text-red-600">{formatCurrency(summary.totalRefunds)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Summary Section */}
            <div className="bg-white rounded-lg shadow-sm border mb-6">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Summary</h2>
                <SummaryTable />
              </div>
            </div>

            
          </>
        ) : (
          /* Date Selection Prompt */
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-12 text-center">
              <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Select Date Range</h3>
              <p className="text-gray-500 mb-4">
                Please select both From Date and To Date to view the collection report details.
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>From Date</span>
                </div>
                <span>→</span>
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>To Date</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CollectionReport;