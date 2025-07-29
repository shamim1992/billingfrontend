import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IndianRupee, Download, Printer, CreditCard, FileText, X, Plus } from 'lucide-react';
import Layout from '@/components/Layout';
import { 
  fetchBillingById, 
  addPayment, 
  cancelBill,
  fetchReceiptsByBillNumber 
} from '@/redux/actions/billingActions';
import PDFDownloadButton from './PDFDownloadButton';
import { toast } from 'react-toastify';
import PrintBillComponent from './PrintBillComponent';

const BillingDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const dispatch = useDispatch();
  const { billing: bill, loading, error, receiptsByBill, receiptsLoading } = useSelector((state) => state.billing);
  const { user } = useSelector((state) => state.auth);
  
  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    paymentMethod: {
      type: 'cash',
      cardNumber: '',
      utrNumber: ''
    }
  });

  // Cancel modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Receipts modal state
  const [showReceiptsModal, setShowReceiptsModal] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchBillingById(id));
    }
  }, [dispatch, id]);

  // Fetch receipts when bill is loaded
  useEffect(() => {
    if (bill?.billNumber) {
      dispatch(fetchReceiptsByBillNumber(bill.billNumber));
    }
  }, [dispatch, bill?.billNumber]);

  // Set default payment amount to due amount
  useEffect(() => {
    if (bill) {
      const dueAmount = bill.totals?.dueAmount || bill.totals?.balance || 0;
      setPaymentData(prev => ({
        ...prev,
        amount: Math.max(0, dueAmount)
      }));
    }
  }, [bill]);

  const handleAddPayment = async (e) => {
    e.preventDefault();
    
    if (paymentData.amount <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    if (paymentData.paymentMethod.type === 'card' && !paymentData.paymentMethod.cardNumber) {
      toast.error('Please enter card number');
      return;
    }

    if (paymentData.paymentMethod.type === 'upi' && !paymentData.paymentMethod.utrNumber) {
      toast.error('Please enter UTR number');
      return;
    }

    try {
      await dispatch(addPayment({ 
        id, 
        paymentData 
      })).unwrap();
      
      toast.success('Payment added successfully');
      setShowPaymentModal(false);
      
      // Reset payment form
      setPaymentData({
        amount: 0,
        paymentMethod: {
          type: 'cash',
          cardNumber: '',
          utrNumber: ''
        }
      });
      
      // Refresh bill data
      dispatch(fetchBillingById(id));
      
      // Refresh receipts
      if (bill?.billNumber) {
        dispatch(fetchReceiptsByBillNumber(bill.billNumber));
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to add payment');
    }
  };

  const handleCancelBill = async (e) => {
    e.preventDefault();
    
    if (!cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    try {
      await dispatch(cancelBill({ 
        id, 
        reason: cancelReason 
      })).unwrap();
      
      toast.success('Bill cancelled successfully');
      setShowCancelModal(false);
      setCancelReason('');
      
      // Refresh bill data
      dispatch(fetchBillingById(id));
    } catch (err) {
      toast.error(err?.message || 'Failed to cancel bill');
    }
  };

  const calculateDiscountAmount = (bill) => {
    if (!bill?.discount) return 0;
    if (bill.discount.type === 'percent') {
      return (bill.totals.subtotal * bill.discount.value) / 100;
    }
    return bill.discount.value || 0;
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

  const getEffectiveStatus = (bill) => {
    // If bill is cancelled, always show cancelled
    if (bill.status?.toLowerCase() === 'cancelled' || bill.remarks?.toLowerCase() === 'cancelled') {
      return 'cancelled';
    }
    
    const grandTotal = bill.totals?.grandTotal || 0;
    const paidAmount = bill.payment?.paid || 0;
    const dueAmount = bill.totals?.dueAmount ?? bill.totals?.balance ?? 0;
    
    // Check if fully paid (due amount is 0 or paid amount equals grand total)
    if (dueAmount <= 0 || Math.abs(paidAmount - grandTotal) < 0.01) {
      return 'paid';
    }
    
    // Check if partially paid
    if (paidAmount > 0 && paidAmount < grandTotal) {
      return 'partial';
    }
    
    // Default to active (due) if no payment or backend status
    return bill.status?.toLowerCase() || 'active';
  };

  if (loading) return (
    <Layout>
      <div className="flex justify-center items-center h-96">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    </Layout>
  );

  if (error) return (
    <Layout>
      <div className="alert alert-error">
        <span>{typeof error === 'object' ? error.message : error}</span>
      </div>
    </Layout>
  );

  if (!bill) return null;

  const billStatus = getEffectiveStatus(bill);
  const dueAmount = bill.totals?.dueAmount ?? bill.totals?.balance ?? 0;

  return (
    <Layout>
      <div className="bg-base-100">
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-sm font-bold">Bill Details</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-600">Bill Number:</span>
              <span className="font-mono text-sm">{bill.billNumber || bill._id}</span>
              <span className={`badge badge-sm text-white ${getStatusBadgeClass(billStatus)}`}>
                {getStatusDisplayText(billStatus)}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setShowReceiptsModal(true)}
              className="inline-flex items-center shadow gap-2 px-4 py-1 text-xs rounded-2xl hover:shadow-md border transition-colors"
              disabled={receiptsLoading}
            >
              <FileText size={16} />
              {receiptsLoading ? 'Loading...' : `Receipts (${receiptsByBill?.length || 0})`}
            </button>
            
            {(billStatus === 'active' || billStatus === 'partial') && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="inline-flex items-center shadow gap-2 px-4 py-1 text-xs rounded-2xl hover:shadow-md border transition-colors"
              >
                <CreditCard size={16} />
                Add Payment
              </button>
            )}
            
            {billStatus !== 'cancelled' && user?.role === 'superAdmin' && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="inline-flex items-center shadow gap-2 px-4 py-1 text-xs rounded-2xl hover:shadow-md border transition-colors"
              >
                <X size={16} />
                Cancel Bill
              </button>
            )}
            
            <PrintBillComponent bill={bill} className="inline-flex items-center shadow gap-2 px-4 py-1 text-xs rounded-2xl hover:shadow-md border transition-colors" />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Patient Information */}
          <div className="card border">
            <div className="card-body">
              <h2 className="card-title text-sm">Patient Information</h2>
              <div className="space-y-2 text-xs">
                <p><span className="font-semibold">Name:</span> {bill.patientId?.firstName} {bill.patientId?.lastName}</p>
                <p><span className="font-semibold">Patient ID:</span> {bill.patientId?.patientId}</p>
                <p><span className="font-semibold">Contact:</span> {bill.patientId?.mobileNumber}</p>
              </div>
            </div>
          </div>

          {/* Bill Information */}
          <div className="card border">
            <div className="card-body">
              <h2 className="card-title text-sm">Bill Information</h2>
              <div className="space-y-2 text-xs">
                <p><span className="font-semibold">Bill Number:</span> {bill.billNumber || bill._id}</p>
                <p><span className="font-semibold">Date:</span> {new Date(bill.createdAt).toLocaleDateString()}</p>
                <p><span className="font-semibold">Doctor:</span> {bill.doctorId?.name}</p>
                <p><span className="font-semibold">Created By:</span> {bill.createdBy?.name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Billing Items Table */}
        <div className="mt-6 overflow-x-auto">
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
              {bill.billingItems?.map((item, index) => (
                <tr key={index}>
                  <td>
                    <div>
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-xs text-gray-500">Code: {item.code}</div>
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
                <p><span className="font-semibold">Payment Method:</span> {bill.payment?.type?.toUpperCase()}</p>
                {bill.payment?.cardNumber && (
                  <p><span className="font-semibold">Card Number:</span> **** {bill.payment.cardNumber}</p>
                )}
                {bill.payment?.utrNumber && (
                  <p><span className="font-semibold">UTR Number:</span> {bill.payment.utrNumber}</p>
                )}
                <p><span className="font-semibold">Total Paid:</span> ₹{bill.payment?.paid?.toFixed(2)}</p>
                {dueAmount > 0 && (
                  <p className="text-warning"><span className="font-semibold">Due Amount:</span> ₹{dueAmount.toFixed(2)}</p>
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
                  <span>₹{bill.totals?.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>₹{bill.totals?.totalTax?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>₹{calculateDiscountAmount(bill).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Grand Total:</span>
                  <span>₹{bill.totals?.grandTotal?.toFixed(2)}</span>
                </div>
                <div className="divider my-2"></div>
                <div className="flex justify-between">
                  <span>Paid Amount:</span>
                  <span>₹{bill.payment?.paid?.toFixed(2)}</span>
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

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg">Add Payment</h3>
              <form onSubmit={handleAddPayment} className="space-y-4 mt-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Payment Amount</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={dueAmount}
                    step="0.01"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData(prev => ({
                      ...prev,
                      amount: parseFloat(e.target.value) || 0
                    }))}
                    className="input input-bordered"
                    required
                  />
                  <label className="label">
                    <span className="label-text-alt">Maximum: ₹{dueAmount.toFixed(2)}</span>
                  </label>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Payment Method</span>
                  </label>
                  <select
                    value={paymentData.paymentMethod.type}
                    onChange={(e) => setPaymentData(prev => ({
                      ...prev,
                      paymentMethod: {
                        ...prev.paymentMethod,
                        type: e.target.value,
                        cardNumber: '',
                        utrNumber: ''
                      }
                    }))}
                    className="select select-bordered"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="NEFT">NEFT</option>
                  </select>
                </div>

                {paymentData.paymentMethod.type === 'card' && (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Last 4 digits of Card</span>
                    </label>
                    <input
                      type="text"
                      maxLength="4"
                      value={paymentData.paymentMethod.cardNumber}
                      onChange={(e) => setPaymentData(prev => ({
                        ...prev,
                        paymentMethod: {
                          ...prev.paymentMethod,
                          cardNumber: e.target.value.replace(/\D/g, '')
                        }
                      }))}
                      className="input input-bordered"
                      placeholder="1234"
                      required
                    />
                  </div>
                )}

                {paymentData.paymentMethod.type === 'upi' && (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">UTR Number</span>
                    </label>
                    <input
                      type="text"
                      maxLength="4"
                      value={paymentData.paymentMethod.utrNumber}
                      onChange={(e) => setPaymentData(prev => ({
                        ...prev,
                        paymentMethod: {
                          ...prev.paymentMethod,
                          utrNumber: e.target.value
                        }
                      }))}
                      className="input input-bordered"
                      placeholder="UTR123"
                      required
                    />
                  </div>
                )}

                <div className="modal-action">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Processing...' : 'Add Payment'}
                  </button>
                  <button 
                    type="button" 
                    className="btn" 
                    onClick={() => setShowPaymentModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Cancel Modal */}
        {showCancelModal && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg">Cancel Bill</h3>
              <form onSubmit={handleCancelBill} className="space-y-4 mt-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Reason for Cancellation</span>
                  </label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="textarea textarea-bordered"
                    placeholder="Please provide a reason for cancellation"
                    required
                  />
                </div>

                <div className="modal-action">
                  <button type="submit" className="btn btn-error" disabled={loading}>
                    {loading ? 'Cancelling...' : 'Cancel Bill'}
                  </button>
                  <button 
                    type="button" 
                    className="btn" 
                    onClick={() => setShowCancelModal(false)}
                  >
                    Close
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Receipts Modal */}
        {showReceiptsModal && (
          <div className="modal modal-open">
            <div className="modal-box max-w-4xl">
              <h3 className="font-bold text-lg">Receipts for Bill {bill.billNumber}</h3>
              
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
                      </tr>
                    </thead>
                    <tbody>
                      {receiptsByBill?.map((receipt) => (
                        <tr key={receipt._id}>
                          <td className="font-mono">{receipt.receiptNumber}</td>
                          <td>
                            <span className={`badge badge-sm  text-white ${
                              receipt.type === 'payment' ? 'badge-success' :
                              receipt.type === 'creation' ? 'badge-info' :
                              receipt.type === 'modification' ? 'badge-warning' :
                              'badge-error'
                            }`}>
                              {receipt.type}
                            </span>
                          </td>
                          <td>₹{receipt.amount?.toFixed(2) || '0.00'}</td>
                          <td>{new Date(receipt.date).toLocaleDateString()}</td>
                          <td>{receipt.createdBy?.name}</td>
                          <td>{receipt.remarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="modal-action">
                <button 
                  className="btn" 
                  onClick={() => setShowReceiptsModal(false)}
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

export default BillingDetails;