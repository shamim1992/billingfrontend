import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBillings } from '@/redux/actions/billingActions';
import { fetchUsers } from '@/redux/actions/userActions';
import Layout from '@/components/Layout';
import DataTable from 'react-data-table-component';
import { Calendar, Download } from 'lucide-react';
import dayjs from 'dayjs';

const UserCollection = () => {
  const dispatch = useDispatch();
  const { billings, loading } = useSelector((state) => state.billing);
  const { users } = useSelector((state) => state.users);
  console.log(billings)
  // State
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
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
    billCount: 0
  });

  // Initial data fetch
  useEffect(() => {
    dispatch(fetchBillings());
    dispatch(fetchUsers());
  }, [dispatch]);

  // Calculate summary for filtered bills
  const calculateSummary = (bills) => {
    const newSummary = bills.reduce((acc, bill) => {
      const paymentType = bill.payment?.type?.toLowerCase() || 'cash';
      const amount = parseFloat(bill.payment?.paid) || 0;
      const status = bill.remarks?.toLowerCase() || 'pending';

      // Update payment type totals
      acc[paymentType] += amount;

      // Update status totals
      acc[status] += amount;

      // Update total amount
      acc.totalAmount += amount;

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
      billCount: bills.length
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
          return billDate.isAfter(dayjs(dateFrom)) && 
                 billDate.isBefore(dayjs(dateTo).add(1, 'day'));
        });
      }

      // User filter
      if (selectedUser) {
        filtered = filtered.filter(bill => bill.createdBy?._id === selectedUser);
      }

      // Search filter
      if (searchQuery) {
        const search = searchQuery.toLowerCase();
        filtered = filtered.filter(bill => 
          bill._id?.toLowerCase().includes(search) ||
          bill.receiptNumber?.toLowerCase().includes(search) ||
          `${bill.patientId?.firstName} ${bill.patientId?.lastName}`.toLowerCase().includes(search) ||
          bill.doctorId?.name?.toLowerCase().includes(search)
        );
      }

      setFilteredBills(filtered);
      calculateSummary(filtered);
    }
  }, [billings, dateFrom, dateTo, selectedUser, searchQuery]);

  // Currency formatter
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  // PDF Export Function
  const handleExport = () => {
    // Create a new window for the printable version
    const printWindow = window.open('', '_blank');
    
    // Generate the HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>User Collection Report - ${dayjs().format('YYYY-MM-DD')}</title>
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
            .report-date { 
              color: #666; 
              font-size: 14px;
            }
            .filter-info {
              margin-bottom: 20px;
              font-size: 12px;
              color: #666;
            }
            .payment-status {
              padding: 4px 8px;
              border-radius: 4px;
              font-weight: 500;
            }
            .status-paid { background-color: #d1fae5; color: #065f46; }
            .status-pending { background-color: #fee2e2; color: #991b1b; }
            .status-partial { background-color: #fef3c7; color: #92400e; }
            @media print {
              .no-print { display: none; }
              table { page-break-inside: auto; }
              tr { page-break-inside: avoid; page-break-after: auto; }
              thead { display: table-header-group; }
              .header { position: fixed; top: 0; width: 100%; }
              body { padding-top: 120px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="report-title">User Collection Report</div>
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
                <th>Cash</th>
                <th>Card</th>
                <th>UPI</th>
                <th>NEFT</th>
              </tr>
              <tr>
                <td>${formatCurrency(summary.totalAmount)}</td>
                <td>${formatCurrency(summary.cash)}</td>
                <td>${formatCurrency(summary.card)}</td>
                <td>${formatCurrency(summary.upi)}</td>
                <td>${formatCurrency(summary.neft)}</td>
              </tr>
            </table>
            
            <table>
              <tr>
                <th>Total Bills</th>
                <th>Paid Bills</th>
                <th>Partial Payments</th>
                <th>Pending Amount</th>
              </tr>
              <tr>
                <td>${summary.billCount}</td>
                <td>${formatCurrency(summary.paid)}</td>
                <td>${formatCurrency(summary.partial)}</td>
                <td>${formatCurrency(summary.pending)}</td>
              </tr>
            </table>
          </div>

          <div class="summary-title">Billing Details</div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Bill No</th>
                <th>Created By</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Amount</th>
                <th>Paid</th>
                <th>Balance</th>
                <th>Payment Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredBills.map(bill => `
                <tr>
                  <td>${dayjs(bill.date).format('DD/MM/YYYY')}</td>
                  <td>${bill._id}</td>
                   <td>${bill.createdBy.name}</td>
                  <td>${bill.patientId?.firstName} ${bill.patientId?.lastName}</td>
                  <td>${bill.doctorId?.name || ''}</td>
                  <td>${formatCurrency(bill.totals?.grandTotal)}</td>
                  <td>${formatCurrency(bill.payment?.paid)}</td>
                  <td>${formatCurrency(bill.totals?.balance)}</td>
                  <td>${bill.payment?.type?.toUpperCase() || 'N/A'}</td>
                  <td>
                    <span class="payment-status ${
                      bill.remarks === 'paid' ? 'status-paid' :
                      bill.remarks === 'pending' ? 'status-pending' :
                      'status-partial'
                    }">
                      ${bill.remarks?.toUpperCase() || 'N/A'}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <button class="no-print" onclick="window.print();" 
            style="
              padding: 10px 20px; 
              background: #2563eb; 
              color: white; 
              border: none; 
              border-radius: 4px; 
              cursor: pointer;
              position: fixed;
              bottom: 20px;
              right: 20px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            ">
            Print PDF
          </button>
        </body>
      </html>
    `;

    // Write the content to the new window
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

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
    },
    {
      name: 'Created By',
      selector: row => row?.createdBy?.name,
      sortable: true,
    },
    {
      name: 'Patient',
      selector: row => `${row.patientId?.firstName} ${row.patientId?.lastName}`,
      sortable: true,
    },
    {
      name: 'Doctor',
      selector: row => row.doctorId?.name,
      sortable: true,
    },
    {
      name: 'Amount',
      selector: row => row.totals?.grandTotal || 0,
      format: row => formatCurrency(row.totals?.grandTotal),
      sortable: true,
    },
    {
      name: 'Paid',
      selector: row => row.payment?.paid || 0,
      format: row => formatCurrency(row.payment?.paid),
      sortable: true,
    },
    {
      name: 'Balance',
      selector: row => row.totals?.balance || 0,
      format: row => formatCurrency(row.totals?.balance),
      sortable: true,
    },
    {
      name: 'Payment Type',
      selector: row => row.payment?.type,
      cell: row => (
        <div className={`px-2 py-1 rounded-full text-xs ${
          row.payment?.type?.toLowerCase() === 'cash' ? 'bg-green-100 text-green-800' :
          row.payment?.type?.toLowerCase() === 'card' ? 'bg-blue-100 text-blue-800' :
          row.payment?.type?.toLowerCase() === 'upi' ? 'bg-purple-100 text-purple-800' :
          'bg-orange-100 text-orange-800'
        }`}>
          {row.payment?.type?.toUpperCase() || 'N/A'}
        </div>
      ),
      sortable: true,
    },
    {
      name: 'Status',
      selector: row => row.remarks,
      cell: row => (
        <div className={`px-2 py-1 rounded text-xs ${
          row.remarks === 'paid' ? 'bg-green-100 text-green-800' :
          row.remarks === 'pending' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {row.remarks?.toUpperCase() || 'N/A'}
        </div>
      ),
      sortable: true,
    }
  ];

  // Get unique users who have created bills
  const getUniqueCreators = () => {
    if (!billings?.length) return [];
    const uniqueCreators = new Map();
    billings.forEach(billing => {
      if (billing.createdBy?._id && billing.createdBy?.name) {
        uniqueCreators.set(billing.createdBy._id, billing.createdBy);
      }
    });
    return Array.from(uniqueCreators.values());
  };

  const SummaryCards = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {/* Payment Type Summary */}
      <div className="col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-xs font-semibold text-green-700">Cash Collections</div>
          <div className="text-sm font-bold text-green-900">{formatCurrency(summary.cash)}</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-xs font-semibold text-blue-700">Card Collections</div>
          <div className="text-sm font-bold text-blue-900">{formatCurrency(summary.card)}</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-xs font-semibold text-purple-700">UPI Collections</div>
          <div className="text-sm font-bold text-purple-900">{formatCurrency(summary.upi)}</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-xs font-semibold text-orange-700">NEFT Collections</div>
          <div className="text-sm font-bold text-orange-900">{formatCurrency(summary.neft)}</div>
        </div>
      </div>

      {/* Status Summary */}
      <div className="col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-xs font-semibold text-green-700">Paid Bills</div>
          <div className="text-sm font-bold text-green-900">{formatCurrency(summary.paid)}</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-xs font-semibold text-yellow-700">Partial Payments</div>
          <div className="text-sm font-bold text-yellow-900">{formatCurrency(summary.partial)}</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-xs font-semibold text-red-700">Pending Amount</div>
          <div className="text-sm font-bold text-red-900">{formatCurrency(summary.pending)}</div>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg">
          <div className="text-xs font-semibold text-gray-700">Total Bills</div>
          <div className="text-sm font-bold text-gray-900">{summary.billCount}</div>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-lg font-bold">User Collection Report</h1>
          <button 
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg hover:shadow-md border transition-colors bg-blue-500 text-white hover:bg-blue-600"
          >
            <Download size={16} />
            Export PDF
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text">From Date</span>
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="input input-bordered input-sm"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">To Date</span>
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="input input-bordered input-sm"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Select User</span>
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="select select-bordered select-sm"
            >
              <option value="">All Users</option>
              {getUniqueCreators().map(user => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Search</span>
            </label>
            <input
              type="text"
              placeholder="Search bills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-bordered input-sm"
            />
          </div>
        </div>

        {/* Summary Cards */}
        {filteredBills.length > 0 && <SummaryCards />}

        {/* DataTable */}
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <DataTable
              columns={columns}
              data={filteredBills}
              pagination
              highlightOnHover
              responsive
              progressPending={loading}
              progressComponent={
                <div className="text-center py-4">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              }
              noDataComponent={
                <div className="text-center py-4">
                  {(dateFrom && dateTo) || selectedUser || searchQuery
                    ? "No bills found for the selected filters"
                    : "Please apply filters to view bills"}
                </div>
              }
              paginationPerPage={10}
              paginationRowsPerPageOptions={[10, 25, 50, 100]}
              dense
              customStyles={{
                headRow: {
                  style: {
                    backgroundColor: '#f8fafc',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#475569',
                  },
                },
                rows: {
                  style: {
                    fontSize: '0.875rem',
                    fontWeight: '400',
                    color: '#1e293b',
                    
                  },
                },
                cells: {
                  style: {
                    padding: '12px 16px',
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Expanded View for Bill Details */}
        {filteredBills.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow">
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-4">Collection Summary</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 border">Total Collections</th>
                      <th className="px-4 py-2 border">Cash</th>
                      <th className="px-4 py-2 border">Card</th>
                      <th className="px-4 py-2 border">UPI</th>
                      <th className="px-4 py-2 border">NEFT</th>
                      <th className="px-4 py-2 border">Paid Bills</th>
                      <th className="px-4 py-2 border">Partial</th>
                      <th className="px-4 py-2 border">Pending</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="text-center">
                      <td className="px-4 py-2 border font-medium">
                        {formatCurrency(summary.totalAmount)}
                      </td>
                      <td className="px-4 py-2 border">{formatCurrency(summary.cash)}</td>
                      <td className="px-4 py-2 border">{formatCurrency(summary.card)}</td>
                      <td className="px-4 py-2 border">{formatCurrency(summary.upi)}</td>
                      <td className="px-4 py-2 border">{formatCurrency(summary.neft)}</td>
                      <td className="px-4 py-2 border text-green-600">
                        {formatCurrency(summary.paid)}
                      </td>
                      <td className="px-4 py-2 border text-yellow-600">
                        {formatCurrency(summary.partial)}
                      </td>
                      <td className="px-4 py-2 border text-red-600">
                        {formatCurrency(summary.pending)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default UserCollection;