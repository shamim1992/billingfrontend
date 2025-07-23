import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { 
  ArrowLeft, 
  FileText, 
  CreditCard, 
  User, 
  Calendar,
  IndianRupee,
  Download,
  Printer,
  Eye,
  Edit2,
  CheckCircle,
  X,
  AlertCircle
} from 'lucide-react';
import Layout from '@/components/Layout';
import { 
  fetchReceiptByNumber,
  fetchBillingById,
  fetchReceiptsByBillNumber
} from '@/redux/actions/billingActions';
import Link from 'next/link';
import { toast } from 'react-toastify';

const ReceiptDetails = () => {
  const router = useRouter();
  const { receiptNumber } = router.query;
  
  const dispatch = useDispatch();
  const { 
    currentReceipt: receipt, 
    billing: bill,
    receiptsByBill,
    receiptsLoading, 
    receiptsError,
    loading 
  } = useSelector((state) => state.billing);
  
  const [showReceiptHistoryModal, setShowReceiptHistoryModal] = useState(false);

  useEffect(() => {
    if (receiptNumber) {
      dispatch(fetchReceiptByNumber(receiptNumber));
    }
  }, [dispatch, receiptNumber]);

  // Fetch associated bill when receipt is loaded
  useEffect(() => {
    if (receipt?.billingId) {
      // Check if billingId is already populated (object) or just an ID (string)
      if (typeof receipt.billingId === 'string') {
        // It's just an ID, fetch the bill
        dispatch(fetchBillingById(receipt.billingId));
      } else if (receipt.billingId._id) {
        // It's already populated, fetch by ID to ensure we have complete data
        dispatch(fetchBillingById(receipt.billingId._id));
      }
    }
  }, [dispatch, receipt?.billingId]);

  // Fetch all receipts for this bill when bill is loaded
  useEffect(() => {
    const currentBill = bill || (typeof receipt?.billingId === 'object' ? receipt.billingId : null);
    if (currentBill?.billNumber) {
      dispatch(fetchReceiptsByBillNumber(currentBill.billNumber));
    }
  }, [dispatch, bill, receipt?.billingId]);

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

  const calculateDiscountAmount = (bill) => {
    if (!bill?.discount) return 0;
    if (bill.discount.type === 'percent') {
      return (bill.totals.subtotal * bill.discount.value) / 100;
    }
    return bill.discount.value || 0;
  };

  const printReceipt = () => {
    window.print();
  };

  const downloadReceiptPDF = () => {
    toast.info('PDF download functionality to be implemented');
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
          <span>Error loading receipt: {typeof receiptsError === 'object' ? receiptsError.message : receiptsError}</span>
        </div>
      </Layout>
    );
  }

  if (!receipt) {
    return (
      <Layout>
        <div className="alert alert-warning">
          <span>Receipt not found</span>
        </div>
      </Layout>
    );
  }

  // Use bill from Redux state or from populated receipt.billingId
  const currentBill = bill || (typeof receipt?.billingId === 'object' ? receipt.billingId : null);

  if (!currentBill) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <span className="loading loading-spinner loading-lg"></span>
          <span className="ml-2">Loading bill details...</span>
        </div>
      </Layout>
    );
  }

  const billStatus = currentBill.status || currentBill.remarks;
  const dueAmount = currentBill.totals?.dueAmount ?? currentBill.totals?.balance ?? 0;

  return (
    <Layout>
      <div className="bg-base-100">
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-sm font-bold">Bill Details (via Receipt)</h1>
            <div className="flex items-center gap-4 mt-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">Receipt Number:</span>
                <span className="font-mono text-sm">{receipt.receiptNumber}</span>
                <span className={`badge text-white badge-sm ${getReceiptTypeColor(receipt.type)}`}>
                  {receipt.type}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">Bill Number:</span>
                <span className="font-mono text-sm">{currentBill.billNumber || currentBill._id}</span>
                <span className={`badge text-white badge-sm ${getStatusBadgeClass(billStatus)}`}>
                  {getStatusDisplayText(billStatus)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setShowReceiptHistoryModal(true)}
              className="inline-flex items-center shadow gap-2 px-4 py-1 text-xs rounded-2xl hover:shadow-md border transition-colors"
              disabled={receiptsLoading}
            >
              <FileText size={16} />
              {receiptsLoading ? 'Loading...' : `Receipts (${receiptsByBill?.length || 0})`}
            </button>
            
            <Link
              href={`/billing/${currentBill._id}`}
              className="inline-flex items-center shadow gap-2 px-4 py-1 text-xs rounded-2xl hover:shadow-md border transition-colors"
            >
              <Eye size={16} />
              View in Billing
            </Link>
            
            <button
              onClick={printReceipt}
              className="inline-flex shadow items-center gap-2 px-4 py-1 text-xs rounded-2xl hover:shadow-md border transition-colors"
            >
              <Printer size={16} />
              Print
            </button>
            
            <button
              onClick={downloadReceiptPDF}
              className="inline-flex shadow items-center gap-2 px-4 py-1 text-xs rounded-2xl hover:shadow-md border transition-colors"
            >
              <Download size={16} />
              PDF
            </button>
          </div>
        </div>

        {/* Receipt Context Banner */}
        <div className="alert alert-success text-white mb-6">
          <AlertCircle size={16} />
          <div>
            <div className="font-semibold">Receipt Context</div>
            <div className="text-sm">
              This is receipt <strong>{receipt.receiptNumber}</strong> ({receipt.type}) 
              {receipt.amount > 0 && <span> for amount ₹{receipt.amount.toFixed(2)}</span>}
              , created on {new Date(receipt.date).toLocaleDateString()} by {receipt.createdBy?.name}.
              {receipt.remarks && <span> Remarks: {receipt.remarks}</span>}
            </div>
          </div>
        </div>

        {/* Main Content - Complete Bill Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Patient Information */}
          <div className="card border">
            <div className="card-body">
              <h2 className="card-title text-sm">Patient Information</h2>
              <div className="space-y-2 text-xs">
                <p><span className="font-semibold">Name:</span> {currentBill.patientId?.firstName} {currentBill.patientId?.lastName}</p>
                <p><span className="font-semibold">Patient ID:</span> {currentBill.patientId?.patientId}</p>
                <p><span className="font-semibold">Contact:</span> {currentBill.patientId?.mobileNumber}</p>
                <p><span className="font-semibold">Email:</span> {currentBill.patientId?.email || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Bill Information */}
          <div className="card border">
            <div className="card-body">
              <h2 className="card-title text-sm">Bill Information</h2>
              <div className="space-y-2 text-xs">
                <p><span className="font-semibold">Bill Number:</span> {currentBill.billNumber || currentBill._id}</p>
                <p><span className="font-semibold">Date:</span> {new Date(currentBill.createdAt).toLocaleDateString()}</p>
                <p><span className="font-semibold">Doctor:</span> {currentBill.doctorId?.name}</p>
                <p><span className="font-semibold">Created By:</span> {currentBill.createdBy?.name}</p>
                <p><span className="font-semibold">Department:</span> {currentBill.doctorId?.department || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Complete Billing Items Table */}
        <div className="mt-6 overflow-x-auto">
          <h2 className="text-sm font-bold mb-4">Billing Items</h2>
          <table className="table table-zebra w-full text-xs">
            <thead>
              <tr>
                <th>Item/Service</th>
                <th className="text-right">Quantity</th>
                <th className="text-right">Rate</th>
                <th className="text-right">Tax</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {currentBill.billingItems?.map((item, index) => (
                <tr key={index}>
                  <td>
                    <div>
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-xs text-gray-500">
                        Code: {item.code} | Category: {item.category}
                      </div>
                    </div>
                  </td>
                  <td className="text-right">{item.quantity}</td>
                  <td className="text-right">₹{item.price?.toFixed(2)}</td>
                  <td className="text-right">₹{item.tax?.toFixed(2)}</td>
                  <td className="text-right">₹{item.total?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Payment Information and Bill Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 text-xs">
          {/* Payment Information */}
          <div className="card border">
            <div className="card-body">
              <h2 className="card-title text-sm">Payment Information</h2>
              <div className="space-y-2">
                <p><span className="font-semibold">Initial Payment Method:</span> {currentBill.payment?.type?.toUpperCase()}</p>
                {currentBill.payment?.cardNumber && (
                  <p><span className="font-semibold">Card Number:</span> **** {currentBill.payment.cardNumber}</p>
                )}
                {currentBill.payment?.utrNumber && (
                  <p><span className="font-semibold">UTR Number:</span> {currentBill.payment.utrNumber}</p>
                )}
                <p><span className="font-semibold">Total Paid:</span> ₹{currentBill.payment?.paid?.toFixed(2)}</p>
                {dueAmount > 0 && (
                  <p className="text-warning"><span className="font-semibold">Due Amount:</span> ₹{dueAmount.toFixed(2)}</p>
                )}
                
                {/* Current Receipt Payment Info */}
                {receipt.type === 'payment' && receipt.paymentMethod && (
                  <>
                    <div className="divider my-2"></div>
                    <p className="font-semibold text-success">This Receipt Payment:</p>
                    <p><span className="font-semibold">Method:</span> {receipt.paymentMethod.type?.toUpperCase()}</p>
                    <p><span className="font-semibold">Amount:</span> ₹{receipt.amount?.toFixed(2)}</p>
                    {receipt.paymentMethod.cardNumber && (
                      <p><span className="font-semibold">Card:</span> **** {receipt.paymentMethod.cardNumber}</p>
                    )}
                    {receipt.paymentMethod.utrNumber && (
                      <p><span className="font-semibold">UTR:</span> {receipt.paymentMethod.utrNumber}</p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Bill Summary */}
          <div className="card border">
            <div className="card-body">
              <h2 className="card-title text-sm">Bill Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{currentBill.totals?.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>₹{currentBill.totals?.totalTax?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>₹{calculateDiscountAmount(currentBill).toFixed(2)}</span>
                </div>
                {currentBill.discount && (
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Discount Type:</span>
                    <span>{currentBill.discount.type === 'percent' ? `${currentBill.discount.value}%` : `₹${currentBill.discount.value}`}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold">
                  <span>Grand Total:</span>
                  <span>₹{currentBill.totals?.grandTotal?.toFixed(2)}</span>
                </div>
                <div className="divider my-2"></div>
                <div className="flex justify-between">
                  <span>Paid Amount:</span>
                  <span>₹{currentBill.payment?.paid?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Due Amount:</span>
                  <span className={dueAmount > 0 ? 'text-warning' : 'text-success'}>
                    ₹{dueAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Changes (if applicable) */}
        {(receipt.previousStatus || receipt.newStatus) && (
          <div className="mt-6">
            <div className="card border">
              <div className="card-body">
                <h2 className="card-title text-sm">Status Changes (This Receipt)</h2>
                <div className="flex items-center gap-4 text-xs">
                  {receipt.previousStatus && (
                    <div className="flex items-center gap-2">
                      <span>From:</span>
                      <span className={`badge badge-sm ${getStatusBadgeClass(receipt.previousStatus)}`}>
                        {getStatusDisplayText(receipt.previousStatus)}
                      </span>
                    </div>
                  )}
                  
                  {receipt.previousStatus && receipt.newStatus && (
                    <span className="text-gray-400">→</span>
                  )}
                  
                  {receipt.newStatus && (
                    <div className="flex items-center gap-2">
                      <span>To:</span>
                      <span className={`badge badge-sm ${getStatusBadgeClass(receipt.newStatus)}`}>
                        {getStatusDisplayText(receipt.newStatus)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Receipt History Modal */}
        {showReceiptHistoryModal && (
          <div className="modal modal-open">
            <div className="modal-box max-w-4xl">
              <h3 className="font-bold text-lg">All Receipts for Bill {currentBill.billNumber}</h3>
              
              {receiptsLoading ? (
                <div className="flex justify-center py-8">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : receiptsByBill?.length === 0 ? (
                <div className="text-center py-8">
                  <p>No receipts found for this bill</p>
                </div>
              ) : (
                <div className="overflow-x-auto mt-4">
                  <table className="table table-zebra w-full text-xs">
                    <thead>
                      <tr>
                        <th>Receipt Number</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Created By</th>
                        <th>Remarks</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {receiptsByBill?.map((r) => (
                        <tr key={r._id} className={r._id === receipt._id ? 'bg-primary bg-opacity-20' : ''}>
                          <td className="font-mono">{r.receiptNumber}</td>
                          <td>
                            <span className={`badge text-white badge-sm ${
                              r.type === 'payment' ? 'badge-success' :
                              r.type === 'creation' ? 'badge-info' :
                              r.type === 'modification' ? 'badge-warning' :
                              'badge-error'
                            }`}>
                              {r.type}
                            </span>
                          </td>
                          <td>₹{r.amount?.toFixed(2) || '0.00'}</td>
                          <td>{new Date(r.date).toLocaleDateString()}</td>
                          <td>{r.createdBy?.name}</td>
                          <td className="max-w-xs truncate">{r.remarks}</td>
                          <td>
                            {r._id === receipt._id ? (
                              <span className="badge badge-primary badge-sm">Current</span>
                            ) : (
                              <Link
                                href={`/billing/receipts/details/${r.receiptNumber}`}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl hover:shadow-md border transition-colors"
                              >
                                <Eye size={14} />
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="modal-action">
                <Link
                  href={`/billing/receipts/${currentBill.billNumber}`}
                  className="btn btn-primary"
                >
                  View All Receipts Page
                </Link>
                <button 
                  className="btn" 
                  onClick={() => setShowReceiptHistoryModal(false)}
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

export default ReceiptDetails;