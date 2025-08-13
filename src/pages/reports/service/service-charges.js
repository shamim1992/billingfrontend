// ServiceCollection.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBillings } from '@/redux/actions/billingActions';
import Layout from '@/components/Layout';
import DataTable from 'react-data-table-component';
import { Download, EyeIcon, Calendar, Users, FileText, Stethoscope, IndianRupeeIcon } from 'lucide-react';
import dayjs from 'dayjs';
import Link from 'next/link';

const ServiceCollection = () => {
  const dispatch = useDispatch();
  const { billings, loading } = useSelector((state) => state.billing);

  // State
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [filteredBills, setFilteredBills] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [summary, setSummary] = useState({
    cash: 0,
    card: 0,
    upi: 0,
    neft: 0,
    pending: 0,
    partial: 0,
    paid: 0,
    totalAmount: 0,
    billCount: 0,
    serviceFees: 0
  });

  // Initial data fetch
  useEffect(() => {
    dispatch(fetchBillings());
  }, [dispatch]);

  // Helper function to get service total for a bill
  const getServiceTotal = (bill) => {
    const serviceItems = bill.billingItems?.filter(
      item => item.category?.toLowerCase() === 'service'
    ) || [];
    return serviceItems.reduce((sum, item) => sum + (item.total || 0), 0);
  };

  // Calculate summary for filtered bills
  const calculateSummary = (bills) => {
    const newSummary = bills.reduce((acc, bill) => {
      const paymentType = bill.payment?.type?.toLowerCase() || 'cash';
      const amount = parseFloat(bill.payment?.paid) || 0;
      const status = bill.status?.toLowerCase() || 'pending';

      // Calculate service fees
      const serviceTotal = getServiceTotal(bill);

      // Update payment type totals
      acc[paymentType] = (acc[paymentType] || 0) + amount;

      // Update status totals
      if (status === 'paid') {
        acc.paid += amount;
      } else if (status === 'partial') {
        acc.partial += amount;
      } else {
        acc.pending += (bill.totals?.balance || 0);
      }

      // Update total amount and service fees
      acc.totalAmount += amount;
      acc.serviceFees += serviceTotal;

      return acc;
    }, {
      cash: 0,
      card: 0,
      upi: 0,
      neft: 0,
      pending: 0,
      partial: 0,
      paid: 0,
      totalAmount: 0,
      billCount: bills.length,
      serviceFees: 0
    });

    setSummary(newSummary);
  };

  // Filter handling
  useEffect(() => {
    if (billings?.length) {
      let filtered = [...billings];

      // Date filter
      if (dateFrom && dateTo) {
        filtered = filtered.filter(bill => {
          const billDate = dayjs(bill.date);
          return billDate.isAfter(dayjs(dateFrom).subtract(1, 'day')) && 
                 billDate.isBefore(dayjs(dateTo).add(1, 'day'));
        });
      }

      // Doctor filter
      if (selectedDoctor) {
        filtered = filtered.filter(bill => bill.doctorId?._id === selectedDoctor);
      }

      // Search filter
      if (searchQuery) {
        const search = searchQuery.toLowerCase();
        filtered = filtered.filter(bill => 
          bill.billNumber?.toLowerCase().includes(search) ||
          `${bill.patientId?.firstName} ${bill.patientId?.lastName}`.toLowerCase().includes(search) ||
          bill.doctorId?.name?.toLowerCase().includes(search) ||
          bill.patientId?.patientId?.toLowerCase().includes(search)
        );
      }

      // Filter for bills that have service items
      filtered = filtered.filter(bill => 
        bill.billingItems?.some(item => 
          item.category?.toLowerCase() === 'service'
        )
      );

      setFilteredBills(filtered);
      calculateSummary(filtered);
    }
  }, [billings, dateFrom, dateTo, selectedDoctor, searchQuery]);

  // Currency formatter
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  // PDF Export Function
  const handleExport = () => {
    const printWindow = window.open('', '_blank');
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Service Collection Report - ${dayjs().format('YYYY-MM-DD')}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px; 
              margin: 0;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 20px; 
              font-size: 12px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left; 
            }
            th { 
              background-color: #f8f9fa; 
              font-weight: bold;
            }
            .summary-card { 
              margin-bottom: 30px; 
              break-inside: avoid;
            }
            .summary-title { 
              font-size: 16px; 
              font-weight: bold; 
              margin-bottom: 10px; 
              color: #333;
            }
            .header { 
              margin-bottom: 30px; 
              padding-bottom: 10px;
              border-bottom: 2px solid #eee;
            }
            .report-title { 
              font-size: 20px; 
              font-weight: bold; 
              margin-bottom: 5px; 
              color: #1a1a1a;
            }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="report-title">Service Collection Report</div>
            <div class="report-date">Generated on: ${dayjs().format('DD/MM/YYYY HH:mm')}</div>
            ${dateFrom && dateTo ? `
              <div class="filter-info">
                Period: ${dayjs(dateFrom).format('DD/MM/YYYY')} to ${dayjs(dateTo).format('DD/MM/YYYY')}
              </div>
            ` : ''}
          </div>

          <div class="summary-card">
            <div class="summary-title">Collection Summary</div>
            <table>
              <tr>
                <th>Total Collections</th>
                <th>Service Fees</th>
                <th>Cash</th>
                <th>Card</th>
                <th>UPI</th>
                <th>NEFT</th>
              </tr>
              <tr>
                <td>₹${formatCurrency(summary.totalAmount)}</td>
                <td>₹${formatCurrency(summary.serviceFees)}</td>
                <td>₹${formatCurrency(summary.cash)}</td>
                <td>₹${formatCurrency(summary.card)}</td>
                <td>₹${formatCurrency(summary.upi)}</td>
                <td>₹${formatCurrency(summary.neft)}</td>
              </tr>
            </table>
          </div>

          <div class="summary-title">Service Details</div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Bill No</th>
                <th>Doctor</th>
                <th>Patient</th>
                <th>Service Items</th>
                <th>Service Fees</th>
                <th>Amount</th>
                <th>Paid</th>
                <th>Balance</th>
                <th>Payment Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredBills.map(bill => {
                const serviceItems = bill.billingItems?.filter(
                  item => item.category?.toLowerCase() === 'service'
                ) || [];
                return `
                  <tr>
                    <td>${dayjs(bill.date).format('DD/MM/YYYY')}</td>
                    <td>${bill.billNumber}</td>
                    <td>${bill.doctorId?.name || ''}</td>
                    <td>${bill.patientId?.firstName} ${bill.patientId?.lastName}</td>
                    <td>${serviceItems.map(item => item.name).join(', ')}</td>
                    <td>₹${formatCurrency(getServiceTotal(bill))}</td>
                    <td>₹${formatCurrency(bill.totals?.grandTotal)}</td>
                    <td>₹${formatCurrency(bill.payment?.paid)}</td>
                    <td>₹${formatCurrency(bill.totals?.balance)}</td>
                    <td>${bill.payment?.type?.toUpperCase() || 'N/A'}</td>
                    <td>${bill.status?.toUpperCase() || 'N/A'}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          
          <button class="no-print" onclick="window.print();" 
            style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 20px;">
            Print PDF
          </button>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const columns = [
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
      name: 'Bill No',
      selector: row => row.billNumber || 'N/A',
      sortable: true,
      width: '120px'
    },
    {
      name: 'Doctor',
      selector: row => row.doctorId?.name,
      sortable: true,
      width: '130px'
    },
    {
      name: 'Patient',
      selector: row => `${row.patientId?.firstName || ''} ${row.patientId?.lastName || ''}`.trim(),
      sortable: true,
      width: '140px'
    },
    {
      name: 'Service Items',
      cell: row => {
        const serviceItems = row.billingItems?.filter(
          item => item.category?.toLowerCase() === 'service'
        ) || [];
        return (
          <div className="text-xs">
            {serviceItems.slice(0, 2).map((item, index) => (
              <div key={index} className="truncate">{item.name}</div>
            ))}
            {serviceItems.length > 2 && (
              <div className="text-gray-500">+{serviceItems.length - 2} more</div>
            )}
          </div>
        );
      },
      grow: 2,
      width: '180px'
    },
    {
      name: 'Service Fees',
      selector: row => getServiceTotal(row),
      cell: row => (
        <div className="font-medium flex items-center gap-1 justify-end w-full text-blue-600">
          <IndianRupeeIcon size={14} />
          {formatCurrency(getServiceTotal(row))}
        </div>
      ),
      sortable: true,
      width: '120px'
    },
    {
      name: 'Amount',
      selector: row => row.totals?.grandTotal || 0,
      cell: row => (
        <div className="font-medium flex items-center gap-1 justify-end w-full">
          <IndianRupeeIcon size={14} />
          {formatCurrency(row.totals?.grandTotal)}
        </div>
      ),
      sortable: true,
      width: '120px'
    },
    {
      name: 'Paid',
      selector: row => row.payment?.paid || 0,
      cell: row => (
        <div className="font-medium flex items-center gap-1 justify-end w-full text-green-600">
          <IndianRupeeIcon size={14} />
          {formatCurrency(row.payment?.paid)}
        </div>
      ),
      sortable: true,
      width: '120px'
    },
    // {
    //   name: 'Balance',
    //   selector: row => row.totals?.balance || 0,
    //   cell: row => (
    //     <div className={`font-medium flex items-center gap-1 justify-end w-full ${
    //       (row.totals?.balance || 0) > 0 ? 'text-red-600' : 'text-gray-600'
    //     }`}>
    //       <IndianRupeeIcon size={14} />
    //       {formatCurrency(row.totals?.balance)}
    //     </div>
    //   ),
    //   sortable: true,
    //   width: '120px'
    // },
    // {
    //   name: 'Payment Type',
    //   selector: row => row.payment?.type,
    //   cell: row => (
    //     <div className={`px-2 py-1 rounded-full text-xs font-medium ${
    //       row.payment?.type?.toLowerCase() === 'cash' ? 'bg-green-100 text-green-800' :
    //       row.payment?.type?.toLowerCase() === 'card' ? 'bg-blue-100 text-blue-800' :
    //       row.payment?.type?.toLowerCase() === 'upi' ? 'bg-purple-100 text-purple-800' :
    //       'bg-orange-100 text-orange-800'
    //     }`}>
    //       {row.payment?.type?.toUpperCase() || 'N/A'}
    //     </div>
    //   ),
    //   sortable: true,
    //   width: '120px'
    // },
    // {
    //   name: 'Status',
    //   selector: row => row.status,
    //   cell: row => (
    //     <div className={`px-2 py-1 rounded-full text-xs font-medium ${
    //       row.status === 'paid' ? 'bg-green-100 text-green-800' :
    //       row.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
    //       row.status === 'cancelled' ? 'bg-red-100 text-red-800' :
    //       'bg-gray-100 text-gray-800'
    //     }`}>
    //       {row.status?.toUpperCase() || 'N/A'}
    //     </div>
    //   ),
    //   sortable: true,
    //   width: '100px'
    // },
    {
      name: 'Action',
      selector: row => row._id,
      cell: row => (
        <Link
          href={'/billing/' + row._id}
          className="text-blue-500 hover:text-blue-700"
          title="View details"
        >
          <EyeIcon size={16} />
        </Link>
      ),
      sortable: false,
      width: '80px'
    }
  ];

  // Get unique doctors who have bills with service items
  const getUniqueDoctors = () => {
    if (!billings?.length) return [];
    const uniqueDoctors = new Map();
    billings.forEach(billing => {
      if (billing.doctorId?._id && billing.doctorId?.name && 
          billing.billingItems?.some(item => item.category?.toLowerCase() === 'service')) {
        uniqueDoctors.set(billing.doctorId._id, billing.doctorId);
      }
    });
    return Array.from(uniqueDoctors.values());
  };

  const SummaryCards = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 mb-6">
      {/* Payment Type Summary */}
      <div className="bg-green-50 p-4 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-green-700">Cash Collections</div>
            <div className="text-xs font-bold text-green-900">₹{formatCurrency(summary.cash)}</div>
          </div>
          <IndianRupeeIcon className="h-3 w-3 text-green-500" />
        </div>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-blue-700">Card Collections</div>
            <div className="text-xs font-bold text-blue-900">₹{formatCurrency(summary.card)}</div>
          </div>
          <IndianRupeeIcon className="h-3 w-3 text-blue-500" />
        </div>
      </div>
      
      <div className="bg-purple-50 p-4 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-purple-700">UPI Collections</div>
            <div className="text-xs font-bold text-purple-900">₹{formatCurrency(summary.upi)}</div>
          </div>
          <IndianRupeeIcon className="h-3 w-3 text-purple-500" />
        </div>
      </div>
      
      <div className="bg-orange-50 p-4 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-orange-700">NEFT Collections</div>
            <div className="text-xs font-bold text-orange-900">₹{formatCurrency(summary.neft)}</div>
          </div>
          <IndianRupeeIcon className="h-3 w-3 text-orange-500" />
        </div>
      </div>
      
      <div className="bg-teal-50 p-4 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-teal-700">Total Collections</div>
            <div className="text-xs font-bold text-teal-900">₹{formatCurrency(summary.totalAmount)}</div>
          </div>
          <Stethoscope className="h-3 w-3 text-teal-500" />
        </div>
      </div>
      
      <div className="bg-yellow-50 p-4 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-yellow-700">Service Charges</div>
            <div className="text-xs font-bold text-yellow-900">₹{formatCurrency(summary.serviceFees)}</div>
          </div>
          <FileText className="h-3 w-3 text-yellow-500" />
        </div>
      </div>
      
      <div className="bg-red-50 p-4 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-red-700">Pending Amount</div>
            <div className="text-xs font-bold text-red-900">₹{formatCurrency(summary.pending)}</div>
          </div>
          <IndianRupeeIcon className="h-3 w-3 text-red-500" />
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-gray-700">Total Bills</div>
            <div className="text-xs font-bold text-gray-900">{summary.billCount}</div>
          </div>
          <Users className="h-3 w-3 text-gray-500" />
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="container mx-auto">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-800 mb-2">Service Charges Report</h1>
          <p className="text-sm text-gray-600">Track and analyze service collection data with detailed breakdown by payment methods and status</p>
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
              <Users className="text-gray-500" size={20} />
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="border border-gray-300 p-2 text-xs rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Doctors</option>
                {getUniqueDoctors().map(doctor => (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search bills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border border-gray-300 p-2 text-xs rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={handleExport}
              disabled={!filteredBills.length}
              className="flex items-center text-xs gap-2 px-4 py-2 bg-blue-600 text-white rounded-md transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={16} />
              Export PDF
            </button>
          </div>
        </div>

        {/* Show details only when date range is selected */}
        {dateFrom && dateTo ? (
          <>
            {/* Summary Cards */}
            {filteredBills.length > 0 && <SummaryCards />}

            {/* DataTable */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <h2 className="text-xs font-semibold text-gray-800 mb-4">
                  Service Collection Details ({dayjs(dateFrom).format('DD-MM-YYYY')} to {dayjs(dateTo).format('DD-MM-YYYY')})
                </h2>
                <DataTable
                  columns={columns}
                  data={filteredBills}
                  pagination
                  highlightOnHover
                  responsive
                  progressPending={loading}
                  progressComponent={
                    <div className="flex items-center justify-center p-6">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  }
                  noDataComponent={
                    <div className="text-center py-8 text-gray-500">
                      <Stethoscope className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      <p>No service bills found for the selected criteria</p>
                      <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or date range</p>
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

            {/* Detailed Summary Table */}
            {filteredBills.length > 0 && (
              <div className="mt-6 bg-white rounded-lg shadow-sm border">
                <div className="p-6">
                  <h3 className="text-xs font-semibold text-gray-800 mb-4">Collection Summary</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="p-3 border font-medium text-gray-600 text-center">Total Collections</th>
                          <th className="p-3 border font-medium text-gray-600 text-center">Service Fees</th>
                          <th className="p-3 border font-medium text-gray-600 text-center">Cash</th>
                          <th className="p-3 border font-medium text-gray-600 text-center">Card</th>
                          <th className="p-3 border font-medium text-gray-600 text-center">UPI</th>
                          <th className="p-3 border font-medium text-gray-600 text-center">NEFT</th>
                          <th className="p-3 border font-medium text-gray-600 text-center">Pending</th>
                          <th className="p-3 border font-medium text-gray-600 text-center">Total Bills</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="hover:bg-gray-50">
                          <td className="p-3 border text-center font-semibold text-xs">
                            ₹{formatCurrency(summary.totalAmount)}
                          </td>
                          <td className="p-3 border text-center font-medium text-blue-600">
                            ₹{formatCurrency(summary.serviceFees)}
                          </td>
                          <td className="p-3 border text-center">₹{formatCurrency(summary.cash)}</td>
                          <td className="p-3 border text-center">₹{formatCurrency(summary.card)}</td>
                          <td className="p-3 border text-center">₹{formatCurrency(summary.upi)}</td>
                          <td className="p-3 border text-center">₹{formatCurrency(summary.neft)}</td>
                          <td className="p-3 border text-center text-red-600 font-medium">
                            ₹{formatCurrency(summary.pending)}
                          </td>
                          <td className="p-3 border text-center font-semibold">
                            {summary.billCount}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Date Selection Prompt */
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-12 text-center">
              <Stethoscope className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Select Date Range</h3>
              <p className="text-gray-500 mb-4">
                Please select both From Date and To Date to view the service collection report details.
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
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-700 text-sm">
                  💡 <strong>Tip:</strong> Select a date range to analyze service collection patterns, track payment methods, and generate detailed reports for the specified period.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ServiceCollection;