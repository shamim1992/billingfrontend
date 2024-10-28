// pages/dashboard/accountant.js
import Layout from '../../components/Layout';

const AccountantDashboard = () => {
  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Accountant Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white shadow-lg rounded-lg">
          <h2 className="text-xl font-semibold">Manage Bills</h2>
          <p>Generate and manage patient bills.</p>
        </div>
        <div className="p-4 bg-white shadow-lg rounded-lg">
          <h2 className="text-xl font-semibold">Financial Reports</h2>
          <p>Generate and view financial reports.</p>
        </div>
      </div>
    </Layout>
  );
};

export default AccountantDashboard;
