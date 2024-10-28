// pages/billing/index.js
import Layout from '../../components/Layout';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { fetchBills } from '../../redux/actions/billingActions';
import Link from 'next/link';

const BillingList = () => {
  const dispatch = useDispatch();
  const { bills, loading, error } = useSelector((state) => state.billing);

  useEffect(() => {
    dispatch(fetchBills());
  }, [dispatch]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Bills</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bills.map((bill) => (
          <div key={bill._id} className="p-4 bg-white shadow-lg rounded-lg">
            <h2 className="text-xl font-semibold">Patient: {bill.patient.name}</h2>
            <p>Total Amount: ₹{bill.totalAmount}</p>
            <p>Status: {bill.paymentStatus}</p>
            <Link href={`/billing/${bill._id}`}>
              <a className="text-blue-500">View Details</a>
            </Link>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default BillingList;
