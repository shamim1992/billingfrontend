// pages/dashboard/receptionist.js
import Layout from '../../components/Layout';

const ReceptionistDashboard = () => {
  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Receptionist Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white shadow-lg rounded-lg">
          <h2 className="text-xl font-semibold">Schedule Appointments</h2>
          <p>Manage patient appointments and assign doctors.</p>
        </div>
        <div className="p-4 bg-white shadow-lg rounded-lg">
          <h2 className="text-xl font-semibold">Manage Patients</h2>
          <p>Handle patient check-ins and add new patients.</p>
        </div>
      </div>
    </Layout>
  );
};

export default ReceptionistDashboard;
