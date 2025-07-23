import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPatientById, updatePatient } from '@/redux/actions/patientActions';
import Layout from '@/components/Layout';
import { Calendar, User, Phone, Mail, MapPin, Users, CreditCard, Home, Globe, Heart, Save, UserPlus, FileText } from 'lucide-react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

const InputField = React.memo(({ label, name, type = 'text', icon: Icon, required = false, options = null, placeholder = '', value, error, onChange, disabled = false }) => (
    <div className="form-group">
        <label className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
            {Icon && (
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Icon className="h-5 w-5 text-gray-400" />
                </div>
            )}
            {options ? (
                <select
                    name={name}
                    value={value || ''}
                    onChange={onChange}
                    disabled={disabled}
                    className={`${Icon ? 'pl-10' : 'pl-3'} w-full rounded-lg border ${error ? 'border-red-500' : 'border-gray-300'} p-2.5 ${disabled ? 'bg-gray-100' : ''}`}
                    required={required}
                >
                    {options.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            ) : (
                <input
                    type={type}
                    name={name}
                    value={value || ''}
                    onChange={onChange}
                    disabled={disabled}
                    className={`${Icon ? 'pl-10' : 'pl-3'} w-full rounded-lg border ${error ? 'border-red-500' : 'border-gray-300'} p-2.5 ${disabled ? 'bg-gray-100' : ''}`}
                    placeholder={placeholder}
                    required={required}
                />
            )}
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
));

InputField.displayName = 'InputField';

const EditPatientPage = () => {
    const router = useRouter();
    const { id } = router.query;

    const dispatch = useDispatch();
    const { patient, loading, error } = useSelector((state) => state.patients);

    const initialFormState = {
        aadhaarId: '',
        title: 'Select.',
        firstName: '',
        lastName: '',
        dob: '',
        gender: '',
        maritalStatus: '',
        mobileNumber: '',
        phoneNumber: '',
        address: '',
        state: '',
        emailId: '',
        city: '',
        pinCode: '',
        bloodGroup: '',
        spouseName: '',
        husbandName: '',
        guardianName: '',
        guardianNumber: '',
        membershipType: '',
        nationality: 'India',
        patientSource: '',
        researchPatient: '',
        diagnosis: '',
        registeredPatient: false,
        registrationDate: '',
        patientId: ''
    };

    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (id) {
            dispatch(fetchPatientById(id));
        }
    }, [id, dispatch]);

    useEffect(() => {
        if (patient) {
            setFormData(prevData => ({
                ...initialFormState,
                ...patient,
                dob: patient.dob,
                title: patient.title || 'Select.',
                gender: patient.gender || '',
                maritalStatus: patient.maritalStatus || '',
                bloodGroup: patient.bloodGroup || '',
                membershipType: patient.membershipType || '',
                patientSource: patient.patientSource || '',
                nationality: patient.nationality || 'India',
                registeredPatient: patient.registeredPatient || false,
                registrationDate: patient.registrationDate || ''
            }));
        }
    }, [patient]);

    const titleOptions = [
        { value: 'Select.', label: 'Select.' },
        { value: 'Mr.', label: 'Mr.' },
        { value: 'Mrs.', label: 'Mrs.' },
        { value: 'Ms.', label: 'Ms.' },
        { value: 'Dr.', label: 'Dr.' }
    ];

    const genderOptions = [
        { value: '', label: 'Select One...' },
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'other', label: 'Other' }
    ];

    const maritalStatusOptions = [
        { value: '', label: 'Select One...' },
        { value: 'single', label: 'Single' },
        { value: 'married', label: 'Married' },
        { value: 'divorced', label: 'Divorced' },
        { value: 'widowed', label: 'Widowed' }
    ];

    const bloodGroupOptions = [
        { value: '', label: 'Select One...' },
        { value: 'A+', label: 'A+' },
        { value: 'A-', label: 'A-' },
        { value: 'B+', label: 'B+' },
        { value: 'B-', label: 'B-' },
        { value: 'O+', label: 'O+' },
        { value: 'O-', label: 'O-' },
        { value: 'AB+', label: 'AB+' },
        { value: 'AB-', label: 'AB-' }
    ];

    const membershipOptions = [
        { value: '', label: 'Select One' },
        { value: 'regular', label: 'Regular' },
        { value: 'premium', label: 'Premium' },
        { value: 'vip', label: 'VIP' }
    ];

    const patientSourceOptions = [
        { value: '', label: 'Select One' },
        { value: 'referral', label: 'Referral' },
        { value: 'walk-in', label: 'Walk-in' },
        { value: 'online', label: 'Online' },
        { value: 'advertisement', label: 'Advertisement' }
    ];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        if (!formData.mobileNumber.trim()) newErrors.mobileNumber = 'Mobile number is required';

        if (formData.mobileNumber && !/^\d{10}$/.test(formData.mobileNumber)) {
            newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number';
        }

        if (formData.emailId && !/\S+@\S+\.\S+/.test(formData.emailId)) {
            newErrors.emailId = 'Please enter a valid email address';
        }

        if (formData.pinCode && !/^\d{6}$/.test(formData.pinCode)) {
            newErrors.pinCode = 'Please enter a valid 6-digit pin code';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // const handleSubmit = async (e) => {
    //     e.preventDefault();

    //     if (validateForm()) {
    //         try {
    //             await dispatch(updatePatient({ id, data: formData })).unwrap();
    //             toast.success('Patient updated successfully!');
    //             router.push('/patients');
    //         } catch (error) {
    //             toast.error(error.message || 'Failed to update patient');
    //             setErrors(prev => ({ ...prev, submit: error.message || 'Failed to update patient' }));
    //         }
    //     }
    // };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateForm()) {
            try {


                const updateData = {
                    ...formData,
                    _id: formData._id || id
                };

                await dispatch(updatePatient({
                    id: formData._id || id,
                    data: updateData
                })).unwrap();

                toast.success('Patient updated successfully!');
                router.push('/patients');
            } catch (error) {

                toast.error(error.message || 'Failed to update patient');
                setErrors(prev => ({ ...prev, submit: error.message || 'Failed to update patient' }));
            }
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-96">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-lg">
                    <div className="border-b p-4">
                        <h1 className="text-sm font-semibold text-gray-900">Edit Patient</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                            {/* Left Column */}
                            <div className="space-y-6">
                                <InputField
                                    label="Patient ID"
                                    name="patientId"
                                    icon={CreditCard}
                                    value={formData.patientId}
                                    onChange={handleChange}
                                    disabled={false}
                                    error={errors.patientId}
                                    required={true}
                                />
                                <div className="form-group">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        First Name <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex gap-2">
                                        <select
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            className="w-24 rounded-lg border border-gray-300 p-2.5"
                                        >
                                            {titleOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className={`flex-1 rounded-lg border p-2.5 ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                                            required
                                        />
                                    </div>
                                    {errors.firstName && (
                                        <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
                                    )}
                                </div>
                                <InputField
                                    label="Date of Birth"
                                    name="dob"
                                    type="date"
                                    icon={Calendar}
                                    value={formData.dob}
                                    onChange={handleChange}
                                />

                                <InputField
                                    label="Gender"
                                    name="gender"
                                    icon={User}
                                    options={genderOptions}
                                    value={formData.gender}
                                    onChange={handleChange}
                                    required
                                />

                                <InputField
                                    label="Mobile Number"
                                    name="mobileNumber"
                                    type="tel"
                                    icon={Phone}
                                    value={formData.mobileNumber}
                                    onChange={handleChange}
                                    required
                                    error={errors.mobileNumber}
                                />

                                <InputField
                                    label="Address"
                                    name="address"
                                    icon={Home}
                                    value={formData.address}
                                    onChange={handleChange}
                                />

                                <InputField
                                    label="Email"
                                    name="emailId"
                                    type="email"
                                    icon={Mail}
                                    value={formData.emailId}
                                    onChange={handleChange}
                                    error={errors.emailId}
                                />

                                <InputField
                                    label="Pin Code"
                                    name="pinCode"
                                    icon={MapPin}
                                    value={formData.pinCode}
                                    onChange={handleChange}
                                    error={errors.pinCode}
                                />

                                <InputField
                                    label="Blood Group"
                                    name="bloodGroup"
                                    icon={Heart}
                                    options={bloodGroupOptions}
                                    value={formData.bloodGroup}
                                    onChange={handleChange}
                                />

                                <InputField
                                    label="Guardian Name"
                                    name="guardianName"
                                    icon={UserPlus}
                                    value={formData.guardianName}
                                    onChange={handleChange}
                                />

                                <InputField
                                    label="Guardian Number"
                                    name="guardianNumber"
                                    type="tel"
                                    icon={Phone}
                                    value={formData.guardianNumber}
                                    onChange={handleChange}
                                />

                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                <InputField
                                    label="Aadhaar ID"
                                    name="aadhaarId"
                                    icon={CreditCard}
                                    value={formData.aadhaarId}
                                    onChange={handleChange}
                                />
                                <InputField
                                    label="Last Name"
                                    name="lastName"
                                    icon={User}
                                    value={formData.lastName}
                                    onChange={handleChange}
                                />

                                <InputField
                                    label="Marital Status"
                                    name="maritalStatus"
                                    icon={Users}
                                    options={maritalStatusOptions}
                                    value={formData.maritalStatus}
                                    onChange={handleChange}
                                />

                                <InputField
                                    label="Phone Number"
                                    name="phoneNumber"
                                    type="tel"
                                    icon={Phone}
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                />

                                <InputField
                                    label="State"
                                    name="state"
                                    icon={MapPin}
                                    value={formData.state}
                                    onChange={handleChange}
                                />

                                <InputField
                                    label="City"
                                    name="city"
                                    icon={MapPin}
                                    value={formData.city}
                                    onChange={handleChange}
                                />


                                <InputField
                                    label="Membership Type"
                                    name="membershipType"
                                    icon={Users}
                                    options={membershipOptions}
                                    value={formData.membershipType}
                                    onChange={handleChange}
                                />

                                <InputField
                                    label="Nationality"
                                    name="nationality"
                                    icon={Globe}
                                    value={formData.nationality}
                                    onChange={handleChange}
                                />

                                <InputField
                                    label="Patient Source"
                                    name="patientSource"
                                    icon={FileText}
                                    options={patientSourceOptions}
                                    value={formData.patientSource}
                                    onChange={handleChange}
                                />

                                <InputField
                                    label="Diagnosis"
                                    name="diagnosis"
                                    icon={FileText}
                                    value={formData.diagnosis}
                                    onChange={handleChange}
                                />

                                <InputField
                                    label="Research Patient"
                                    name="researchPatient"
                                    icon={FileText}
                                    value={formData.researchPatient}
                                    onChange={handleChange}
                                />

                                <InputField
                                    label="Registration Date"
                                    name="registrationDate"
                                    type="datetime-local"
                                    icon={Calendar}
                                    value={formData.registrationDate}
                                    onChange={handleChange}
                                    disabled={true}
                                />

                                <div className="form-group">
                                    <label className="flex items-center space-x-2">
                                        <input hidden
                                            type="checkbox"
                                            name="registeredPatient"
                                            checked={formData.registeredPatient}
                                            onChange={handleChange}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            disabled={true}
                                        />
                                        {/* <span className="text-sm font-medium text-gray-700">Un-Registered Patient</span> */}
                                    </label>
                                </div>
                            </div>
                        </div>

                        {errors.submit && (
                            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                {errors.submit}
                            </div>
                        )}

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl hover:shadow-md border transition-colors"
                            >
                                <span className='text-sm'>Cancel</span>
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl hover:shadow-md border transition-colors"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                <span className='text-sm'>{loading ? 'Updating...' : 'Update Patient'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default EditPatientPage;