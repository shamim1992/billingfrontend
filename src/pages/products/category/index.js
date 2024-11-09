import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories, deleteCategory } from '../../../redux/actions/categoryActions';
import Layout from '@/components/Layout';
import Link from 'next/link';
import { Search, Eye, Edit, Trash2, Layers3, PlusCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const CategoryList = () => {
  const dispatch = useDispatch();
  const { items: categories, status, error } = useSelector((state) => state.category);
  const [searchTerm, setSearchTerm] = useState('');
  const [refresh, setRefresh] = useState(false);
// console.log(categories)
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch, refresh]);

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteCategory(id)).unwrap();
      toast.success('Category deleted successfully');
      setRefresh((prev) => !prev);
    } catch (error) {
      toast.error(error || 'Failed to delete category');
    }
  };

  const filteredCategories = categories?.filter((category) =>
    
    category.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-md font-semibold">Categories</h1>
            <p className="mt-1 text-xs">Manage your product categories</p>
          </div>
          <div>
          <Link href="/products">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl hover:shadow-md border transition-colors">
                <Layers3 size={20} />
                <span className="text-xs">Products</span>
              </span>
            </Link>
            <Link href="/products/category/addcategory">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl hover:shadow-md border transition-colors">
              <PlusCircle size={20} />
              <span className="text-xs">Add Category</span>
            </span>
          </Link>
          </div>
          
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={20} />
            <input
              type="text"
              placeholder="Search categories by name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full rounded-lg">
          <thead>
            <tr>
              <th className="px-6  border-b text-left text-xs font-semibold">Category Name</th>
              <th className="px-6  border-b text-left text-xs font-semibold">Description</th>
              <th className="px-6  border-b text-left text-xs font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody >
            {filteredCategories?.map((category) => (
              <tr key={category._id} >
                <td className="px-6 py-2 border-b text-xs">{category.categoryName}</td>
                <td className="px-6 py-2 border-b text-xs">{category.description}</td>
                <td className="px-6 py-2 border-b text-xs">
                  <div className="flex gap-2">
                    <Link href={`/categories/${category._id}`}>
                      <Eye size={16} className="text-blue-600 hover:text-blue-700" />
                    </Link>
                    <Link href={`/categories/edit/${category._id}`}>
                      <Edit size={16} className="text-blue-600 hover:text-blue-700" />
                    </Link>
                    <button onClick={() => handleDelete(category._id)} className="text-red-500 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredCategories?.length === 0 && (
              <tr>
                <td colSpan="3" className="text-center py-6 text-gray-500 text-xs">
                  No categories found. Try adjusting your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </Layout>
  );
};

export default CategoryList;
