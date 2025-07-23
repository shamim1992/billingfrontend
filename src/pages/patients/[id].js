import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPatientById } from '../../redux/actions/patientActions';
import { createAppointment, fetchAppointmentsByPatientId } from '../../redux/actions/appointmentActions';
import { fetchDepartments } from '../../redux/actions/departmentActions';
import { fetchDoctorsByDepartment } from '../../redux/actions/doctorActions';
import DataTable from 'react-data-table-component';
import Layout from '../../components/Layout';
import {
  Calendar,
  Phone,
  Mail,
  MapPin,
  User,
  Heart,
  Users,
  Home,
  X,
  SquareArrowRight,
  Edit,
  CreditCard,
  FileText,
  Clipboard,
  Globe
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-toastify';

const PatientDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useDispatch();

  // Redux state
  const { patient, loading, error } = useSelector((state) => state.patients);
  const { departments } = useSelector((state) => state.department);
  const { doctors } = useSelector((state) => state.doctor);
  const { appointments } = useSelector((state) => state.appointments);

  // Local state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [consultationCharge, setConsultationCharge] = useState(0);
  const [appointmentData, setAppointmentData] = useState({
    department: '',
    doctor: '',
    appointmentDate: '',
    notes: '',
    paymentStatus: 'Unpaid',
  });

  // Fetch initial data
  useEffect(() => {
    if (id) {
      dispatch(fetchPatientById(id));
      dispatch(fetchAppointmentsByPatientId(id));
    }
    dispatch(fetchDepartments());
  }, [id, dispatch]);

  // Fetch doctors when department changes
  useEffect(() => {
    if (appointmentData.department) {
      dispatch(fetchDoctorsByDepartment(appointmentData.department));
    }
  }, [appointmentData.department, dispatch]);

  // Update consultation charge when doctor changes
  useEffect(() => {
    const selectedDoctor = doctors.find((doc) => doc._id === appointmentData.doctor);
    if (selectedDoctor) {
      setConsultationCharge(selectedDoctor.consultationCharges || 0);
    }
  }, [appointmentData.doctor, doctors]);

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAppointmentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createAppointment({
        ...appointmentData,
        patientId: id,
        consultationCharge
      })).unwrap();

      toast.success('Appointment booked successfully!');
      dispatch(fetchAppointmentsByPatientId(id)); // Refresh appointments
      toggleModal();
      setAppointmentData({ // Reset form
        department: '',
        doctor: '',
        appointmentDate: '',
        notes: '',
        paymentStatus: 'Unpaid',
      });
    } catch (error) {
      toast.error(error.message || 'Failed to book appointment');
    }
  };

  const appointmentColumns = [
    {
      name: 'Date',
      selector: row => new Date(row.appointmentDate).toLocaleString(),
      sortable: true,
    },
    {
      name: 'Department',
      selector: row => row.department?.name || 'N/A',
    },
    {
      name: 'Doctor',
      selector: row => row.doctor?.name || 'N/A',
    },
    {
      name: 'Notes',
      selector: row => row.notes,
      wrap: true,
    },
    {
      name: 'Payment Status',
      selector: row => row.paymentStatus,
      cell: row => (
        <span className={`px-2 py-1 rounded-full text-xs ${row.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
          {row.paymentStatus}
        </span>
      ),
      sortable: true,
    },
    {
      name: 'Actions',
      cell: row => (
        <Link
          href={`/appointments/${row._id}`}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          View
        </Link>
      ),
    },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4">
          Error: {error}
        </div>
      </Layout>
    );
  }

  if (!patient) {
    return (
      <Layout>
        <div className="text-center text-gray-600">Patient not found</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm">
        {/* Header Section */}
        <div className="border-b p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {patient.title} {patient.firstName} {patient.lastName}
              </h1>
              <p className="text-sm text-gray-500">Patient ID: {patient.patientId}</p>
            </div>
            <Link
              href={`/patients/${id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl hover:shadow-md border transition-colors"
            >
              <Edit size={20} />
              <span className="text-sm">Edit Details</span>

            </Link>
          </div>
        </div>

        {/* Patient Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {/* Basic Information */}
          <div className="border rounded-lg p-4">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <User size={16} className="text-blue-600" />
              Basic Information
            </h2>
            <div className="space-y-3">
              <InfoRow icon={CreditCard} label="Patient ID" value={patient.patientId} />
              <InfoRow
                icon={Calendar}
                label="Date of Birth"
                value={patient.dob ? new Date(patient.dob).toLocaleDateString() : 'Not provided'}
              />
              <InfoRow icon={User} label="Gender" value={patient.gender} capitalize />
              <InfoRow icon={Heart} label="Blood Group" value={patient.bloodGroup} />
              <InfoRow icon={Users} label="Marital Status" value={patient.maritalStatus} capitalize />
            </div>
          </div>

          {/* Contact Information */}
          <div className="border rounded-lg p-4">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Phone size={16} className="text-blue-600" />
              Contact Information
            </h2>
            <div className="space-y-3">
              <InfoRow icon={Phone} label="Mobile" value={patient.mobileNumber} />
              <InfoRow icon={Mail} label="Email" value={patient.emailId} />
              <InfoRow icon={Home} label="Address" value={patient.address} />
              <InfoRow
                icon={MapPin}
                label="Location"
                value={`${patient.city || ''}, ${patient.state || ''} ${patient.pinCode || ''}`}
              />
              <InfoRow icon={Globe} label="Nationality" value={patient.nationality} />
            </div>
          </div>

          {/* Additional Information */}
          <div className="border rounded-lg p-4">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <FileText size={16} className="text-blue-600" />
              Additional Information
            </h2>
            <div className="space-y-3">
              <InfoRow icon={Users} label="Membership" value={patient.membershipType} capitalize />
              <InfoRow icon={User} label="Guardian Name" value={patient.guardianName} />
              <InfoRow icon={Phone} label="Guardian Contact" value={patient.guardianNumber} />
              <InfoRow
                icon={Calendar}
                label="Registration Date"
                value={patient.registrationDate ? new Date(patient.registrationDate).toLocaleDateString() : 'Not provided'}
              />
            </div>
          </div>

          {/* Medical Information */}
          <div className="border rounded-lg p-4">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Clipboard size={16} className="text-blue-600" />
              Medical Information
            </h2>
            <div className="space-y-3">
              <InfoRow icon={FileText} label="Diagnosis" value={patient.diagnosis} />
              <InfoRow icon={Clipboard} label="Research Patient" value={patient.researchPatient || 'No'} />
              <InfoRow icon={Users} label="Patient Source" value={patient.patientSource} capitalize />
            </div>
          </div>
        </div>

        {/* Appointments Section */}
        {/* <div className="p-6 border-t">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-semibold">Appointment History</h2>
            <button
              onClick={toggleModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Book Appointment
            </button>
          </div>

          <DataTable
            columns={appointmentColumns}
            data={appointments || []}
            pagination
            highlightOnHover
            responsive
            striped
          />
        </div> */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Book Appointment</h2>
                <button onClick={toggleModal} className="text-gray-500 hover:text-gray-700">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAppointmentSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <select
                    name="department"
                    value={appointmentData.department}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments?.map((dept) => (
                      <option key={dept._id} value={dept._id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Doctor
                  </label>
                  <select
                    name="doctor"
                    value={appointmentData.doctor}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Doctor</option>
                    {doctors?.map((doc) => (
                      <option key={doc._id} value={doc._id}>{doc.name}</option>
                    ))}
                  </select>
                </div>

                {consultationCharge > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Consultation Charge
                    </label>
                    <input
                      type="text"
                      value={`₹${consultationCharge}`}
                      className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                      disabled
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Appointment Date
                  </label>
                  <input
                    type="datetime-local"
                    name="appointmentDate"
                    value={appointmentData.appointmentDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    min={new Date().toISOString().slice(0, 16)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Status
                  </label>
                  <select
                    name="paymentStatus"
                    value={appointmentData.paymentStatus}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={appointmentData.notes}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    placeholder="Additional notes for the appointment"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={toggleModal}
                    className="px-4 py-2 border text-gray-600 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Book Appointment
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

// Helper component for consistent information display
const InfoRow = ({ icon: Icon, label, value, capitalize = false }) => {
  const displayValue = value || 'Not provided';
  return (
    <div className="flex items-start gap-2">
      <Icon size={14} className="text-gray-400 mt-1" />
      <div className="flex-1">
        <span className="text-sm text-gray-600">{label}:</span>{' '}
        <span className={`text-sm font-medium ${capitalize ? 'capitalize' : ''}`}>
          {displayValue}
        </span>
      </div>
    </div>
  );
};

export default PatientDetails;