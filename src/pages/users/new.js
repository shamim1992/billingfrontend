import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createUser } from '@/redux/actions/authActions'; // Import the createUser action
import Layout from '../../components/Layout';
import { UserPlus, User, Mail, Phone, Briefcase, GraduationCap, IndianRupee, EyeClosed } from 'lucide-react';
import axios from 'axios';
import { baseURL } from '@/ApiUrl';

const AddUser = () => {
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.users);

  const [formData, setFormData] = useState({
    name: '',
    username:'',
    email: '',
    contactNumber: '', // Fixed from 'contact'
    role: '',
    password: '',
    department: '',
    specialization: '',
    consultationCharges: '',
  });

  const [departments, setDepartments] = useState([]); // Store fetched departments
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (success) {
      setFormData({
        name: '',
        username:'',
        email: '',
        contactNumber: '',
        role: '',
        password: '',
        department: '',
        specialization: '',
        consultationCharges: '',
      });
    }
  }, [success]);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // If role is selected as 'Doctor', fetch departments
    if (name === 'role' && value === 'Doctor') {
      fetchDepartments();
    }
  };

  // Fetch departments from the backend
  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/department`);
      setDepartments(response.data);
    } catch (error) {
      console.error('Failed to fetch departments', error);
    }
  };

  // Submit form
  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic form validation
    if (!formData.name || !formData.email || !formData.role) {
      setErrorMessage('Please fill out all required fields.');
      return;
    }

    // Dispatch the createUser action
    dispatch(createUser(formData));
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

        <form onSubmit={handleSubmit} className="bg-white p-6 max-w-xl mx-auto rounded-lg">
          {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
          {error && <p className="text-red-500 mb-4">{error}</p>}

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
                placeholder="Enter full username"
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
                placeholder="Enter Password"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Contact<span className='text-red-500'>*</span></label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                name="contactNumber" // Fixed contact field
                value={formData.contactNumber}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter contact number"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Role<span className='text-red-500'>*</span></label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Role</option>
              <option value="Doctor">Doctor</option>
              <option value="Admin">Admin</option>
              <option value="Receptionist">Receptionist</option>
              <option value="Accountant">Accountant</option>
            </select>
          </div>

          {/* Conditionally show department, specialization, and consultation charges fields if role is Doctor */}
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
                    className="w-full px-4 pl-10 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Department<span className='text-red-500'>*</span></option>
                    {departments.map((dept) => (
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
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" size={20} />
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

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus size={20} />
              <span>Add User</span>
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AddUser;
