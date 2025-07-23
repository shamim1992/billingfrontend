import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBillings } from '@/redux/actions/billingActions';
import Layout from '@/components/Layout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Activity,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  IndianRupee
} from 'lucide-react';
import { fetchPatients } from '@/redux/actions/patientActions';
import PaymentMethodDistribution from '@/components/accountant/PaymentMethodDistribution';
import CategoryRevenue from '@/components/accountant/CategoryRevenue';

const AccountantDashboard = () => {
  const dispatch = useDispatch();
  const [revenueData, setRevenueData] = useState([]);
  const [periodMetrics, setPeriodMetrics] = useState({
    currentMonth: { revenue: 0, bills: 0, avgBill: 0 },
    lastMonth: { revenue: 0, bills: 0, avgBill: 0 },
    growth: { revenue: 0, bills: 0, avgBill: 0, patients: 0 }
  });
  const billings = useSelector((state) => state.billing?.billings || []);
  const { patients } = useSelector((state) => state.patients);

  useEffect(() => {
    dispatch(fetchBillings());
    dispatch(fetchPatients())
  }, [dispatch]);

  useEffect(() => {
    if (billings.length > 0) {
      const processedData = processRevenueData(billings);
      setRevenueData(processedData);
      calculatePeriodMetrics(billings);
    }
  }, [billings]);

  const calculatePeriodMetrics = (bills) => {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const currentMonth = { revenue: 0, bills: 0, avgBill: 0 };
    const lastMonth = { revenue: 0, bills: 0, avgBill: 0 };

    bills.forEach(bill => {
      const billDate = new Date(bill.date);
      if (billDate >= currentMonthStart) {
        currentMonth.revenue += bill.totals.grandTotal;
        currentMonth.bills += 1;
      } else if (billDate >= lastMonthStart && billDate < currentMonthStart) {
        lastMonth.revenue += bill.totals.grandTotal;
        lastMonth.bills += 1;
      }
    });

    // Calculate averages
    currentMonth.avgBill = currentMonth.bills ? currentMonth.revenue / currentMonth.bills : 0;
    lastMonth.avgBill = lastMonth.bills ? lastMonth.revenue / lastMonth.bills : 0;

    // Calculate growth percentages
    const growth = {
      revenue: calculateGrowth(currentMonth.revenue, lastMonth.revenue),
      bills: calculateGrowth(currentMonth.bills, lastMonth.bills),
      avgBill: calculateGrowth(currentMonth.avgBill, lastMonth.avgBill),
      patients: calculateGrowth(patients?.length || 0, (patients?.length || 0) * 0.9) // Simulated previous month
    };

    setPeriodMetrics({ currentMonth, lastMonth, growth });
  };

  const calculateGrowth = (current, previous) => {
    if (!previous) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const processRevenueData = (bills) => {
    const monthlyData = bills.reduce((acc, bill) => {
      const date = new Date(bill.date);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;

      if (!acc[monthYear]) {
        acc[monthYear] = {
          month: monthYear,
          revenue: 0,
          bills: 0
        };
      }

      acc[monthYear].revenue += bill.totals.grandTotal;
      acc[monthYear].bills += 1;

      return acc;
    }, {});

    return Object.values(monthlyData)
      .sort((a, b) => {
        const [aMonth, aYear] = a.month.split(' ');
        const [bMonth, bYear] = b.month.split(' ');
        return new Date(`${aMonth} 1, ${aYear}`) - new Date(`${bMonth} 1, ${bYear}`);
      });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const renderMetricCard = (title, value, icon, trend, prefix = '') => (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
          </h3>
        </div>
        <div className={`p-3 ${getIconBackgroundColor(icon)} rounded-full`}>
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm">
        {trend > 0 ? (
          <ArrowUpRight className="h-4 w-4 text-green-500" />
        ) : (
          <ArrowDownRight className="h-4 w-4 text-red-500" />
        )}
        <span className={trend > 0 ? 'text-green-500 font-medium' : 'text-red-500 font-medium'}>
          {trend.toFixed(1)}%
        </span>
        <span className="text-gray-600 ml-2">from last month</span>
      </div>
    </div>
  );

  const getIconBackgroundColor = (icon) => {
    const type = icon.type.name;
    switch (type) {
      case 'DollarSign': return 'bg-green-100';
      case 'FileText': return 'bg-blue-100';
      case 'TrendingUp': return 'bg-purple-100';
      case 'Users': return 'bg-orange-100';
      default: return 'bg-gray-100';
    }
  };

  const getRecentActivity = () => {
    return [...billings] // Create a copy of the array
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 4)
      .map(bill => ({
        id: bill._id,
        patient: bill.patientId?.firstName || 'Unknown Patient',
        amount: bill.totals.grandTotal,
        date: new Date(bill.date),
        receipt: bill.receiptNumber
      }));
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  return (
    <Layout>
      <div className=" space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-sm font-bold text-gray-800">Accountant Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Calendar className="h-5 w-5 text-gray-500" />
            <span className="text-gray-600">
              {new Date().toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
          {renderMetricCard(
            'Total Revenue',
            periodMetrics.currentMonth.revenue,
            <IndianRupee className="h-4 w-4 text-green-600" />,
            periodMetrics.growth.revenue,
            '₹'
          )}
          {renderMetricCard(
            'Monthly Bills',
            periodMetrics.currentMonth.bills,
            <FileText className="h-6 w-6 text-blue-600" />,
            periodMetrics.growth.bills
          )}
          {renderMetricCard(
            'Average Bill Value',
            Math.round(periodMetrics.currentMonth.avgBill),
            <TrendingUp className="h-6 w-6 text-purple-600" />,
            periodMetrics.growth.avgBill,
            '₹'
          )}
          {renderMetricCard(
            'Active Patients',
            patients?.length || 0,
            <Users className="h-6 w-6 text-orange-600" />,
            periodMetrics.growth.patients
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Revenue Overview</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), "Revenue"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {getRecentActivity().map((activity) => (
                <div key={activity.id} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <Activity className="h-8 w-8 text-blue-500" />
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {activity.patient}
                        </p>
                        <p className="text-xs text-gray-500">
                          Receipt: {activity.receipt}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(activity.amount)}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTimeAgo(activity.date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg border p-6">
            <CategoryRevenue billings={billings} />
          </div>
          <div>
            <PaymentMethodDistribution billings={billings} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AccountantDashboard;