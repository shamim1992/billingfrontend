import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getDueAmountReport } from '@/redux/actions/billingActions';
import Layout from '@/components/Layout';
import { Calendar, FileText, Download, Printer, Loader2, AlertCircle } from 'lucide-react';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const DuesReportRedesign = () => {
  const dispatch = useDispatch();
  const { dueAmountReport, loading, error } = useSelector((state) => state.billing);
  
  // Form state
  const [fromDate, setFromDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [toDate, setToDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [encounterType, setEncounterType] = useState('');
  const [dueExcess, setDueExcess] = useState('');
  const [remarks, setRemarks] = useState('');
  const [billType, setBillType] = useState('');
  const [status, setStatus] = useState('');
  
  // Report data state
  const [reportData, setReportData] = useState([]);
  const [totals, setTotals] = useState({
    billAmount: 0,
    paidAmount: 0,
    due: 0,
    excess: 0,
    totalBills: 0
  });
  const [showReport, setShowReport] = useState(false);

  // Load data when component mounts with default dates
  useEffect(() => {
    handleView();
  }, []);

  // Process backend data when dueAmountReport changes
  useEffect(() => {
    if (dueAmountReport?.bills) {
      const processedData = dueAmountReport.bills.map((bill, index) => {
        // Calculate excess (when paid > grand total)
        const excess = bill.paidAmount > bill.grandTotal ? bill.paidAmount - bill.grandTotal : 0;
        const actualDue = bill.dueAmount > 0 ? bill.dueAmount : 0;

        return {
          sNo: index + 1,
          date: dayjs(bill.date).format('DD-MM-YYYY'),
          patientId: bill.patientId || 'N/A',
          patientName: bill.patientName || 'N/A',
          billNumber: bill.billNumber || '',
          mobileNumber: bill.mobileNumber || 'N/A',
          paymentStatus: bill.status === 'paid' ? 'Paid' : 
                        bill.status === 'partial' ? 'Partial' : 
                        bill.status === 'cancelled' ? 'Cancelled' : 'Pending',
          billAmount: bill.grandTotal || 0,
          paidAmount: bill.paidAmount || 0,
          due: actualDue,
          excess: excess,
          remarks: bill.remarks || '',
          billedBy: bill.billedBy || bill.createdBy || 'N/A',
          originalBill: bill // Keep reference to original data
        };
      });

      // Apply client-side filters
      let filteredData = processedData;

      // Filter by due/excess
      if (dueExcess === 'due') {
        filteredData = filteredData.filter(item => item.due > 0);
      } else if (dueExcess === 'excess') {
        filteredData = filteredData.filter(item => item.excess > 0);
      }

      // Filter by remarks
      if (remarks) {
        filteredData = filteredData.filter(item => 
          item.remarks.toLowerCase().includes(remarks.toLowerCase())
        );
      }

      // Filter by status
      if (status) {
        filteredData = filteredData.filter(item => 
          item.paymentStatus.toLowerCase() === status.toLowerCase()
        );
      }

      setReportData(filteredData);
      calculateTotals(filteredData);
      setShowReport(true);
    }
  }, [dueAmountReport, dueExcess, remarks, status]);

  const calculateTotals = (data) => {
    const totalBillAmount = data.reduce((sum, item) => sum + item.billAmount, 0);
    const totalPaidAmount = data.reduce((sum, item) => sum + item.paidAmount, 0);
    const totalDue = data.reduce((sum, item) => sum + item.due, 0);
    const totalExcess = data.reduce((sum, item) => sum + item.excess, 0);

    setTotals({
      billAmount: totalBillAmount,
      paidAmount: totalPaidAmount,
      due: totalDue,
      excess: totalExcess,
      totalBills: data.length
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const handleView = () => {
    if (!fromDate || !toDate) {
      alert('Please select both From Date and To Date');
      return;
    }

    const filters = {
      startDate: fromDate,
      endDate: toDate
    };

    // Add status filter if selected
    if (status) {
      filters.status = status;
    }

    dispatch(getDueAmountReport(filters));
  };

  const handlePdfPrint = () => {
    if (!reportData.length) {
      alert('No data to print');
      return;
    }

    const doc = new jsPDF('l', 'pt', 'a4'); // landscape orientation
    
    // Add title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`Due Report From ${dayjs(fromDate).format('DD-MM-YYYY')} to ${dayjs(toDate).format('DD-MM-YYYY')}`, 40, 40);
    
    // Prepare table data
    const tableData = reportData.map(row => [
      row.sNo,
      row.date,
      row.patientId,
      row.patientName,
      row.billNumber || '',
      row.mobileNumber,
      row.paymentStatus,
      formatCurrency(row.billAmount),
      formatCurrency(row.paidAmount),
      formatCurrency(row.due),
      formatCurrency(row.excess),
      row.remarks || '',
      row.billedBy
    ]);

    // Add totals row
    tableData.push([
      '', '', '', '', '', '', 'Total',
      formatCurrency(totals.billAmount),
      formatCurrency(totals.paidAmount),
      formatCurrency(totals.due),
      formatCurrency(totals.excess),
      '', ''
    ]);

    // Create table
    doc.autoTable({
      startY: 70,
      head: [['S.No.', 'Date', 'Patient Id', 'Patient Name', 'Bill Number', 'Mobile Number', 'Payment Status', 'Bill Amount', 'Paid Amount', 'Due', 'Excess', 'Remarks', 'Billed By']],
      body: tableData,
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: [51, 65, 85],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 40 }, // S.No
        1: { halign: 'center', cellWidth: 70 }, // Date
        2: { halign: 'center', cellWidth: 60 }, // Patient Id
        3: { halign: 'left', cellWidth: 100 }, // Patient Name
        4: { halign: 'center', cellWidth: 70 }, // Bill Number
        5: { halign: 'center', cellWidth: 80 }, // Mobile
        6: { halign: 'center', cellWidth: 60 }, // Status
        7: { halign: 'right', cellWidth: 70 }, // Bill Amount
        8: { halign: 'right', cellWidth: 70 }, // Paid Amount
        9: { halign: 'right', cellWidth: 60 }, // Due
        10: { halign: 'right', cellWidth: 60 }, // Excess
        11: { halign: 'left', cellWidth: 60 }, // Remarks
        12: { halign: 'left', cellWidth: 60 } // Billed By
      },
      didParseCell: function(data) {
        // Style the total row
        if (data.row.index === tableData.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [249, 250, 251];
        }
        // Style pending status
        if (data.column.index === 6 && data.cell.text[0] === 'Pending') {
          data.cell.styles.fillColor = [254, 226, 226];
          data.cell.styles.textColor = [185, 28, 28];
        }
      }
    });

    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    const currentUser = JSON.parse(localStorage.getItem('user'))?.name || 'User';
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Printed at ${dayjs().format('DD/MM/YYYY HH:mm:ss A')} by ${currentUser}`, 40, doc.internal.pageSize.height - 20);
    }

    // Print the PDF
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const printWindow = window.open(pdfUrl);
    
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
        printWindow.onafterprint = () => {
          printWindow.close();
          URL.revokeObjectURL(pdfUrl);
        };
      };
    }
  };

  const handleExcel = () => {
    if (!reportData.length) {
      alert('No data to export');
      return;
    }

    const excelData = reportData.map(row => ({
      'S.No.': row.sNo,
      'Date': row.date,
      'Patient Id': row.patientId,
      'Patient Name': row.patientName,
      'Bill Number': row.billNumber || '',
      'Mobile Number': row.mobileNumber,
      'Payment Status': row.paymentStatus,
      'Bill Amount': row.billAmount,
      'Paid Amount': row.paidAmount,
      'Due': row.due,
      'Excess': row.excess,
      'Remarks': row.remarks || '',
      'Billed By': row.billedBy
    }));

    // Add totals row
    excelData.push({
      'S.No.': '',
      'Date': '',
      'Patient Id': '',
      'Patient Name': '',
      'Bill Number': '',
      'Mobile Number': '',
      'Payment Status': 'Total',
      'Bill Amount': totals.billAmount,
      'Paid Amount': totals.paidAmount,
      'Due': totals.due,
      'Excess': totals.excess,
      'Remarks': '',
      'Billed By': ''
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, ws, "Dues Report");
    XLSX.writeFile(wb, `Dues_Report_${dayjs().format('DDMMYYYY')}.xlsx`);
  };

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className=" px-6 py-4">
          <h1 className="text-xl font-bold">DUE REPORT</h1>
        </div>

        {/* Filters Section */}
        <div className="bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-end">
            {/* From Date */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                From Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* To Date */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                To Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Encounter Type */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Encounter Type
              </label>
              <select
                value={encounterType}
                onChange={(e) => setEncounterType(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select</option>
                <option value="OP">OP</option>
                <option value="IP">IP</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>

            {/* Due/Excess */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Due/Excess
              </label>
              <select
                value={dueExcess}
                onChange={(e) => setDueExcess(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select</option>
                <option value="due">Due Only</option>
                <option value="excess">Excess Only</option>
                <option value="both">Both</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Payment Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Remarks
              </label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Search remarks..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleView}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-md text-xs font-medium transition-colors flex items-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              View
            </button>
            <button
              onClick={handlePdfPrint}
              disabled={!reportData.length || loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-md text-xs font-medium transition-colors flex items-center gap-2"
            >
              <Printer size={16} />
              Pdf/Print
            </button>
            <button
              onClick={handleExcel}
              disabled={!reportData.length || loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-md text-xs font-medium transition-colors flex items-center gap-2"
            >
              <FileText size={16} />
              Excel
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <Loader2 className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600">Loading dues report...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="text-red-500" size={20} />
                <p className="text-red-800 text-xs">
                  Error loading dues report: {error.message || 'Please try again'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Report Table */}
        {showReport && !loading && (
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-sm">
              {/* Report Header */}
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Due Report From {dayjs(fromDate).format('DD-MM-YYYY')} to {dayjs(toDate).format('DD-MM-YYYY')}
                  </h2>
                  <div className="text-xs text-gray-600">
                    Total Records: {totals.totalBills} | Total Due: ₹{formatCurrency(totals.due)}
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                {reportData.length > 0 ? (
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-700 border-b">S.No.</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700 border-b">Date</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700 border-b">Patient Id</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700 border-b">Patient Name</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700 border-b">Bill Number</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700 border-b">Mobile Number</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700 border-b">Payment Status</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-700 border-b">Bill Amount</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-700 border-b">Paid Amount</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-700 border-b">Due</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-700 border-b">Excess</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700 border-b">Remarks</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700 border-b">Billed By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.map((row) => (
                        <tr key={row.sNo} className="hover:bg-gray-50">
                          <td className="px-4 py-3 border-b text-center">{row.sNo}</td>
                          <td className="px-4 py-3 border-b">{row.date}</td>
                          <td className="px-4 py-3 border-b text-blue-600 hover:text-blue-800 cursor-pointer">
                            {row.patientId}
                          </td>
                          <td className="px-4 py-3 border-b">{row.patientName}</td>
                          <td className="px-4 py-3 border-b">{row.billNumber}</td>
                          <td className="px-4 py-3 border-b">{row.mobileNumber}</td>
                          <td className="px-4 py-3 border-b">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              row.paymentStatus === 'Pending' ? 'bg-red-100 text-red-800' :
                              row.paymentStatus === 'Partial' ? 'bg-yellow-100 text-yellow-800' :
                              row.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {row.paymentStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3 border-b text-right">{formatCurrency(row.billAmount)}</td>
                          <td className="px-4 py-3 border-b text-right">{formatCurrency(row.paidAmount)}</td>
                          <td className="px-4 py-3 border-b text-right">{formatCurrency(row.due)}</td>
                          <td className="px-4 py-3 border-b text-right">{formatCurrency(row.excess)}</td>
                          <td className="px-4 py-3 border-b">{row.remarks}</td>
                          <td className="px-4 py-3 border-b">{row.billedBy}</td>
                        </tr>
                      ))}
                      
                      {/* Totals Row */}
                      <tr className="bg-gray-50 font-semibold">
                        <td className="px-4 py-3 border-b" colSpan="7">Total</td>
                        <td className="px-4 py-3 border-b text-right">{formatCurrency(totals.billAmount)}</td>
                        <td className="px-4 py-3 border-b text-right">{formatCurrency(totals.paidAmount)}</td>
                        <td className="px-4 py-3 border-b text-right">{formatCurrency(totals.due)}</td>
                        <td className="px-4 py-3 border-b text-right">{formatCurrency(totals.excess)}</td>
                        <td className="px-4 py-3 border-b" colSpan="2"></td>
                      </tr>
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No dues found for the selected criteria
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 text-xs text-gray-500 border-t">
                Printed at {dayjs().format('DD/MM/YYYY HH:mm:ss A')} by {JSON.parse(localStorage.getItem('user'))?.name || 'User'}
              </div>
            </div>
          </div>
        )}

        {/* No Data State */}
        {showReport && !loading && reportData.length === 0 && (
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">No Dues Found</h3>
              <p className="text-gray-500">
                No bills with outstanding dues found for the selected date range and criteria.
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DuesReportRedesign;