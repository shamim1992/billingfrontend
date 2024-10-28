// pages/dashboard/admin.js
import Layout from '../../components/Layout';

const AdminDashboard = () => {
  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white shadow-lg rounded-lg">
          <h2 className="text-xl font-semibold">Manage Patients</h2>
          <p>View, add, update, and delete patients.</p>
        </div>
        <div className="p-4 bg-white shadow-lg rounded-lg">
          <h2 className="text-xl font-semibold">Manage Appointments</h2>
          <p>View and manage upcoming appointments.</p>
        </div>
        <div className="p-4 bg-white shadow-lg rounded-lg">
          <h2 className="text-xl font-semibold">Generate Reports</h2>
          <p>View and generate financial, patient, and appointment reports.</p>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
