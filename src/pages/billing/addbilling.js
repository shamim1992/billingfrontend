import React, { useState, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '@/components/Layout';
import { fetchPatients } from '../../redux/actions/patientActions';
import { fetchUsers } from '@/redux/actions/userActions';
import { createBilling } from '../../redux/actions/billingActions';
import { useRouter } from 'next/router';


const BillingForm = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { patients } = useSelector((state) => state.patients);
  const { users } = useSelector((state) => state.users);

  const [patientQuery, setPatientQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [doctorQuery, setDoctorQuery] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showPatientSuggestions, setShowPatientSuggestions] = useState(false);
  const [billingItems, setBillingItems] = useState([
    { id: 1, name: '', code: '', category: '', price: 0, quantity: 1, tax: 0, total: 0 }
  ]);
  const [discount, setDiscount] = useState({ type: 'percent', value: 0 });
  const [payment, setPayment] = useState({ type: '', paid: 0 });
  const [consultationChecked, setConsultationChecked] = useState(false);
  const [remarks, setRemarks] = useState('');

  const doctors = users.filter(user => user.role === 'Doctor');

  useEffect(() => {
    dispatch(fetchPatients());
    dispatch(fetchUsers());
  }, [dispatch]);

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
    updatedItems[index][field] = value;
    const price = Number(updatedItems[index].price);
    const quantity = Number(updatedItems[index].quantity);
    const tax = Number(updatedItems[index].tax);
    updatedItems[index].total = (price * quantity) + tax;
    setBillingItems(updatedItems);
  };

  const addBillingItem = () => {
    setBillingItems([...billingItems, { id: billingItems.length + 1, name: '', code: '', category: '', price: 0, quantity: 1, tax: 0, total: 0 }]);
  };

  const removeBillingItem = (index) => {
    if (billingItems.length > 1) {
      setBillingItems(billingItems.filter((_, i) => i !== index));
    }
  };

  const calculateTotals = () => {
    const subtotal = billingItems.reduce((sum, item) => sum + item.total, 0);
    const totalTax = billingItems.reduce((sum, item) => sum + Number(item.tax), 0);
    let discountAmount = 0;

    if (discount.type === 'percent') {
      discountAmount = (subtotal * discount.value) / 100;
    } else {
      discountAmount = Number(discount.value);
    }

    const grandTotal = subtotal - discountAmount;
    const balance = grandTotal - Number(payment.paid);

    return { subtotal, totalTax, grandTotal, balance };
  };

  const totals = calculateTotals();
  console.log(totals)

  const handleSaveBill = () => {
    if (selectedPatient && selectedDoctor) {
      const billingData = {
        patientId: selectedPatient._id,
        doctorId: selectedDoctor._id,
        billingItems,
        discount,
        payment,
        remarks,
        totals
      };
      console.log(billingData)
      dispatch(createBilling(billingData));
      router.push('/billing')
    } else {
      alert('Please select both a patient and a doctor.');
    }
  };

  return (
    <Layout>
      <div className="w-full max-w-6xl mx-auto bg-white rounded-lg">
        <div className="">
          <h1 className="text-sm font-bold mb-6">Outpatient Bill</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="relative text-xs">
              <label className="block text-xs font-medium mb-2">Patient</label>
              <input
                type="text"
                value={patientQuery}
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
                          <button onClick={addBillingItem} className="p-1 text-white bg-blue-500 rounded hover:bg-blue-600"><Plus size={16} /></button>
                          {billingItems.length > 1 && (
                            <button onClick={() => removeBillingItem(index)} className="p-1 text-white bg-red-500 rounded hover:bg-red-600"><Minus size={16} /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
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
          <div className="grid grid-cols-2 gap-4 mb-8 text-xs">
            <div className="text-right font-medium">Subtotal:</div>
            <div>₹{totals.subtotal}</div>
            <div className="text-right font-medium">Total Tax:</div>
            <div>₹{totals.totalTax}</div>
            <div className="text-right font-medium">Grand Total:</div>
            <div>₹{totals.grandTotal}</div>
            <div className="text-right font-medium">Paid Amount:</div>
            <div><input type="number" value={payment.paid} onChange={(e) => setPayment({ ...payment, paid: e.target.value })} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500" min="0" /></div>
            <div className="text-right font-medium">Balance:</div>
            <div>₹{totals.balance}</div>
          </div>
          <div className="flex justify-end space-x-4">
            <button
              onClick={handleSaveBill}
              className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Save Bill
            </button>
            <button className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
              Reset
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BillingForm;
