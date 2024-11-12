import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { createProduct } from '../../redux/actions/productActions';
import { fetchCategories } from '../../redux/actions/categoryActions';
import Layout from '../../components/Layout';
import { toast } from 'react-toastify';

const AddProduct = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { status: productStatus, error: productError } = useSelector((state) => state.products);
  const { items: categories, status: categoryStatus } = useSelector((state) => state.category);

  const [formData, setFormData] = useState({
    productname: '',
    productcode: '',
    description: '',
    price: '',
    servicetype: '',
    category: '',
    tax: '',
  });


  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        console.log(formData)
      await dispatch(createProduct(formData)).unwrap();
      toast.success('Product added successfully');

      setFormData({
        productname: '',
        productcode: '',
        description: '',
        price: '',
        servicetype: '',
        category: '',
        tax: '',
      });
   
    } catch (error) {
      toast.error(error || 'Failed to add product');
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto p-6 bg-white">
        <h2 className="text-sm font-semibold mb-2">Add New Product</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-2">
            <label className="block text-xs font-medium mb-2">Product Name</label>
            <input
              type="text"
              name="productname"
              value={formData.productname}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-2">
            <label className="block text-xs font-medium mb-2">Product Code</label>
            <input
              type="text"
              name="productcode"
              value={formData.productcode}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-2">
            <label className="block text-xs font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-2">
            <label className="block text-xs font-medium mb-2">Price</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              className="w-full px-4 py-2  text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-2">
            <label className="block text-xs font-medium mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Category</option>
              {categoryStatus === 'loading' ? (
                <option>Loading...</option>
              ) : (
                categories?.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.categoryName}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="mb-2">
            <label className="block text-xs font-medium mb-2">Service Type</label>
            <select
              name="servicetype"
              value={formData.servicetype}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Service Type</option>
              <option value="IP">IP</option>
              <option value="OP">OP</option>
              <option value="Both">Both</option>
            </select>
          </div>

          <div className="mb-2">
            <label className="block text-xs font-medium mb-2">Tax</label>
            <input
              type="text"
              name="tax"
              value={formData.tax}
              onChange={handleChange}
              
              className="w-full px-4 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={productStatus === 'loading'}
          >
            {productStatus === 'loading' ? 'Adding...' : 'Add Product'}
          </button>
        </form>
        {productError && <p className="text-red-500 mt-4">{productError}</p>}
      </div>
    </Layout>
  );
};

export default AddProduct;
