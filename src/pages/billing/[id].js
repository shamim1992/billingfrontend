// pages/billing/[id].js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBillById, updateBillStatus } from '../../redux/actions/billingActions';

const BillingDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useDispatch();
  const { bill, loading, error } = useSelector((state) => state.billing);
  const [paymentStatus, setPaymentStatus] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(fetchBillById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (bill) {
      setPaymentStatus(bill.paymentStatus);
    }
  }, [bill]);

  const handleStatusChange = async (e) => {
    e.preventDefault();
    await dispatch(updateBillStatus({ id, paymentStatus }));
    router.push('/billing');
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Billing Details</h1>
      {bill && (
        <div className="bg-white p-8 shadow-lg rounded-lg">
          <h2 className="text-xl font-semibold">Patient: {bill.patient.name}</h2>
          <p>Total Amount: ₹{bill.totalAmount}</p>
          <p>Services:</p>
          <ul>
            {bill.services.map((service, index) => (
              <li key={index}>
                {service.description} - ₹{service.cost}
              </li>
            ))}
          </ul>
          <form onSubmit={handleStatusChange}>
            <div className="mb-4">
              <label>Payment Status</label>
              <select
                className="w-full p-2 border border-gray-300 rounded"
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded"
            >
              Update Status
            </button>
          </form>
        </div>
      )}
    </Layout>
  );
};

export default BillingDetails;
