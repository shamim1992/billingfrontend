import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUsers } from '../../redux/actions/userActions';
import Layout from '../../components/Layout';
import { Search, UserPlus, ChevronRight, Phone, Mail, User, Pencil } from 'lucide-react';

const UserList = () => {
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state.users);
  console.log(users)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

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

  const UserCard = ({ user }) => (
    <div className="rounded-lg border border-gray-200 hover:border-blue-500 transition-all duration-200">
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <User size={24} className="text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold ">{user.name}</h3>
              <div className="text-sm text-gray-500">{user.role}</div>
            </div>
          </div>
          <div className="px-3 py-1 rounded-full bg-green-50 text-green-600 text-sm font-medium">
            Active
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-600">
            <Phone size={16} />
            <span className="text-sm">{user.contactNumber}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Mail size={16} />
            <span className="text-sm">{user.email}</span>
          </div>
          
        </div>

        <div className="mt-4 pt-4 border-t flex items-center justify-between">
          <Link href={`/users/${user._id}`}>
            <span className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View Details
              <ChevronRight size={16} />
            </span>
          </Link>
          <div className="flex items-center gap-2">
          <Link href={`/users/edit/${user._id}`}>
        <button className="p-2 hover:bg-gray-50 rounded-md">
          <Pencil size={16} className="text-gray-500" />
        </button>
      </Link>
            <button className="p-2 hover:bg-gray-50 rounded-md">
              <Phone size={16} className="text-gray-500" />
            </button>
            <button className="p-2 hover:bg-gray-50 rounded-md">
              <Mail size={16} className="text-gray-500" />
            </button>
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
            <h1 className="text-md font-semibold ">Users</h1>
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 " size={20} />
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

      {/* User Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {filteredUsers?.map((user) => (
          <UserCard key={user._id} user={user} />
        ))}
      </div>

      {/* Empty State */}
      {filteredUsers?.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4  rounded-full flex items-center justify-center">
            <User size={32} className="" />
          </div>
          <h3 className="text-md font-medium ">No users found</h3>
          <p className="text-sm mt-1">Try adjusting your search or filter to find what you&apos;re looking for.</p>
        </div>
      )}
    </Layout>
  );
};

export default UserList;
