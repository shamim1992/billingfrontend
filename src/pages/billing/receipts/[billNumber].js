// pages/billing/receipts/[billNumber].js
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { 
  ArrowLeft, 
  FileText, 
  Eye, 
  Download, 
  Filter,
  Calendar,
  CreditCard,
  Edit2,
  X,
  CheckCircle
} from 'lucide-react';
import Layout from '@/components/Layout';
import { 
  fetchReceiptsByBillNumber, 
  fetchBillingByBillNumber,
  fetchBillingById 
} from '@/redux/actions/billingActions';
import Link from 'next/link';

const ViewReceiptsPage = () => {
  const router = useRouter();
  const { billNumber } = router.query;
  
  const dispatch = useDispatch();
  const { 
    receiptsByBill, 
    billByNumber,
    billing,
    receiptsLoading, 
    receiptsError,
    loading 
  } = useSelector((state) => state.billing);
  
  // Local state for filtering
  const [filterType, setFilterType] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  useEffect(() => {
    if (billNumber) {
      // Try to fetch by bill number first, then by ID if that fails
      const fetchBillAndReceipts = async () => {
        try {
          // Check if billNumber is a valid bill number or MongoDB ObjectId
          if (billNumber.length === 9 && /^\d+$/.test(billNumber)) {
            // It's a bill number
            dispatch(fetchBillingByBillNumber(billNumber));
            dispatch(fetchReceiptsByBillNumber(billNumber));
          } else {
            // It's likely a MongoDB ObjectId, fetch by ID first to get bill number
            const result = await dispatch(fetchBillingById(billNumber)).unwrap();
            if (result.billNumber) {
              dispatch(fetchReceiptsByBillNumber(result.billNumber));
            }
          }
        } catch (error) {
          console.error('Error fetching bill or receipts:', error);
        }
      };
      
      fetchBillAndReceipts();
    }
  }, [dispatch, billNumber]);

  const bill = billByNumber || billing;

  const getReceiptTypeColor = (type) => {
    switch (type) {
      case 'creation':
        return 'badge-info';
      case 'payment':
        return 'badge-success';
      case 'modification':
        return 'badge-warning';
      case 'cancellation':
        return 'badge-error';
      default:
        return 'badge-ghost';
    }
  };

  const getReceiptTypeIcon = (type) => {
    switch (type) {
      case 'creation':
        return <CheckCircle size={16} />;
      case 'payment':
        return <CreditCard size={16} />;
      case 'modification':
        return <Edit2 size={16} />;
      case 'cancellation':
        return <X size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'badge-success';
      case 'active':
        return 'badge-info';
      case 'partial':
        return 'badge-warning';
      case 'cancelled':
        return 'badge-error';
      default:
        return 'badge-ghost';
    }
  };

  const getStatusDisplayText = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'Due';
      case 'paid':
        return 'Paid';
      case 'partial':
        return 'Partial';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status || 'Unknown';
    }
  };

  // Filter and sort receipts
  const filteredAndSortedReceipts = React.useMemo(() => {
    if (!receiptsByBill) return [];
    
    let filtered = receiptsByBill;
    
    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(receipt => receipt.type === filterType);
    }
    
    // Create a copy of the array before sorting to avoid mutating Redux state
    const sortedFiltered = [...filtered];
    
    // Sort by date
    sortedFiltered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    
    return sortedFiltered;
  }, [receiptsByBill, filterType, sortOrder]);

  const exportReceipts = () => {
    if (!receiptsByBill || receiptsByBill.length === 0) return;

    const csvContent = [
      // Header
      ['Receipt Number', 'Type', 'Amount', 'Date', 'Created By', 'Remarks'].join(','),
      // Data rows
      ...filteredAndSortedReceipts.map(receipt => [
        receipt.receiptNumber,
        receipt.type,
        receipt.amount || 0,
        new Date(receipt.date).toLocaleDateString(),
        receipt.createdBy?.name || '',
        receipt.remarks || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipts-${bill?.billNumber || billNumber}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleReceiptClick = (receipt) => {
    console.log(receipt)
    router.push(`/billing/receipts/details/${receipt.receiptNumber}`);
    // setSelectedReceipt(receipt);
    // setShowReceiptModal(true);
  };

  if (loading || receiptsLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </Layout>
    );
  }

  if (receiptsError) {
    return (
      <Layout>
        <div className="alert alert-error">
          <span>Error loading receipts: {typeof receiptsError === 'object' ? receiptsError.message : receiptsError}</span>
        </div>
      </Layout>
    );
  }

  const billStatus = bill?.status || bill?.remarks;
  const dueAmount = bill?.totals?.dueAmount ?? bill?.totals?.balance ?? 0;

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/billing" className="btn btn-ghost btn-sm">
            <ArrowLeft size={16} />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <FileText size={24} />
              <h1 className="text-2xl font-bold">
                Receipts for Bill #{bill?.billNumber || billNumber}
              </h1>
              {bill && (
                <span className={`badge text-white ${getStatusBadgeClass(billStatus)}`}>
                  {getStatusDisplayText(billStatus)}
                </span>
              )}
            </div>
            <p className="text-gray-600">
              {bill 
                ? `Patient: ${bill.patientId?.firstName} ${bill.patientId?.lastName} | Doctor: ${bill.doctorId?.name}`
                : 'View all receipts and transactions for this bill'
              }
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportReceipts}
              className="btn btn-outline btn-sm"
              disabled={!receiptsByBill?.length}
            >
              <Download size={16} />
              Export
            </button>
            {bill && (
              <Link
                href={`/billing/${bill._id}`}
                className="btn btn-primary text-white btn-sm"
              >
                View Bill Details
              </Link>
            )}
          </div>
        </div>

        {/* Bill Summary (if available) */}
        {bill && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-title">Grand Total</div>
              <div className="stat-value text-lg">₹{bill.totals?.grandTotal?.toFixed(2)}</div>
            </div>
            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-title">Paid Amount</div>
              <div className="stat-value text-lg text-success">₹{bill.payment?.paid?.toFixed(2)}</div>
            </div>
            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-title">Due Amount</div>
              <div className={`stat-value text-lg ${dueAmount > 0 ? 'text-warning' : 'text-success'}`}>
                ₹{dueAmount.toFixed(2)}
              </div>
            </div>
            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-title">Total Receipts</div>
              <div className="stat-value text-lg">{receiptsByBill?.length || 0}</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="card bg-base-200 mb-6">
          <div className="card-body p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-xs">Filter by Type</span>
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="select select-bordered select-sm"
                >
                  <option value="all">All Types</option>
                  <option value="creation">Creation</option>
                  <option value="payment">Payment</option>
                  <option value="modification">Modification</option>
                  <option value="cancellation">Cancellation</option>
                </select>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-xs">Sort by Date</span>
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="select select-bordered select-sm"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>

              {filterType !== 'all' && (
                <button
                  onClick={() => setFilterType('all')}
                  className="btn btn-ghost btn-sm mt-6"
                  title="Clear filter"
                >
                  <X size={16} />
                  Clear Filter
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Receipts Table */}
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Receipt Number</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Date</th>
                <th>Created By</th>
                <th>Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedReceipts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8">
                    {receiptsByBill?.length === 0 
                      ? 'No receipts found for this bill' 
                      : 'No receipts match the current filter'
                    }
                  </td>
                </tr>
              ) : (
                filteredAndSortedReceipts.map((receipt) => (
                  <tr key={receipt._id} className="text-sm hover:bg-base-200">
                    <td className="font-mono">{receipt.receiptNumber}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        {getReceiptTypeIcon(receipt.type)}
                        <span className={`badge badge-sm text-white ${getReceiptTypeColor(receipt.type)}`}>
                          {receipt.type}
                        </span>
                      </div>
                    </td>
                    <td>
                      {receipt.amount > 0 ? (
                        <span className="font-semibold text-success">
                          ₹{receipt.amount.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td>
                      {receipt.paymentMethod?.type ? (
                        <div className="text-xs">
                          <div className="capitalize font-semibold">{receipt.paymentMethod.type}</div>
                          {receipt.paymentMethod.cardNumber && (
                            <div className="text-gray-500">**** {receipt.paymentMethod.cardNumber}</div>
                          )}
                          {receipt.paymentMethod.utrNumber && (
                            <div className="text-gray-500">UTR: {receipt.paymentMethod.utrNumber}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td>
                      <div className="text-xs">
                        <div>{new Date(receipt.date).toLocaleDateString()}</div>
                        <div className="text-gray-500">{new Date(receipt.date).toLocaleTimeString()}</div>
                      </div>
                    </td>
                    <td>{receipt.createdBy?.name}</td>
                    <td className="max-w-xs">
                      <div className="truncate" title={receipt.remarks}>
                        {receipt.remarks}
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => handleReceiptClick(receipt)}
                        className="btn btn-ghost btn-xs"
                        title="View receipt details"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Results Summary */}
        {filteredAndSortedReceipts.length > 0 && (
          <div className="text-center text-sm text-gray-600 mt-4">
            Showing {filteredAndSortedReceipts.length} of {receiptsByBill?.length || 0} receipts
            {filterType !== 'all' && (
              <span> (filtered by {filterType})</span>
            )}
          </div>
        )}

        {/* Receipt Detail Modal */}
        {showReceiptModal && selectedReceipt && (
          <div className="modal modal-open">
            <div className="modal-box max-w-2xl">
              <h3 className="font-bold text-lg mb-4">
                Receipt Details - {selectedReceipt.receiptNumber}
              </h3>
              
              <div className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">Receipt Number</span>
                    </label>
                    <div className="font-mono text-sm bg-base-200 p-2 rounded">
                      {selectedReceipt.receiptNumber}
                    </div>
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">Type</span>
                    </label>
                    <div className="flex items-center gap-2">
                      {getReceiptTypeIcon(selectedReceipt.type)}
                      <span className={`badge ${getReceiptTypeColor(selectedReceipt.type)}`}>
                        {selectedReceipt.type}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">Amount</span>
                    </label>
                    <div className="text-lg font-semibold text-success">
                      ₹{selectedReceipt.amount?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">Date</span>
                    </label>
                    <div className="text-sm">
                      {new Date(selectedReceipt.date).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Payment Method Details */}
                {selectedReceipt.paymentMethod?.type && (
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">Payment Method</span>
                    </label>
                    <div className="bg-base-200 p-3 rounded">
                      <div className="capitalize font-semibold mb-1">
                        {selectedReceipt.paymentMethod.type}
                      </div>
                      {selectedReceipt.paymentMethod.cardNumber && (
                        <div className="text-sm">Card: **** {selectedReceipt.paymentMethod.cardNumber}</div>
                      )}
                      {selectedReceipt.paymentMethod.utrNumber && (
                        <div className="text-sm">UTR: {selectedReceipt.paymentMethod.utrNumber}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Status Changes */}
                {(selectedReceipt.previousStatus || selectedReceipt.newStatus) && (
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">Status Changes</span>
                    </label>
                    <div className="bg-base-200 p-3 rounded">
                      {selectedReceipt.previousStatus && (
                        <div className="text-sm">
                          From: <span className="badge badge-outline badge-sm">{selectedReceipt.previousStatus}</span>
                        </div>
                      )}
                      {selectedReceipt.newStatus && (
                        <div className="text-sm">
                          To: <span className="badge badge-outline badge-sm">{selectedReceipt.newStatus}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Remarks */}
                <div>
                  <label className="label">
                    <span className="label-text font-semibold">Remarks</span>
                  </label>
                  <div className="bg-base-200 p-3 rounded text-sm">
                    {selectedReceipt.remarks || 'No remarks'}
                  </div>
                </div>

                {/* Created By */}
                <div>
                  <label className="label">
                    <span className="label-text font-semibold">Created By</span>
                  </label>
                  <div className="text-sm">
                    {selectedReceipt.createdBy?.name || 'Unknown'}
                  </div>
                </div>

                {/* Changes Details (if modification) */}
                {selectedReceipt.type === 'modification' && selectedReceipt.changes && (
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">Change Details</span>
                    </label>
                    <div className="bg-base-200 p-3 rounded text-xs">
                      {selectedReceipt.changes.description || 'Bill was modified'}
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-action">
                <button 
                  className="btn" 
                  onClick={() => setShowReceiptModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ViewReceiptsPage;