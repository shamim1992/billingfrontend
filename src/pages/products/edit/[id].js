import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { fetchProducts, updateProduct } from '@/redux/actions/productActions';
import { fetchCategories } from '@/redux/actions/categoryActions';
import Layout from '@/components/Layout';
import Link from 'next/link';
import { Layers3 } from 'lucide-react';

const EditProduct = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { id } = router.query;
  
  const { items: products, status } = useSelector((state) => state.products);
  const { items: categories, status: categoryStatus } = useSelector((state) => state.category);

  const product = products?.find((p) => p._id === id);

  const [formData, setFormData] = useState({
    productname: '',
    productcode: '',
    category: '',
    price: '',
    tax: '',
    servicetype: '',  // New service type field in state
  });

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProducts());
    }
    if (categoryStatus === 'idle') {
      dispatch(fetchCategories());
    }
    if (product) {
      setFormData({
        productname: product.productname,
        productcode: product.productcode,
        category: product.category._id,
        price: product.price,
        tax: product.tax || '',
        servicetype: product.servicetype || '',  // Initialize with existing servicetype value, if available
      });
    }
  }, [dispatch, status, categoryStatus, product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(updateProduct({ id, updatedData: formData }));
    router.push('/products'); // Redirect after update
  };

  if (!product) return <p>Loading...</p>;

  return (
    <Layout>
        <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-md font-semibold">Edit Product</h1>
            <p className="mt-1 text-xs">Manage your products and inventory</p>
          </div>
          <div>
            <Link href="/products">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl hover:shadow-md border transition-colors">
              <Layers3 size={20} />
                <span className="text-xs">Products</span>
              </span>
            </Link>
          </div>
        </div>
        <div className="max-w-lg mx-auto p-4">
       
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-xs font-medium mb-2">Product Name</label>
            <input
              type="text"
              name="productname"
              value={formData.productname}
              onChange={handleChange}
              className="w-full p-2 border rounded-md text-xs"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium mb-2">Product Code</label>
            <input
              type="text"
              name="productcode"
              value={formData.productcode}
              onChange={handleChange}
              className="w-full p-2 border rounded-md text-xs"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-2 border rounded-md text-xs"
              required
            >
              {categoryStatus === 'loading' ? (
                <option>Loading categories...</option>
              ) : (
                categories?.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.categoryName}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium mb-2">Price</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full p-2 border rounded-md text-xs"
              required
            />
          </div>

          {/* Tax Field */}
          <div className="mb-4">
            <label className="block text-xs font-medium mb-2">Tax (%)</label>
            <input
              type="number"
              name="tax"
              value={formData.tax}
              onChange={handleChange}
              className="w-full p-2 border rounded-md text-xs"
              placeholder="Enter tax percentage"
            />
          </div>

          {/* Service Type Field */}
          <div className="mb-4">
            <label className="block text-xs font-medium mb-2">Service Type</label>
            <select
              name="servicetype"
              value={formData.servicetype}
              onChange={handleChange}
              className="w-full p-2 border rounded-md text-xs"
            >
              <option value="">Select service type</option>
              <option value="IP">IP</option>
              <option value="OP">OP</option>
              <option value="Both">Both</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Save Changes
          </button>
        </form>
      </div>
        </div>
     
    </Layout>
  );
};

export default EditProduct;
