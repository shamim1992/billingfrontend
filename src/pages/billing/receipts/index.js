// pages/billing/receipts/index.js
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FileText, Search, Filter, X, Eye, Download } from 'lucide-react';
import Layout from '@/components/Layout';
import { fetchAllReceipts, getReceiptStats } from '@/redux/actions/billingActions';
import Link from 'next/link';

const ReceiptsManagement = () => {
  const dispatch = useDispatch();
  const { receipts, receiptStats, receiptsLoading, receiptsError } = useSelector((state) => state.billing);
  
  // Filter states
  const [filters, setFilters] = useState({
    type: '',
    billNumber: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 20
  });
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [showStatsModal, setShowStatsModal] = useState(false);

  useEffect(() => {
    dispatch(fetchAllReceipts(filters));
    dispatch(getReceiptStats());
  }, [dispatch]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const applyFilters = () => {
    const filterParams = { ...filters };
    if (searchQuery) {
      filterParams.query = searchQuery;
    }
    dispatch(fetchAllReceipts(filterParams));
  };

  const clearFilters = () => {
    const clearedFilters = {
      type: '',
      billNumber: '',
      startDate: '',
      endDate: '',
      page: 1,
      limit: 20
    };
    setFilters(clearedFilters);
    setSearchQuery('');
    dispatch(fetchAllReceipts(clearedFilters));
  };

  const getReceiptTypeColor = (type) => {
    switch (type) {
      case 'creation':
        return 'badge-info';
      case 'payment':
        return 'badge-success';
      case 'modification':
        return 'badge-warning';
      case 'cancellation':
        return 'badge-error';
      default:
        return 'badge-ghost';
    }
  };

  const getReceiptTypeIcon = (type) => {
    switch (type) {
      case 'creation':
        return '🆕';
      case 'payment':
        return '💳';
      case 'modification':
        return '✏️';
      case 'cancellation':
        return '❌';
      default:
        return '📄';
    }
  };

  const exportReceipts = () => {
    if (!receipts?.receipts) return;

    const csvContent = [
      // Header
      ['Receipt Number', 'Bill Number', 'Type', 'Amount', 'Date', 'Created By', 'Remarks'].join(','),
      // Data rows
      ...receipts.receipts.map(receipt => [
        receipt.receiptNumber,
        receipt.billNumber,
        receipt.type,
        receipt.amount || 0,
        new Date(receipt.date).toLocaleDateString(),
        receipt.createdBy?.name || '',
        receipt.remarks || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipts-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handlePageChange = (newPage) => {
    const updatedFilters = { ...filters, page: newPage };
    setFilters(updatedFilters);
    dispatch(fetchAllReceipts(updatedFilters));
  };

  return (
    <Layout>
      <div className="bg-base-100 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText size={24} />
              Receipts Management
            </h1>
            <p className="text-gray-600">View and manage all receipts and transactions</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowStatsModal(true)}
              className="btn btn-outline btn-sm"
            >
              View Statistics
            </button>
            <button
              onClick={exportReceipts}
              className="btn btn-primary btn-sm"
              disabled={!receipts?.receipts?.length}
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        {receiptStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-title">Total Receipts</div>
              <div className="stat-value text-primary">{receiptStats.summary?.totalReceipts || 0}</div>
            </div>
            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-title">Total Amount</div>
              <div className="stat-value text-success">₹{receiptStats.summary?.totalAmount?.toFixed(2) || '0.00'}</div>
            </div>
            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-title">Payments</div>
              <div className="stat-value text-info">
                {receiptStats.byType?.find(t => t._id === 'payment')?.count || 0}
              </div>
            </div>
            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-title">Modifications</div>
              <div className="stat-value text-warning">
                {receiptStats.byType?.find(t => t._id === 'modification')?.count || 0}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="card bg-base-200 mb-6">
          <div className="card-body p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-xs">Receipt Type</span>
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="select select-bordered select-sm"
                >
                  <option value="">All Types</option>
                  <option value="creation">Creation</option>
                  <option value="payment">Payment</option>
                  <option value="modification">Modification</option>
                  <option value="cancellation">Cancellation</option>
                </select>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-xs">Bill Number</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter bill number"
                  value={filters.billNumber}
                  onChange={(e) => handleFilterChange('billNumber', e.target.value)}
                  className="input input-bordered input-sm"
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-xs">From Date</span>
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="input input-bordered input-sm"
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-xs">To Date</span>
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="input input-bordered input-sm"
                  min={filters.startDate}
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={applyFilters}
                  className="btn btn-primary btn-sm"
                  disabled={receiptsLoading}
                >
                  <Filter size={16} />
                  Apply
                </button>
                <button
                  onClick={clearFilters}
                  className="btn btn-ghost btn-sm"
                >
                  <X size={16} />
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="form-control mb-4">
          <div className="input-group">
            <input
              type="text"
              placeholder="Search by receipt number, bill number, or remarks..."
              className="input input-bordered input-sm flex-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              onClick={applyFilters}
              className="btn btn-square btn-sm"
              disabled={receiptsLoading}
            >
              <Search size={16} />
            </button>
          </div>
        </div>

        {/* Error state */}
        {receiptsError && (
          <div className="alert alert-error mb-4">
            <span>Error loading receipts: {typeof receiptsError === 'object' ? receiptsError.message : receiptsError}</span>
          </div>
        )}

        {/* Loading state */}
        {receiptsLoading && (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        )}

        {/* Results Table */}
        {!receiptsLoading && (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full text-xs">
              <thead>
                <tr>
                  <th>Receipt Number</th>
                  <th>Bill Number</th>
                  <th>Type</th>
                  <th className="text-right">Amount</th>
                  <th>Payment Method</th>
                  <th>Date</th>
                  <th>Created By</th>
                  <th>Remarks</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {receipts?.receipts?.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-8">
                      No receipts found
                    </td>
                  </tr>
                ) : (
                  receipts?.receipts?.map((receipt) => (
                    <tr key={receipt._id}>
                      <td className="font-mono">{receipt.receiptNumber}</td>
                      <td className="font-mono">
                        <Link
                          href={`/billing/${receipt.billingId}`}
                          className="link link-primary"
                        >
                          {receipt.billNumber}
                        </Link>
                      </td>
                      <td>
                        <span className={`badge badge-sm ${getReceiptTypeColor(receipt.type)}`}>
                          {getReceiptTypeIcon(receipt.type)} {receipt.type}
                        </span>
                      </td>
                      <td className="text-right">
                        {receipt.amount > 0 ? `₹${receipt.amount.toFixed(2)}` : '-'}
                      </td>
                      <td>
                        {receipt.paymentMethod?.type ? (
                          <span className="capitalize">{receipt.paymentMethod.type}</span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>{new Date(receipt.date).toLocaleDateString()}</td>
                      <td>{receipt.createdBy?.name}</td>
                      <td className="max-w-xs truncate">{receipt.remarks}</td>
                      <td>
                        <Link
                          href={`/billing/receipts/${receipt.receiptNumber}`}
                          className="btn btn-ghost btn-xs"
                        >
                          <Eye size={14} />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {receipts?.pagination && receipts.pagination.totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <div className="join">
              <button
                className="join-item btn btn-sm"
                onClick={() => handlePageChange(receipts.pagination.currentPage - 1)}
                disabled={!receipts.pagination.hasPrev}
              >
                «
              </button>
              
              {[...Array(Math.min(5, receipts.pagination.totalPages))].map((_, index) => {
                const page = index + Math.max(1, receipts.pagination.currentPage - 2);
                if (page <= receipts.pagination.totalPages) {
                  return (
                    <button
                      key={page}
                      className={`join-item btn btn-sm ${
                        receipts.pagination.currentPage === page ? 'btn-active' : ''
                      }`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  );
                }
                return null;
              })}
              
              <button
                className="join-item btn btn-sm"
                onClick={() => handlePageChange(receipts.pagination.currentPage + 1)}
                disabled={!receipts.pagination.hasNext}
              >
                »
              </button>
            </div>
          </div>
        )}

        {/* Results info */}
        {receipts?.pagination && (
          <div className="text-center text-sm text-gray-600 mt-4">
            Showing {receipts.pagination.totalReceipts > 0 ? 
              ((receipts.pagination.currentPage - 1) * filters.limit + 1) : 0
            } to {Math.min(
              receipts.pagination.currentPage * filters.limit, 
              receipts.pagination.totalReceipts
            )} of {receipts.pagination.totalReceipts} receipts
          </div>
        )}

        {/* Statistics Modal */}
        {showStatsModal && receiptStats && (
          <div className="modal modal-open">
            <div className="modal-box max-w-4xl">
              <h3 className="font-bold text-lg mb-4">Receipt Statistics</h3>
              
              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="stat bg-base-200 rounded-lg">
                  <div className="stat-title">Total Receipts</div>
                  <div className="stat-value">{receiptStats.summary?.totalReceipts || 0}</div>
                </div>
                <div className="stat bg-base-200 rounded-lg">
                  <div className="stat-title">Total Amount</div>
                  <div className="stat-value">₹{receiptStats.summary?.totalAmount?.toFixed(2) || '0.00'}</div>
                </div>
              </div>

              {/* By Type */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">By Receipt Type</h4>
                <div className="overflow-x-auto">
                  <table className="table table-zebra w-full text-xs">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Count</th>
                        <th>Total Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {receiptStats.byType?.map((type) => (
                        <tr key={type._id}>
                          <td>
                            <span className={`badge ${getReceiptTypeColor(type._id)}`}>
                              {getReceiptTypeIcon(type._id)} {type._id}
                            </span>
                          </td>
                          <td>{type.count}</td>
                          <td>₹{type.totalAmount?.toFixed(2) || '0.00'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Methods */}
              {receiptStats.paymentMethodStats?.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">By Payment Method</h4>
                  <div className="overflow-x-auto">
                    <table className="table table-zebra w-full text-xs">
                      <thead>
                        <tr>
                          <th>Payment Method</th>
                          <th>Count</th>
                          <th>Total Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {receiptStats.paymentMethodStats.map((method) => (
                          <tr key={method._id}>
                            <td className="capitalize">{method._id || 'Not Specified'}</td>
                            <td>{method.count}</td>
                            <td>₹{method.totalAmount?.toFixed(2) || '0.00'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="modal-action">
                <button 
                  className="btn" 
                  onClick={() => setShowStatsModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ReceiptsManagement;