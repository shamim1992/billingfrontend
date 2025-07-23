import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { useDispatch } from 'react-redux';
import { createPatient } from '../../redux/actions/patientActions';
import { useRouter } from 'next/router';
import { Calendar, User, Phone, Mail, MapPin, Users, CreditCard, Home, Globe, Heart, UserPlus, FileText } from 'lucide-react';
import { toast } from 'react-toastify';


const InputField = React.memo(({ label, name, type = 'text', icon: Icon, required = false, options = null, placeholder = '', value, error, onChange }) => (
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
                    onChange={onChange} // Handle changes properly
                    className={`${Icon ? 'pl-10' : 'pl-3'} w-full rounded-lg border ${error ? 'border-red-500' : 'border-gray-300'} p-2.5`}
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
                    onChange={onChange} // Handle changes properly
                    className={`${Icon ? 'pl-10' : 'pl-3'} w-full rounded-lg border ${error ? 'border-red-500' : 'border-gray-300'} p-2.5`}
                    placeholder={placeholder}
                    required={required}
                />
            )}
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
));
InputField.displayName = 'InputField';

const getCurrentDateTime = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000; // Offset in milliseconds
    const localTime = new Date(now - offset).toISOString().slice(0, 16); // Adjust to local time and slice to match 'datetime-local'
    return localTime;
};

const PatientForm = () => {
    const [formData, setFormData] = useState({
        patientId: '', // Added Patient ID field
        aadhaarId: '00000000',
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
        nationality: '',
        patientSource: '',
        researchPatient: '',
        diagnosis: '',
        registeredPatient: false,
        registrationDate: getCurrentDateTime()
    });
    
    const nationalityOptions = [
        { value: '', label: 'Select Nationality' },
        { value: 'Afghanistan', label: 'Afghanistan' },
        { value: 'Albania', label: 'Albania' },
        { value: 'Algeria', label: 'Algeria' },
        { value: 'Argentina', label: 'Argentina' },
        { value: 'Australia', label: 'Australia' },
        { value: 'Austria', label: 'Austria' },
        { value: 'Bangladesh', label: 'Bangladesh' },
        { value: 'Belgium', label: 'Belgium' },
        { value: 'Brazil', label: 'Brazil' },
        { value: 'Canada', label: 'Canada' },
        { value: 'China', label: 'China' },
        { value: 'Colombia', label: 'Colombia' },
        { value: 'Denmark', label: 'Denmark' },
        { value: 'Egypt', label: 'Egypt' },
        { value: 'Finland', label: 'Finland' },
        { value: 'France', label: 'France' },
        { value: 'Germany', label: 'Germany' },
        { value: 'Greece', label: 'Greece' },
        { value: 'India', label: 'India' },
        { value: 'Indonesia', label: 'Indonesia' },
        { value: 'Iran', label: 'Iran' },
        { value: 'Iraq', label: 'Iraq' },
        { value: 'Ireland', label: 'Ireland' },
        { value: 'Israel', label: 'Israel' },
        { value: 'Italy', label: 'Italy' },
        { value: 'Japan', label: 'Japan' },
        { value: 'Malaysia', label: 'Malaysia' },
        { value: 'Mexico', label: 'Mexico' },
        { value: 'Netherlands', label: 'Netherlands' },
        { value: 'New Zealand', label: 'New Zealand' },
        { value: 'Norway', label: 'Norway' },
        { value: 'Pakistan', label: 'Pakistan' },
        { value: 'Philippines', label: 'Philippines' },
        { value: 'Poland', label: 'Poland' },
        { value: 'Portugal', label: 'Portugal' },
        { value: 'Russia', label: 'Russia' },
        { value: 'Saudi Arabia', label: 'Saudi Arabia' },
        { value: 'Singapore', label: 'Singapore' },
        { value: 'South Africa', label: 'South Africa' },
        { value: 'South Korea', label: 'South Korea' },
        { value: 'Spain', label: 'Spain' },
        { value: 'Sweden', label: 'Sweden' },
        { value: 'Switzerland', label: 'Switzerland' },
        { value: 'Thailand', label: 'Thailand' },
        { value: 'Turkey', label: 'Turkey' },
        { value: 'UAE', label: 'United Arab Emirates' },
        { value: 'UK', label: 'United Kingdom' },
        { value: 'USA', label: 'United States' },
        { value: 'Vietnam', label: 'Vietnam' }
    ];
    
    const [errors, setErrors] = useState({});
    const dispatch = useDispatch();
    const router = useRouter();
    
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

        // Required fields validation
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        if (!formData.registrationDate) newErrors.registrationDate = 'Registration date is required';
        
        // Patient ID validation (optional - can be auto-generated by backend if not provided)
        if (formData.patientId && formData.patientId.length < 3) {
            newErrors.patientId = 'Patient ID must be at least 3 characters long';
        }

        // Email validation
        if (formData.emailId && !/\S+@\S+\.\S+/.test(formData.emailId)) {
            newErrors.emailId = 'Please enter a valid email address';
        }

        // Pin code validation
        if (formData.pinCode && !/^\d{6}$/.test(formData.pinCode)) {
            newErrors.pinCode = 'Please enter a valid 6-digit pin code';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateForm()) {
            try {
                console.log(formData)
                await dispatch(createPatient(formData));
                toast('Patient created successfully!');
                router.push('/patients');
            } catch (error) {
                console.error('Error creating patient:', error);
                
                // Handle specific patientId conflict error
                if (error.message?.includes('Patient ID already exists') || 
                    (error.field && error.field === 'patientId')) {
                    setErrors(prev => ({ 
                        ...prev, 
                        patientId: 'This Patient ID already exists. Please choose a different ID.' 
                    }));
                    toast.error('Patient ID already exists. Please choose a different ID.');
                } else {
                    setErrors(prev => ({ ...prev, submit: 'Failed to create patient. Please try again.' }));
                    toast.error('Failed to create patient. Please try again.');
                }
            }
        }
    };

    return (
        <Layout>
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-lg">
                    <div className=" border-b p-4">
                        <h1 className="text-sm font-semibold text-gray-900">Patient Info</h1>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                            {/* Left Column */}
                            <div className="space-y-6">
                                <InputField 
                                    onChange={handleChange}
                                    label="Patient ID"
                                    name="patientId"
                                    icon={CreditCard}
                                    placeholder="Enter Patient ID (optional - auto-generated if left blank)"
                                    value={formData.patientId}
                                    error={errors.patientId}
                                    required={false}
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
                                            placeholder="First Name"
                                            required
                                        />
                                    </div>

                                    {errors.firstName && (
                                        <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
                                    )}
                                </div>
                                
                                <InputField onChange={handleChange}
                                    label="Aadhaar ID"
                                    name="aadhaarId"
                                    icon={CreditCard}
                                    placeholder="12 digit Aadhaar ID"
                                    type="number"
                                    value={formData.aadhaarId}
                                    required={false}
                                />
                                
                                {/* First Name with Title */}
                                
                                
                                <InputField onChange={handleChange}
                                    label="Birth Date(Age)"
                                    name="dob"
                                    type="date"
                                    icon={Calendar}
                                    value={formData.dob}
                                    required
                                />
                                
                                <InputField onChange={handleChange}
                                    label="Gender"
                                    name="gender"
                                    icon={User}
                                    options={genderOptions}
                                    value={formData.gender}
                                    error={errors.gender}
                                    required
                                />
                                
                                <InputField onChange={handleChange}
                                    label="Mobile Number"
                                    name="mobileNumber"
                                    type="tel"
                                    icon={Phone}
                                    placeholder="Mobile Number"
                                    value={formData.mobileNumber}
                                />

                                <InputField onChange={handleChange}
                                    label="Address"
                                    name="address"
                                    icon={Home}
                                    placeholder="Address"
                                    value={formData.address}
                                />
                                
                                <InputField onChange={handleChange}
                                    label="Email Id"
                                    name="emailId"
                                    type="email"
                                    icon={Mail}
                                    placeholder="Email Id"
                                    value={formData.emailId}
                                    error={errors.emailId}
                                />
                                
                                <InputField onChange={handleChange}
                                    label="Pin Code"
                                    name="pinCode"
                                    icon={MapPin}
                                    placeholder="Pin Code"
                                    value={formData.pinCode}
                                    error={errors.pinCode}
                                />
                                
                                <InputField onChange={handleChange}
                                    label="Spouse Name"
                                    name="spouseName"
                                    icon={User}
                                    placeholder="Spouse Name"
                                    value={formData.spouseName}
                                />
                                
                                <InputField onChange={handleChange}
                                    label="Guardian Name"
                                    name="guardianName"
                                    icon={UserPlus}
                                    placeholder="Guardian Name"
                                    value={formData.guardianName}
                                />
                                
                                <InputField onChange={handleChange}
                                    label="Membership Type"
                                    name="membershipType"
                                    icon={Users}
                                    options={membershipOptions}
                                    value={formData.membershipType}
                                />
                                
                                <div className="form-group">
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.registeredPatient}
                                            name="registeredPatient"
                                            onChange={handleChange}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Un-Registered Patient</span>
                                    </label>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                <InputField
                                    label="Registration Date"
                                    name="registrationDate"
                                    type="datetime-local"
                                    icon={Calendar}
                                    value={formData.registrationDate}
                                    onChange={handleChange}
                                    error={errors.registrationDate}
                                    required
                                />
                                
                                <InputField onChange={handleChange}
                                    label="Last Name"
                                    name="lastName"
                                    icon={User}
                                    placeholder="Last Name"
                                    value={formData.lastName}
                                    required
                                />
                                
                                <InputField onChange={handleChange}
                                    label="Marital Status"
                                    name="maritalStatus"
                                    icon={Users}
                                    options={maritalStatusOptions}
                                    value={formData.maritalStatus}
                                />
                                
                                <InputField onChange={handleChange}
                                    label="Phone Number"
                                    name="phoneNumber"
                                    type="tel"
                                    icon={Phone}
                                    placeholder="Phone Number"
                                    value={formData.phoneNumber}
                                    required
                                />
                                
                                <InputField onChange={handleChange}
                                    label="State"
                                    name="state"
                                    icon={MapPin}
                                    placeholder="State"
                                    value={formData.state}
                                />
                                
                                <InputField onChange={handleChange}
                                    label="City"
                                    name="city"
                                    icon={MapPin}
                                    placeholder="City"
                                    value={formData.city}
                                />
                                
                                <InputField onChange={handleChange}
                                    label="Blood Group"
                                    name="bloodGroup"
                                    icon={Heart}
                                    options={bloodGroupOptions}
                                    value={formData.bloodGroup}
                                />
                                
                                <InputField onChange={handleChange}
                                    label="Husband Name"
                                    name="husbandName"
                                    icon={User}
                                    placeholder="Husband Name"
                                    value={formData.husbandName}
                                />
                                
                                <InputField onChange={handleChange}
                                    label="Guardian Number"
                                    name="guardianNumber"
                                    type="tel"
                                    icon={Phone}
                                    placeholder="Guardian Number"
                                    value={formData.guardianNumber}
                                />
                                
                                <InputField
                                    label="Nationality"
                                    name="nationality"
                                    icon={Globe}
                                    options={nationalityOptions}
                                    value={formData.nationality}
                                    onChange={handleChange}
                                />
                                
                                <InputField onChange={handleChange}
                                    label="Patient Source"
                                    name="patientSource"
                                    icon={FileText}
                                    options={patientSourceOptions}
                                    value={formData.patientSource}
                                />
                                
                                <InputField onChange={handleChange}
                                    label="Diagnosis"
                                    name="diagnosis"
                                    icon={FileText}
                                    placeholder="Diagnosis"
                                    value={formData.diagnosis}
                                />
                                
                                {/* Research Patient Checkbox */}
                                <div className="form-group">
                                    <InputField
                                        label="Research Patient"
                                        type="text"
                                        name="researchPatient"
                                        icon={FileText}
                                        value={formData.researchPatient}
                                        onChange={handleChange}
                                        placeholder="Research Patient Details"
                                    />
                                </div>
                            </div>
                        </div>
                        
                        {/* Error Message */}
                        {errors.submit && (
                            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                {errors.submit}
                            </div>
                        )}
                        
                        {/* Info Message for Patient ID */}
                        {!formData.patientId && (
                            <div className="mt-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm">
                                            <strong>Info:</strong> Patient ID will be automatically generated if left blank.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Form Actions */}
                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => router.push('/patients')}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="bg-blue-500 text-white p-2 text-sm rounded"
                            >
                                Add Patient
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default PatientForm;