import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { fetchProducts, deleteProduct } from '../../redux/actions/productActions';
import Layout from '../../components/Layout';
import { Edit, Trash2, Layers, Layers3, Loader } from 'lucide-react';
import Link from 'next/link';

const ProductView = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { id } = router.query;
  const { products, status, error } = useSelector((state) => state.products);
  
  console.log(products);
  const product = products?.find((p) => p._id === id);

  useEffect(() => {
    if (status === 'idle' && id) {
      dispatch(fetchProducts());
    }
  }, [dispatch, status, id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await dispatch(deleteProduct(product._id)).unwrap();
        router.push('/products');
      } catch (error) {
        console.error('Failed to delete product:', error);
      }
    }
  };

  if (status === 'loading') {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[calc(100vh-100px)]">
          <div className="flex flex-col items-center gap-2">
            <Loader className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-xs text-gray-600">Loading product details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)]">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Product Not Found</h2>
            <p className="text-gray-600 mb-4">The product you&apos;re looking for doesn&apos;t exist or has been removed.</p>
            <Link href="/products">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                <Layers3 size={20} />
                <span>Back to Products</span>
              </span>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-white rounded-lg shadow-sm">
        <div className="">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Product Details</h1>
              <p className="mt-1 text-xs text-gray-500">View and manage product information</p>
            </div>
            <Link href="/products">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Layers3 size={20} />
                <span className="text-xs">All Products</span>
              </span>
            </Link>
          </div>

          <div className="max-w-3xl mx-auto bg-white rounded-lg">
            <div className="grid grid-cols-2 gap-6 p-6">
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <label className="text-xs font-medium text-gray-500">Product Name</label>
                  <p className="mt-1 text-xs text-gray-900">{product.productname}</p>
                </div>

                <div className="border-b pb-4">
                  <label className="text-xs font-medium text-gray-500">Product Code</label>
                  <p className="mt-1 text-xs text-gray-900">{product.productcode}</p>
                </div>

                <div className="border-b pb-4">
                  <label className="text-xs font-medium text-gray-500">Category</label>
                  <p className="mt-1 text-xs capitalize text-gray-900">
                    {product.category.categoryName}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border-b pb-4">
                  <label className="text-xs font-medium text-gray-500">Price</label>
                  <p className="mt-1 text-xs text-gray-900">₹ {product.price}</p>
                </div>

                <div className="border-b pb-4">
                  <label className="text-xs font-medium text-gray-500">Service Type</label>
                  <p className="mt-1 text-xs text-gray-900">{product.servicetype}</p>
                </div>

                <div className="border-b pb-4">
                  <label className="text-xs font-medium text-gray-500">Tax</label>
                  <p className="mt-1 text-xs text-gray-900">{product.tax}</p>
                </div>
              </div>
            </div>

            {/* <div className="flex justify-end gap-4 px-6 py-4 bg-gray-50 rounded-b-lg">
              <Link href={`/products/edit/${product._id}`}>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <Edit size={18} className="text-blue-500" />
                  <span>Edit Product</span>
                </span>
              </Link>
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 size={18} />
                <span>Delete Product</span>
              </button>
            </div> */}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductView;