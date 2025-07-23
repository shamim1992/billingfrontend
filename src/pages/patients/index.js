import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPatients, deletePatientbyId, searchPatients } from '../../redux/actions/patientActions';
import Layout from '../../components/Layout';
import { Search, UserPlus, Eye, Delete, UserPen, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';

// Debounce hook for search optimization
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const PatientList = () => {
  const dispatch = useDispatch();
  const { patients, searchResults, loading } = useSelector((state) => state.patients);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [refresh, setRefresh] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage] = useState(10);
  
  // Sorting states
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortBy, setSortBy] = useState('patientId');

  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    // Load all patients on initial load
    dispatch(fetchPatients());
  }, [dispatch, refresh]);

  // Handle search when debounced search term changes
  useEffect(() => {
    if (debouncedSearchTerm.trim() !== '') {
      setIsSearching(true);
      dispatch(searchPatients(debouncedSearchTerm))
        .finally(() => setIsSearching(false));
    } else {
      setIsSearching(false);
    }
    // Reset to first page when searching
    setCurrentPage(1);
  }, [debouncedSearchTerm, dispatch]);

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
    setRefresh((prev) => !prev);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const sortPatients = (patients) => {
    if (!patients) return [];
    
    return [...patients].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'patientId':
          aValue = a.patientId;
          bValue = b.patientId;
          break;
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
          bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
          break;
        case 'age':
          aValue = a.dob.length > 3 ? calculateAge(a.dob) : parseInt(a.dob);
          bValue = b.dob.length > 3 ? calculateAge(b.dob) : parseInt(b.dob);
          break;
        default:
          aValue = a[sortBy];
          bValue = b[sortBy];
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  // Determine which data to use
  const dataToUse = searchTerm.trim() !== '' ? searchResults : patients;

  // Apply additional filtering
  const filteredPatients = dataToUse?.filter((patient) => {
    // Apply the "starts with 3" filter for patientId
    const startsWithThree = patient.patientId.startsWith('3');
    
    if (selectedFilter === 'all') {
      return startsWithThree;
    }
    // Add other filter logic here if needed
    return startsWithThree;
  });

  // Apply sorting to filtered patients
  const sortedPatients = sortPatients(filteredPatients);

  // Get current patients for pagination
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = sortedPatients?.slice(indexOfFirstPatient, indexOfLastPatient);
  
  // Calculate total pages
  const totalPages = Math.ceil((sortedPatients?.length || 0) / patientsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  const clearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-md font-semibold">Patients</h1>
            <p className="mt-1 text-sm">Manage your patient records and information</p>
          </div>
          <div>
            <Link href="/patients/registerpatient">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl hover:shadow-md border transition-colors">
                <UserPlus size={20} />
                <span className="text-sm">Add Patient</span>
              </span>
            </Link>
            <Link href="/patients/unregistered">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl hover:shadow-md border transition-colors">
                <UserPlus size={20} />
                <span className="text-sm">Unregistered</span>
              </span>
            </Link>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={20} />
            <input
              type="text"
              placeholder="Search patients (Name, ID, Mobile, Email)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
            {isSearching && (
              <div className="absolute right-8 top-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-4 text-sm py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Patients</option>
              <option value="recent">Recent</option>
              <option value="critical">Critical</option>
              <option value="pending">Pending Review</option>
            </select>
          </div>
        </div>
        
        {/* Search status */}
        {searchTerm.trim() !== '' && (
          <div className="mt-2 text-sm text-gray-600">
            {isSearching ? (
              'Searching...'
            ) : (
              `Found ${sortedPatients?.length || 0} patients matching "${searchTerm}"`
            )}
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full rounded-lg">
          <thead>
            <tr>
              <th 
                className="px-6 py-3 border-b text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 select-none"
                onClick={() => handleSort('patientId')}
              >
                <div className="flex items-center gap-2">
                  Patient ID
                  {getSortIcon('patientId')}
                </div>
              </th>
              <th 
                className="px-6 py-3 border-b text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 select-none"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-2">
                  Name
                  {getSortIcon('name')}
                </div>
              </th>
              <th 
                className="px-6 py-3 border-b text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 select-none"
                onClick={() => handleSort('age')}
              >
                <div className="flex items-center gap-2">
                  Age
                  {getSortIcon('age')}
                </div>
              </th>
              <th className="px-6 py-3 border-b text-left text-sm font-semibold">Gender</th>
              <th className="px-6 py-3 border-b text-left text-sm font-semibold">Mobile</th>
              <th className="px-6 py-3 border-b text-left text-sm font-semibold">City</th>
              <th className="px-6 py-3 border-b text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentPatients?.map((patient) => (
              <tr key={patient._id}>
                <td className="px-6 py-4 border-b text-sm">{patient.patientId}</td>
                <td className="px-6 py-4 border-b text-sm">
                  {patient.firstName} {patient.lastName}
                </td>
                <td className="px-6 py-4 border-b text-sm">
                  {patient.dob && patient.dob.length > 3 ? calculateAge(patient.dob) : patient.dob || 'N/A'}
                </td>
                <td className="px-6 py-4 border-b text-sm capitalize">{patient.gender}</td>
                <td className="px-6 py-4 border-b text-sm">{patient.mobileNumber || patient.phoneNumber}</td>
                <td className="px-6 py-4 border-b text-sm">{patient.city}</td>
                <td className="px-6 py-4 border-b text-sm text-blue-600 hover:text-blue-700">
                  <div className="flex gap-2 justify-center items-center">
                    <Link href={`/patients/${patient._id}`}>
                      <Eye size={16} />
                    </Link>
                    <Link href={`/patients/${patient._id}/edit`}>
                      <UserPen size={16} />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {sortedPatients?.length === 0 && !loading && !isSearching && (
              <tr>
                <td colSpan="7" className="text-center py-6 text-gray-500 text-sm">
                  {searchTerm.trim() !== '' 
                    ? `No patients found matching "${searchTerm}". Try adjusting your search term.`
                    : 'No patients found. Try adjusting your search or filter.'
                  }
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {sortedPatients?.length > 0 && (
        <div className="flex items-center justify-between mt-4 pb-4">
          <div className="text-sm text-gray-700">
            Showing {indexOfFirstPatient + 1} to {Math.min(indexOfLastPatient, sortedPatients.length)} of {sortedPatients.length} patients
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-4 py-1 rounded border bg-gray-50">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default PatientList;