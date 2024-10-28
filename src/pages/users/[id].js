import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserDetails } from '../../redux/actions/userActions';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { ChevronLeft, Mail, Phone, User, Briefcase, GraduationCap, IndianRupee } from 'lucide-react';
import Link from 'next/link';

const UserDetails = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { id } = router.query; 
  const { user } = useSelector((state) => state.users);

console.log(user)
  useEffect(() => {
    if (id) {
      dispatch(fetchUserDetails(id));
    }
  }, [dispatch, id]);

  if (!user) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-md font-medium text-gray-900">Loading user details...</h3>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8">
        <Link href="/users">
          <span className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors cursor-pointer">
            <ChevronLeft size={20} />
            <span className="text-sm">Back to Users</span>
          </span>
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <User size={24} className="text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{user.name}</h3>
              <div className="text-sm text-gray-500">{user.role}</div>
            </div>
          </div>
          <div className="px-3 py-1 rounded-full bg-green-50 text-green-600 text-sm font-medium">
            Active
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Phone size={16} />
            <span className="text-sm">{user.contactNumber}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Mail size={16} />
            <span className="text-sm">{user.email}</span>
          </div>
          
          {user.role === 'Doctor' && (
            <>
              <div className="flex items-center gap-2 text-gray-600">
                <Briefcase size={16} />
                <span className="text-sm">Department: {user.department?.name || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <GraduationCap size={16} />
                <span className="text-sm">Specialization: {user.specialization}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <IndianRupee size={16} />
                <span className="text-sm">Consultation Charges: ₹{user.consultationCharges}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default UserDetails;
