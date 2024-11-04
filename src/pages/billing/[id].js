import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IndianRupee, Download, Printer } from 'lucide-react';
import Layout from '@/components/Layout';
import { fetchBillingById, updateBilling } from '@/redux/actions/billingActions';
import PDFDownloadButton from './PDFDownloadButton';
import { toast } from 'react-toastify';
import PrintBillComponent from './PrintBillComponent';


const BillingDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const dispatch = useDispatch();
  const { billing: bill, loading, error } = useSelector((state) => state.billing);
  const [remarks, setRemarks] = useState('');


  useEffect(() => {
    if (id) {
      dispatch(fetchBillingById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (bill) {
      setRemarks(bill.remarks);
    }
  }, [bill]);

  const handleStatusChange = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(updateBilling({ 
        id, 
        data: { remarks } 
      })).unwrap();
      
      // Show success message using a toast or alert system
      // You can replace this with your preferred notification system
      toast("Bill status updated successfully");
      
      // Refresh the billing data
      dispatch(fetchBillingById(id));
    } catch (error) {
      alert(error || 'Failed to update bill status');
    }
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
        <span>Error: {error}</span>
      </div>
    </Layout>
  );

  if (!bill) return null;

  return (
    <Layout>
      <div className="bg-base-100">
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-sm font-bold">Bill Details</h1>
          <div className="flex items-center justify-center gap-2">
            <PDFDownloadButton bill={bill} />
            
            <PrintBillComponent bill={bill} />
            
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Patient Information */}
          <div className="card border">
            <div className="card-body">
              <h2 className="card-title text-sm">Patient Information</h2>
              <div className="space-y-2 text-xs">
                <p><span className="text-xs">Name:</span> {bill.patientId.firstName} {bill.patientId.lastName}</p>
                <p><span className="text-xs">Patient ID:</span> {bill.patientId.patientId}</p>
                <p><span className="text-xs">Contact:</span> {bill.patientId.mobileNumber}</p>
              </div>
            </div>
          </div>

          {/* Bill Information */}
          <div className="card border">
            <div className="card-body">
              <h2 className="card-title text-sm">Bill Information</h2>
              <div className="space-y-2 text-xs">
                <p><span className="text-xs">Bill No:</span> {bill._id}</p>
                <p><span className="text-xs">Date:</span> {new Date(bill.createdAt).toLocaleDateString()}</p>
                <p><span className="text-xs">Doctor:</span> {bill.doctorId.name}</p>
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
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {bill.billingItems?.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td className="text-right">{item.quantity}</td>
                  <td className="text-right">₹{item.price.toFixed(2)}</td>
                  <td className="text-right">₹{item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals and Payment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 text-xs">
          {/* Payment Status Update */}
          <div className="card border">
            <div className="card-body">
              <h2 className="card-title text-sm">Update Payment Status</h2>
              <form onSubmit={handleStatusChange} className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="text-xs">Payment Status</span>
                  </label>
                  <select
                    className="select select-bordered w-full text-xs"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="partial">Partial</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
                <button type="submit" data-tip="Update Status" className="border tooltip border-blue-500 px-4 py-2 rounded-lg hover:shadow text-xs">
                  Update Status
                </button>
              </form>
            </div>
          </div>

          {/* Bill Summary */}
          <div className="card border">
            <div className="card-body">
              <h2 className="card-title text-sm">Bill Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{bill.totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>₹{bill.totals.totalTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>{bill.discount.type === 'percent' ?  `${bill.discount.value} %` : `₹ ${bill.discount.value}` || 0 }</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>₹{bill.totals.grandTotal.toFixed(2)}</span>
                </div>
                <div className="divider my-2"></div>
                <div className="flex justify-between">
                  <span>Paid Amount:</span>
                  <span>₹{bill.payment.paid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Balance:</span>
                  <span>₹{bill.totals.balance.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BillingDetails;