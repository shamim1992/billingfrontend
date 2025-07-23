import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllReceipts } from '@/redux/actions/billingActions';
import Layout from '@/components/Layout';
import DataTable from 'react-data-table-component';
import { Calendar, Eye, FileText, Download, Filter, X } from 'lucide-react';
import dayjs from 'dayjs';

const BillingAudit = () => {
  const dispatch = useDispatch();
  const { receipts, receiptsLoading, receiptsError } = useSelector((state) => state.billing);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filteredBills, setFilteredBills] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    // Fetch all receipts on component mount
    dispatch(fetchAllReceipts());
  }, [dispatch]);

  useEffect(() => {
    if (receipts?.length) {
      let filtered = receipts;

      // Filter by date if dates are selected
      if (dateFrom && dateTo) {
        filtered = filtered.filter(receipt => {
          const receiptDate = dayjs(receipt.date);
          return receiptDate.isAfter(dayjs(dateFrom).subtract(1, 'day')) && 
                 receiptDate.isBefore(dayjs(dateTo).add(1, 'day'));
        });
      }

      // Filter by type
      if (filterType !== 'all') {
        filtered = filtered.filter(receipt => receipt.type === filterType);
      }

      // Group receipts by bill number
      const billsMap = {};
      filtered.forEach(receipt => {
        const billNumber = receipt.billNumber || receipt.billingId?.billNumber || 'Unknown';
        if (!billsMap[billNumber]) {
          billsMap[billNumber] = {
            billNumber,
            billingId: receipt.billingId,
            receipts: [],
            totalAmount: 0,
            lastActivity: receipt.date,
            patientName: receipt.billingId?.patientId ? 
              `${receipt.billingId.patientId.firstName} ${receipt.billingId.patientId.lastName}` : 'N/A',
            doctorName: receipt.billingId?.doctorId?.name || 'N/A',
            status: receipt.billingId?.status || 'N/A'
          };
        }
        billsMap[billNumber].receipts.push(receipt);
        billsMap[billNumber].totalAmount += receipt.amount || 0;
        
        // Keep track of the latest activity
        if (dayjs(receipt.date).isAfter(dayjs(billsMap[billNumber].lastActivity))) {
          billsMap[billNumber].lastActivity = receipt.date;
        }
      });

      // Convert to array and sort by last activity
      const billsArray = Object.values(billsMap).sort((a, b) => 
        dayjs(b.lastActivity).diff(dayjs(a.lastActivity))
      );

      setFilteredBills(billsArray);
    } else {
      setFilteredBills([]);
    }
  }, [receipts, dateFrom, dateTo, filterType]);

  // Function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  // Function to get receipt type badge
  const getReceiptTypeBadge = (type) => {
    const colors = {
      'creation': 'bg-blue-100 text-blue-800',
      'payment': 'bg-green-100 text-green-800',
      'modification': 'bg-yellow-100 text-yellow-800',
      'cancellation': 'bg-red-100 text-red-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  // Function to get status badge
  const getStatusBadge = (status) => {
    const colors = {
      'paid': 'bg-green-100 text-green-800',
      'active': 'bg-blue-100 text-blue-800',
      'partial': 'bg-yellow-100 text-yellow-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Clear all filters
  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setFilterType('all');
  };

  // Export to CSV
  const exportToCSV = () => {
    if (!filteredBills.length) return;

    const csvContent = [
      // Header
      ['Bill Number', 'Patient Name', 'Doctor Name', 'Total Receipts', 'Total Amount', 'Status', 'Last Activity'].join(','),
      // Data rows
      ...filteredBills.map(bill => [
        bill.billNumber,
        bill.patientName,
        bill.doctorName,
        bill.receipts.length,
        bill.totalAmount || 0,
        bill.status,
        dayjs(bill.lastActivity).format('DD/MM/YYYY HH:mm')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `billing-audit-bills-${dayjs().format('YYYY-MM-DD')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const columns = [
    {
      name: 'S.No.',
      selector: (row, index) => index + 1,
      sortable: true,
      width: '80px'
    },
    {
      name: 'Bill Number',
      selector: row => row.billNumber,
      sortable: true,
      width: '150px',
      cell: row => (
        <span className="font-mono text-xs font-semibold">{row.billNumber}</span>
      )
    },
    {
      name: 'Patient Name',
      selector: row => row.patientName,
      sortable: true,
      width: '150px'
    },
    {
      name: 'Doctor Name',
      selector: row => row.doctorName,
      sortable: true,
      width: '150px'
    },
    {
      name: 'Total Receipts',
      selector: row => row.receipts.length,
      sortable: true,
      width: '120px',
      cell: row => (
        <div className="text-center">
          <span className="badge badge-primary badge-sm">{row.receipts.length}</span>
        </div>
      )
    },
    {
      name: 'Receipt Types',
      cell: row => {
        const types = [...new Set(row.receipts.map(r => r.type))];
        return (
          <div className="flex flex-wrap gap-1">
            {types.map(type => (
              <div key={type} className={`px-2 py-1 rounded text-xs capitalize ${getReceiptTypeBadge(type)}`}>
                {type}
              </div>
            ))}
          </div>
        );
      },
      width: '200px'
    },
    {
      name: 'Total Amount',
      selector: row => row.totalAmount,
      format: row => formatCurrency(row.totalAmount),
      sortable: true,
      width: '120px'
    },
    {
      name: 'Bill Status',
      selector: row => row.status,
      cell: row => (
        <div className={`px-2 py-1 rounded text-xs capitalize ${getStatusBadge(row.status)}`}>
          {row.status === 'active' ? 'Due' : row.status}
        </div>
      ),
      sortable: true,
      width: '100px'
    },
    {
      name: 'Last Activity',
      selector: row => row.lastActivity,
      format: row => dayjs(row.lastActivity).format('DD/MM/YYYY HH:mm'),
      sortable: true,
      width: '140px'
    }
  ];

  const ExpandedComponent = ({ data }) => (
    <div className="p-6 bg-gray-50">
      {/* Bill Summary */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-4">Bill Details - {data.billNumber}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-lg">
          <div>
            <h4 className="font-semibold text-sm mb-2">Patient Information</h4>
            <div className="space-y-1 text-xs">
              <p><span className="font-semibold">Name:</span> {data.patientName}</p>
              <p><span className="font-semibold">Patient ID:</span> {data.billingId?.patientId?._id || 'N/A'}</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2">Bill Summary</h4>
            <div className="space-y-1 text-xs">
              <p><span className="font-semibold">Grand Total:</span> {formatCurrency(data.billingId?.totals?.grandTotal)}</p>
              <p><span className="font-semibold">Paid Amount:</span> {formatCurrency(data.billingId?.payment?.paid)}</p>
              <p><span className="font-semibold">Due Amount:</span> {formatCurrency(data.billingId?.totals?.dueAmount)}</p>
              <p><span className="font-semibold">Status:</span> {data.status}</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2">Doctor Information</h4>
            <div className="space-y-1 text-xs">
              <p><span className="font-semibold">Doctor:</span> {data.doctorName}</p>
              <p><span className="font-semibold">Total Receipts:</span> {data.receipts.length}</p>
              <p><span className="font-semibold">Total Receipt Amount:</span> {formatCurrency(data.totalAmount)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* All Receipts and Changes */}
      <div>
        <h4 className="font-semibold text-lg mb-4">All Receipts & Changes</h4>
        <div className="space-y-4">
          {data.receipts.sort((a, b) => dayjs(b.date).diff(dayjs(a.date))).map((receipt, index) => (
            <div key={receipt._id || index} className="bg-white p-4 rounded-lg border-l-4 border-blue-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Receipt Basic Info */}
                <div>
                  <h5 className="font-semibold text-sm mb-2 text-blue-700">Receipt #{receipt.receiptNumber}</h5>
                  <div className="space-y-1 text-xs">
                    <p><span className="font-semibold">Date:</span> {dayjs(receipt.date).format('DD/MM/YYYY HH:mm')}</p>
                    <p><span className="font-semibold">Type:</span> 
                      <span className={`ml-1 px-2 py-1 rounded text-xs capitalize ${getReceiptTypeBadge(receipt.type)}`}>
                        {receipt.type}
                      </span>
                    </p>
                    <p><span className="font-semibold">Amount:</span> {formatCurrency(receipt.amount)}</p>
                    <p><span className="font-semibold">Created By:</span> {receipt.createdBy?.name || 'N/A'}</p>
                  </div>
                </div>

                {/* Status Changes */}
                <div>
                  <h5 className="font-semibold text-sm mb-2 text-green-700">Status Changes</h5>
                  <div className="space-y-1 text-xs">
                    {receipt.previousStatus && (
                      <p><span className="font-semibold">From:</span> 
                        <span className={`ml-1 px-2 py-1 rounded text-xs ${getStatusBadge(receipt.previousStatus)}`}>
                          {receipt.previousStatus}
                        </span>
                      </p>
                    )}
                    {receipt.newStatus && (
                      <p><span className="font-semibold">To:</span> 
                        <span className={`ml-1 px-2 py-1 rounded text-xs ${getStatusBadge(receipt.newStatus)}`}>
                          {receipt.newStatus}
                        </span>
                      </p>
                    )}
                    {!receipt.previousStatus && !receipt.newStatus && (
                      <p className="text-gray-500">No status changes</p>
                    )}
                  </div>
                </div>

                {/* Payment Details */}
                <div>
                  <h5 className="font-semibold text-sm mb-2 text-purple-700">Payment Details</h5>
                  <div className="space-y-1 text-xs">
                    {receipt.paymentMethod ? (
                      <>
                        <p><span className="font-semibold">Method:</span> {receipt.paymentMethod.type}</p>
                        {receipt.paymentMethod.cardNumber && (
                          <p><span className="font-semibold">Card:</span> **** {receipt.paymentMethod.cardNumber}</p>
                        )}
                        {receipt.paymentMethod.utrNumber && (
                          <p><span className="font-semibold">UTR:</span> {receipt.paymentMethod.utrNumber}</p>
                        )}
                      </>
                    ) : (
                      <p className="text-gray-500">No payment details</p>
                    )}
                  </div>
                </div>

                {/* Additional Info */}
                <div>
                  <h5 className="font-semibold text-sm mb-2 text-orange-700">Additional Info</h5>
                  <div className="space-y-1 text-xs">
                    {receipt.remarks && (
                      <p><span className="font-semibold">Remarks:</span> {receipt.remarks}</p>
                    )}
                    {receipt.reason && (
                      <p><span className="font-semibold">Reason:</span> {receipt.reason}</p>
                    )}
                    {!receipt.remarks && !receipt.reason && (
                      <p className="text-gray-500">No additional info</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Calculate summary statistics
  const totalReceipts = filteredBills.reduce((sum, bill) => sum + bill.receipts.length, 0);
  const totalAmount = filteredBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
  const paymentReceipts = filteredBills.reduce((sum, bill) => 
    sum + bill.receipts.filter(r => r.type === 'payment').length, 0);
  const modificationReceipts = filteredBills.reduce((sum, bill) => 
    sum + bill.receipts.filter(r => r.type === 'modification').length, 0);

  return (
    <Layout>
      <div className="bg-base-100">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">Billing Audit - Bills Overview</h1>
          <div className="flex gap-2">
            <button
              onClick={exportToCSV}
              className="btn btn-outline btn-sm"
              disabled={!filteredBills.length}
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="card bg-base-200 mb-6">
          <div className="card-body p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="input input-bordered input-sm"
                  placeholder="From Date"
                />
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="input input-bordered input-sm"
                  placeholder="To Date"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter size={16} />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="select select-bordered select-sm"
                >
                  <option value="all">All Receipt Types</option>
                  <option value="creation">Creation</option>
                  <option value="payment">Payment</option>
                  <option value="modification">Modification</option>
                  <option value="cancellation">Cancellation</option>
                </select>
              </div>
              {(dateFrom || dateTo || filterType !== 'all') && (
                <button
                  onClick={clearFilters}
                  className="btn btn-ghost btn-sm"
                  title="Clear all filters"
                >
                  <X size={16} />
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-title">Total Bills</div>
            <div className="stat-value text-lg">{filteredBills.length}</div>
          </div>
          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-title">Total Receipts</div>
            <div className="stat-value text-lg">{totalReceipts}</div>
          </div>
          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-title">Payment Receipts</div>
            <div className="stat-value text-lg text-success">{paymentReceipts}</div>
          </div>
          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-title">Modification Receipts</div>
            <div className="stat-value text-lg text-warning">{modificationReceipts}</div>
          </div>
        </div>

        {/* Table Section */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-0">
            <DataTable
              columns={columns}
              data={filteredBills}
              pagination
              highlightOnHover
              responsive
              expandableRows
              expandableRowsComponent={ExpandedComponent}
              progressPending={receiptsLoading}
              progressComponent={
                <div className="flex justify-center py-8">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              }
              noDataComponent={
                <div className="text-center py-8">
                  {receiptsError ? (
                    <div className="text-error">
                      Error loading receipts: {receiptsError.message || receiptsError}
                    </div>
                  ) : filteredBills.length === 0 && receipts?.length > 0 ? (
                    "No bills found matching your filters"
                  ) : (
                    "No billing data available"
                  )}
                </div>
              }
              paginationPerPage={10}
              paginationRowsPerPageOptions={[10, 20, 30, 50, 100]}
              customStyles={{
                headRow: {
                  style: {
                    backgroundColor: 'hsl(var(--b2))',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  },
                },
                cells: {
                  style: {
                    fontSize: '12px'
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BillingAudit;