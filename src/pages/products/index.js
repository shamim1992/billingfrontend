import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts, deleteProduct } from '@/redux/actions/productActions';
import { fetchCategories } from '@/redux/actions/categoryActions';
import Layout from '@/components/Layout';
import { Search, PlusCircle, Eye, Edit, Trash2, Layers3 } from 'lucide-react';

const ProductList = () => {
  const dispatch = useDispatch();
  // Update the selector to match your Redux state structure
  const { products, status, error } = useSelector((state) => state.products);
  const { items: categories, status: categoryStatus } = useSelector((state) => state.category);
 

  // Debug logs
  useEffect(() => {
    console.log('Products from Redux:', products);
    console.log('Redux Status:', status);
  }, [products, status]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);


  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          dispatch(fetchProducts()),
          dispatch(fetchCategories())
        ]);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };
    fetchData();
  }, [dispatch]);

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteProduct(id));
      setCurrentPage(1);
      toast.success('Product deleted successfully');
    } catch (error) {
      toast.error('Error deleting product');
    }
  };

  const filteredProducts = products?.filter((product) => {
    if (!product) return false;
    
    const matchesSearch = 
      product.productname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.productcode?.toLowerCase().includes(searchTerm.toLowerCase());

    if (selectedFilter === 'all') return matchesSearch;
    
    return matchesSearch && product.category?._id === selectedFilter;
  }) || [];

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-md font-semibold">Products</h1>
            <p className="mt-1 text-xs">Manage your products and inventory</p>
          </div>
          <div className="flex gap-2">
            <Link href="/products/category">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl hover:shadow-md border transition-colors">
                <Layers3 size={20} />
                <span className="text-xs">Category</span>
              </span>
            </Link>
            <Link href="/products/addproduct">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl hover:shadow-md border transition-colors">
                <PlusCircle size={20} />
                <span className="text-xs">Add Product</span>
              </span>
            </Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={20} />
            <input
              type="text"
              placeholder="Search products (Name, Code)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-4 text-xs py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Products</option>
              {categories?.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.categoryName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full rounded-lg">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b text-left text-xs font-semibold">Name</th>
              <th className="px-6 py-3 border-b text-left text-xs font-semibold">Product Code</th>
              <th className="px-6 py-3 border-b text-left text-xs font-semibold">Category</th>
              <th className="px-6 py-3 border-b text-left text-xs font-semibold">Service Type</th>
              <th className="px-6 py-3 border-b text-left text-xs font-semibold">Price</th>
              <th className="px-6 py-3 border-b text-left text-xs font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentProducts.length > 0 ? (
              currentProducts.map((product) => (
                <tr key={product._id}>
                  <td className="px-6 py-2 border-b text-xs">{product.productname}</td>
                  <td className="px-6 py-2 border-b text-xs">{product.productcode}</td>
                  <td className="px-6 py-2 border-b text-xs capitalize">
                    {product.category?.categoryName}
                  </td>
                  <td className="px-6 py-2 border-b text-xs">{product.servicetype}</td>
                  <td className="px-6 py-2 border-b text-xs">₹{product.price}</td>
                  <td className="px-6 py-2 border-b text-xs">
                    <div className="flex gap-2 justify-center items-center">
                      <Link 
                        href={`/products/${product._id}`} 
                        className="tooltip text-blue-500" 
                        data-tip="View Details"
                      >
                        <Eye size={16} />
                      </Link>
                      <Link 
                        href={`/products/edit/${product._id}`} 
                        className="tooltip" 
                        data-tip="Edit"
                      >
                        <Edit size={16} />
                      </Link>
                      <button 
                        className="text-red-500 tooltip" 
                        data-tip="Delete"
                        onClick={() => handleDelete(product._id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500 text-xs">
                  {searchTerm || selectedFilter !== 'all' 
                    ? 'No products found. Try adjusting your search or filter.'
                    : 'No products available. Add some products to get started.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-end mt-4">
        <div className="join">
          <button 
            className={`join-item btn btn-sm ${currentPage === 1 ? 'btn-disabled' : ''}`}
            onClick={handlePrevPage}
          >
            «
          </button>
          <button className="join-item btn btn-sm">
            Page {currentPage} of {totalPages}
          </button>
          <button 
            className={`join-item btn btn-sm ${currentPage === totalPages ? 'btn-disabled' : ''}`}
            onClick={handleNextPage}
          >
            »
          </button>
        </div>
      </div>
      )}
    </Layout>
  );
};

export default ProductList;