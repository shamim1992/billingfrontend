import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBillings } from '@/redux/actions/billingActions';
import { fetchUsers } from '@/redux/actions/userActions';
import Layout from '@/components/Layout';
import DataTable from 'react-data-table-component';
import { Calendar, Download } from 'lucide-react';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';

// Expanded Row Component
const ExpandedComponent = ({ data, formatCurrency }) => (
  <div className="p-4 bg-gray-50">
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div>
        <h4 className="text-xs mb-2">Billing Details</h4>
        <p className='text-xs'><span className="text-xs">Payment Type:</span> {data.paymenttype}</p>
        <p className='text-xs'>
          <span className="text-xs">Amount Paid:</span> 
          {data.billingDetails?.payment?.paid === data.paymentpaid ? (
            formatCurrency(data.paymentpaid)
          ) : (
            <span className={data.billingDetails?.payment?.paid > data.paymentpaid ? 
              'text-red-600' : 'text-green-600'}>
              {formatCurrency(data.paymentpaid)} → {formatCurrency(data.billingDetails?.payment?.paid)}
            </span>
          )}
        </p>
        <p className='text-xs'><span className="text-xs">Balance:</span> {formatCurrency(data.billingDetails?.totals?.balance)}</p>
      </div>
      <div>
        <h4 className="text-xs mb-2 ">Amount Breakdown</h4>
        <p className='text-xs'><span className=" text-xs">Subtotal:</span> {formatCurrency(data.billingDetails?.totals?.subtotal)}</p>
        <p className='text-xs'><span className=" text-xs">Tax:</span> {formatCurrency(data.billingDetails?.totals?.totalTax)}</p>
        <p className='text-xs'>
          <span className="text-xs">Discount:</span> 
          {data.billingDetails?.discount?.value}
          {data.billingDetails?.discount?.type === 'percent' ? '%' : ' INR'}
        </p>
      </div>
    </div>
    <div>
      <h4 className="text-xs mb-2">Items</h4>
      <div className="grid grid-cols-1 gap-2">
        {data.billingDetails?.billingItems?.map((item, index) => (
          <div key={index} className="flex justify-between bg-white p-2 rounded text-xs">
            <span>{item.name}</span>
            <div className="flex gap-4">
              <span>Qty: {item.quantity}</span>
              <span>{formatCurrency(item.total)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const BillingAudit = () => {
  const dispatch = useDispatch();
  const { billings, loading } = useSelector((state) => state.billing);
  const { users } = useSelector((state) => state.users);
  
  // State
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [filteredReceipts, setFilteredReceipts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Initial data fetch
  useEffect(() => {
    dispatch(fetchBillings());
    dispatch(fetchUsers());
  }, [dispatch]);

  // Filter handling
  useEffect(() => {
    if (billings?.length) {
      const allReceipts = billings.reduce((acc, billing) => {
        const receipts = billing.receiptHistory.map(history => ({
          ...history,
          patientId: billing.patientId,
          doctorId: billing.doctorId,
          createdBy: billing.createdBy,
          _id: billing._id,
          paymentpaid: billing.payment.paid,
          paymenttype: billing.payment.type,
        }));
        return [...acc, ...receipts];
      }, []);

      let filtered = allReceipts;

      // Date filter
      if (dateFrom && dateTo) {
        filtered = filtered.filter(receipt => {
          const receiptDate = dayjs(receipt.date);
          return receiptDate.isAfter(dayjs(dateFrom)) && 
                 receiptDate.isBefore(dayjs(dateTo).add(1, 'day'));
        });
      }

      // User filter
      if (selectedUser) {
        filtered = filtered.filter(receipt => receipt.createdBy?._id === selectedUser);
      }

      // Search filter
      if (searchQuery) {
        const search = searchQuery.toLowerCase();
        filtered = filtered.filter(receipt => 
          receipt.receiptNumber.toLowerCase().includes(search) ||
          `${receipt.patientId?.firstName} ${receipt.patientId?.lastName}`.toLowerCase().includes(search) ||
          receipt.doctorId?.name.toLowerCase().includes(search)
        );
      }

      setFilteredReceipts(filtered);
    }
  }, [billings, dateFrom, dateTo, selectedUser, searchQuery]);

  // Currency formatter
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  // Calculate totals
  const calculateTotals = () => {
    return filteredReceipts.reduce((acc, receipt) => {
      const total = receipt.billingDetails?.totals?.grandTotal || 0;
      const paid = receipt.billingDetails?.payment?.paid || 0;
      return {
        totalAmount: acc.totalAmount + total,
        totalPaid: acc.totalPaid + paid,
        count: acc.count + 1
      };
    }, { totalAmount: 0, totalPaid: 0, count: 0 });
  };

  // Export to Excel
  const handleExport = () => {
    const exportData = filteredReceipts.map(receipt => ({
      Date: dayjs(receipt.date).format('DD/MM/YYYY'),
      'Receipt Number': receipt.receiptNumber,
      'Patient Name': `${receipt.patientId?.firstName} ${receipt.patientId?.lastName}`,
      'Doctor': receipt.doctorId?.name,
      'Created By': receipt.createdBy?.name,
      'Amount': receipt.billingDetails?.totals?.grandTotal,
      'Paid': receipt.billingDetails?.payment?.paid,
      'Balance': receipt.billingDetails?.totals?.balance,
      'Payment Type': receipt.paymenttype,
      'Status': receipt.billingDetails?.remarks?.toUpperCase()
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Billing Report');
    XLSX.writeFile(wb, `Billing_Report_${dayjs().format('YYYY-MM-DD')}.xlsx`);
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
      name: 'Receipt No',
      selector: row => row.receiptNumber,
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
      name: 'Created By',
      selector: row => row.createdBy?.name || 'N/A',
      sortable: true,
    },
    {
      name: 'Amount',
      selector: row => row.billingDetails?.totals?.grandTotal || 0,
      format: row => formatCurrency(row.billingDetails?.totals?.grandTotal),
      sortable: true,
      right: true,
    },
    {
      name: 'Paid',
      selector: row => row.billingDetails?.payment?.paid || 0,
      format: row => formatCurrency(row.billingDetails?.payment?.paid),
      sortable: true,
      right: true,
    },
    {
      name: 'Balance',
      selector: row => row.billingDetails?.totals?.balance || 0,
      format: row => formatCurrency(row.billingDetails?.totals?.balance),
      sortable: true,
      right: true,
    },
    {
      name: 'Payment Type',
      selector: row => row.paymenttype,
      sortable: true,
    },
    {
      name: 'Status',
      selector: row => row.billingDetails?.remarks,
      cell: row => (
        <div className={`px-2 py-1 rounded text-xs ${
          row.billingDetails?.remarks === 'paid' ? 'bg-green-100 text-green-800' :
          row.billingDetails?.remarks === 'pending' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {row.billingDetails?.remarks?.toUpperCase()}
        </div>
      ),
      sortable: true,
    }
  ];
  const getUniqueCreators = () => {
    if (!billings?.length) return [];
    
    // Get unique creator IDs and their names from the billings
    const uniqueCreators = new Map();
    
    billings.forEach(billing => {
      if (billing.createdBy?._id && billing.createdBy?.name) {
        uniqueCreators.set(billing.createdBy._id, billing.createdBy);
      }
    });
    
    // Convert Map to array of user objects
    return Array.from(uniqueCreators.values());
  };
  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-sm font-bold">Billing Audit Report</h1>
          <button 
            onClick={handleExport}
            className="inline-flex text-xs items-center gap-2 px-4 py-2 rounded-2xl hover:shadow-md border transition-colors"
          >
            <Download size={16} />
            Export to Excel
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

          {/* <div className="form-control">
            <label className="label">
              <span className="label-text">User</span>
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="select select-bordered select-sm"
            >
              <option value="">All Users</option>
              {users?.map(user => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div> */}

<div className="form-control">
  <label className="label">
    <span className="label-text">User</span>
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
              placeholder="Search receipts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-bordered input-sm"
            />
          </div>
        </div>

        {/* Summary Cards */}
        {filteredReceipts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="stat bg-base-100 rounded-lg shadow">
              <div className="text-sm font-bold">Total Bills</div>
              <div className="text-xs font-bold">{calculateTotals().count}</div>
            </div>
            <div className="stat bg-base-100 rounded-lg shadow">
              <div className="text-sm font-bold">Total Amount</div>
              <div className="text-xs font-bold text-primary">
                {formatCurrency(calculateTotals().totalAmount)}
              </div>
            </div>
            <div className="stat bg-base-100 rounded-lg shadow">
              <div className="text-sm font-bold">Total Paid</div>
              <div className="text-success text-xs font-bold">
                {formatCurrency(calculateTotals().totalPaid)}
              </div>
            </div>
          </div>
        )}

        {/* DataTable */}
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <DataTable
              columns={columns}
              data={filteredReceipts}
              pagination
              highlightOnHover
              responsive
              expandableRows
              expandableRowsComponent={props => <ExpandedComponent {...props} formatCurrency={formatCurrency} />}
              progressPending={loading}
              progressComponent={
                <div className="text-center py-4">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              }
              noDataComponent={
                <div className="text-center py-4">
                  {(dateFrom && dateTo) || selectedUser || searchQuery
                    ? "No records found for the selected filters"
                    : "Please apply filters to view records"}
                </div>
              }
              paginationPerPage={10}
              paginationRowsPerPageOptions={[10, 25, 50, 100]}
              dense
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BillingAudit;