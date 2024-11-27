import React, { useState, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '@/components/Layout';
import { useRouter } from 'next/router';
import { fetchBillingById, updateBilling } from '@/redux/actions/billingActions';
import { fetchPatients } from '@/redux/actions/patientActions';
import { fetchUsers } from '@/redux/actions/userActions';
import { fetchProducts } from '@/redux/actions/productActions';

const UpdateBilling = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { id } = router.query;

  const { billing, loading } = useSelector((state) => state.billing);
  const { patients } = useSelector((state) => state.patients);
  const { users } = useSelector((state) => state.users);
  const { products } = useSelector((state) => state.products);

  const [patientQuery, setPatientQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [doctorQuery, setDoctorQuery] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showPatientSuggestions, setShowPatientSuggestions] = useState(false);
  const [consultationChecked, setConsultationChecked] = useState(false);
  const [billingItems, setBillingItems] = useState([]);
  const [discount, setDiscount] = useState({ type: 'percent', value: 0 });
  const [payment, setPayment] = useState({ type: '', paid: 0 });
  const [remarks, setRemarks] = useState('');

  // Product search state
  const [searchQueries, setSearchQueries] = useState({});
  const [activeSearchIndex, setActiveSearchIndex] = useState(null);

  const doctors = users.filter(user => user.role === 'Doctor');

  useEffect(() => {
    dispatch(fetchPatients());
    dispatch(fetchUsers());
    dispatch(fetchProducts());
    if (id) {
      dispatch(fetchBillingById(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (billing) {
      setBillingItems(billing.billingItems || []);
      setDiscount(billing.discount || { type: 'percent', value: 0 });
      setPayment(billing.payment || { type: '', paid: 0 });
      setRemarks(billing.remarks || '');
      if (billing.patientId) setSelectedPatient(billing.patientId);
      if (billing.doctorId) setSelectedDoctor(billing.doctorId);
    }
  }, [billing]);

  const handlePatientChange = (e) => {
    const value = e.target.value;
    setPatientQuery(value);
    setShowPatientSuggestions(!!value);
  };

  const handlePatientSelect = (patient) => {
    setPatientQuery(`${patient.firstName} ${patient.lastName}`);
    setSelectedPatient(patient);
    setShowPatientSuggestions(false);
  };

  const handleDoctorSelect = (doctorId) => {
    const doctor = doctors.find(doc => doc._id === doctorId);
    setSelectedDoctor(doctor);
    setConsultationChecked(false);
  };

  // Product search and filtering functions
  const getFilteredProducts = (searchQuery) => {
    if (!searchQuery || !products) return [];
    return products.filter(product =>
      product.productname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.productcode?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleProductSearch = (index, value) => {
    setSearchQueries(prev => ({
      ...prev,
      [index]: value
    }));
    setActiveSearchIndex(index);

    const updatedItems = [...billingItems];
    updatedItems[index] = {
      ...updatedItems[index],
      name: value
    };
    setBillingItems(updatedItems);
  };

  const handleProductSelect = (product, index) => {
    const updatedItems = [...billingItems];
    updatedItems[index] = {
      ...updatedItems[index],
      name: product.productname,
      code: product.productcode,
      category: product.servicetype,
      price: parseFloat(product.price),
      tax: parseFloat(product.tax),
      quantity: 1,
      total: parseFloat(product.price) + parseFloat(product.tax)
    };
    setBillingItems(updatedItems);
    
    setSearchQueries(prev => ({
      ...prev,
      [index]: product.productname
    }));
    setActiveSearchIndex(null);
  };

  const handleConsultationToggle = () => {
    if (selectedDoctor && selectedDoctor.consultationCharges) {
      setConsultationChecked(!consultationChecked);
      if (!consultationChecked) {
        setBillingItems([
          ...billingItems,
          {
            id: billingItems.length + 1,
            name: 'Consultation Fee',
            code: 'CONSULT',
            category: 'Service',
            price: selectedDoctor.consultationCharges,
            quantity: 1,
            tax: 0,
            total: selectedDoctor.consultationCharges
          }
        ]);
      } else {
        setBillingItems(billingItems.filter(item => item.code !== 'CONSULT'));
      }
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...billingItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };

    // Recalculate total when quantity changes
    if (field === 'quantity') {
      const price = parseFloat(updatedItems[index].price);
      const quantity = parseInt(value);
      const tax = parseFloat(updatedItems[index].tax);
      updatedItems[index].total = (price * quantity) + tax;
    }

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
      // Clear search queries for removed item
      setSearchQueries(prev => {
        const newQueries = { ...prev };
        delete newQueries[index];
        return newQueries;
      });
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

  const handleUpdateBill = () => {
    if (selectedPatient && selectedDoctor) {
      const totals = calculateTotals();
      const billingData = {
        patientId: selectedPatient._id,
        doctorId: selectedDoctor._id,
        billingItems,
        discount,
        payment,
        remarks,
        totals
      };
      dispatch(updateBilling({ id, data: billingData })).then(() => router.push('/billing'));
    } else {
      alert('Please select both a patient and a doctor.');
    }
  };

  if (loading) return <p>Loading...</p>;

  const totals = calculateTotals();

  return (
    <Layout>
      <div className="w-full max-w-6xl mx-auto bg-white rounded-lg p-6">
        <h1 className="text-lg font-bold mb-6">Update Bill</h1>
        
        {/* Patient and Doctor Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="relative text-xs">
            <label className="block text-xs font-medium mb-2">Patient</label>
            <input
              type="text"
              value={`${billing?.patientId.firstName +' '+ billing?.patientId.lastName}`}
              onChange={handlePatientChange}
              placeholder="Search patient..."
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {showPatientSuggestions && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-md">
                {patients.map(patient => (
                  <div
                    key={patient._id}
                    onClick={() => handlePatientSelect(patient)}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {patient.firstName} {patient.lastName} - {patient.patientId}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium mb-2">Doctor</label>
            <select
              name="doctor"
              value={selectedDoctor ? selectedDoctor._id : ''}
              onChange={(e) => handleDoctorSelect(e.target.value)}
              className="w-full p-2 border text-xs text-black rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor._id} value={doctor._id}>{doctor.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={consultationChecked}
                onChange={handleConsultationToggle}
                className="form-checkbox h-3 w-3 text-blue-600"
              />
              <span className="ml-2 text-xs">Consultation</span>
            </label>
          </div>
        </div>

        {/* Billing Items Table */}
        <div className="mb-8">
          <h2 className="text-sm font-medium mb-4">Billing Items</h2>
          <div className="">
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
                    <td className="p-2 border relative">
                      <input
                        type="text"
                        value={searchQueries[index] || item.name}
                        onChange={(e) => handleProductSearch(index, e.target.value)}
                        onFocus={() => setActiveSearchIndex(index)}
                        className="w-full text-xs p-2 border rounded focus:ring-2 focus:ring-blue-500"
                        placeholder="Search product..."
                      />
                      {activeSearchIndex === index && searchQueries[index] && (
                        <ul className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 ">
                          {getFilteredProducts(searchQueries[index]).map((product) => (
                            <li
                              key={product._id}
                              onClick={() => handleProductSelect(product, index)}
                              className="p-2 text-xs hover:bg-gray-100 cursor-pointer"
                            >
                              <div>{product.productname}</div>
                              <div className="text-gray-500">Price: ₹{product.price}</div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                    <td className="p-2 border">
                      <input
                        type="text"
                        value={item.code}
                        readOnly
                        className="w-full text-xs p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        type="text"
                        value={item.category}
                        readOnly
                        className="w-full text-xs p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        type="number"
                        value={item.price}
                        readOnly
                        className="w-full text-xs p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        min="1"
                        className="w-full text-xs p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        type="number"
                        value={item.tax}
                        readOnly
                        className="w-full text-xs p-2 border rounded focus:ring-2 focus:ring-blue-500"
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

        {/* Discount and Payment Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-medium mb-4">Discount</h3>
            <div className="flex items-center space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="discountType"
                  checked={discount.type === 'percent'}
                  onChange={() => setDiscount({ ...discount, type: 'percent' })}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-xs">Percentage (%)</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="discountType"
                  checked={discount.type === 'amount'}
                  onChange={() => setDiscount({ ...discount, type: 'amount' })}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-xs">Amount (₹)</span>
              </label>
              <input
                type="number"
                value={discount.value}
                onChange={(e) => setDiscount({ ...discount, value: e.target.value })}
                className="w-24 p-2 text-xs border rounded-md focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-4">Payment</h3>
            <select
              value={payment.type}
              onChange={(e) => setPayment({ ...payment, type: e.target.value })}
              className="w-full text-xs p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Payment Type</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
            </select>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-4">Remarks</h3>
            <select
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full text-xs p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Remarks</option>
              <option value="paid">Paid</option>
              <option value="pending">Payment Pending</option>
              <option value="partial">Partially Paid</option>
            </select>
          </div>
        </div>

        {/* Totals and Balance */}
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

        {/* Update and Cancel Buttons */}
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