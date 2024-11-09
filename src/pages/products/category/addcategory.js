import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { createCategory } from '../../../redux/actions/categoryActions';
import Layout from '@/components/Layout';
import { toast } from 'react-toastify';

const AddCategory = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { status: categoryStatus, error: categoryError } = useSelector((state) => state.category);

  const [formData, setFormData] = useState({
    categoryName: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault('');
    try {
      await dispatch(createCategory(formData)).unwrap();
      toast.success('Category added successfully');
    //   router.push('/products/category'); 
  
    } catch (error) {
      toast.error(error || 'Failed to add category');
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto p-6 bg-white ">
        <h2 className="text-sm font-semibold mb-4">Add New Category</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-xs font-medium mb-2">Category Name</label>
            <input
              type="text"
              name="categoryName"
              value={formData.categoryName}
              onChange={handleChange}
              required
              className="w-full text-xs px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="max-w-2xl text-xs mx-auto py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={categoryStatus === 'loading'}
          >
            {categoryStatus === 'loading' ? 'Adding...' : 'Add Category'}
          </button>
        </form>
        {categoryError && <p className="text-red-500 mt-4">{categoryError}</p>}
      </div>
    </Layout>
  );
};

export default AddCategory;
