import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDepartments } from '../../redux/actions/departmentActions'; // Replace with your fetchDepartments action
import Layout from '../../components/Layout';
import { Search, Plus, Edit, Trash, Building } from 'lucide-react';

const DepartmentList = () => {
  const dispatch = useDispatch();
  const { departments, loading, error } = useSelector((state) => state.department);

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchDepartments()); // Fetch departments when the component mounts
  }, [dispatch]);

  // Filter departments based on search term
  const filteredDepartments = departments?.filter(department =>
    department?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const DepartmentCard = ({ department }) => (
    <div className="rounded-lg border border-gray-200 hover:border-blue-500 transition-all duration-200">
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <Building size={24} className="text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{department.name}</h3>
              <div className="text-sm text-gray-500">{department.description || 'No description available'}</div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t flex items-center justify-between">
          <Link href={`/departments/${department._id}`}>
            <span className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View Details
            </span>
          </Link>
          <div className="flex items-center gap-2">
            {/* <button className="p-2 hover:bg-gray-50 rounded-md">
              <Edit size={16} className="text-gray-500" />
            </button> */}
            {/* <button className="p-2 hover:bg-gray-50 rounded-md">
              <Trash size={16} className="text-red-500" />
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-md font-semibold text-gray-900">Departments</h1>
            <p className="text-gray-500 mt-1 text-sm">Manage your hospital departments</p>
          </div>
          <Link href="/departments/new">
            <span className="inline-flex items-center gap-2 px-4  rounded-2xl hover:shadow-md py-2 border transition-colors">
              <Plus size={20} />
              <span className='text-sm'>Add Department</span>
            </span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 w-full mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Department Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredDepartments?.map((department) => (
            <DepartmentCard key={department._id} department={department} />
          ))}
        </div>

        {/* Empty State */}
        {filteredDepartments?.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Building size={32} className="text-gray-400" />
            </div>
            <h3 className="text-md font-medium text-gray-900">No departments found</h3>
            <p className="text-gray-500 text-sm mt-1">Try adjusting your search or add a new department.</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm">Loading departments...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-500 text-sm">Failed to load departments. Please try again.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DepartmentList;
