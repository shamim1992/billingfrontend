// pages/appointments/[id].js

import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAppointmentById } from '../../redux/actions/appointmentActions';
import Layout from '../../components/Layout';
import { Calendar, User, Briefcase, Clock } from 'lucide-react';

const ViewAppointmentDetails = () => {
    const router = useRouter();
    const { id } = router.query; // Get appointment ID from URL
    const dispatch = useDispatch();
    const { appointment, loading, error } = useSelector((state) => state.appointments);

    useEffect(() => {
        if (id) {
            dispatch(fetchAppointmentById(id)); // Fetch appointment details by ID
        }
    }, [id, dispatch]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!appointment) return <p>Appointment not found</p>;

    return (
        <Layout>
            <div className="max-w-4xl  bg-white rounded-lg">
                <h1 className="text-sm font-semibold text-gray-800 mb-6">Appointment Details</h1>

                <div className="space-y-6">
                    {/* Patient Details */}
                    <div>
                        <h2 className="text-md font-medium text-gray-700 mb-2">Patient Information</h2>
                        <div className="flex items-center gap-3">
                            <User size={14} className="text-blue-500" />
                            <span className="text-sm text-gray-800">
                                {appointment.patient.firstName} {appointment.patient.lastName}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Gender: {appointment.patient.gender}</p>
                        <p className="text-sm text-gray-600 mt-1">Date of Birth: {new Date(appointment.patient.dob).toLocaleDateString()}</p>
                    </div>

                    {/* Doctor Details */}
                    <div>
                        <h2 className="text-md font-medium text-gray-700 mb-2">Doctor Information</h2>
                        <div className="flex items-center gap-3">
                            <Briefcase size={14} className="text-blue-500" />
                            <span className="text-sm text-gray-800">{appointment.doctor.name}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Department: {appointment.department.name}</p>
                    </div>

                    {/* Appointment Details */}
                    <div>
                        <h2 className="text-md font-medium text-gray-700 mb-2">Appointment Information</h2>
                        <div className="flex items-center gap-3">
                            <Calendar size={14} className="text-blue-500" />
                            <span className="text-sm text-gray-800">{new Date(appointment.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                            <Clock size={14} className="text-blue-500" />
                            <span className="text-sm text-gray-800">Time: {new Date(appointment.date).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Status: {appointment.status}</p>
                        <p className="text-sm text-gray-600 mt-1">Consultation Fee: ${appointment.consultationFee}</p>
                        <p className="text-sm text-gray-600 mt-1">Notes: {appointment.notes || 'N/A'}</p>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ViewAppointmentDetails;
