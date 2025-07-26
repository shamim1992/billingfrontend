import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllReceipts, fetchBillDetailsByReceiptNumber } from '@/redux/actions/billingActions';
import Layout from '@/components/Layout';
import DataTable from 'react-data-table-component';
import { Calendar, IndianRupeeIcon, FileText, Loader2, Download, AlertTriangle, RefreshCw, Filter, Search, TrendingDown } from 'lucide-react';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const RefundReport = () => {
  const dispatch = useDispatch();
  const { receipts, receiptsLoading, receiptsError } = useSelector((state) => state.billing);
  
  // Filter states
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRefunds, setFilteredRefunds] = useState([]);
  
  // Summary state
  const [summary, setSummary] = useState({
    refunds: { cash: 0, card: 0, upi: 0, neft: 0 },
    totalRefunds: 0,
    totalRefundTransactions: 0,
    averageRefund: 0,
    highestRefund: 0,
    lowestRefund: 0
  });

  // Fetch all receipts including cancellations
  useEffect(() => {
    const filters = {
      page: 1,
      limit: 1000
    };
    dispatch(fetchAllReceipts(filters));
  }, [dispatch]);

  // Filter and process refund data
  useEffect(() => {
    if (receipts?.receipts?.length || receipts?.length) {
      const receiptData = receipts?.receipts || receipts;

      // Filter only cancellation receipts (refunds)
      let filteredRefundsData = receiptData.filter(receipt => {
        // Include only cancellation type receipts
        if (receipt.type !== 'cancellation') {
          return false;
        }

        // Date filter
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

        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const patientName = receipt.billingId?.patientId ? 
            `${receipt.billingId.patientId.firstName || ''} ${receipt.billingId.patientId.lastName || ''}`.toLowerCase() : '';
          const billNumber = receipt.billNumber?.toLowerCase() || '';
          const receiptNumber = receipt.receiptNumber?.toLowerCase() || '';
          const remarks = receipt.remarks?.toLowerCase() || '';
          
          if (!patientName.includes(query) && 
              !billNumber.includes(query) && 
              !receiptNumber.includes(query) && 
              !remarks.includes(query)) {
            return false;
          }
        }

        return true;
      });

      setFilteredRefunds(filteredRefundsData);
      calculateSummary(filteredRefundsData);
    }
  }, [receipts, dateFrom, dateTo, paymentTypeFilter, searchQuery]);

  // Calculate summary statistics
  const calculateSummary = (refunds) => {
    if (!refunds.length) {
      setSummary({
        refunds: { cash: 0, card: 0, upi: 0, neft: 0 },
        totalRefunds: 0,
        totalRefundTransactions: 0,
        averageRefund: 0,
        highestRefund: 0,
        lowestRefund: 0
      });
      return;
    }

    const refundsByType = refunds.reduce((acc, receipt) => {
      const paymentType = (receipt.paymentMethod?.type || 'cash').toLowerCase();
      const amount = receipt.amount || 0;
      acc[paymentType] += amount;
      return acc;
    }, { cash: 0, card: 0, upi: 0, neft: 0 });

    const amounts = refunds.map(receipt => receipt.amount || 0).filter(amount => amount > 0);
    const totalRefunds = Object.values(refundsByType).reduce((sum, amount) => sum + amount, 0);
    const averageRefund = amounts.length > 0 ? totalRefunds / amounts.length : 0;
    const highestRefund = amounts.length > 0 ? Math.max(...amounts) : 0;
    const lowestRefund = amounts.length > 0 ? Math.min(...amounts) : 0;

    setSummary({
      refunds: refundsByType,
      totalRefunds,
      totalRefundTransactions: refunds.length,
      averageRefund,
      highestRefund,
      lowestRefund
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Generate receipt PDF
  const generateReceiptPDF = async (receipt) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const leftMargin = 20;
      const rightMargin = pageWidth - 20;

      // Helper functions
      const addText = (text, x, y, fontSize = 10, style = 'normal', align = 'left') => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', style);
        if (align === 'right') {
          const textWidth = doc.getTextWidth(text);
          doc.text(text, x - textWidth, y);
        } else if (align === 'center') {
          const textWidth = doc.getTextWidth(text);
          doc.text(text, x - textWidth / 2, y);
        } else {
          doc.text(text, x, y);
        }
      };

      const addLine = (y, thickness = 0.5, startX = leftMargin, endX = rightMargin) => {
        doc.setLineWidth(thickness);
        doc.line(startX, y, endX, y);
      };

      // Header
      addText('REFUND RECEIPT', pageWidth / 2, 30, 16, 'bold', 'center');
      addLine(35);

      // Receipt details
      let yPos = 50;
      addText(`Receipt Number: ${receipt.receiptNumber || 'N/A'}`, leftMargin, yPos, 12, 'bold');
      addText(`Date: ${dayjs(receipt.date).format('DD-MM-YYYY HH:mm A')}`, rightMargin, yPos, 10, 'normal', 'right');
      yPos += 15;

      addText(`Bill Number: ${receipt.billNumber || 'N/A'}`, leftMargin, yPos, 10);
      yPos += 10;

      // Patient details
      const patient = receipt.billingId?.patientId;
      if (patient) {
        addText(`Patient Name: ${patient.firstName || ''} ${patient.lastName || ''}`, leftMargin, yPos, 10);
        yPos += 8;
        addText(`Patient ID: ${patient.patientId || 'N/A'}`, leftMargin, yPos, 10);
        yPos += 8;
        if (patient.mobileNumber) {
          addText(`Mobile: ${patient.mobileNumber}`, leftMargin, yPos, 10);
          yPos += 8;
        }
      }

      // Doctor details
      const doctor = receipt.billingId?.doctorId;
      if (doctor) {
        addText(`Doctor: ${doctor.name || 'N/A'}`, leftMargin, yPos, 10);
        yPos += 10;
      }

      // Refund details
      addLine(yPos);
      yPos += 10;
      addText('REFUND DETAILS', leftMargin, yPos, 12, 'bold');
      yPos += 10;

      const paymentType = (receipt.paymentMethod?.type || 'Cash').charAt(0).toUpperCase() + 
                         (receipt.paymentMethod?.type || 'Cash').slice(1);
      addText(`Payment Method: ${paymentType}`, leftMargin, yPos, 10);
      yPos += 8;

      if (receipt.paymentMethod?.cardNumber) {
        addText(`Card Number: ****${receipt.paymentMethod.cardNumber.slice(-4)}`, leftMargin, yPos, 10);
        yPos += 8;
      }

      if (receipt.paymentMethod?.utrNumber) {
        addText(`UTR Number: ${receipt.paymentMethod.utrNumber}`, leftMargin, yPos, 10);
        yPos += 8;
      }

      // Refund amount
      yPos += 10;
      addText('REFUND AMOUNT', leftMargin, yPos, 12, 'bold');
      addText(`Rs. ${formatCurrency(receipt.amount || 0)}`, rightMargin, yPos, 12, 'bold', 'right');
      yPos += 10;

      // Reason
      if (receipt.remarks) {
        addText('Reason for Refund:', leftMargin, yPos, 10, 'bold');
        yPos += 8;
        addText(receipt.remarks, leftMargin, yPos, 10);
        yPos += 10;
      }

      // Processed by
      addText(`Processed By: ${receipt.createdBy?.name || 'N/A'}`, leftMargin, yPos, 10);
      yPos += 15;

      // Footer
      addLine(yPos);
      yPos += 10;
      addText('This is a refund receipt for the cancelled bill.', leftMargin, yPos, 10);
      yPos += 8;
      addText('Thank you for your understanding.', leftMargin, yPos, 10);

      // Generate and print PDF
      const pdfOutput = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfOutput);
      const printWindow = window.open(pdfUrl);

      if (printWindow) {
        printWindow.onload = () => {
          printWindow.document.title = `Refund-Receipt-${receipt.receiptNumber}`;
          printWindow.print();
          printWindow.onafterprint = () => {
            printWindow.close();
            URL.revokeObjectURL(pdfUrl);
          };
        };
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating refund receipt. Please try again.');
    }
  };

  // Export to Excel
  const handleExport = () => {
    const exportData = filteredRefunds.map((receipt, index) => {
      const billing = receipt?.billingId;
      const patient = billing?.patientId;
      const doctor = billing?.doctorId;

      return {
        'S.No.': index + 1,
        'Date': dayjs(receipt.date).format('DD/MM/YYYY HH:mm A'),
        'Receipt Number': receipt.receiptNumber || 'N/A',
        'Bill Number': receipt.billNumber || billing?.billNumber || 'N/A',
        'Patient ID': patient?.patientId || 'N/A',
        'Patient Name': patient ? `${patient.firstName || ''} ${patient.lastName || ''}`.trim() : 'N/A',
        'Mobile Number': patient?.mobileNumber || 'N/A',
        'Doctor Name': doctor?.name || 'N/A',
        'Refund Mode': (receipt.paymentMethod?.type || 'N/A').toUpperCase(),
        'Card Number': receipt.paymentMethod?.cardNumber ? `****${receipt.paymentMethod.cardNumber.slice(-4)}` : 'N/A',
        'UTR Number': receipt.paymentMethod?.utrNumber || 'N/A',
        'Refund Amount': receipt.amount || 0,
        'Reason': receipt.remarks || 'Bill Cancelled',
        'Processed By': receipt.createdBy?.name || 'N/A'
      };
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws, "Refunds");

    // Summary sheet
    const summaryData = [{
      'Total Refund Transactions': summary.totalRefundTransactions,
      'Total Refund Amount': summary.totalRefunds,
      'Average Refund Amount': summary.averageRefund,
      'Highest Refund Amount': summary.highestRefund,
      'Lowest Refund Amount': summary.lowestRefund,
      'Cash Refunds': summary.refunds.cash,
      'Card Refunds': summary.refunds.card,
      'UPI Refunds': summary.refunds.upi,
      'NEFT Refunds': summary.refunds.neft
    }];
    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

    XLSX.writeFile(wb, `Refund_Report_${dayjs().format('DDMMYYYY_HHmm')}.xlsx`);
  };

  // Refresh data
  const refreshData = () => {
    const filters = {
      page: 1,
      limit: 1000,
      ...(dateFrom && dateTo && { startDate: dateFrom, endDate: dateTo })
    };
    dispatch(fetchAllReceipts(filters));
  };

  // Clear filters
  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setPaymentTypeFilter('all');
    setSearchQuery('');
  };

  // DataTable columns
  const columns = [
    {
      name: 'S.No.',
      selector: (row, index) => index + 1,
      sortable: false,
      width: '60px'
    },
    {
      name: 'Date & Time',
      selector: row => dayjs(row.date).format('DD-MM-YYYY HH:mm A'),
      sortable: true,
      width: '140px'
    },
    {
      name: 'Receipt No.',
      selector: row => row.receiptNumber || 'N/A',
      cell: row => (
        <button
          onClick={() => generateReceiptPDF(row)}
          className="text-blue-600 hover:text-blue-800 focus:outline-none hover:underline text-xs"
          title="Click to print refund receipt"
        >
          {row.receiptNumber || 'N/A'}
        </button>
      ),
      sortable: true,
      width: '120px'
    },
    {
      name: 'Bill No.',
      selector: row => row.billNumber || 'N/A',
      sortable: true,
      width: '100px'
    },
    {
      name: 'Patient ID',
      selector: row => row.billingId?.patientId?.patientId || 'N/A',
      sortable: true,
      width: '100px'
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
      name: 'Mobile',
      selector: row => row.billingId?.patientId?.mobileNumber || 'N/A',
      sortable: true,
      width: '120px'
    },
    {
      name: 'Doctor',
      selector: row => row.billingId?.doctorId?.name || 'N/A',
      sortable: true,
      width: '120px'
    },
    {
      name: 'Payment Mode',
      selector: row => row.paymentMethod?.type || 'N/A',
      cell: row => (
        <div className={`px-2 py-1 capitalize rounded text-xs font-medium text-white flex items-center gap-1 ${
          row.paymentMethod?.type === 'cash' ? 'bg-green-500' :
          row.paymentMethod?.type === 'card' ? 'bg-blue-500' :
          row.paymentMethod?.type === 'upi' ? 'bg-purple-500' :
          'bg-gray-500'
        }`}>
          <IndianRupeeIcon size={10} />
          {(row.paymentMethod?.type || 'Cash').charAt(0).toUpperCase() + (row.paymentMethod?.type || 'Cash').slice(1)}
        </div>
      ),
      sortable: true,
      width: '100px'
    },
    {
      name: 'Refund Amount',
      selector: row => row.amount || 0,
      cell: row => (
        <div className="font-medium text-red-600 text-right">
          ₹{formatCurrency(row.amount || 0)}
        </div>
      ),
      sortable: true,
      width: '120px'
    },
    {
      name: 'Reason',
      selector: row => row.remarks || 'Bill Cancelled',
      sortable: true,
      width: '150px'
    },
    {
      name: 'Processed By',
      selector: row => row.createdBy?.name || 'N/A',
      sortable: true,
      width: '120px'
    }
  ];

  return (
    <Layout>
      <div className="bg-base-100 p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div>
            <h1 className="text-md font-bold text-gray-800 flex items-center gap-2">
              <TrendingDown className="text-red-500" size={24} />
              Refund Report
            </h1>
            <p className="text-gray-600 mt-1">Track and analyze all refund transactions</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={refreshData}
              className="btn btn-outline btn-sm"
              disabled={receiptsLoading}
            >
              <RefreshCw className={`h-4 w-4 ${receiptsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleExport}
              className="btn btn-primary btn-sm"
              disabled={filteredRefunds.length === 0}
            >
              <Download className="h-4 w-4" />
              Export Excel
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Total Refunds</p>
                <p className="text-md font-bold text-red-600">{summary.totalRefundTransactions}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Total Amount</p>
                <p className="text-md font-bold text-red-600">₹{formatCurrency(summary.totalRefunds)}</p>
              </div>
              <IndianRupeeIcon className="h-8 w-8 text-red-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Average Refund</p>
                <p className="text-md font-bold text-orange-600">₹{formatCurrency(summary.averageRefund)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-orange-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Highest Refund</p>
                <p className="text-md font-bold text-purple-600">₹{formatCurrency(summary.highestRefund)}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Payment Method Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <h3 className="text-xs font-semibold text-gray-800 mb-4">Refunds by Payment Method</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-gray-600">Cash</p>
              <p className="text-xs font-bold text-green-600">₹{formatCurrency(summary.refunds.cash)}</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-600">Card</p>
              <p className="text-xs font-bold text-blue-600">₹{formatCurrency(summary.refunds.card)}</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-xs text-gray-600">UPI</p>
              <p className="text-xs font-bold text-purple-600">₹{formatCurrency(summary.refunds.upi)}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">NEFT</p>
              <p className="text-xs font-bold text-gray-600">₹{formatCurrency(summary.refunds.neft)}</p>
            </div>
          </div>
        </div>

       

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search by patient name, bill number, receipt number, or reason..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Date From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Date To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Payment Mode</label>
              <select
                value={paymentTypeFilter}
                onChange={(e) => setPaymentTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Modes</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="neft">NEFT</option>
              </select>
            </div>
            
            <button
              onClick={clearFilters}
              className="btn btn-outline btn-sm"
            >
              <Filter className="h-4 w-4" />
              Clear
            </button>
          </div>
        </div>

        {/* Results */}
        {dateFrom && dateTo ? (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-semibold text-gray-800 flex items-center gap-2">
                  <AlertTriangle className="text-red-500" size={20} />
                  Refund Transactions ({dayjs(dateFrom).format('DD-MM-YYYY')} to {dayjs(dateTo).format('DD-MM-YYYY')})
                </h2>
                <div className="text-xs text-gray-600">
                  Total: {filteredRefunds.length} refunds
                </div>
              </div>
              
              <DataTable
                columns={columns}
                data={filteredRefunds}
                pagination
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
                    <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p>No refunds found for selected date range</p>
                    <p className="text-xs">Try adjusting your filters or date range</p>
                  </div>
                }
                paginationPerPage={25}
                paginationRowsPerPageOptions={[10, 25, 50, 100]}
                customStyles={{
                  headRow: {
                    style: {
                      backgroundColor: '#f8fafc',
                      fontSize: '0.875rem',
                      color: '#475569',
                      fontWeight: '500',
                    },
                  },
                  rows: {
                    style: {
                      fontSize: '0.875rem',
                      color: '#1e293b',
                      minHeight: '3rem',
                    },
                  },
                }}
              />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xs font-medium text-gray-900 mb-2">Select Date Range</h3>
            <p className="text-gray-600">Please select a date range to view refund transactions</p>
          </div>
        )}

        {/* Error Display */}
        {receiptsError && (
          <div className="alert alert-error mt-4">
            <AlertTriangle className="h-5 w-5" />
            <span>Error loading refund data: {receiptsError}</span>
          </div>
        )}


         {/* Refund Summary Table */}
         {dateFrom && dateTo && (
          <div className="bg-white rounded-lg shadow-sm border p-6 my-6">
            <h3 className="text-xs font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="text-red-500" size={20} />
              Refund Summary for {dayjs(dateFrom).format('DD-MM-YYYY')} to {dayjs(dateTo).format('DD-MM-YYYY')}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-3 border font-medium text-gray-600 text-center">Payment Method</th>
                    <th className="p-3 border font-medium text-gray-600 text-center">Number of Refunds</th>
                    <th className="p-3 border font-medium text-gray-600 text-center">Total Refund Amount</th>
                    <th className="p-3 border font-medium text-gray-600 text-center">Average Refund</th>
                    <th className="p-3 border font-medium text-gray-600 text-center">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-gray-50">
                    <td className="p-3 border text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="font-medium">Cash</span>
                      </div>
                    </td>
                    <td className="p-3 border text-center font-medium">
                      {filteredRefunds.filter(r => r.paymentMethod?.type === 'cash').length}
                    </td>
                    <td className="p-3 border text-center font-bold text-red-600">
                      ₹{formatCurrency(summary.refunds.cash)}
                    </td>
                    <td className="p-3 border text-center">
                      {filteredRefunds.filter(r => r.paymentMethod?.type === 'cash').length > 0 
                        ? `₹${formatCurrency(summary.refunds.cash / filteredRefunds.filter(r => r.paymentMethod?.type === 'cash').length)}`
                        : '₹0.00'
                      }
                    </td>
                    <td className="p-3 border text-center">
                      {summary.totalRefunds > 0 
                        ? `${((summary.refunds.cash / summary.totalRefunds) * 100).toFixed(1)}%`
                        : '0%'
                      }
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="p-3 border text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="font-medium">Card</span>
                      </div>
                    </td>
                    <td className="p-3 border text-center font-medium">
                      {filteredRefunds.filter(r => r.paymentMethod?.type === 'card').length}
                    </td>
                    <td className="p-3 border text-center font-bold text-red-600">
                      ₹{formatCurrency(summary.refunds.card)}
                    </td>
                    <td className="p-3 border text-center">
                      {filteredRefunds.filter(r => r.paymentMethod?.type === 'card').length > 0 
                        ? `₹${formatCurrency(summary.refunds.card / filteredRefunds.filter(r => r.paymentMethod?.type === 'card').length)}`
                        : '₹0.00'
                      }
                    </td>
                    <td className="p-3 border text-center">
                      {summary.totalRefunds > 0 
                        ? `${((summary.refunds.card / summary.totalRefunds) * 100).toFixed(1)}%`
                        : '0%'
                      }
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="p-3 border text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="font-medium">UPI</span>
                      </div>
                    </td>
                    <td className="p-3 border text-center font-medium">
                      {filteredRefunds.filter(r => r.paymentMethod?.type === 'upi').length}
                    </td>
                    <td className="p-3 border text-center font-bold text-red-600">
                      ₹{formatCurrency(summary.refunds.upi)}
                    </td>
                    <td className="p-3 border text-center">
                      {filteredRefunds.filter(r => r.paymentMethod?.type === 'upi').length > 0 
                        ? `₹${formatCurrency(summary.refunds.upi / filteredRefunds.filter(r => r.paymentMethod?.type === 'upi').length)}`
                        : '₹0.00'
                      }
                    </td>
                    <td className="p-3 border text-center">
                      {summary.totalRefunds > 0 
                        ? `${((summary.refunds.upi / summary.totalRefunds) * 100).toFixed(1)}%`
                        : '0%'
                      }
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="p-3 border text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                        <span className="font-medium">NEFT</span>
                      </div>
                    </td>
                    <td className="p-3 border text-center font-medium">
                      {filteredRefunds.filter(r => r.paymentMethod?.type === 'neft').length}
                    </td>
                    <td className="p-3 border text-center font-bold text-red-600">
                      ₹{formatCurrency(summary.refunds.neft)}
                    </td>
                    <td className="p-3 border text-center">
                      {filteredRefunds.filter(r => r.paymentMethod?.type === 'neft').length > 0 
                        ? `₹${formatCurrency(summary.refunds.neft / filteredRefunds.filter(r => r.paymentMethod?.type === 'neft').length)}`
                        : '₹0.00'
                      }
                    </td>
                    <td className="p-3 border text-center">
                      {summary.totalRefunds > 0 
                        ? `${((summary.refunds.neft / summary.totalRefunds) * 100).toFixed(1)}%`
                        : '0%'
                      }
                    </td>
                  </tr>
                  <tr className="bg-red-50 border-t-2 border-red-200">
                    <td className="p-3 border font-bold text-gray-800 text-center">TOTAL</td>
                    <td className="p-3 border font-bold text-gray-800 text-center">
                      {summary.totalRefundTransactions}
                    </td>
                    <td className="p-3 border font-bold text-red-700 text-center text-xs">
                      ₹{formatCurrency(summary.totalRefunds)}
                    </td>
                    <td className="p-3 border font-bold text-gray-800 text-center">
                      ₹{formatCurrency(summary.averageRefund)}
                    </td>
                    <td className="p-3 border font-bold text-gray-800 text-center">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RefundReport;
