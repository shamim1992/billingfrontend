import React, { useEffect, useState, useMemo, use } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Edit, Eye, Plus, Calendar, X, CreditCard, FileText } from 'lucide-react';
import Layout from '@/components/Layout';
import { fetchBillings, migrateBillNumbers } from '@/redux/actions/billingActions';
import Link from 'next/link';

const BillingTable = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' for oldest first, 'desc' for newest first
  
  // Date filtering states
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const { billings, loading, error } = useSelector((state) => state.billing);

  useEffect(() => {
    dispatch(fetchBillings());
  }, [dispatch]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, sortOrder, dateFrom, dateTo]);

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'text-success';
      case 'active':
        return 'text-info';
      case 'partial':
        return 'text-warning';
      case 'cancelled':
        return 'text-error';
      case 'pending':
        return 'text-error';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusDisplayText = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'paid';
      case 'paid':
        return 'Paid';
      case 'partial':
        return 'Partial';
      case 'cancelled':
        return 'Cancelled';
      case 'pending':
        return 'Pending';
      default:
        return status || 'Unknown';
    }
  };

  // Helper function to check if a date falls within the selected range
  const isDateInRange = (dateString) => {
    if (!dateFrom && !dateTo) return true;
    
    const billDate = new Date(dateString);
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;
    
    // Set time to beginning/end of day for accurate comparison
    if (fromDate) {
      fromDate.setHours(0, 0, 0, 0);
    }
    if (toDate) {
      toDate.setHours(23, 59, 59, 999);
    }
    
    if (fromDate && toDate) {
      return billDate >= fromDate && billDate <= toDate;
    } else if (fromDate) {
      return billDate >= fromDate;
    } else if (toDate) {
      return billDate <= toDate;
    }
    
    return true;
  };

  // Clear date filters
  const clearDateFilters = () => {
    setDateFrom('');
    setDateTo('');
  };

  // Memoized sorted and filtered bills for performance
  const sortedAndFilteredBills = useMemo(() => {
    if (!billings) return [];
    
    return billings.filter(bill => {
      const patientName = `${bill.patientId?.firstName || ''} ${bill.patientId?.lastName || ''}`.toLowerCase();
      const billNumber = bill.billNumber?.toLowerCase() || '';
      const billId = bill._id?.toLowerCase() || '';
      const searchTerm = searchQuery.toLowerCase();

      const matchesSearch = patientName.includes(searchTerm) || 
                          billNumber.includes(searchTerm) || 
                          billId.includes(searchTerm);
      
      // Updated to work with new status system
      const billStatus = bill.status || bill.remarks; // Support both new and legacy
      const matchesStatus = filterStatus === 'all' || billStatus?.toLowerCase() === filterStatus.toLowerCase();
      const matchesDateRange = isDateInRange(bill.createdAt);

      return matchesSearch && matchesStatus && matchesDateRange;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [billings, searchQuery, filterStatus, sortOrder, dateFrom, dateTo]);

  // Memoized pagination logic
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil((sortedAndFilteredBills?.length || 0) / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedAndFilteredBills?.slice(indexOfFirstItem, indexOfLastItem);

    return {
      totalPages,
      indexOfLastItem,
      indexOfFirstItem,
      currentItems
    };
  }, [sortedAndFilteredBills, currentPage, itemsPerPage]);

  const { totalPages, indexOfLastItem, indexOfFirstItem, currentItems } = paginationData;

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Memoized pagination buttons
  const paginationButtons = useMemo(() => {
    const buttons = [];
    const maxVisiblePages = 2;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    buttons.push(
      <button
        key="prev"
        className="join-item btn btn-sm"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        «
      </button>
    );

    // First page
    if (startPage > 1) {
      buttons.push(
        <button
          key={1}
          className={`join-item btn btn-sm ${currentPage === 1 ? 'btn-active' : ''}`}
          onClick={() => handlePageChange(1)}
          aria-label="Go to page 1"
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(
          <button key="dots1" className="join-item btn btn-sm btn-disabled" aria-hidden="true">
            ...
          </button>
        );
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          className={`join-item btn btn-sm ${currentPage === i ? 'btn-active' : ''}`}
          onClick={() => handlePageChange(i)}
          aria-label={`Go to page ${i}`}
          aria-current={currentPage === i ? 'page' : undefined}
        >
          {i}
        </button>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <button key="dots2" className="join-item btn btn-sm btn-disabled" aria-hidden="true">
            ...
          </button>
        );
      }
      buttons.push(
        <button
          key={totalPages}
          className={`join-item btn btn-sm ${currentPage === totalPages ? 'btn-active' : ''}`}
          onClick={() => handlePageChange(totalPages)}
          aria-label={`Go to page ${totalPages}`}
        >
          {totalPages}
        </button>
      );
    }

    // Next button
    buttons.push(
      <button
        key="next"
        className="join-item btn btn-sm"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        »
      </button>
    );

    return buttons;
  }, [currentPage, totalPages]);


  return (
    <Layout>
      <div className="bg-base-100">
        <div className="">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-xl">Bills</h2>
            <div className="flex flex-col gap-4 w-full sm:w-auto">
              {/* Search and filters row */}
              <div className="flex flex-col lg:flex-row gap-2 justify-between">
                <div className="flex flex-col sm:flex-row gap-2">
                  {/* Search box */}
                  <div className="form-control">
                    <input
                      type="text"
                      placeholder="Search bills..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input input-bordered input-sm w-full max-w-xs"
                      aria-label="Search bills by patient name, bill number, or bill ID"
                    />
                  </div>
                  
                  {/* Date filters */}
                  <div className="flex gap-2 items-center">
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="input input-bordered input-sm w-32"
                      aria-label="Filter from date"
                      placeholder="From date"
                    />
                    <span className="text-xs text-gray-500">to</span>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="input input-bordered input-sm w-32"
                      aria-label="Filter to date"
                      min={dateFrom || undefined}
                      placeholder="To date"
                    />
                    {(dateFrom || dateTo) && (
                      <button
                        onClick={clearDateFilters}
                        className="btn btn-ghost btn-sm"
                        aria-label="Clear date filters"
                        title="Clear date filters"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="select select-bordered select-sm w-full max-w-xs"
                    aria-label="Filter by status"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Due</option>
                    <option value="paid">Paid</option>
                    <option value="partial">Partial</option>
                    <option value="cancelled">Cancelled</option>
                    {/* Legacy status options */}
                    <option value="pending">Pending (Legacy)</option>
                  </select>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="select select-bordered select-sm w-full max-w-xs"
                    aria-label="Sort by date"
                  >
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                  </select>
                  <Link
                    href="/billing/addbilling"
                    className="btn btn-primary btn-sm text-white flex items-center gap-1"
                  >
                    <Plus size={16} /> Add Billing
                  </Link>
                  
                </div>
              </div>

              {/* Active filters display */}
              {(searchQuery || filterStatus !== 'all' || dateFrom || dateTo) && (
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="text-gray-600">Active filters:</span>
                  {searchQuery && (
                    <span className="badge badge-outline">
                      Search: {searchQuery}
                    </span>
                  )}
                  {filterStatus !== 'all' && (
                    <span className="badge badge-outline">
                      Status: {getStatusDisplayText(filterStatus)}
                    </span>
                  )}
                  {dateFrom && (
                    <span className="badge badge-outline">
                      From: {new Date(dateFrom).toLocaleDateString()}
                    </span>
                  )}
                  {dateTo && (
                    <span className="badge badge-outline">
                      To: {new Date(dateTo).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Error state */}
          {error && (
            <div className="alert alert-error mb-4">
              <span>Error loading bills: {typeof error === 'object' ? error.message : error}</span>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="table table-zebra" role="table">
              <thead>
                <tr>
                  <th>Bill Number</th>
                  <th>Date</th>
                  <th>Patient ID</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Amount</th>
                  <th>Paid</th>
                  <th>Due Amount</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="10" className="text-center">
                      <span className="loading loading-spinner loading-md"></span>
                      <span className="sr-only">Loading bills...</span>
                    </td>
                  </tr>
                ) : currentItems?.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center">
                      {sortedAndFilteredBills?.length === 0 && (searchQuery || filterStatus !== 'all' || dateFrom || dateTo) ? 
                        'No bills found matching your filters' : 
                        'No bills found'
                      }
                    </td>
                  </tr>
                ) : (
                  currentItems?.map((bill) => {
                    const billStatus = bill.status || bill.remarks; // Support both new and legacy
                    const dueAmount = bill.totals?.dueAmount ?? bill.totals?.balance ?? 0;
                    
                    return (
                      <tr key={bill._id} className="text-xs">
                        <td className="font-mono text-sm">
                          {bill.billNumber || bill._id.slice(-8).toUpperCase()}
                        </td>
                        <td>{bill.createdAt ? new Date(bill.createdAt).toLocaleDateString() : 'N/A'}</td>
                        <td>{bill.patientId?.patientId || 'N/A'}</td>
                        <td>
                          {bill.patientId?.firstName && bill.patientId?.lastName 
                            ? `${bill.patientId.firstName} ${bill.patientId.lastName}`
                            : 'N/A'
                          }
                        </td>
                        <td>{bill.doctorId?.name || 'N/A'}</td>
                        <td>₹{bill.totals?.grandTotal ?? '0'}</td>
                        <td>₹{bill.payment?.paid ?? '0'}</td>
                        <td className={dueAmount > 0 ? 'text-warning font-semibold' : 'text-success'}>
                          ₹{dueAmount}
                        </td>
                        <td>
                          <span className={`badge badge-sm ${getStatusBadgeClass(billStatus)}`}>
                            {getStatusDisplayText(billStatus)}
                          </span>
                        </td>
                        <td>
                          <div className="flex justify-center items-center gap-3">
                            <Link 
                              href={'/billing/' + bill._id}
                              className="tooltip text-green-500 hover:text-green-600"
                              data-tip="View Bill"
                              aria-label={`View bill ${bill.billNumber || bill._id}`}
                            >
                              <Eye size={16} />
                            </Link>
                            <Link
                              href={`/billing/receipts/${bill.billNumber || bill._id}`}
                              className="tooltip text-blue-500 hover:text-blue-600"
                              data-tip="View Receipts"
                              aria-label={`View receipts for bill ${bill.billNumber || bill._id}`}
                            >
                              <FileText size={16} />
                            </Link>
                            {(billStatus === 'active' || billStatus === 'partial') && (
                              <Link
                                href={`/billing/payment/${bill._id}`}
                                className="tooltip text-purple-500 hover:text-purple-600"
                                data-tip="Add Payment"
                                aria-label={`Add payment to bill ${bill.billNumber || bill._id}`}
                              >
                                <CreditCard size={16} />
                              </Link>
                            )}
                            {user?.role === 'superAdmin' && (
                              <Link
                                href={'/billing/update/' + bill._id}
                                className="tooltip text-orange-500 hover:text-orange-600"
                                data-tip="Edit Bill"
                                aria-label={`Edit bill ${bill.billNumber || bill._id}`}
                              >
                                <Edit size={16} />
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {sortedAndFilteredBills?.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
              <div className="text-sm">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedAndFilteredBills?.length || 0)} of {sortedAndFilteredBills?.length || 0} entries
                {(searchQuery || filterStatus !== 'all' || dateFrom || dateTo) && (
                  <span className="text-gray-500"> (filtered)</span>
                )}
              </div>
              {totalPages > 1 && (
                <div className="join" role="navigation" aria-label="Pagination">
                  {paginationButtons}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default BillingTable;