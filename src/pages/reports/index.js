// Enhanced BillingReport.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBillings } from '@/redux/actions/billingActions';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import Layout from '@/components/Layout';
import Link from 'next/link';
import { 
  ArrowUp, ArrowDown, Activity, Calculator, Users, Calendar, ChevronDown, 
  BarChart2, PieChart as PieChartIcon, CreditCard, Wallet, BanknoteIcon, 
  Receipt, TestTube2Icon, Download, RefreshCw, TrendingUp, TrendingDown,
  IndianRupee, Clock, CheckCircle, AlertCircle, Eye, FileText
} from 'lucide-react';
import dayjs from 'dayjs';

const BillingReport = () => {
  const dispatch = useDispatch();
  const { billings, loading, error } = useSelector((state) => state.billing);
  const [dateRange, setDateRange] = useState('week');
  const [filteredData, setFilteredData] = useState([]);
  const [paymentStats, setPaymentStats] = useState({
    cash: 0,
    card: 0,
    upi: 0,
    neft: 0
  });
  const [summaryStats, setSummaryStats] = useState({
    totalRevenue: 0,
    averageTransaction: 0,
    totalTransactions: 0,
    growth: 0,
    pendingAmount: 0,
    completedBills: 0,
    partialBills: 0,
    cancelledBills: 0
  });

  useEffect(() => {
    dispatch(fetchBillings());
  }, [dispatch]);

  useEffect(() => {
    if (billings?.length) {
      const filtered = filterDataByDateRange(billings, dateRange);
      setFilteredData(filtered);
      calculateStats(filtered);
    }
  }, [billings, dateRange]);

  const filterDataByDateRange = (data, range) => {
    const now = new Date();
    const startDate = new Date();

    switch (range) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    return data.filter(bill => new Date(bill.date) >= startDate);
  };

  const calculateStats = (data) => {
    const total = data.reduce((sum, bill) => sum + bill.totals.grandTotal, 0);
    const prevPeriodData = filterDataByDateRange(billings, 'prev' + dateRange);
    const prevTotal = prevPeriodData.reduce((sum, bill) => sum + bill.totals.grandTotal, 0);
    const growth = prevTotal ? ((total - prevTotal) / prevTotal) * 100 : 0;
    
    const pendingAmount = data.reduce((sum, bill) => sum + (bill.totals.dueAmount || 0), 0);
    const completedBills = data.filter(bill => bill.status === 'paid').length;
    const partialBills = data.filter(bill => bill.status === 'partial').length;
    const cancelledBills = data.filter(bill => bill.status === 'cancelled').length;

    // Calculate payment type totals
    const payments = data.reduce((acc, bill) => {
      const type = bill.payment?.type?.toLowerCase() || 'cash';
      const amount = bill.payment?.paid || 0;
      acc[type] = (acc[type] || 0) + amount;
      return acc;
    }, {
      cash: 0,
      card: 0,
      upi: 0,
      neft: 0
    });

    setPaymentStats(payments);
    setSummaryStats({
      totalRevenue: total,
      averageTransaction: data.length ? total / data.length : 0,
      totalTransactions: data.length,
      growth,
      pendingAmount,
      completedBills,
      partialBills,
      cancelledBills
    });
  };

  const prepareChartData = () => {
    const dailyTotals = {};
    filteredData.forEach(bill => {
      const date = dayjs(bill.date).format('MMM DD');
      dailyTotals[date] = (dailyTotals[date] || 0) + bill.totals.grandTotal;
    });

    return Object.entries(dailyTotals)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([date, total]) => ({
        date,
        total,
        revenue: total
      }));
  };

  const preparePaymentPieChart = () => {
    return [
      { name: 'Cash', value: paymentStats.cash, color: '#10b981' },
      { name: 'Card', value: paymentStats.card, color: '#3b82f6' },
      { name: 'UPI', value: paymentStats.upi, color: '#8b5cf6' },
      { name: 'NEFT', value: paymentStats.neft, color: '#f59e0b' }
    ].filter(item => item.value > 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const refreshData = () => {
    dispatch(fetchBillings());
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-gray-600">Loading billing data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 m-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-red-500" size={24} />
            <div>
              <h3 className="text-red-800 font-semibold">Error Loading Data</h3>
              <p className="text-red-600">{error.message}</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 p-6  min-h-screen">
        {/* Enhanced Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow p-6 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-md font-bold mb-2">Financial Dashboard</h1>
              <p className="text-blue-100">Track revenue, transactions, and billing metrics in real-time</p>
              <div className="flex items-center gap-2 mt-2 text-blue-100">
                <Calendar size={16} />
                <span className="text-sm">Last updated: {dayjs().format('MMM DD, YYYY HH:mm')}</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex bg-white/10 backdrop-blur-sm rounded-lg p-1">
                {['today', 'week', 'month', 'quarter', 'year'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setDateRange(range)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      dateRange === range 
                        ? 'bg-white text-blue-600 shadow' 
                        : 'text-blue-100 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                ))}
              </div>
              <button
                onClick={refreshData}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg transition-all"
              >
                <RefreshCw size={16} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Revenue Card */}
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-green-500 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-full">
                <IndianRupee className="h-6 w-6 text-green-600" />
              </div>
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                summaryStats.growth >= 0 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {summaryStats.growth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {Math.abs(summaryStats.growth).toFixed(1)}%
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Total Revenue</h3>
            <p className="text-md font-bold text-gray-900 mb-1">₹{formatCurrency(summaryStats.totalRevenue)}</p>
            <p className="text-sm text-gray-500">vs previous {dateRange}</p>
          </div>

          {/* Transactions Card */}
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Receipt className="h-6 w-6 text-blue-600" />
              </div>
              <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {summaryStats.totalTransactions > 0 ? 
                  ((summaryStats.completedBills / summaryStats.totalTransactions) * 100).toFixed(0) : 0
                }% completed
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Total Transactions</h3>
            <p className="text-md font-bold text-gray-900 mb-1">{summaryStats.totalTransactions}</p>
            <p className="text-sm text-gray-500">{summaryStats.completedBills} completed</p>
          </div>

          {/* Average Transaction Card */}
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-purple-500 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Calculator className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Average Transaction</h3>
            <p className="text-md font-bold text-gray-900 mb-1">₹{formatCurrency(summaryStats.averageTransaction)}</p>
            <p className="text-sm text-gray-500">per transaction</p>
          </div>

          {/* Pending Amount Card */}
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-orange-500 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Pending Amount</h3>
            <p className="text-md font-bold text-gray-900 mb-1">₹{formatCurrency(summaryStats.pendingAmount)}</p>
            <p className="text-sm text-gray-500">{summaryStats.partialBills} partial payments</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Trend Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-bold text-gray-900">Revenue Trend</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <BarChart2 size={16} />
                <span>Daily Revenue</span>
              </div>
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={prepareChartData()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value) => [`₹${formatCurrency(value)}`, 'Revenue']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Payment Methods Distribution */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-bold text-gray-900">Payment Methods</h2>
              <PieChartIcon size={20} className="text-gray-600" />
            </div>
            
            {/* Pie Chart */}
            <div className="h-48 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={preparePaymentPieChart()}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {preparePaymentPieChart().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${formatCurrency(value)}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Payment Methods List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <Wallet className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Cash</span>
                </div>
                <span className="font-bold text-green-800">₹{formatCurrency(paymentStats.cash)}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Card</span>
                </div>
                <span className="font-bold text-blue-800">₹{formatCurrency(paymentStats.card)}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <Activity className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">UPI</span>
                </div>
                <span className="font-bold text-purple-800">₹{formatCurrency(paymentStats.upi)}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <BanknoteIcon className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">NEFT</span>
                </div>
                <span className="font-bold text-orange-800">₹{formatCurrency(paymentStats.neft)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions and Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-sm font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/reports/audit" 
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 hover:from-blue-100 hover:to-blue-200 transition-all group">
                <PieChartIcon className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-blue-800">Audit Report</span>
              </Link>
              
              <Link href="/reports/usercollection" 
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200 hover:from-green-100 hover:to-green-200 transition-all group">
                <Users className="h-5 w-5 text-green-600 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-green-800">User Report</span>
              </Link>
              
              <Link href="/reports/collection" 
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200 hover:from-purple-100 hover:to-purple-200 transition-all group">
                <BarChart2 className="h-5 w-5 text-purple-600 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-purple-800">Collections Report</span>
              </Link>
              
              <Link href="/reports/doctor" 
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200 hover:from-orange-100 hover:to-orange-200 transition-all group">
                <Activity className="h-5 w-5 text-orange-600 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-orange-800">Consultant Wise Consultation Report</span>
              </Link>
              
              <Link href="/reports/investigation" 
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-lg border border-red-200 hover:from-red-100 hover:to-red-200 transition-all group">
                <TestTube2Icon className="h-5 w-5 text-red-600 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-red-800">Investigation</span>
              </Link>
              
              <Link href="/reports/radiology" 
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg border border-indigo-200 hover:from-indigo-100 hover:to-indigo-200 transition-all group">
                <Eye className="h-5 w-5 text-indigo-600 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-indigo-800">Radiology</span>
              </Link>

              <Link href="/reports/dues" 
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200 hover:from-purple-100 hover:to-purple-200 transition-all group">
                <BarChart2 className="h-5 w-5 text-purple-600 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-purple-800">Dues Report</span>
              </Link>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-sm font-bold text-gray-900 mb-6">Performance Metrics</h2>
            
            {/* Collection Rate */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Collection Rate</span>
                <span className="text-sm font-bold text-green-600">
                  {summaryStats.totalRevenue > 0 ? 
                    (((summaryStats.totalRevenue - summaryStats.pendingAmount) / summaryStats.totalRevenue * 100).toFixed(1)) : 0
                  }%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500" 
                  style={{ 
                    width: `${summaryStats.totalRevenue > 0 ? ((summaryStats.totalRevenue - summaryStats.pendingAmount) / summaryStats.totalRevenue * 100) : 0}%` 
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>Collected: ₹{formatCurrency(summaryStats.totalRevenue - summaryStats.pendingAmount)}</span>
                <span>Total: ₹{formatCurrency(summaryStats.totalRevenue)}</span>
              </div>
            </div>

            {/* Payment Success Rate */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Payment Success Rate</span>
                <span className="text-sm font-bold text-blue-600">
                  {summaryStats.totalTransactions > 0 ? 
                    ((summaryStats.completedBills / summaryStats.totalTransactions) * 100).toFixed(1) : 0
                  }%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-500" 
                  style={{ 
                    width: `${summaryStats.totalTransactions > 0 ? (summaryStats.completedBills / summaryStats.totalTransactions) * 100 : 0}%` 
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>Completed: {summaryStats.completedBills}</span>
                <span>Total: {summaryStats.totalTransactions}</span>
              </div>
            </div>

            {/* Status Distribution */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
                <div className="text-xs font-bold text-green-800">{summaryStats.completedBills}</div>
                <div className="text-xs text-green-600">Completed</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                <Clock className="h-6 w-6 text-orange-600 mx-auto mb-1" />
                <div className="text-xs font-bold text-orange-800">{summaryStats.partialBills}</div>
                <div className="text-xs text-orange-600">Partial</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                <AlertCircle className="h-6 w-6 text-red-600 mx-auto mb-1" />
                <div className="text-xs font-bold text-red-800">{summaryStats.cancelledBills}</div>
                <div className="text-xs text-red-600">Cancelled</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-gray-900">Recent Transactions</h2>
            <Link href="/reports/collection" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
              <Eye size={16} />
              View All
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Patient</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Bill Number</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Payment</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.slice(0, 8).map((bill) => (
                  <tr key={bill._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {dayjs(bill.date).format('MMM DD, YYYY')}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">
                      {bill.patientId?.firstName + ' ' + bill.patientId?.lastName || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 font-mono">
                      {bill.billNumber}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">
                      ₹{formatCurrency(bill.totals.grandTotal)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        bill.payment?.type === 'cash' ? 'bg-green-100 text-green-800' :
                        bill.payment?.type === 'card' ? 'bg-blue-100 text-blue-800' :
                        bill.payment?.type === 'upi' ? 'bg-purple-100 text-purple-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {(bill.payment?.type || 'cash').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        bill.status === 'paid' ? 'bg-green-100 text-green-800' :
                        bill.status === 'partial' ? 'bg-orange-100 text-orange-800' :
                        bill.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {(bill.status || 'pending').toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredData.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No transactions found for the selected period</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BillingReport;