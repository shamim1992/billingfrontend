import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBillings } from '@/redux/actions/billingActions';
import Layout from '@/components/Layout';
import DataTable from 'react-data-table-component';
import { Calendar, IndianRupeeIcon, FileText, Loader2, ChevronRight, ChevronDown, Eye } from 'lucide-react';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const CollectionReport = () => {
  const dispatch = useDispatch();
  const { billings, loading } = useSelector((state) => state.billing);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filteredCollections, setFilteredCollections] = useState([]);
  const [summary, setSummary] = useState({
    amountCollected: { cash: 0, card: 0, upi: 0, neft: 0 },
    duesCollected: { cash: 0, card: 0, upi: 0, neft: 0 },
    totalAmount: { card: 0, cash: 0, upi: 0, neft: 0 },
    refund: 0,
    grandTotal: 0
  });

  useEffect(() => {
    dispatch(fetchBillings());
  }, [dispatch]);

  useEffect(() => {
    if (billings?.length) {
      const filtered = dateFrom && dateTo
        ? billings.filter(billing => {
          const billingDate = dayjs(billing.date);
          return billingDate.isAfter(dayjs(dateFrom)) && 
                 billingDate.isBefore(dayjs(dateTo).add(1, 'day'));
        })
        : billings;

      setFilteredCollections(filtered);
      calculateSummary(filtered);
    }
  }, [billings, dateFrom, dateTo]);

  const calculateSummary = (filtered) => {
    const newSummary = filtered.reduce((acc, billing) => {
      const paymentType = billing.payment?.type?.toLowerCase() || 'cash';
      const amount = billing.payment?.paid || 0;
      const isDues = billing.remarks === 'partial' || billing.remarks === 'pending';

      acc.amountCollected[paymentType] += isDues ? 0 : amount;
      acc.duesCollected[paymentType] += isDues ? amount : 0;
      acc.totalAmount[paymentType] = acc.amountCollected[paymentType] + acc.duesCollected[paymentType];

      return acc;
    }, {
      amountCollected: { cash: 0, card: 0, upi: 0, neft: 0 },
      duesCollected: { cash: 0, card: 0, upi: 0, neft: 0 },
      totalAmount: { cash: 0, card: 0, upi: 0, neft: 0 },
      refund: 0
    });

    newSummary.grandTotal = Object.values(newSummary.totalAmount)
      .reduce((sum, amount) => sum + amount, 0) - newSummary.refund;

    setSummary(newSummary);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const handleExport = () => {
    const exportData = filteredCollections.map((item, index) => ({
      'S.No.': index + 1,
      'Date': dayjs(item.date).format('DD/MM/YYYY'),
      'Patient ID': item.patientId?._id,
      'Patient Name': item.patientId?.name,
      'Doctor Name': item.doctorId?.name,
      'Receipt Number': item.receiptNumber,
      'Payment Mode': item.payment?.type?.toUpperCase(),
      'Amount': item.payment?.paid || 0
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws, "Collections");

    const summaryData = [{
      'Amount Collected (Cash)': summary.amountCollected.cash,
      'Amount Collected (Card)': summary.amountCollected.card,
      'Amount Collected (UPI)': summary.amountCollected.upi,
      'Amount Collected (NEFT)': summary.amountCollected.neft,
      'Total Collection': summary.grandTotal
    }];
    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

    XLSX.writeFile(wb, `Collection_Report_${dayjs().format('DDMMYYYY')}.xlsx`);
  };

  const generateReceiptPDF = (billing) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;
    const lineHeight = 7;
    const leftMargin = 20;

    // Helper functions
    const addCenteredText = (text, y, fontSize = 12) => {
      doc.setFontSize(fontSize);
      const textWidth = doc.getTextWidth(text);
      const x = (pageWidth - textWidth) / 2;
      doc.text(text, x, y);
    };

    const addLabelValuePair = (label, value, y, valueXPos = 80) => {
      doc.setFontSize(10);
      doc.text(label, leftMargin, y);
      doc.text(': ' + value, valueXPos, y);
    };

    // Header
    addCenteredText('CHANRE HOSPITAL', yPos, 16);
    yPos += lineHeight;
    addCenteredText('123 Hospital Street, City - 123456', yPos, 10);
    yPos += lineHeight;
    addCenteredText('Phone: +91 1234567890 | Email: info@chanre.com', yPos, 10);
    yPos += lineHeight * 1.5;

    // Receipt Details
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
    const tableData = billing.billingItems?.map(item => [
      item.name,
      item.quantity.toString(),
      formatCurrency(item.price),
      formatCurrency(item.tax),
      formatCurrency(item.total)
    ]) || [];

    doc.autoTable({
      startY: yPos,
      head: [['Item Description', 'Qty', 'Price', 'Tax', 'Total']],
      body: tableData,
      margin: { left: leftMargin },
      headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0] },
      styles: { fontSize: 10 },
      theme: 'grid'
    });

    yPos = doc.lastAutoTable.finalY + 10;

    // Summary
    addLabelValuePair('Subtotal', formatCurrency(billing.totals?.subtotal || 0), yPos);
    yPos += lineHeight;
    addLabelValuePair('Tax', formatCurrency(billing.totals?.totalTax || 0), yPos);
    yPos += lineHeight;
    addLabelValuePair('Discount', 
      `${billing.discount?.value || 0} ${billing.discount?.type === 'percent' ? '%' : 'INR'}`, 
      yPos
    );
    yPos += lineHeight;
    addLabelValuePair('Total Amount', formatCurrency(billing.totals?.grandTotal || 0), yPos);
    yPos += lineHeight;
    addLabelValuePair('Amount Paid', formatCurrency(billing.payment?.paid || 0), yPos);
    yPos += lineHeight;
    addLabelValuePair('Balance', formatCurrency(billing.totals?.balance || 0), yPos);
    yPos += lineHeight * 1.5;

    // Footer
    addLabelValuePair('Payment Mode', billing.payment?.type?.toUpperCase() || '', yPos);
    yPos += lineHeight;
    addLabelValuePair('Status', billing.remarks?.toUpperCase() || '', yPos);

    doc.save(`Receipt-${billing.receiptNumber}.pdf`);
  };

  const ExpandedComponent = ({ data }) => (
    <div className="p-4 bg-gray-50">
      <h3 className="text-sm font-semibold mb-3">Receipt History</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-white">
              <th className="px-4 py-2 border text-left">Receipt No.</th>
              <th className="px-4 py-2 border text-left">Date</th>
              <th className="px-4 py-2 border text-left">Payment Mode</th>
              <th className="px-4 py-2 border text-right">Amount Paid</th>
              <th className="px-4 py-2 border text-center">Status</th>
              <th className="px-4 py-2 border text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.receiptHistory?.map((receipt, index) => (
              <tr key={index} className="hover:bg-gray-100">
                <td className="px-4 py-2 border">{receipt.receiptNumber}</td>
                <td className="px-4 py-2 border">
                  {dayjs(receipt.date).format('DD/MM/YYYY')}
                </td>
                <td className="px-4 py-2 border">
                  {receipt.billingDetails?.payment?.type?.toUpperCase()}
                </td>
                <td className="px-4 py-2 border text-right">
                  {formatCurrency(receipt.billingDetails?.payment?.paid || 0)}
                </td>
                <td className="px-4 py-2 border text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium 
                    ${receipt.billingDetails?.remarks === 'paid' ? 'bg-green-100 text-green-800' :
                      receipt.billingDetails?.remarks === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'}`}>
                    {(receipt.billingDetails?.remarks || '').toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-2 border text-center">
                  <button
                    onClick={() => generateReceiptPDF(receipt.billingDetails)}
                    className="text-blue-600 hover:text-blue-800 focus:outline-none"
                  >
                    <Eye size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const columns = [
    {
      name: 'S.No.',
      selector: (row, index) => index + 1,
      sortable: true,
      width: '70px'
    },
    {
      name: 'Date',
      selector: row => dayjs(row.date).format('DD/MM/YYYY'),
      sortable: true,
      width: '120px'
    },
    {
      name: 'Patient ID',
      selector: row => row.patientId?._id,
      sortable: true,
      width: '130px'
    },
    {
      name: 'Patient Name',
      selector: row => row.patientId?.name,
      sortable: true,
      minWidth: '200px'
    },
    {
      name: 'Doctor Name',
      selector: row => row.doctorId?.name,
      sortable: true,
      minWidth: '200px'
    },
    {
      name: 'Receipt No',
      selector: row => row.receiptNumber,
      cell: row => (
        <button
          onClick={() => generateReceiptPDF(row)}
          className="text-blue-600 hover:text-blue-800 underline focus:outline-none"
        >
          {row.receiptNumber}
        </button>
      ),
      sortable: true,
      width: '130px'
    },
    {
      name: 'Pay Mode',
      selector: row => row.payment?.type,
      cell: row => (
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          row.payment?.type === 'cash' ? 'bg-green-100 text-green-800' :
          row.payment?.type === 'card' ? 'bg-blue-100 text-blue-800' :
          row.payment?.type === 'upi' ? 'bg-purple-100 text-purple-800' :
          'bg-orange-100 text-orange-800'
        }`}>
          {row.payment?.type?.toUpperCase()}
        </div>
      ),
      sortable: true,
      width: '120px'
    },
    {
      name: 'Amount',
      selector: row => row.payment?.paid,
      cell: row => (
        <div className="font-medium flex items-center gap-1">
          <IndianRupeeIcon size={14} />
          {formatCurrency(row.payment?.paid || 0)}
        </div>
      ),
      sortable: true,
      right: true,
      width: '140px'
    }
  ];

  const SummaryTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-3 border font-medium text-gray-600">Amount Collected In Cash</th>
            <th className="p-3 border font-medium text-gray-600">Amount Collected In Card</th>
            <th className="p-3 border font-medium text-gray-600">Amount Collected In UPI</th>
            <th className="p-3 border font-medium text-gray-600">Amount Collected In NEFT/IMPS</th>
            <th className="p-3 border font-medium text-gray-600">Dues Collected In Cash</th>
            <th className="p-3 border font-medium text-gray-600">Dues Collected In Card</th>
            <th className="p-3 border font-medium text-gray-600">Dues Collected In UPI</th>
            <th className="p-3 border font-medium text-gray-600">Dues Collected In NEFT/IMPS</th>
            <th className="p-3 border font-medium text-gray-600 bg-blue-50">Total Amount Collected By Card</th>
            <th className="p-3 border font-medium text-gray-600 bg-blue-50">Total Amount By Cash</th>
            <th className="p-3 border font-medium text-gray-600 bg-blue-50">Total Amount By UPI</th>
            <th className="p-3 border font-medium text-gray-600 bg-blue-50">Total Amount By NEFT/IMPS</th>
            <th className="p-3 border font-medium text-gray-600">Refund(Total)</th>
            <th className="p-3 border font-medium text-gray-600 bg-gray-100">Total (Exclud Refu)</th>
          </tr>
        </thead>
        <tbody>
          <tr className="text-right hover:bg-gray-50">
            <td className="p-3 border">{formatCurrency(summary.amountCollected.cash)}</td>
            <td className="p-3 border">{formatCurrency(summary.amountCollected.card)}</td>
            <td className="p-3 border">{formatCurrency(summary.amountCollected.upi)}</td>
            <td className="p-3 border">{formatCurrency(summary.amountCollected.neft)}</td>
            <td className="p-3 border">{formatCurrency(summary.duesCollected.cash)}</td>
            <td className="p-3 border">{formatCurrency(summary.duesCollected.card)}</td>
            <td className="p-3 border">{formatCurrency(summary.duesCollected.upi)}</td>
            <td className="p-3 border">{formatCurrency(summary.duesCollected.neft)}</td>
            <td className="p-3 border font-medium bg-blue-50">{formatCurrency(summary.totalAmount.card)}</td>
            <td className="p-3 border font-medium bg-blue-50">{formatCurrency(summary.totalAmount.cash)}</td>
            <td className="p-3 border font-medium bg-blue-50">{formatCurrency(summary.totalAmount.upi)}</td>
            <td className="p-3 border font-medium bg-blue-50">{formatCurrency(summary.totalAmount.neft)}</td>
            <td className="p-3 border text-red-600">{formatCurrency(summary.refund)}</td>
            <td className="p-3 border font-semibold bg-gray-100">{formatCurrency(summary.grandTotal)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-800 mb-2">Collection Report</h1>
          <p className="text-sm text-gray-600">View and analyze collection data with detailed breakdown</p>
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
                className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="From Date"
              />
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="text-gray-500" size={20} />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="To Date"
              />
            </div>
          </div>

          <button 
            onClick={handleExport}
            disabled={!filteredCollections.length}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText size={18} />
            <span>Export Report</span>
          </button>
        </div>

        {/* Collection Details Table */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Collection Details</h2>
            <DataTable
              columns={columns}
              data={filteredCollections}
              pagination
              highlightOnHover
              responsive
              expandableRows
              expandableRowsComponent={ExpandedComponent}
              expandOnRowClicked
              expandableRowsHideExpander={false}
              expandableIcon={{
                collapsed: <ChevronRight size={20} className="text-gray-500" />,
                expanded: <ChevronDown size={20} className="text-gray-500" />
              }}
              progressPending={loading}
              progressComponent={
                <div className="flex items-center justify-center p-6">
                  <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
                </div>
              }
              noDataComponent={
                <div className="text-center py-8 text-gray-500">
                  {dateFrom && dateTo 
                    ? "No collections found for selected date range"
                    : "Please select date range to view collections"}
                </div>
              }
              paginationPerPage={10}
              paginationRowsPerPageOptions={[10, 20, 30, 50]}
              customStyles={{
                headRow: {
                  style: {
                    backgroundColor: '#f8fafc',
                    fontSize: '0.875rem',
                    color: '#475569',
                    fontWeight: '600',
                  },
                },
                rows: {
                  style: {
                    fontSize: '0.875rem',
                    color: '#1e293b',
                    minHeight: '3.5rem',
                  },
                },
                expandableRow: {
                  style: {
                    backgroundColor: '#f8fafc',
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Summary Section */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Collection Summary</h2>
            <SummaryTable />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CollectionReport;