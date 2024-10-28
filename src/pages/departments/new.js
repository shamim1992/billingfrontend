import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createDepartment } from '../../redux/actions/departmentActions'; // Import the createDepartment action
import Layout from '../../components/Layout';
import { Building, ClipboardList, Plus } from 'lucide-react';

const AddDepartment = () => {
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.department);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  
  const [errorMessage, setErrorMessage] = useState('');

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Submit form
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name) {
      setErrorMessage('Please fill out the department name.');
      return;
    }

    // Dispatch the createDepartment action
    dispatch(createDepartment(formData));
  };

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-md font-semibold text-gray-900">Add New Department</h1>
            <p className="text-gray-500 mt-1 text-sm">Fill out the form to create a new department</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg">
          {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {success && <p className="text-green-500 mb-4">Department added successfully!</p>}

          <div className="mb-4">
            <label className="block text-gray-700">Department Name</label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter department name"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Description (optional)</label>
            <div className="relative">
              <ClipboardList className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter department description"
                rows="4"
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              disabled={loading}
            >
              <Plus size={20} />
              {loading ? 'Adding...' : 'Add Department'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AddDepartment;
