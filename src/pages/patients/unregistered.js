import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPatients, deletePatientbyId } from '../../redux/actions/patientActions';
import Layout from '../../components/Layout';
import { Search, UserPlus, Eye, Edit, Delete, toast } from 'lucide-react';


const UnPatientList = () => {
  const dispatch = useDispatch();
  const { patients } = useSelector((state) => state.patients);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [refresh, setRefresh] = useState(false); // Refresh toggle state

  useEffect(() => {
    dispatch(fetchPatients());
  }, [dispatch, refresh]); // Run useEffect on refresh toggle

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleDelete = async (id) => {
    await dispatch(deletePatientbyId(id));
    setRefresh((prev) => !prev); // Toggle refresh to re-fetch patients
  };

  const filteredPatients = patients?.filter((patient) => 
    {
    const matchesSearch = patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || patient.patientId.includes(searchTerm)|| patient.mobileNumber.includes(searchTerm) ;
    const startsWithThree = patient.patientId.startsWith('UN');
    if (selectedFilter === 'all') return matchesSearch && startsWithThree;
    return matchesSearch;
  });

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-md font-semibold text-gray-900">Patients</h1>
            <p className="text-gray-500 mt-1 text-sm">Manage your patient records and information</p>
          </div>
          <div>
            <Link href="/patients/registerpatient">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors">
                <UserPlus size={20} />
                <span className="text-sm">Add Patient</span>
              </span>
            </Link>
            <Link href="/patients">
              <span className="inline-flex items-center gap-2 px-4 py-2   rounded-lg transition-colors">
                <UserPlus size={20} />
                <span className="text-sm">Registered</span>
              </span>
            </Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search patients(Name, ID, Mobile)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-4 text-sm py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Patients</option>
              <option value="recent">Recent</option>
              <option value="critical">Critical</option>
              <option value="pending">Pending Review</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 border-b text-left text-sm font-semibold text-gray-700">Patient ID</th>
              <th className="px-6 py-3 border-b text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="px-6 py-3 border-b text-left text-sm font-semibold text-gray-700">Age</th>
              <th className="px-6 py-3 border-b text-left text-sm font-semibold text-gray-700">Gender</th>
              <th className="px-6 py-3 border-b text-left text-sm font-semibold text-gray-700">Mobile</th>
              <th className="px-6 py-3 border-b text-left text-sm font-semibold text-gray-700">City</th>
              <th className="px-6 py-3 border-b text-left text-sm font-semibold text-gray-700">Last Visit</th>
              <th className="px-6 py-3 border-b text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients?.map((patient) => (
              <tr key={patient._id} className="hover:bg-gray-100">
                <td className="px-6 py-4 border-b text-sm text-gray-700">{patient.patientId}</td>
                <td className="px-6 py-4 border-b text-sm text-gray-700">
                  {patient.firstName} {patient.lastName}
                </td>
                <td className="px-6 py-4 border-b text-sm text-gray-700">{calculateAge(patient.dob)}</td>
                <td className="px-6 py-4 border-b text-sm text-gray-700 capitalize">{patient.gender}</td>
                <td className="px-6 py-4 border-b text-sm text-gray-700">{patient.mobileNumber}</td>
                <td className="px-6 py-4 border-b text-sm text-gray-700">{patient.city}</td>
                <td className="px-6 py-4 border-b text-sm text-gray-700">15 May 2024</td>
                <td className="px-6 py-4 border-b text-sm text-blue-600 hover:text-blue-700">
                  <div className="flex gap-2 justify-center items-center">
                    <Link href={`/patients/${patient._id}`}>
                      <Eye size={16} />
                    </Link>
                    
                    {/* <button onClick={() => handleDelete(patient._id)} className="text-red-500">
                      <Delete size={16} />
                    </button> */}
                  </div>
                </td>
              </tr>
            ))}
            {filteredPatients?.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center py-6 text-gray-500 text-sm">
                  No patients found. Try adjusting your search or filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default UnPatientList;
