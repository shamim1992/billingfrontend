import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDepartments } from '../../redux/actions/departmentActions';
import { fetchDoctorsByDepartment, fetchDoctor, fetchDoctorById } from '../../redux/actions/doctorActions';
import { fetchPatientById } from '../../redux/actions/patientActions';
import { createAppointment } from '../../redux/actions/appointmentActions';
import Layout from '../../components/Layout';
import { Calendar, User, Briefcase, GraduationCap, IdCard } from 'lucide-react';

const NewAppointment = () => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    department: '',
    doctor: '',
    patientId: '',
    appointmentDate: '',
    notes: '',
  });
  const [patient, setPatient] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const { departments } = useSelector((state) => state.department);
  const { doctors } = useSelector((state) => state.doctor);

  const { patient: fetchedPatient, loading: patientLoading } = useSelector((state) => state.patients);

  useEffect(() => {
    dispatch(fetchDepartments());
    dispatch(fetchDoctor());
  }, [dispatch]);

  useEffect(() => {
    if (formData.department) {
      dispatch(fetchDoctorsByDepartment(formData.department));
    }
  }, [formData.department, dispatch]);

  useEffect(() => {
    if (formData.patientId.length === 5) {
      dispatch(fetchPatientById(formData.patientId));
    }
  }, [formData.patientId, dispatch]);

  useEffect(() => {
    setPatient(fetchedPatient);
  }, [fetchedPatient]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.department || !formData.doctor || !formData.patientId || !formData.appointmentDate) {
      setErrorMessage('Please fill out all fields.');
      return;
    }

    const appointmentData = {
      department: formData.department,
      doctor: formData.doctor,
      patientId: formData.patientId,
      appointmentDate: formData.appointmentDate,
      notes: formData.notes,
    };

    dispatch(createAppointment(appointmentData));
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="bg-white  rounded-lg">
          <h1 className="text-sm font-semibold text-gray-900 mb-6">Schedule a New Appointment</h1>

          <form onSubmit={handleSubmit}>
            {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}

            {/* Department */}
            <div className="mb-4">
              <label className="block text-sm text-gray-700">Department</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Department</option>
                  {departments?.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Doctor */}
            <div className="mb-4">
              <label className="block text-sm text-gray-700">Doctor</label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <select
                  name="doctor"
                  value={formData.doctor}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Doctor</option>
                  {doctors?.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      {doc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Patient ID */}
            <div className="mb-4">
              <label className="block text-sm text-gray-700">Patient ID</label>
              <div className="relative">
                <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter 5-digit Patient ID"
                  required
                />
              </div>
              {patientLoading && <p className="text-gray-500 mt-2">Fetching patient details...</p>}
              {patient && (
                <div className="mt-2 bg-gray-50 p-3 rounded-lg">
                  <p><strong>Name:</strong> {patient.firstName} {patient.lastName}</p>
                  <p><strong>Age:</strong> {patient.age}</p>
                </div>
              )}
            </div>

            {/* Appointment Date */}
            <div className="mb-4">
              <label className="block text-sm text-gray-700">Appointment Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="datetime-local"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Notes */}
            <div className="mb-4">
              <label className="block text-sm text-gray-700">Notes</label>
              <div className="relative">
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes for the appointment"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
              >
                Schedule Appointment
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default NewAppointment;
