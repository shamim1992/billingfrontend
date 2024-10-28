import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDepartmentById } from '../../redux/actions/departmentActions'; // Replace with your fetchDepartmentById action
import Layout from '../../components/Layout';
import { Edit, Trash, Building } from 'lucide-react';

const DepartmentDetails = () => {
  const router = useRouter();
  const { id } = router.query; // Get department ID from the URL

  const dispatch = useDispatch();
  const { department, loading, error } = useSelector((state) => state.department);
  
  useEffect(() => {
    if (id) {
      dispatch(fetchDepartmentById(id)); // Fetch the department details when ID is available
    }
  }, [dispatch, id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-md font-semibold text-gray-900">Department Details</h1>
            <p className="text-gray-500 mt-1 text-sm">Details for {department?.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Edit size={20} />
              <span>Edit</span>
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              <Trash size={20} />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Department Details */}
        <div className="bg-white p-6 rounded-lg">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-blue-100 flex items-center justify-center rounded-full">
              <Building size={40} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">{department?.name}</h2>
              <p className="text-gray-500 text-xs">{department?.description || 'No description available'}</p>
            </div>
          </div>

          {/* Additional Information */}
          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="text-md font-semibold text-gray-900">Department ID</h3>
              <p className="text-gray-600">{department?._id}</p>
            </div>
            
          </div> */}
        </div>
      </div>
    </Layout>
  );
};

export default DepartmentDetails;
