import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBillings } from '@/redux/actions/billingActions';
import Layout from '@/components/Layout';
import DataTable from 'react-data-table-component';
import { Calendar, Eye } from 'lucide-react';
import dayjs from 'dayjs';

const BillingAudit = () => {
  const dispatch = useDispatch();
  const { billings, loading } = useSelector((state) => state.billing);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filteredReceipts, setFilteredReceipts] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);


  useEffect(() => {
    dispatch(fetchBillings());
  }, [dispatch]);

  useEffect(() => {
    if (billings?.length) {
      const allReceipts = billings.reduce((acc, billing) => {
        console.log(billing)
        const receipts = billing.receiptHistory.map(history => ({
          ...history,
          patientId: billing.patientId,
          doctorId: billing.doctorId,
          _id: billing._id, paymentpaid: billing.payment.id, paymentpaid: billing.payment.paid, paymenttype: billing.payment.type,
        }));
        return [...acc, ...receipts];
      }, []);

      // Filter by date if dates are selected
      const filtered = dateFrom && dateTo
        ? allReceipts.filter(receipt => {
            const receiptDate = dayjs(receipt.date);
            return receiptDate.isAfter(dayjs(dateFrom)) && 
                   receiptDate.isBefore(dayjs(dateTo).add(1, 'day'));
          })
        : allReceipts;

      setFilteredReceipts(filtered);
    } else {
      setFilteredReceipts([]);
    }
  }, [billings, dateFrom, dateTo]);

  // Function to format billing items
  const formatBillingItems = (items) => {
    if (!items || !Array.isArray(items)) return 'No items';
    return items.map(item => `${item.name} (${item.quantity})`).join(', ');
  };

  // Function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const columns = [
    {
      name: 'S.No.',
      selector: (row, index) => index + 1,
      sortable: true,
      width: '80px'
    },
    {
      name: 'Date',
      selector: row => dayjs(row.date).format('DD/MM/YYYY'),
      sortable: true,
    },
    {
      name: 'Receipt Number',
      selector: row => row.receiptNumber,
      sortable: true,
    },
    {
      name: 'Patient Name',
      selector: row => row.patientId.firstName + ' ' + row.patientId.lastName,
      sortable: true,
    },
    {
      name: 'Doctor Name',
      selector: row => row.doctorId?.name,
      sortable: true,
    },
    {
      name: 'Total Amount',
      selector: row => row.billingDetails?.totals?.grandTotal,
      format: row => formatCurrency(row.billingDetails?.totals?.grandTotal || 0),
      sortable: true,
    },
    {
      name: 'Payment Status',
      selector: row => row.billingDetails?.remarks,
      cell: row => (
        <div className={`px-2 py-1 rounded text-xs ${
          row.billingDetails?.remarks === 'paid' ? 'bg-green-100 text-green-800' :
          row.billingDetails?.remarks === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {row.billingDetails?.remarks?.toUpperCase()}
        </div>
      ),
      sortable: true,
    }
  ];

  const ExpandedComponent = ({ data }) => (
    <div className="p-4 bg-gray-50">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="font-semibold mb-2">Billing Details</h4>
          <p><span className="font-medium">Payment Type:</span> {data.billingDetails?.payment?.type}</p>
          <p><span className="font-medium">Amount Paid:</span> <span>
  {data.billingDetails?.payment?.paid === data.paymentpaid
    ? data.billingDetails?.payment?.paid
    : data.billingDetails?.payment?.paid > data.paymentpaid ? (
      <>
        <span style={{ color: 'red' }}>
        {data.paymentpaid} ← {data.billingDetails?.payment?.paid} 
        </span>
      </>
    ) : (
      <>
        <span style={{ color: 'green' }}>
           {data.paymentpaid} → {data.billingDetails?.payment?.paid} 
        </span>
      </>
    )}
</span></p>
          <p><span className="font-medium">Balance:</span> {formatCurrency(data.billingDetails?.totals?.balance)}</p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Amount Breakdown</h4>
          <p><span className="font-medium">Subtotal:</span> {formatCurrency(data.billingDetails?.totals?.subtotal)}</p>
          <p><span className="font-medium">Tax:</span> {formatCurrency(data.billingDetails?.totals?.totalTax)}</p>
          <p><span className="font-medium">Discount:</span> {data.billingDetails?.discount?.value}
            {data.billingDetails?.discount?.type === 'percent' ? '%' : ' INR'}</p>
        </div>
      </div>
      <div>
        <h4 className="font-semibold mb-2">Items</h4>
        <div className="grid grid-cols-1 gap-2">
          {data.billingDetails?.billingItems?.map((item, index) => (
            <div key={index} className="flex justify-between bg-white p-2 rounded">
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

  return (
    <Layout>
      <div className="container mx-auto">
        <h1 className="text-sm font-bold mb-6">Billing Receipt History</h1>

        {/* Date Filter Section */}
        <div className="flex gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Calendar size={20} />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="border p-2 rounded"
              placeholder="From Date"
            />
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={20} />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="border p-2 rounded"
              placeholder="To Date"
            />
          </div>
        </div>

        {/* Table Section */}
        <div className="card ">
          <div className="card-body">
            <DataTable
              columns={columns}
              data={filteredReceipts}
              pagination
              highlightOnHover
              responsive
              expandableRows
              expandableRowsComponent={ExpandedComponent}
              progressPending={loading}
              progressComponent={<div className="text-center py-4">Loading...</div>}
              noDataComponent={
                <div className="text-center py-4">
                  {dateFrom && dateTo 
                    ? "No receipt history found for selected date range"
                    : "Please select date range to view receipt history"}
                </div>
              }
              paginationPerPage={10}
              paginationRowsPerPageOptions={[10, 20, 30, 50]}
              customStyles={{
                headRow: {
                  style: {
                    backgroundColor: 'hsl(var(--b2))',
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BillingAudit;