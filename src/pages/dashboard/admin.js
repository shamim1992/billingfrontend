import Layout from '../../components/Layout';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers } from '../../redux/actions/userActions'; 
import { useEffect } from 'react';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.users); 


  useEffect(() => {
    dispatch(fetchUsers()); 
  }, [dispatch]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Layout>
      <h1 className="text-md font-bold mb-4">Super Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
       
        <div className="p-4  border-2 rounded-lg">
          <h2 className="text-sm font-semibold">Manage Users</h2>
          <p className='text-xs'>Create, update, or delete users (Admin, Doctor, Receptionist, Accountant).</p>
          <Link href="/users" className=" text-xs">
            Manage Users
          </Link>
        </div>
        <div className="p-4  border-2 rounded-lg">
          <h2 className="text-sm font-semibold">View Reports</h2>
          <p className='text-xs'>Access reports for financials, appointments, and patient data.</p>
          <Link href="/reports" className=" text-xs">
            <span >View Reports</span>
          </Link>
        </div>

        <div className="p-4  border-2 rounded-lg">
          <h2 className="text-sm font-semibold">System Overview</h2>
          <p className='text-xs'>Oversee all hospital operations, monitor activities, and more.</p>
          <Link href="/dashboard/systemOverview" className=" text-xs">
            <span >System Overview</span>
          </Link>
        </div>
      </div>

     
      <h2 className="text-md font-bold mt-8 mb-4">User List</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {users?.map((user) => (
          <div key={user._id} className="p-4  border-2 hover:border-blue-400 rounded-lg">
            <h2 className="text-sm font-semibold">{user.name}</h2>
            <p className='text-xs'>Email: {user.email}</p>
            <p className='text-xs'>Role: {user.role}</p>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default AdminDashboard;
