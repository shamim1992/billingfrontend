import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createUser } from '@/redux/actions/userActions';
import { fetchDepartments } from '@/redux/actions/departmentActions';
import Layout from '../../components/Layout';
import { UserPlus, User, Mail, Phone, Briefcase, GraduationCap, IndianRupee, EyeClosed } from 'lucide-react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

const AddUser = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  
  // Redux state
  const { loading, error, success } = useSelector((state) => state.users);
  const { departments } = useSelector((state) => state.department);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    contactNumber: '',
    role: '',
    password: '',
    department: '',
    specialization: '',
    consultationCharges: '',
  });

  const [errorMessage, setErrorMessage] = useState('');

  // Fetch departments when role is Doctor
  useEffect(() => {
    if (formData.role === 'Doctor') {
      dispatch(fetchDepartments());
    }
  }, [formData.role, dispatch]);

  // Reset form on successful submission
  useEffect(() => {
    if (success) {
      setFormData({
        name: '',
        username: '',
        email: '',
        contactNumber: '',
        role: '',
        password: '',
        department: '',
        specialization: '',
        consultationCharges: '',
      });
      toast.success('User created successfully!');
      router.push('/users'); // Redirect to users list
    }
  }, [success, router]);

  // Display error if any
  useEffect(() => {
    if (error) {
      toast.error(error);
      setErrorMessage(error);
    }
  }, [error]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Form validation
  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.role || !formData.contactNumber) {
      setErrorMessage('Please fill in all required fields');
      return false;
    }

    if (formData.role === 'Doctor' && (!formData.department || !formData.specialization || !formData.consultationCharges)) {
      setErrorMessage('Please fill in all doctor-specific fields');
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage('Please enter a valid email address');
      return false;
    }

    // Contact number validation (assumes 10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.contactNumber)) {
      setErrorMessage('Please enter a valid 10-digit contact number');
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateForm()) {
      return;
    }

    try {
      
      await dispatch(createUser(formData)).unwrap();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create user');
    }
  };

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-md font-semibold text-gray-900">Add New User</h1>
            <p className="text-gray-500 mt-1 text-sm">Fill out the form to add a new user</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 max-w-xl mx-auto rounded-lg shadow-sm">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              {errorMessage}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-700">Name<span className='text-red-500'>*</span></label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter full name"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Username<span className='text-red-500'>*</span></label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter username"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Email<span className='text-red-500'>*</span></label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email address"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Password<span className='text-red-500'>*</span></label>
            <div className="relative">
              <EyeClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Contact Number<span className='text-red-500'>*</span></label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter 10-digit contact number"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Role<span className='text-red-500'>*</span></label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Role</option>
                <option value="Doctor">Doctor</option>
                <option value="Admin">Admin</option>
                <option value="Receptionist">Receptionist</option>
                <option value="Accountant">Accountant</option>
              </select>
            </div>
          </div>

          {formData.role === 'Doctor' && (
            <>
              <div className="mb-4">
                <label className="block text-gray-700">Department<span className='text-red-500'>*</span></label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments && departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Specialization<span className='text-red-500'>*</span></label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter specialization"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Consultation Charges<span className='text-red-500'>*</span></label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="number"
                    name="consultationCharges"
                    value={formData.consultationCharges}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter consultation charges"
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <UserPlus size={20} />
              <span>{loading ? 'Adding...' : 'Add User'}</span>
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AddUser;