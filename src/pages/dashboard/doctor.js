// pages/dashboard/doctor.js
import Layout from '../../components/Layout';

const DoctorDashboard = () => {
  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Doctor Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white shadow-lg rounded-lg">
          <h2 className="text-xl font-semibold">Patient List</h2>
          <p>View and manage assigned patients.</p>
        </div>
        <div className="p-4 bg-white shadow-lg rounded-lg">
          <h2 className="text-xl font-semibold">Appointment Schedule</h2>
          <p>Manage your upcoming appointments.</p>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorDashboard;
