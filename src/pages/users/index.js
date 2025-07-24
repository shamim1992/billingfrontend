import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUsers } from '../../redux/actions/userActions';
import Layout from '../../components/Layout';
import { Search, UserPlus, ChevronRight, Phone, Mail, User, Pencil, Eye } from 'lucide-react';

const UserList = () => {
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state.users);
  console.log(users)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedRole]);

  // Filter options for roles
  const roleOptions = [
    { label: 'All Users', value: 'all' },
    { label: 'Doctors', value: 'Doctor' },
    { label: 'Admins', value: 'Admin' },
    { label: 'Receptionists', value: 'Receptionist' },
  ];

  // Filter and search users
  const filteredUsers = users?.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (selectedRole === 'all') return matchesSearch;
    return matchesSearch && user.role === selectedRole;
  });

  // Pagination calculations
  const totalItems = filteredUsers?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageUsers = filteredUsers?.slice(startIndex, endIndex);

  // Pagination handlers
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToPrevious = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const goToNext = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Doctor':
        return 'bg-blue-50 text-blue-600';
      case 'Admin':
        return 'bg-purple-50 text-purple-600';
      case 'Receptionist':
        return 'bg-green-50 text-green-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-md font-semibold">Users</h1>
            <p className="mt-1 text-sm">Manage user roles and details</p>
          </div>
          <Link href="/users/new">
            <span className="inline-flex items-center gap-2 px-4 rounded-2xl hover:shadow-md py-2 border transition-colors">
              <UserPlus size={20} />
              <span className='text-sm'>Add User</span>
            </span>
          </Link>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={20} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 text-sm py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {roleOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

     

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Users', value: users?.length || 0, color: 'blue' },
          { label: 'Doctors', value: users?.filter(user => user.role === 'Doctor').length || 0, color: 'green' },
          { label: 'Admins', value: users?.filter(user => user.role === 'Admin').length || 0, color: 'yellow' },
          { label: 'Receptionists', value: users?.filter(user => user.role === 'Receptionist').length || 0, color: 'red' },
        ].map((stat, index) => (
          <div key={index} className="rounded-lg border p-4">
            <div className={`text-${stat.color}-600 text-md text-center font-semibold`}>
              {stat.value}
            </div>
            <div className="text-sm text-center">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">User</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Role</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Contact</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Status</th>
                <th className="text-center py-3 px-4 font-semibold text-sm text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentPageUsers?.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                        <User size={20} className="text-blue-500" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{user.name}</div>
                        <div className="text-xs text-gray-500">ID: {user._id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone size={14} />
                      <span>{user.contactNumber}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail size={14} />
                      <span>{user.email}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full bg-green-50 text-green-600 text-xs font-medium">
                      Active
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1">
                      <Link href={`/users/${user._id}`}>
                        <button 
                          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} className="text-gray-500" />
                        </button>
                      </Link>
                      <Link href={`/users/edit/${user._id}`}>
                        <button 
                          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                          title="Edit User"
                        >
                          <Pencil size={16} className="text-gray-500" />
                        </button>
                      </Link>
                      <button 
                        className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                        title="Call User"
                      >
                        <Phone size={16} className="text-gray-500" />
                      </button>
                      <button 
                        className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                        title="Email User"
                      >
                        <Mail size={16} className="text-gray-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {totalItems === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center">
            <User size={32} className="" />
          </div>
          <h3 className="text-md font-medium">No users found</h3>
          <p className="text-sm mt-1">Try adjusting your search or filter to find what you&apos;re looking for.</p>
        </div>
      )}

       {/* Pagination Controls */}
       {totalItems > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} users
            </span>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Show:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevious}
              disabled={currentPage === 1}
              className="px-3 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex items-center gap-1">
              {/* First page */}
              {currentPage > 3 && (
                <>
                  <button
                    onClick={() => goToPage(1)}
                    className="w-8 h-8 flex items-center justify-center rounded text-sm hover:bg-gray-50"
                  >
                    1
                  </button>
                  {currentPage > 4 && <span className="px-2 text-gray-400">...</span>}
                </>
              )}

              {/* Current page and neighbors */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  return page >= currentPage - 2 && page <= currentPage + 2;
                })
                .map(page => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`w-8 h-8 flex items-center justify-center rounded text-sm ${
                      page === currentPage
                        ? 'bg-blue-500 text-white'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}

              {/* Last page */}
              {currentPage < totalPages - 2 && (
                <>
                  {currentPage < totalPages - 3 && <span className="px-2 text-gray-400">...</span>}
                  <button
                    onClick={() => goToPage(totalPages)}
                    className="w-8 h-8 flex items-center justify-center rounded text-sm hover:bg-gray-50"
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>

            <button
              onClick={goToNext}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default UserList;