// components/dashboard/CollectionSummary.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  CreditCard, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar,
  Eye,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { fetchCollectionSummary } from '@/redux/actions/collectionReportActions';

const CollectionSummary = () => {
  const dispatch = useDispatch();
  const { collectionSummary } = useSelector((state) => state.reports);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    dispatch(fetchCollectionSummary(selectedPeriod));
  }, [dispatch, selectedPeriod]);

  // Auto refresh every 5 minutes if enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      dispatch(fetchCollectionSummary(selectedPeriod));
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [dispatch, selectedPeriod, autoRefresh]);

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  const handleRefresh = () => {
    dispatch(fetchCollectionSummary(selectedPeriod));
  };

  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  const getPeriodLabel = (period) => {
    switch (period) {
      case 'today': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'year': return 'This Year';
      default: return 'Today';
    }
  };

  const data = collectionSummary.data || {
    totalAmount: 0,
    totalTransactions: 0,
    cash: 0,
    card: 0,
    upi: 0,
    neft: 0
  };

  const paymentMethods = [
    { 
      name: 'Cash', 
      amount: data.cash, 
      icon: DollarSign, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    { 
      name: 'Card', 
      amount: data.card, 
      icon: CreditCard, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    { 
      name: 'UPI', 
      amount: data.upi, 
      icon: TrendingUp, 
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    { 
      name: 'NEFT', 
      amount: data.neft, 
      icon: Users, 
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    }
  ];

  if (collectionSummary.loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center h-48">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Collection Summary</h3>
            <p className="text-sm text-gray-600 mt-1">
              Payment collections for {getPeriodLabel(selectedPeriod).toLowerCase()}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Period Selector */}
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-sm btn-outline">
                <Calendar className="h-4 w-4 mr-1" />
                {getPeriodLabel(selectedPeriod)}
              </label>
              <ul tabIndex={0} className="dropdown-content z-10 menu p-2 shadow bg-base-100 rounded-box w-32">
                {['today', 'week', 'month', 'year'].map((period) => (
                  <li key={period}>
                    <a 
                      onClick={() => handlePeriodChange(period)}
                      className={selectedPeriod === period ? 'active' : ''}
                    >
                      {getPeriodLabel(period)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Auto Refresh Toggle */}
            <label className="label cursor-pointer gap-2">
              <span className="label-text text-xs">Auto</span>
              <input 
                type="checkbox" 
                className="toggle toggle-xs" 
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
            </label>

            {/* Refresh Button */}
            <button 
              onClick={handleRefresh}
              className="btn btn-sm btn-ghost"
              disabled={collectionSummary.loading}
            >
              <RefreshCw className={`h-4 w-4 ${collectionSummary.loading ? 'animate-spin' : ''}`} />
            </button>

            {/* View Full Report Link */}
            <Link href="/reports/collection-report" className="btn btn-sm btn-primary">
              <Eye className="h-4 w-4 mr-1" />
              View Report
            </Link>
          </div>
        </div>
      </div>

      {/* Error State */}
      {collectionSummary.error && (
        <div className="p-6">
          <div className="alert alert-error">
            <span>Error loading collection summary: {collectionSummary.error.message || collectionSummary.error}</span>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="p-6">
        {/* Total Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Collections</p>
                <p className="text-3xl font-bold">{formatCurrency(data.totalAmount)}</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <DollarSign className="h-8 w-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Transactions</p>
                <p className="text-3xl font-bold">{data.totalTransactions.toLocaleString()}</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <TrendingUp className="h-8 w-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Method Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            const percentage = data.totalAmount > 0 
              ? ((method.amount / data.totalAmount) * 100).toFixed(1)
              : 0;

            return (
              <div 
                key={method.name}
                className={`${method.bgColor} ${method.borderColor} border rounded-lg p-4 transition-transform hover:scale-105`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`${method.color} p-2 rounded-lg bg-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs text-gray-500">{percentage}%</span>
                </div>
                
                <div>
                  <p className="text-xs text-gray-600 mb-1">{method.name}</p>
                  <p className={`text-lg font-bold ${method.color}`}>
                    {formatCurrency(method.amount)}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full ${method.color.replace('text-', 'bg-')}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Stats */}
        {data.totalTransactions > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-600">Average Transaction</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(data.totalAmount / data.totalTransactions)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Largest Payment Method</p>
                <p className="text-lg font-semibold text-gray-900">
                  {paymentMethods.reduce((max, method) => 
                    method.amount > max.amount ? method : max, paymentMethods[0]
                  ).name}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Digital vs Cash</p>
                <p className="text-lg font-semibold text-gray-900">
                  {data.totalAmount > 0 
                    ? `${(((data.card + data.upi + data.neft) / data.totalAmount) * 100).toFixed(1)}% Digital`
                    : 'No Data'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {data.totalTransactions === 0 && !collectionSummary.loading && (
          <div className="text-center py-8">
            <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Collections Yet</h4>
            <p className="text-gray-600">
              No payment collections found for {getPeriodLabel(selectedPeriod).toLowerCase()}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionSummary;