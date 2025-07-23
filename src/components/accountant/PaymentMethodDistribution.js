import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const PaymentMethodDistribution = ({ billings }) => {
  // Colors for different payment methods
  const COLORS = {
    'Cash': '#10B981',
    'Credit Card': '#6366F1',
    'Debit Card': '#F59E0B',
    'UPI': '#EC4899',
    'Insurance': '#8B5CF6',
    'Bank Transfer': '#3B82F6',
    'Other': '#6B7280'
  };

  const paymentData = useMemo(() => {
    if (!billings?.length) return [];

    // Count payments by method
    const paymentCounts = billings.reduce((acc, bill) => {
      const method = bill.payment?.method || 'Other';
      const amount = bill.totals?.grandTotal || 0;

      if (!acc[method]) {
        acc[method] = {
          method,
          amount: 0,
          count: 0
        };
      }
      
      acc[method].amount += amount;
      acc[method].count += 1;
      
      return acc;
    }, {});

    // Convert to array and calculate percentages
    const total = Object.values(paymentCounts).reduce((sum, item) => sum + item.amount, 0);
    
    return Object.values(paymentCounts)
      .map(item => ({
        name: item.method,
        value: item.amount,
        percentage: ((item.amount / total) * 100).toFixed(1),
        count: item.count
      }))
      .sort((a, b) => b.value - a.value);
  }, [billings]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4  rounded-lg border">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">Amount: {formatCurrency(data.value)}</p>
          <p className="text-sm text-gray-600">Transactions: {data.count}</p>
          <p className="text-sm text-gray-600">Percentage: {data.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => {
    return (
      <div className="grid grid-cols-2 gap-2 mt-4">
        {payload.map((entry, index) => (
          <div key={`legend-${index}`} className="flex items-center">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600">
              {entry.value} ({paymentData.find(p => p.name === entry.value)?.percentage}%)
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg  p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Payment Methods</h2>
        <div className="text-sm text-gray-500">
          Total Transactions: {paymentData.reduce((sum, item) => sum + item.count, 0)}
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={paymentData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {paymentData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[entry.name] || COLORS.Other}
                  stroke="#fff"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
        {paymentData.map((method) => (
          <div 
            key={method.name} 
            className="bg-gray-50 rounded-lg p-4"
          >
            <div className="text-sm font-medium text-gray-600">{method.name}</div>
            <div className="text-lg font-semibold text-gray-900">
              {formatCurrency(method.value)}
            </div>
            <div className="text-xs text-gray-500">
              {method.count} transactions
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentMethodDistribution;