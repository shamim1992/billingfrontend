import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { fetchProducts , deleteProduct} from '../../redux/actions/productActions';
import Layout from '../../components/Layout';
import { Edit, Trash2, Layers, Layers3, PlusCircle } from 'lucide-react';
import Link from 'next/link';

const ProductView = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { id } = router.query;
  const { items: products, status } = useSelector((state) => state.product);
  const product = products?.find((p) => p._id === id);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProducts());
    }
  }, [dispatch, status]);

  if (status === 'loading') return <p>Loading...</p>;
  if (!product) return <p>Product not found</p>;

  return (
    <Layout>
        <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-md font-semibold">Product Details</h1>
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

        <div className="max-w-xl mx-auto p-4">
        
        <div className="mb-6">
          <label className="text-xs font-medium">Product Name : </label>
          <span className="text-xs text-gray-600 mt-1">{product.productname}</span>
        </div>
        <div className="mb-6">
          <label className="text-xs font-medium">Product Code : </label>
          <span className="text-xs text-gray-600 mt-1">{product.productcode}</span>
        </div>
        
        <div className="mb-6">
          <label className="text-xs font-semibold">Category : </label>
          <span className="text-xs capitalize">{product.category.categoryName}</span>
        </div>

        <div className="mb-6">
          <label className="text-xs font-semibold">Price:</label>
          <span className="text-xs">&#x20B9; {product.price}</span>
        </div>

        <div className="mb-6">
          <label className="text-xs font-semibold">Service type:</label>
          <span className="text-xs"> {product.servicetype}</span>
        </div>

        <div className="mb-6">
          <label className="text-xs font-semibold">Tax:</label>
          <span className="text-xs">&#x20B9; {product.tax}</span>
        </div>
        <div className="flex gap-4 mt-6 text-xs">
          <Link href={`/products/edit/${product._id}`}>
            <span className="inline-flex items-center gap-2 px-4 py-1  border rounded-lg hover:shadow-lg">
              <Edit size={20} className='text-blue-500'/>
              Edit
            </span>
          </Link>
          <button
            onClick={() => dispatch(deleteProduct(product._id))}
            className="inline-flex items-center gap-2 px-4 py-1  border rounded-lg hover:shadow-lg"
          >
            <Trash2 size={20} className='text-red-500'/>
            Delete
          </button>
        </div>
      </div>
        </div>
      
    </Layout>
  );
};

export default ProductView;
