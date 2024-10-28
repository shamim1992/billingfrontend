import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPatientById } from '../../redux/actions/patientActions';
import { createAppointment, fetchAppointmentsByPatientId } from '../../redux/actions/appointmentActions';
import { fetchDepartments } from '../../redux/actions/departmentActions';
import { fetchDoctorsByDepartment } from '../../redux/actions/doctorActions';
import DataTable from 'react-data-table-component';
import Layout from '../../components/Layout';
import { Calendar, Phone, Mail, MapPin, User, Heart, Users, Home, X, SquareArrowRight } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-toastify';

const PatientDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useDispatch();

  const { patient, loading, error } = useSelector((state) => state.patients);
  const { departments } = useSelector((state) => state.department);
  const { doctors } = useSelector((state) => state.doctor);
  const { appointments } = useSelector((state) => state.appointments);
  const [refresh, setRefresh] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointmentData, setAppointmentData] = useState({
    department: '',
    doctor: '',
    appointmentDate: '',
    notes: '',
    paymentStatus: 'Unpaid',
  });
  const [consultationCharge, setConsultationCharge] = useState(0);

  useEffect(() => {
    if (id) {
      dispatch(fetchPatientById(id));
      dispatch(fetchAppointmentsByPatientId(id)); // Fetch all appointments for this patient
    }
    dispatch(fetchDepartments());
  }, [id, dispatch]);

  useEffect(() => {
    if (appointmentData.department) {
      dispatch(fetchDoctorsByDepartment(appointmentData.department));
    }
  }, [appointmentData.department, dispatch]);

  useEffect(() => {
    const selectedDoctor = doctors.find((doc) => doc._id === appointmentData.doctor);
    if (selectedDoctor) {
      setConsultationCharge(selectedDoctor.consultationCharges || 0);
    }
  }, [appointmentData.doctor, doctors]);

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAppointmentData({ ...appointmentData, [name]: value });
  };

  const handleAppointmentSubmit = (e) => {
    e.preventDefault();
    dispatch(createAppointment({ ...appointmentData, patientId: id, consultationCharge }));
    toast.success('Appointment booked successfully!');
    setRefresh((prev) => !prev); 
    toggleModal();
  };

  const columns = [
    {
      name: 'Date',
      selector: (row) => new Date(row.date).toLocaleString(),
      sortable: true,
    },
    {
      name: 'Department',
      selector: (row) => row.department?.name || 'N/A',
    },
    {
      name: 'Doctor',
      selector: (row) => row.doctor?.name || 'N/A',
    },
    {
      name: 'Notes',
      selector: (row) => row.notes,
      wrap: true,
    },
    {
      name: 'Payment Status',
      selector: (row) => row.paymentStatus,
      cell: (row) => (
        <span className={row.paymentStatus === 'Paid' ? 'text-green-500' : 'text-red-500'}>
          {row.paymentStatus}
        </span>
      ),
      sortable: true,
    },
    {
      name: 'Actions',
      selector: (row) => row.status,
      cell: (row) => (
        <Link href={`/appointments/${row._id}`} className={row.status === 'Paid' ? 'text-green-500 font-semibold' : 'text-blue-500 font-semibold'}>
          View
        </Link>
      ),
      sortable: true,
    },
  ];

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!patient) return <p>Patient not found</p>;

  return (
    <Layout>
      <div className="max-w-4xl  bg-white  rounded-lg">
        <h1 className="text-sm font-bold mb-6 text-gray-800">{patient.firstName} {patient.lastName}'s Details</h1>

        {/* Patient Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User size={14} className="text-blue-500" />
              <span className="text-sm font-medium text-gray-800 capitalize">{patient.gender}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-blue-500" />
              <span className="text-sm text-gray-800">{patient.mobileNumber}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-blue-500" />
              <span className="text-sm text-gray-800">{patient.emailId}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-blue-500" />
              <span className="text-sm text-gray-800">{patient.city}, {patient.state}, {patient.pinCode}</span>
            </div>
            <div className="flex items-center gap-2">
              <Home size={14} className="text-blue-500" />
              <span className="text-sm text-gray-800">{patient.address}</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-blue-500" />
              <span className="text-sm text-gray-800">Date of Birth: {new Date(patient.dob).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart size={14} className="text-red-500" />
              <span className="text-sm text-gray-800">Blood Group: {patient.bloodGroup}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={14} className="text-blue-500" />
              <span className="text-sm text-gray-800">Marital Status: {patient.maritalStatus}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-blue-500" />
              <span className="text-sm text-gray-800">Registered On: {new Date(patient.registrationDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <button
          onClick={toggleModal}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Book Appointment
        </button>

        {/* Appointments Data Table */}
        <div className="mt-10 w-full">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Appointment History</h2>
          <DataTable
            columns={columns}
            data={appointments || []}
            pagination
            highlightOnHover
            className="bg-white w-full"
          />
        </div>

        {/* Appointment Booking Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 mt-5 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h2 className="text-lg font-semibold mb-4">Book Appointment</h2>
              <form onSubmit={handleAppointmentSubmit}>
                <div className="mb-4">
                  <label className="block text-sm text-gray-700">Department</label>
                  <select
                    name="department"
                    value={appointmentData.department}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments?.map((dept) => (
                      <option key={dept._id} value={dept._id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-gray-700">Doctor</label>
                  <select
                    name="doctor"
                    value={appointmentData.doctor}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none"
                    required
                  >
                    <option value="">Select Doctor</option>
                    {doctors?.map((doc) => (
                      <option key={doc._id} value={doc._id}>{doc.name}</option>
                    ))}
                  </select>
                </div>

                {consultationCharge > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm text-gray-700">Consultation Charge</label>
                    <input
                      type="text"
                      name="consultationCharge"
                      value={consultationCharge}
                      readOnly
                      className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none"
                    />
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-sm text-gray-700">Payment Status</label>
                  <select
                    name="paymentStatus"
                    value={appointmentData.paymentStatus}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none"
                    required
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-gray-700">Appointment Date</label>
                  <input
                    type="datetime-local"
                    name="appointmentDate"
                    value={appointmentData.appointmentDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none"
                    required
                    min={new Date().toISOString().slice(0, 16)} 
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-gray-700">Notes</label>
                  <textarea
                    name="notes"
                    value={appointmentData.notes}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none"
                    placeholder="Additional notes for the appointment"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={toggleModal}
                    className="px-2 py-2 border text-white rounded-lg hover:border-red-500"
                  >
                    <X Icon className="w-6 h-6 text-red-500 font-bold" />
                  </button>
                  <button type="submit" className="px-2 py-2 border hover:border-blue-500 text-white rounded-lg">
                   
                    <SquareArrowRight className="w-6 h-6 text-blue-500 font-bold" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PatientDetails;
