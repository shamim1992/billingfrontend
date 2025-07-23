import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

const CategoryRevenue = ({ billings }) => {
  const categoryData = useMemo(() => {
    if (!billings?.length) return [];

    // Group billings by service category
    const categoryRevenue = billings.reduce((acc, bill) => {
      // Handle multiple billing items in each bill
      bill.billingItems.forEach(item => {
        const category = item?.category || 'Other';
        const amount = item.price * item.quantity;

        if (!acc[category]) {
          acc[category] = {
            name: category,
            revenue: 0,
            count: 0,
            items: new Set()
          };
        }

        acc[category].revenue += amount;
        acc[category].count += 1;
        acc[category].items.add(item.productname);
      });

      return acc;
    }, {});

    // Calculate previous month data for comparison
    const currentMonth = new Date().getMonth();
    const previousMonthData = billings.reduce((acc, bill) => {
      const billMonth = new Date(bill.date).getMonth();
      if (billMonth === currentMonth - 1) {
        bill.billingItems.forEach(item => {
          const category = item?.category || 'Other';
          const amount = item.price * item.quantity;
          acc[category] = (acc[category] || 0) + amount;
        });
      }
      return acc;
    }, {});

    // Transform data for chart
    return Object.entries(categoryRevenue)
      .map(([category, data]) => ({
        name: category,
        revenue: data.revenue,
        count: data.count,
        uniqueServices: data.items.size,
        previousRevenue: previousMonthData[category] || 0,
        growth: previousMonthData[category] 
          ? ((data.revenue - previousMonthData[category]) / previousMonthData[category] * 100).toFixed(1)
          : 100
      }))
      .sort((a, b) => b.revenue - a.revenue);
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
          <p className="text-sm text-gray-600">Revenue: {formatCurrency(data.revenue)}</p>
          <p className="text-sm text-gray-600">Services: {data.uniqueServices}</p>
          <p className="text-sm text-gray-600">Transactions: {data.count}</p>
          <div className="flex items-center mt-1 text-sm">
            <span className={data.growth >= 0 ? 'text-green-600' : 'text-red-600'}>
              {data.growth}% from last month
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg  p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Revenue by Category</h2>

      <div className="h-80 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={categoryData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              interval={0}
              angle={-45}
              textAnchor="end"
            />
            <YAxis
              tickFormatter={(value) => formatCurrency(value)}
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="revenue" 
              fill="#6366f1"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoryData.map((category) => (
          <div 
            key={category.name}
            className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-gray-900">{category.name}</h3>
              <div className="flex items-center">
                {parseFloat(category.growth) >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className={`ml-1 text-sm ${
                  parseFloat(category.growth) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {category.growth}%
                </span>
              </div>
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {formatCurrency(category.revenue)}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {category.uniqueServices} services · {category.count} transactions
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryRevenue;