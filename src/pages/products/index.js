import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts, deleteProduct } from '../../redux/actions/productActions';
import { fetchCategories } from '../../redux/actions/categoryActions';
import Layout from '../../components/Layout';
import { Search, PlusCircle, Eye, Edit, Trash2, Layers3 } from 'lucide-react';

const ProductList = () => {
  const dispatch = useDispatch();
  const { items: products, status, error } = useSelector((state) => state.product);
  const { items: categories, status: categoryStatus } = useSelector((state) => state.category);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10); // Adjust the number of items per page

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleDelete = async (id) => {
    await dispatch(deleteProduct(id));
    setCurrentPage(1); // Reset to first page after deleting
  };

  const filteredProducts = products?.filter((product) => {
    const matchesSearch =
      (product.productname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.productcode?.includes(searchTerm)) ?? false;

    if (selectedFilter === 'all') return matchesSearch;

    return product.category?._id === selectedFilter && matchesSearch;
  });

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-md font-semibold">Products</h1>
            <p className="mt-1 text-xs">Manage your products and inventory</p>
          </div>
          <div>
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
              placeholder="Search products (Name, ID)"
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
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full rounded-lg">
          <thead>
            <tr>

              <th className="px-6 py-3 border-b text-left text-xs font-semibold">Name</th>
              <th className="px-6 py-3 border-b text-left text-xs font-semibold">Product Code</th>
              <th className="px-6 py-3 border-b text-left text-xs font-semibold">Category</th>
              <th className="px-6 py-3 border-b text-left text-xs font-semibold">Price</th>
              <th className="px-6 py-3 border-b text-left text-xs font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentProducts?.map((product) => (
              <tr key={product._id}>
                <td className="px-6 py-2 border-b text-xs">{product.productname}</td>
                <td className="px-6 py-2 border-b text-xs">{product.productcode}</td>
                <td className="px-6 py-2 border-b text-xs capitalize">{product.category.categoryName}</td>
                <td className="px-6 py-2 border-b text-xs">&#x20B9; {product.price}</td>
                <td className="px-6 py-2 border-b text-xs text-blue-600 hover:text-blue-700">
                  <div className="flex gap-2 justify-center items-center">
                    <Link href={`/products/${product._id}`} data-tip ="View Details" className='tooltip'>
                      <Eye size={16} />
                    </Link>
                    <Link href={`/products/edit/${product._id}`} data-tip ="Edit" className='tooltip'>
                      <Edit size={16} />
                    </Link>
                    <button data-tip ="Delete" onClick={() => handleDelete(product._id)} className="text-red-500 tooltip">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {currentProducts?.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500 text-xs">
                  No products found. Try adjusting your search or filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center mt-4">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => paginate(index + 1)}
            className={`text-xs px-3 py-1 mx-1 border rounded-lg ${currentPage === index + 1 ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'}`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </Layout>
  );
};

export default ProductList;
