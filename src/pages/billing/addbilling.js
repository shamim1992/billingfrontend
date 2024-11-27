import React, { useState, useEffect } from 'react';
import { Plus, Minus, Search } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '@/components/Layout';
import { fetchPatients } from '@/redux/actions/patientActions';
import { fetchUsers } from '@/redux/actions/userActions';
import { fetchProducts } from '@/redux/actions/productActions';
import { createBilling } from '@/redux/actions/billingActions';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

const BillingForm = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  // Redux state
  const { patients } = useSelector((state) => state.patients);
  const { users } = useSelector((state) => state.users);
  const { products, status } = useSelector((state) => state.products);

  // Debug logs for products data
  useEffect(() => {
    console.log('Products from Redux:', products);
    console.log('Redux Status:', status);
  }, [products, status]);

  // Component state
  const [isLoading, setIsLoading] = useState(true);
  const [formState, setFormState] = useState({
    patientQuery: '',
    selectedPatient: null,
    selectedDoctor: null,
    showPatientSuggestions: false,
    remarks: '',
    discount: { type: 'percent', value: 0 },
    payment: { type: '', paid: 0 },
    consultationChecked: false,
  });

  const [billingItems, setBillingItems] = useState([
    { id: 1, name: '', code: '', category: '', price: 0, quantity: 1, tax: 0, total: 0 }
  ]);

  // Product search state
  const [searchQueries, setSearchQueries] = useState({});
  const [activeSearchIndex, setActiveSearchIndex] = useState(null);

  // Filter doctors from users
  const doctors = users.filter(user => user.role === 'Doctor');

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          dispatch(fetchProducts()),
          dispatch(fetchPatients()),
          dispatch(fetchUsers())
        ]);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
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

  // Filter functions
  const getFilteredProducts = (searchQuery) => {
    if (!searchQuery || !products) return [];
    console.log('Searching products with query:', searchQuery);
    return products.filter(product =>
      product.productname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.productcode?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getFilteredPatients = (query) => {
    if (!query || !patients) return [];
    return patients.filter(patient =>
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(query.toLowerCase()) ||
      patient.patientId.toLowerCase().includes(query.toLowerCase())
    );
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
    console.log('Search value:', value);
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
    console.log('Selected product:', product);
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
    if (formState.selectedDoctor?.consultationCharges) {
      setFormState(prev => ({ ...prev, consultationChecked: !prev.consultationChecked }));
      
      if (!formState.consultationChecked) {
        setBillingItems([
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

    if (field === 'quantity') {
      const price = parseFloat(updatedItems[index].price);
      const quantity = parseInt(value);
      const tax = parseFloat(updatedItems[index].tax);
      updatedItems[index].total = (price * quantity) + tax;
    }

    setBillingItems(updatedItems);
  };

  const handlePaidAmountChange = (e) => {
    const paidAmount = parseFloat(e.target.value) || 0;
    const grandTotal = calculateTotals().grandTotal;
    
    let automaticRemarks = 'pending';
    if (paidAmount === 0) {
      automaticRemarks = 'pending';
    } else if (paidAmount >= grandTotal) {
      automaticRemarks = 'paid';
    } else {
      automaticRemarks = 'partial';
    }

    setFormState(prev => ({
      ...prev,
      payment: { ...prev.payment, paid: e.target.value },
      remarks: automaticRemarks
    }));
  };

  const addBillingItem = () => {
    setBillingItems([
      ...billingItems,
      { id: Date.now(), name: '', code: '', category: '', price: 0, quantity: 1, tax: 0, total: 0 }
    ]);
  };

  const removeBillingItem = (index) => {
    if (billingItems.length > 1) {
      setBillingItems(billingItems.filter((_, i) => i !== index));
      setSearchQueries(prev => {
        const newQueries = { ...prev };
        delete newQueries[index];
        return newQueries;
      });
    }
  };

  const calculateTotals = () => {
    const subtotal = billingItems.reduce((sum, item) => sum + item.total, 0);
    const totalTax = billingItems.reduce((sum, item) => sum + parseFloat(item.tax || 0), 0);
    let discountAmount = 0;

    if (formState.discount.type === 'percent') {
      discountAmount = (subtotal * formState.discount.value) / 100;
    } else {
      discountAmount = parseFloat(formState.discount.value || 0);
    }

    const grandTotal = subtotal - discountAmount;
    const balance = grandTotal - parseFloat(formState.payment.paid || 0);

    return { subtotal, totalTax, discountAmount, grandTotal, balance };
  };

  const handleSaveBill = () => {
    if (!formState.selectedPatient || !formState.selectedDoctor) {
      toast.error('Please select both patient and doctor');
      return;
    }

    if (!billingItems.some(item => item.name)) {
      toast.error('Please add at least one billing item');
      return;
    }

    if (!formState.payment.type) {
      toast.error('Please select a payment type');
      return;
    }

    const totals = calculateTotals();
    const billingData = {
      patientId: formState.selectedPatient._id,
      doctorId: formState.selectedDoctor._id,
      billingItems,
      discount: formState.discount,
      payment: formState.payment,
      remarks: formState.remarks,
      totals
    };

    dispatch(createBilling(billingData))
      .unwrap()
      .then(() => {
        toast.success('Bill created successfully');
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
      remarks: '',
      discount: { type: 'percent', value: 0 },
      payment: { type: '', paid: 0 },
      consultationChecked: false,
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
      <div className="">
        <div className="">
          <h2 className="text-sm">Create Bill</h2>
          <p className="text-xs">Create a new bill for patient services</p>

          {/* Patient and Doctor Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Patient Selection */}
            <div className="form-control">
              <label className="label">
                <span className="text-xs">Patient</span>
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
                  className="w-full p-2 border text-xs rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                
                {formState.showPatientSuggestions && formState.patientQuery && (
                  <ul className="menu bg-base-100 w-full p-2 rounded-box shadow absolute z-50 mt-1 max-h-60 overflow-auto">
                    {getFilteredPatients(formState.patientQuery).map(patient => (
                      <li key={patient._id}>
                        <a onClick={() => handlePatientSelect(patient)}>
                          <div>
                            <div className="text-xs">
                              {patient.firstName} {patient.lastName}
                            </div>
                            <div className="text-sm opacity-70">
                              ID: {patient.patientId}
                            </div>
                          </div>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Doctor Selection */}
            <div className="form-control">
              <label className="label">
                <span className="text-xs">Doctor</span>
              </label>
              <select
                className="w-full p-2 text-xs border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onChange={handleDoctorSelect}
                value={formState.selectedDoctor?._id || ''}
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
            <div className="form-control ">
              <div className="flex justify-center items-center p-2 gap-2">
                <span className="text-xs">Consultation</span>
                <input
                  type="checkbox"
                  checked={formState.consultationChecked}
                  onChange={handleConsultationToggle}
                  className="checkbox "
                />
              </div>
            </div>
          </div>

          {/* Billing Items Table */}
          <div className="text-xs">
            <table className="table my-4">
              <thead>
                <tr className='text-xs'>
                  <th>Name</th>
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
                        type="text"
                        value={searchQueries[index] || item.name}
                        onChange={(e) => handleProductSearch(index, e.target.value)}
                        onFocus={() => setActiveSearchIndex(index)}
                        placeholder="Search product..."
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {activeSearchIndex === index && searchQueries[index] && getFilteredProducts(searchQueries[index]).length > 0 && (
                        <ul className="menu bg-base-200 w-[200px] p-2 rounded-box shadow absolute z-50 mt-1 max-h-60 overflow-auto">
                          {getFilteredProducts(searchQueries[index]).map((product) => (
                            <li key={product._id}>
                              <a 
                                onClick={() => handleProductSelect(product, index)}
                                className="hover: p-2 cursor-pointer"
                              >
                                <div>
                                  <div className="text-xs">{product.productname}</div>
                                  <div className="text-sm opacity-70">
                                  Price: ₹{product.price}
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
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.category}
                        readOnly
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={item.price}
                        readOnly
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        min="1"
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={item.tax}
                        readOnly
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </td>
                    <td>₹{item.total.toFixed(2)}</td>
                    <td>
                      <div className="flex space-x-2">
                        <button onClick={addBillingItem} className="p-1 text-white bg-blue-500 rounded hover:bg-blue-600">
                          <Plus className="h-4 w-4" />
                        </button>
                        {billingItems.length > 1 && (
                          <button onClick={() => removeBillingItem(index)} className="p-1 text-white bg-red-500 rounded hover:bg-red-600">
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

          {/* Discount Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="form-control">
              <label className="label">
                <span className="text-xs">Discount Type</span>
              </label>
              <div className="flex items-center space-x-4">
                <label className="label cursor-pointer">
                  <input
                    type="radio"
                    name="discountType"
                    className="radio"
                    checked={formState.discount.type === 'percent'}
                    onChange={() => setFormState(prev => ({
                      ...prev,
                      discount: { ...prev.discount, type: 'percent' }
                    }))}
                  />
                  <span className="ml-2 text-xs">Percentage (%)</span>
                </label>
                <label className="label cursor-pointer">
                  <input
                    type="radio"
                    name="discountType"
                    className="radio"
                    checked={formState.discount.type === 'amount'}
                    onChange={() => setFormState(prev => ({
                      ...prev,
                      discount: { ...prev.discount, type: 'amount' }
                    }))}
                  />
                  <span className="ml-2 text-xs">Amount (₹)</span>
                </label>
                <input
                  type="number"
                  value={formState.discount.value}
                  onChange={(e) => setFormState(prev => ({
                    ...prev,
                    discount: { ...prev.discount, value: e.target.value }
                  }))}
                  className="input input-bordered text-xs input-sm w-24"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Payment and Remarks Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Payment Type */}
            <div className="form-control">
              <label className="label">
                <span className="text-xs">Payment Type</span>
              </label>
              <select
                className="w-full text-xs p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formState.payment.type}
                onChange={(e) => setFormState(prev => ({
                  ...prev,
                  payment: { ...prev.payment, type: e.target.value }
                }))}
              >
                <option value="">Select Payment Type</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
              </select>
            </div>

            {/* Remarks - Now Read Only */}
            <div className="form-control">
              <label className="label">
                <span className="text-xs">Remarks</span>
              </label>
              <input
                type="text"
                value={formState.remarks}
                readOnly
                className="w-full text-xs p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Totals Section */}
          <div className=" p-4 rounded-lg mb-8 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-right text-xs">Subtotal:</div>
              <div>₹{totals.subtotal.toFixed(2)}</div>
              
              <div className="text-right text-xs">Total Tax:</div>
              <div>₹{totals.totalTax.toFixed(2)}</div>
              
              <div className="text-right text-xs">Discount:</div>
              <div>₹{totals.discountAmount.toFixed(2)}</div>
              
              <div className="text-right text-xs">Grand Total:</div>
              <div>₹{totals.grandTotal.toFixed(2)}</div>
              
              <div className="text-right text-xs">Paid Amount:</div>
              <div>
                <input
                  type="number"
                  value={formState.payment.paid}
                  onChange={handlePaidAmountChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
              </div>
              
              <div className="text-right text-xs">Balance:</div>
              <div>₹{totals.balance.toFixed(2)}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={handleSaveBill}
              className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:ring-2 focus:ring-green-500"
            >
              Save Bill
            </button>
            <button
              onClick={resetForm}
              className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BillingForm;