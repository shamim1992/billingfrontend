import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Minus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '@/components/Layout';
import { fetchPatients } from '@/redux/actions/patientActions';
import { fetchUsers } from '@/redux/actions/userActions';
import { fetchProducts } from '@/redux/actions/productActions';
import { createBilling } from '@/redux/actions/billingActions';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

const CreateBillingPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  
  // Redux state
  const { patients } = useSelector((state) => state.patients);
  const { users } = useSelector((state) => state.users);
  const { products, status } = useSelector((state) => state.products);
  const { user: currentUser } = useSelector((state) => state.auth || {});
  const { loading: billingLoading } = useSelector((state) => state.billing);
  
  // Component state
  const [isLoading, setIsLoading] = useState(true);
  const [formState, setFormState] = useState({
    patientQuery: '',
    selectedPatient: null,
    selectedDoctor: null,
    showPatientSuggestions: false,
    discount: { type: 'percent', value: 0 },
    payment: { 
      type: '', 
      paid: 0,
      cardNumber: '',
      utrNumber: ''
    },
    consultationChecked: false
  });

  const [billingItems, setBillingItems] = useState([
    { id: 1, name: '', code: '', category: '', price: 0, quantity: 1, tax: 0, total: 0 }
  ]);
  
  // Product search state
  const [searchQueries, setSearchQueries] = useState({});
  const [activeSearchIndex, setActiveSearchIndex] = useState(null);
  
  // Filter doctors from users
  const doctors = users?.filter(user => user.role === 'Doctor') || [];

  // Fetch initial data with proper error handling
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          dispatch(fetchProducts()),
          dispatch(fetchPatients()),
          dispatch(fetchUsers())
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load initial data. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [dispatch]);

  // Update loading state based on Redux status
  useEffect(() => {
    if (status === 'succeeded') {
      setIsLoading(false);
    }
  }, [status]);

  // Filter functions with null checks
  const getFilteredProducts = useCallback((searchQuery) => {
    if (!searchQuery || !products) return [];
    return products.filter(product =>
      product.productname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.productcode?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products]);

  const getFilteredPatients = useCallback((query) => {
    if (!query || !patients) return [];
    return patients.filter(patient =>
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(query.toLowerCase()) ||
      patient.patientId.toLowerCase().includes(query.toLowerCase())
    );
  }, [patients]);

  // Calculate totals function
  const calculateTotals = (items = billingItems) => {
    const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
    const totalTax = items.reduce((sum, item) => sum + parseFloat(item.tax || 0), 0);
    let discountAmount = 0;

    if (formState.discount.type === 'percent') {
      discountAmount = (subtotal * parseFloat(formState.discount.value || 0)) / 100;
    } else {
      discountAmount = parseFloat(formState.discount.value || 0);
    }

    const grandTotal = Math.max(0, subtotal - discountAmount);
    const paidAmount = parseFloat(formState.payment.paid || 0);
    const balance = grandTotal - paidAmount;
    const dueAmount = Math.max(0, balance);
    
    return { subtotal, totalTax, discountAmount, grandTotal, balance, dueAmount };
  };

  // Handlers
  const handlePatientSelect = (patient) => {
    setFormState(prev => ({
      ...prev,
      patientQuery: `${patient.firstName} ${patient.lastName}`,
      selectedPatient: patient,
      showPatientSuggestions: false
    }));
  };

  const handleDoctorSelect = (e) => {
    const doctor = doctors.find(doc => doc._id === e.target.value);
    setFormState(prev => ({
      ...prev,
      selectedDoctor: doctor,
      consultationChecked: false
    }));
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
    // Validate that the product has all required fields
    if (!product.productname || !product.productcode || !product.price) {
      toast.error('Invalid product data. Please select a different product.');
      return;
    }
  
    const isDuplicate = billingItems.some(
      (item, idx) => idx !== index && item.code === product.productcode
    );
  
    if (isDuplicate) {
      toast.error('This product is already added to the bill');
      return;
    }
  
    const updatedItems = [...billingItems];
    updatedItems[index] = {
      ...updatedItems[index],
      name: product.productname,
      code: product.productcode,
      category: product.category?.categoryName || 'Uncategorized',
      price: parseFloat(product.price) || 0,
      tax: parseFloat(product.tax) || 0,
      quantity: 1,
      total: (parseFloat(product.price) || 0) + (parseFloat(product.tax) || 0)
    };
    setBillingItems(updatedItems);
    
    setSearchQueries(prev => ({
      ...prev,
      [index]: product.productname
    }));
    setActiveSearchIndex(null);
  
    // Auto-update payment amount if payment type is selected
    if (formState.payment.type) {
      const totals = calculateTotals(updatedItems);
      setFormState(prev => ({
        ...prev,
        payment: { ...prev.payment, paid: totals.grandTotal }
      }));
    }
  };
  
  const handleConsultationToggle = () => {
    if (formState.selectedDoctor?.consultationCharges) {
      setFormState(prev => ({ ...prev, consultationChecked: !prev.consultationChecked }));
      
      let newBillingItems;
      if (!formState.consultationChecked) {
        newBillingItems = [
          ...billingItems,
          {
            id: Date.now(),
            name: 'Consultation Fee',
            code: 'CONSULT',
            category: 'Service',
            price: formState.selectedDoctor.consultationCharges,
            quantity: 1,
            tax: 0,
            total: formState.selectedDoctor.consultationCharges
          }
        ];
      } else {
        newBillingItems = billingItems.filter(item => item.code !== 'CONSULT');
      }
      
      setBillingItems(newBillingItems);

      // Auto-update payment amount if payment type is selected
      if (formState.payment.type) {
        const totals = calculateTotals(newBillingItems);
        setFormState(prev => ({
          ...prev,
          payment: { ...prev.payment, paid: totals.grandTotal }
        }));
      }
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...billingItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };

    if (field === 'quantity') {
      const price = parseFloat(updatedItems[index].price);
      const quantity = parseInt(value) || 1;
      const tax = parseFloat(updatedItems[index].tax);
      updatedItems[index].total = (price * quantity) + tax;
    }

    setBillingItems(updatedItems);
    
    // Auto-update payment amount if payment type is selected
    if (formState.payment.type) {
      const totals = calculateTotals(updatedItems);
      setFormState(prev => ({
        ...prev,
        payment: { ...prev.payment, paid: totals.grandTotal }
      }));
    }
  };

  const validateCardNumber = (number) => {
    return /^\d{4}$/.test(number);
  };

  const validateUTRNumber = (number) => {
    return /^[a-zA-Z0-9]{4}$/.test(number);
  };

  // Updated handlePaymentDetailsChange with paid amount validation
  const handlePaymentDetailsChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'cardNumber' && !/^\d*$/.test(value)) {
      return;
    }

    let newPayment = {
      ...formState.payment,
      [name]: value
    };

    // Add validation for paid amount
    if (name === 'paid') {
      const inputValue = parseFloat(value) || 0;
      const totals = calculateTotals(billingItems);
      
      // Allow any positive amount (including overpayment)
      if (inputValue < 0) {
        newPayment.paid = 0;
        toast.warning('Paid amount cannot be negative');
      } else {
        newPayment.paid = inputValue;
      }
    }

    // Auto-set paid amount to grand total when payment type is selected
    if (name === 'type' && value) {
      const totals = calculateTotals(billingItems);
      newPayment.paid = totals.grandTotal;
    }

    setFormState(prev => ({
      ...prev,
      payment: newPayment
    }));
  };

  // Simple discount change handler
  const handleDiscountChange = (field, value) => {
    setFormState(prev => ({
      ...prev,
      discount: {
        ...prev.discount,
        [field]: value
      }
    }));
    
    // Auto-update payment amount if payment type is selected
    if (formState.payment.type) {
      setTimeout(() => {
        const totals = calculateTotals(billingItems);
        setFormState(prev => ({
          ...prev,
          payment: { ...prev.payment, paid: totals.grandTotal }
        }));
      }, 0);
    }
  };

  const addBillingItem = () => {
    const newItems = [
      ...billingItems,
      { id: Date.now(), name: '', code: '', category: '', price: 0, quantity: 1, tax: 0, total: 0 }
    ];
    setBillingItems(newItems);
  };

  const removeBillingItem = (index) => {
    if (billingItems.length > 1) {
      const newItems = billingItems.filter((_, i) => i !== index);
      setBillingItems(newItems);
      
      // Reindex search queries
      setSearchQueries(prev => {
        const newQueries = {};
        Object.keys(prev).forEach(key => {
          const keyIndex = parseInt(key);
          if (keyIndex < index) {
            newQueries[key] = prev[key];
          } else if (keyIndex > index) {
            newQueries[keyIndex - 1] = prev[key];
          }
        });
        return newQueries;
      });

      // Auto-update payment amount if payment type is selected
      if (formState.payment.type) {
        const totals = calculateTotals(newItems);
        setFormState(prev => ({
          ...prev,
          payment: { ...prev.payment, paid: totals.grandTotal }
        }));
      }
    }
  };

  const handleSaveBill = () => {
    // Validation
    if (!formState.selectedPatient || !formState.selectedDoctor) {
      toast.error('Please select both patient and doctor');
      return;
    }
  
    const hasEmptyItems = billingItems.some(item => !item.name || !item.code);
    if (hasEmptyItems) {
      toast.error('Please fill in all billing items or remove empty ones');
      return;
    }
  
    if (billingItems.length === 0) {
      toast.error('Please add at least one billing item');
      return;
    }
  
    if (!formState.payment.type) {
      toast.error('Please select a payment type');
      return;
    }
  
    if (formState.payment.type === 'card' && !validateCardNumber(formState.payment.cardNumber)) {
      toast.error('Please enter a valid 4-digit card number');
      return;
    }
  
    if (formState.payment.type === 'upi' && !validateUTRNumber(formState.payment.utrNumber)) {
      toast.error('Please enter a valid 4-character UTR number');
      return;
    }
  
    const totals = calculateTotals();
    
    // Determine status based on payment amount
    let status = 'active';
    if (totals.dueAmount <= 0) {
      status = 'paid';
    } else if (formState.payment.paid > 0) {
      status = 'partial';
    }
    
    const billingData = {
      patientId: formState.selectedPatient._id,
      doctorId: formState.selectedDoctor._id,
      billingItems,
      discount: formState.discount,
      payment: formState.payment,
      totals: {
        ...totals,
        balance: totals.dueAmount,
        dueAmount: totals.dueAmount
      }
    };
  
    dispatch(createBilling(billingData))
      .unwrap()
      .then((response) => {
        toast.success('Bill created successfully');
        const billNumber = response.billing?.billNumber;
        if (billNumber) {
          toast.info(`Bill Number: ${billNumber}`);
        }
        router.push('/billing');
      })
      .catch((error) => {
        toast.error(error.message || 'Error creating bill');
      });
  };

  const resetForm = () => {
    setFormState({
      patientQuery: '',
      selectedPatient: null,
      selectedDoctor: null,
      showPatientSuggestions: false,
      discount: { type: 'percent', value: 0 },
      payment: { type: '', paid: 0, cardNumber: '', utrNumber: '' },
      consultationChecked: false
    });
    setBillingItems([
      { id: 1, name: '', code: '', category: '', price: 0, quantity: 1, tax: 0, total: 0 }
    ]);
    setSearchQueries({});
    setActiveSearchIndex(null);
  };

  const totals = calculateTotals();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-4">
        <div className="bg-white rounded-lg">
          <h2 className="text-sm font-semibold mb-2">Create Bill</h2>
          <p className="text-gray-600 mb-6 text-xs">Create a new bill for patient services</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-xs">
            {/* Patient Selection */}
            <div className="form-control">
              <label className="label">
                <span className="text-sm font-medium">Patient *</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formState.patientQuery}
                  onChange={(e) => setFormState(prev => ({
                    ...prev,
                    patientQuery: e.target.value,
                    showPatientSuggestions: true
                  }))}
                  placeholder="Search patient..."
                  className="w-full p-2 border rounded-md"
                  required
                />
                
                {formState.showPatientSuggestions && formState.patientQuery && (
                  <ul className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                    {getFilteredPatients(formState.patientQuery).map(patient => (
                      <li
                        key={patient._id}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handlePatientSelect(patient)}
                      >
                        <div className="text-sm">{patient.firstName} {patient.lastName}</div>
                        <div className="text-xs text-gray-600">ID: {patient.patientId}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Doctor Selection */}
            <div className="form-control">
              <label className="label">
                <span className="text-sm font-medium">Doctor *</span>
              </label>
              <select
                className="w-full p-2 border rounded-md"
                onChange={handleDoctorSelect}
                value={formState.selectedDoctor?._id || ''}
                required
              >
                <option value="">Select doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Consultation Checkbox */}
            <div className="form-control flex items-center justify-center">
              <label className="cursor-pointer flex items-center gap-2">
                <span className="text-sm font-medium">Add Consultation</span>
                <input
                  type="checkbox"
                  checked={formState.consultationChecked}
                  onChange={handleConsultationToggle}
                  disabled={!formState.selectedDoctor?.consultationCharges}
                  className="checkbox"
                />
              </label>
              {formState.selectedDoctor?.consultationCharges && (
                <span className="text-xs text-gray-500 mt-1">
                  ₹{formState.selectedDoctor.consultationCharges}
                </span>
              )}
            </div>
          </div>

          {/* Billing Items Table */}
          <div className="text-xs">
            <table className="table my-4">
              <thead>
                <tr className='text-xs'>
                  <th>Service/Product Name *</th>
                  <th>Code</th>
                  <th>Category</th>
                  <th>Price (₹)</th>
                  <th>Qty</th>
                  <th>Tax (₹)</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {billingItems.map((item, index) => (
                  <tr key={item.id} className='text-xs'>
                    <td className="relative">
                      <input 
                        required
                        type="text"
                        value={searchQueries[index] || item.name}
                        onChange={(e) => handleProductSearch(index, e.target.value)}
                        onFocus={() => setActiveSearchIndex(index)}
                        placeholder="Search product/service..."
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {activeSearchIndex === index && searchQueries[index] && getFilteredProducts(searchQueries[index]).length > 0 && (
                        <ul className="menu bg-base-200 w-full min-w-[300px] max-w-[500px] p-2 rounded-box shadow absolute z-50 mt-1 max-h-60 overflow-auto">
                          {getFilteredProducts(searchQueries[index]).map((product) => (
                            <li key={product._id}>
                              <a 
                                onClick={() => handleProductSelect(product, index)}
                                className="hover:bg-base-300 p-2 cursor-pointer"
                              >
                                <div>
                                  <div className="text-xs font-semibold">{product.productname}</div>
                                  <div className="text-xs opacity-70">
                                    Code: {product.productcode} | Price: ₹{product.price}
                                  </div>
                                </div>
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.code}
                        readOnly
                        className="w-full p-2 border rounded-md bg-gray-50"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.category}
                        readOnly
                        className="w-full p-2 border rounded-md bg-gray-50"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={item.price}
                        readOnly
                        className="w-full p-2 border rounded-md bg-gray-50"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        min="1"
                        className="w-full p-2 border rounded-md"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={item.tax}
                        readOnly
                        className="w-full p-2 border rounded-md bg-gray-50"
                      />
                    </td>
                    <td>₹{(item.total || 0).toFixed(2)}</td>
                    <td>
                      <div className="flex space-x-2">
                        <button 
                          type="button"
                          onClick={addBillingItem} 
                          className="p-1 text-white bg-blue-500 rounded hover:bg-blue-600"
                          title="Add item"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        {billingItems.length > 1 && (
                          <button 
                            type="button"
                            onClick={() => removeBillingItem(index)} 
                            className="p-1 text-white bg-red-500 rounded hover:bg-red-600"
                            title="Remove item"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Discount and Payment Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 text-xs">
            {/* Discount Section */}
            <div className="form-control">
              <label className="label">
                <span className="text-sm font-medium">Discount</span>
              </label>
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="discountType"
                    className="form-radio"
                    checked={formState.discount.type === 'percent'}
                    onChange={() => handleDiscountChange('type', 'percent')}
                  />
                  <span className="ml-2">Percentage (%)</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="discountType"
                    className="form-radio"
                    checked={formState.discount.type === 'amount'}
                    onChange={() => handleDiscountChange('type', 'amount')}
                  />
                  <span className="ml-2">Amount (₹)</span>
                </label>
                <input
                  type="number"
                  value={formState.discount.value}
                  onChange={(e) => handleDiscountChange('value', e.target.value)}
                  className="w-24 p-2 border rounded-md"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Payment Section */}
            <div className="form-control">
              <label className="label">
                <span className="text-sm font-medium">Payment Details *</span>
              </label>
              <div className="space-y-2">
                <select
                  className="w-full p-2 border rounded-md"
                  value={formState.payment.type}
                  onChange={(e) => handlePaymentDetailsChange({ target: { name: 'type', value: e.target.value } })}
                  required
                >
                  <option value="">Select Payment Type</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                  <option value="NEFT">NEFT</option>
                </select>

                {formState.payment.type === 'card' && (
                  <input
                    type="text"
                    name="cardNumber"
                    value={formState.payment.cardNumber}
                    onChange={handlePaymentDetailsChange}
                    placeholder="Last 4 digits of card"
                    maxLength="4"
                    className="w-full p-2 border rounded-md"
                    required
                  />
                )}

                {formState.payment.type === 'upi' && (
                  <input
                    type="text"
                    name="utrNumber"
                    value={formState.payment.utrNumber}
                    onChange={handlePaymentDetailsChange}
                    placeholder="4-character UTR number"
                    maxLength="4"
                    className="w-full p-2 border rounded-md"
                    required
                  />
                )}
              </div>
            </div>
          </div>

          {/* Totals Section */}
          <div className="bg-gray-50 p-4 rounded-lg mb-8 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-right font-medium">Subtotal:</div>
              <div>₹{totals.subtotal.toFixed(2)}</div>
              
              <div className="text-right font-medium">Total Tax:</div>
              <div>₹{totals.totalTax.toFixed(2)}</div>
              
              <div className="text-right font-medium">Discount:</div>
              <div>₹{totals.discountAmount.toFixed(2)}</div>
              
              <div className="text-right font-bold text-lg">Grand Total:</div>
              <div className="font-bold text-lg">₹{totals.grandTotal.toFixed(2)}</div>
              
              <div className="text-right font-medium">Paid Amount:</div>
              <div>
                <input
                  type="number"
                  value={formState.payment.paid}
                  onChange={(e) => handlePaymentDetailsChange({ target: { name: 'paid', value: e.target.value } })}
                  min="0"
                  step="0.01"
                  className="w-full p-2 border rounded-md"
                />
              </div>
              
              <div className="text-right font-medium">Due Amount:</div>
              <div className={`font-medium ${
                totals.dueAmount > 0 ? 'text-warning' : 'text-success'
              }`}>
                ₹{totals.dueAmount.toFixed(2)}
              </div>
              
              <div className="text-right font-medium">Status:</div>
              <div>
                <span className={`badge ${
                  totals.dueAmount <= 0 ? 'badge-success' : 
                  formState.payment.paid > 0 ? 'badge-warning' : 'badge-info'
                }`}>
                  {totals.dueAmount <= 0 ? 'Paid' : 
                   formState.payment.paid > 0 ? 'Partial' : 'Due'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 text-xs">
            <button
              onClick={handleSaveBill}
              disabled={billingLoading}
              className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:ring-2 focus:ring-green-500 disabled:opacity-50"
            >
              {billingLoading ? 'Creating...' : 'Create Bill'}
            </button>
            <button
              onClick={resetForm}
              disabled={billingLoading}
              className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateBillingPage;