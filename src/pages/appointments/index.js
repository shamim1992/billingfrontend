import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAppointments } from '../../redux/actions/appointmentActions';
import Layout from '../../components/Layout';
import { Search, Plus, ChevronRight, Edit, Eye } from 'lucide-react';

const AppointmentList = () => {
  const dispatch = useDispatch();
  const { appointments } = useSelector((state) => state.appointments);
  
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchAppointments()); // Fetch appointments when component mounts
  }, [dispatch]);

  // Search appointments by patient name
  const filteredAppointments = appointments?.filter((appointment) => {
    const matchesSearch = appointment.patient?.firstName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-md font-semibold text-gray-900">Appointments</h1>
            <p className="text-gray-500 mt-1 text-sm">Manage your appointments and schedules</p>
          </div>
          <Link href="/appointments/new">
            <span className="inline-flex items-center gap-2 px-4 rounded-2xl hover:shadow-md py-2 border transition-colors">
              <Plus size={20} />
              <span className="text-sm">Add Appointment</span>
            </span>
          </Link>
        </div>

        {/* Search */}
        <div className="relative flex-1 w-full mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search appointments by patient name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Appointment Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-50  text-center ">
                <th className="px-6 py-3 border-b text-left text-sm font-semibold text-gray-700">Patient Name</th>
                <th className="px-6 py-3 border-b text-left text-sm font-semibold text-gray-700">Doctor</th>
                <th className="px-6 py-3 border-b text-left text-sm font-semibold text-gray-700">Department</th>
                <th className="px-6 py-3 border-b text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-6 py-3 border-b text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 border-b text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody >
              {filteredAppointments?.map((appointment) => (
                <tr key={appointment._id} className="hover:bg-gray-100">
                  <td className="px-6 py-4 border-b text-sm text-gray-700">
                    {appointment.patient.firstName} {appointment.patient.lastName}
                  </td>
                  <td className="px-6 py-4 border-b text-sm text-gray-700">
                    {appointment.doctor.name}
                  </td>
                  <td className="px-6 py-4 border-b text-sm text-gray-700">
                    {appointment.department.name}
                  </td>
                  <td className="px-6 py-4 border-b text-sm text-gray-700">
                    {new Date(appointment.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 border-b text-sm text-gray-700">
                    <span className={`px-2 py-1 rounded-full ${
                      appointment.status === 'Completed' ? ' text-green-600' : ' text-blue-600'
                    }`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td className="px-2 py-4 border-b text-sm text-blue-600 hover:text-blue-700 space-x-4">
                   <div className='flex justify-center items-center gap-2'>
                   <Link href={`/appointments/${appointment._id}`}>
                      <span className="flex items-center gap-1">
                        <Eye size={16} />
                      </span>
                    </Link>
                    <Link href={`/appointments/edit/${appointment._id}`}>
                      <span className="flex items-center gap-1 text-blue-600 hover:text-blue-700">
                        <Edit size={16} />
                      </span>
                    </Link>
                   </div>
                  </td>
                </tr>
              ))}
              {filteredAppointments?.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-gray-500 text-sm">
                    No appointments found. Try adjusting your search or filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default AppointmentList;
