// pages/billing/update/[id].js
import React, { useState, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '@/components/Layout';
import { useRouter } from 'next/router';
import { fetchBillingById, updateBilling } from '@/redux/actions/billingActions';

const UpdateBilling = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { id } = router.query;

  const { billing, loading } = useSelector((state) => state.billing);

  // Local state to hold billing fields
  const [billingItems, setBillingItems] = useState([]);
  const [discount, setDiscount] = useState({ type: 'percent', value: 0 });
  const [payment, setPayment] = useState({ type: '', paid: 0 });
  const [remarks, setRemarks] = useState('');

  // Load billing data when component mounts
  useEffect(() => {
    if (id) {
      dispatch(fetchBillingById(id));
    }
  }, [id, dispatch]);

  // Initialize form fields from billing data
  useEffect(() => {
    if (billing) {
      setBillingItems(billing.billingItems || []);
      setDiscount(billing.discount || { type: 'percent', value: 0 });
      setPayment(billing.payment || { type: '', paid: 0 });
      setRemarks(billing.remarks || '');
    }
  }, [billing]);

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...billingItems];
    updatedItems[index][field] = value;
    updatedItems[index].total = updatedItems[index].price * updatedItems[index].quantity + updatedItems[index].tax;
    setBillingItems(updatedItems);
  };

  const addBillingItem = () => {
    setBillingItems([
      ...billingItems,
      { id: billingItems.length + 1, name: '', code: '', category: '', price: 0, quantity: 1, tax: 0, total: 0 }
    ]);
  };

  const removeBillingItem = (index) => {
    if (billingItems.length > 1) {
      setBillingItems(billingItems.filter((_, i) => i !== index));
    }
  };

  const calculateTotals = () => {
    const subtotal = billingItems.reduce((sum, item) => sum + item.total, 0);
    const totalTax = billingItems.reduce((sum, item) => sum + Number(item.tax), 0);
    let discountAmount = discount.type === 'percent' ? (subtotal * discount.value) / 100 : Number(discount.value);
    const grandTotal = subtotal - discountAmount;
    const balance = grandTotal - Number(payment.paid);

    return { subtotal, totalTax, grandTotal, balance };
  };

  const totals = calculateTotals();

  const handleUpdateBill = () => {
    const billingData = {
      billingItems,
      discount,
      payment,
      remarks,
      totals
    };
    dispatch(updateBilling({ id, data: billingData })).then(() => router.push('/billing'));
  };

  if (loading) return <p>Loading...</p>;

  return (
    <Layout>
      <div className="w-full max-w-6xl mx-auto bg-white rounded-lg p-6">
        <h1 className="text-lg font-bold mb-6">Update Bill</h1>
        
        <div className="mb-8">
          <h2 className="text-sm font-medium mb-4">Billing Items</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-3 text-left text-xs border">Name</th>
                  <th className="p-3 text-left text-xs border">Code</th>
                  <th className="p-3 text-left text-xs border">Category</th>
                  <th className="p-3 text-left text-xs border">Price (₹)</th>
                  <th className="p-3 text-left text-xs border">Qty</th>
                  <th className="p-3 text-left text-xs border">Tax (₹)</th>
                  <th className="p-3 text-left text-xs border">Total</th>
                  <th className="p-3 text-center border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {billingItems.map((item, index) => (
                  <tr key={item.id}>
                    <td className="p-2 border">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                        className="w-full text-xs p-2 border rounded focus:ring-2 focus:ring-blue-500"
                        placeholder="Service name"
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        type="text"
                        value={item.code}
                        onChange={(e) => handleItemChange(index, 'code', e.target.value)}
                        className="w-full text-xs p-2 border rounded focus:ring-2 focus:ring-blue-500"
                        placeholder="Code"
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        type="text"
                        value={item.category}
                        onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                        className="w-full text-xs p-2 border rounded focus:ring-2 focus:ring-blue-500"
                        placeholder="Category"
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                        className="w-full text-xs p-2 border rounded focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="w-full text-xs p-2 border rounded focus:ring-2 focus:ring-blue-500"
                        min="1"
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        type="number"
                        value={item.tax}
                        onChange={(e) => handleItemChange(index, 'tax', e.target.value)}
                        className="w-full text-xs p-2 border rounded focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                    </td>
                    <td className="p-2 border text-xs text-right">₹{item.total}</td>
                    <td className="p-2 border">
                      <div className="flex justify-center space-x-2">
                        <button onClick={addBillingItem} className="p-1 text-white bg-blue-500 rounded hover:bg-blue-600">
                          <Plus size={16} />
                        </button>
                        {billingItems.length > 1 && (
                          <button onClick={() => removeBillingItem(index)} className="p-1 text-white bg-red-500 rounded hover:bg-red-600">
                            <Minus size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8 text-xs">
          <div className="text-right font-medium">Subtotal:</div>
          <div>₹{totals.subtotal}</div>
          <div className="text-right font-medium">Total Tax:</div>
          <div>₹{totals.totalTax}</div>
          <div className="text-right font-medium">Grand Total:</div>
          <div>₹{totals.grandTotal}</div>
          <div className="text-right font-medium">Paid Amount:</div>
          <div>
            <input
              type="number"
              value={payment.paid}
              onChange={(e) => setPayment({ ...payment, paid: e.target.value })}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="0"
            />
          </div>
          <div className="text-right font-medium">Balance:</div>
          <div>₹{totals.balance}</div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={handleUpdateBill}
            className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:ring-2 focus:ring-green-500"
          >
            Update Bill
          </button>
          <button
            onClick={() => router.push('/billing')}
            className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default UpdateBilling;
