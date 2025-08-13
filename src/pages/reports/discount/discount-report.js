import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBillings } from '@/redux/actions/billingActions';
import Layout from '@/components/Layout';
import DataTable from 'react-data-table-component';
import {
    Calendar,
    IndianRupeeIcon,
    FileText,
    Loader2,
    TrendingDown,
    Users,
    Receipt,
    Download,
    PieChart,
    BarChart3,
    AlertCircle
} from 'lucide-react';
import dayjs from 'dayjs';

import jsPDF from 'jspdf';
import Link from 'next/link';

const DiscountReport = () => {
    const dispatch = useDispatch();
    const { billings, loading, error } = useSelector((state) => state.billing);

    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [discountTypeFilter, setDiscountTypeFilter] = useState('all');
    const [doctorFilter, setDoctorFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [filteredDiscounts, setFilteredDiscounts] = useState([]);

    const [summary, setSummary] = useState({
        totalDiscountAmount: 0,
        totalDiscountPercent: 0,
        averageDiscountAmount: 0,
        averageDiscountPercent: 0,
        totalBillsWithDiscount: 0,
        totalBillAmount: 0,
        discountByType: { percent: 0, amount: 0 },
        discountByDoctor: {},
        discountByStatus: {},
        maxDiscount: { amount: 0, percent: 0, bill: null },
        minDiscount: { amount: 0, percent: 0, bill: null }
    });

    // Fetch all billings on component mount
    useEffect(() => {
        dispatch(fetchBillings());
    }, [dispatch]);

    // Filter and calculate discounts when data changes
    useEffect(() => {
        if (billings?.length) {
            filterAndCalculateDiscounts();
        }
    }, [billings, dateFrom, dateTo, discountTypeFilter, doctorFilter, statusFilter]);

    const filterAndCalculateDiscounts = () => {
        let filtered = billings.filter(bill => {
            // Only include bills with discounts
            if (!bill.discount || (!bill.discount.value || bill.discount.value <= 0)) {
                return false;
            }

            // Date filter
            if (dateFrom && dateTo) {
                const billDate = dayjs(bill.date).format('YYYY-MM-DD');
                const fromDate = dayjs(dateFrom).format('YYYY-MM-DD');
                const toDate = dayjs(dateTo).format('YYYY-MM-DD');

                if (billDate < fromDate || billDate > toDate) {
                    return false;
                }
            }

            // Discount type filter
            if (discountTypeFilter !== 'all' && bill.discount?.type !== discountTypeFilter) {
                return false;
            }

            // Doctor filter
            if (doctorFilter !== 'all' && bill.doctorId?._id !== doctorFilter) {
                return false;
            }

            // Status filter
            if (statusFilter !== 'all' && bill.status !== statusFilter) {
                return false;
            }

            return true;
        });

        setFilteredDiscounts(filtered);
        calculateSummary(filtered);
    };

    const calculateSummary = (discountBills) => {
        if (!discountBills.length) {
            setSummary({
                totalDiscountAmount: 0,
                totalDiscountPercent: 0,
                averageDiscountAmount: 0,
                averageDiscountPercent: 0,
                totalBillsWithDiscount: 0,
                totalBillAmount: 0,
                discountByType: { percent: 0, amount: 0 },
                discountByDoctor: {},
                discountByStatus: {},
                maxDiscount: { amount: 0, percent: 0, bill: null },
                minDiscount: { amount: 0, percent: 0, bill: null }
            });
            return;
        }

        let totalDiscountAmount = 0;
        let totalDiscountPercent = 0;
        let totalBillAmount = 0;
        let discountByType = { percent: 0, amount: 0 };
        let discountByDoctor = {};
        let discountByStatus = {};
        let maxDiscount = { amount: 0, percent: 0, bill: null };
        let minDiscount = { amount: Infinity, percent: Infinity, bill: null };

        discountBills.forEach(bill => {
            const discountAmount = calculateDiscountAmount(bill);
            const discountPercent = calculateDiscountPercent(bill);

            totalDiscountAmount += discountAmount;
            totalBillAmount += bill.totals?.grandTotal || 0;

            // Count percentage discounts for average calculation
            if (bill.discount.type === 'percent') {
                totalDiscountPercent += bill.discount.value;
            }

            // Discount by type - track actual amounts
            if (bill.discount.type === 'percent') {
                discountByType.percent += discountAmount; // Store actual amount, not percentage
            } else {
                discountByType.amount += discountAmount;
            }

            // Discount by doctor
            const doctorName = bill.doctorId?.name || 'Unknown Doctor';
            if (!discountByDoctor[doctorName]) {
                discountByDoctor[doctorName] = { amount: 0, count: 0 };
            }
            discountByDoctor[doctorName].amount += discountAmount;
            discountByDoctor[doctorName].count += 1;

            // Discount by status
            if (!discountByStatus[bill.status]) {
                discountByStatus[bill.status] = { amount: 0, count: 0 };
            }
            discountByStatus[bill.status].amount += discountAmount;
            discountByStatus[bill.status].count += 1;

            // Max and min discounts
            if (discountAmount > maxDiscount.amount) {
                maxDiscount = { amount: discountAmount, percent: discountPercent, bill };
            }
            if (discountAmount < minDiscount.amount && discountAmount > 0) {
                minDiscount = { amount: discountAmount, percent: discountPercent, bill };
            }
        });

        const averageDiscountAmount = totalDiscountAmount / discountBills.length;
        const averageDiscountPercent = totalDiscountPercent / discountBills.filter(b => b.discount.type === 'percent').length || 0;

        setSummary({
            totalDiscountAmount,
            totalDiscountPercent,
            averageDiscountAmount,
            averageDiscountPercent,
            totalBillsWithDiscount: discountBills.length,
            totalBillAmount,
            discountByType,
            discountByDoctor,
            discountByStatus,
            maxDiscount: maxDiscount.amount > 0 ? maxDiscount : { amount: 0, percent: 0, bill: null },
            minDiscount: minDiscount.amount < Infinity ? minDiscount : { amount: 0, percent: 0, bill: null }
        });
    };

    const calculateDiscountAmount = (bill) => {
        if (!bill.discount || !bill.discount.value) return 0;

        if (bill.discount.type === 'percent') {
            // For percentage discount, calculate based on subtotal
            const subtotal = bill.totals?.subtotal || 0;
            const discountAmount = (subtotal * bill.discount.value) / 100;
            return Math.round(discountAmount * 100) / 100; // Round to 2 decimal places
        } else {
            // For amount discount, return the direct value
            return bill.discount.value;
        }
    };

    const calculateDiscountPercent = (bill) => {
        if (!bill.discount || !bill.discount.value) return 0;

        if (bill.discount.type === 'percent') {
            // For percentage discount, return the percentage value
            return bill.discount.value;
        } else {
            // For amount discount, calculate what percentage it represents
            const subtotal = bill.totals?.subtotal || 0;
            if (subtotal > 0) {
                const percentage = (bill.discount.value / subtotal) * 100;
                return Math.round(percentage * 100) / 100; // Round to 2 decimal places
            }
            return 0;
        }
    };

    // Helper function to get the original discount value for display
    const getDiscountDisplayValue = (bill) => {
        if (!bill.discount || !bill.discount.value) return '0';

        if (bill.discount.type === 'percent') {
            return `${formatPercent(bill.discount.value)}%`;
        } else {
            return `₹${formatCurrency(bill.discount.value)}`;
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount || 0);
    };

    const formatPercent = (percent) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
        }).format(percent || 0);
    };

    // Get unique doctors for filter
    const uniqueDoctors = billings?.reduce((acc, bill) => {
        if (bill.doctorId && !acc.find(d => d._id === bill.doctorId._id)) {
            acc.push(bill.doctorId);
        }
        return acc;
    }, []) || [];

    const handleExport = () => {
        // Create a new window for the printable version
        const printWindow = window.open('', '_blank');

        // Generate the HTML content for PDF
        const htmlContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Discount Report - ${dayjs().format('YYYY-MM-DD')}</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            padding: 20px; 
                            margin: 0;
                            line-height: 1.4;
                        }
                        table { 
                            width: 100%; 
                            border-collapse: collapse; 
                            margin-bottom: 20px; 
                            font-size: 12px;
                        }
                        th, td { 
                            border: 1px solid #ddd; 
                            padding: 8px; 
                            text-align: left; 
                        }
                        th { 
                            background-color: #f8f9fa; 
                            font-weight: bold;
                        }
                        .summary-card { 
                            margin-bottom: 30px; 
                            break-inside: avoid;
                        }
                        .summary-title { 
                            font-size: 16px; 
                            font-weight: bold; 
                            margin-bottom: 10px; 
                            color: #333;
                        }
                        .header { 
                            margin-bottom: 30px; 
                            padding-bottom: 10px;
                            border-bottom: 2px solid #eee;
                        }
                        .report-title { 
                            font-size: 20px; 
                            font-weight: bold; 
                            margin-bottom: 5px; 
                            color: #1a1a1a;
                        }
                        .report-date { 
                            color: #666; 
                            font-size: 14px;
                        }
                        .filter-info {
                            margin-bottom: 20px;
                            font-size: 12px;
                            color: #666;
                        }
                        .discount-badge {
                            padding: 4px 8px;
                            border-radius: 4px;
                            font-weight: 500;
                            font-size: 11px;
                        }
                        .discount-percent { background-color: #dbeafe; color: #1e40af; }
                        .discount-amount { background-color: #dcfce7; color: #166534; }
                        .status-paid { background-color: #d1fae5; color: #065f46; }
                        .status-pending { background-color: #fee2e2; color: #991b1b; }
                        .status-partial { background-color: #fef3c7; color: #92400e; }
                        .status-cancelled { background-color: #fecaca; color: #991b1b; }
                        .amount-red { color: #dc2626; font-weight: 600; }
                        .amount-orange { color: #ea580c; font-weight: 600; }
                        @media print {
                            .no-print { display: none; }
                            table { page-break-inside: auto; }
                            tr { page-break-inside: avoid; page-break-after: auto; }
                            thead { display: table-header-group; }
                            .header { position: fixed; top: 0; width: 100%; }
                            body { padding-top: 120px; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="report-title">Discount Analysis Report</div>
                        <div class="report-date">Generated on: ${dayjs().format('DD/MM/YYYY HH:mm')}</div>
                        ${dateFrom && dateTo ? `
                            <div class="filter-info">
                                Period: ${dayjs(dateFrom).format('DD/MM/YYYY')} to ${dayjs(dateTo).format('DD/MM/YYYY')}
                                ${discountTypeFilter !== 'all' ? ` | Discount Type: ${discountTypeFilter.toUpperCase()}` : ''}
                                ${doctorFilter !== 'all' ? ` | Doctor Filter Applied` : ''}
                                ${statusFilter !== 'all' ? ` | Status: ${statusFilter.toUpperCase()}` : ''}
                            </div>
                        ` : ''}
                    </div>

                    <div class="summary-card">
                        <div class="summary-title">Discount Summary</div>
                        <table>
                            <tr>
                                <th>Total Discount Given</th>
                                <th>Bills with Discount</th>
                                <th>Average Discount</th>
                                <th>Discount % of Total</th>
                            </tr>
                            <tr>
                                <td class="amount-red">₹${formatCurrency(summary.totalDiscountAmount)}</td>
                                <td>${summary.totalBillsWithDiscount}</td>
                                <td>₹${formatCurrency(summary.averageDiscountAmount)}</td>
                                <td>${formatPercent(summary.totalBillAmount > 0 ? (summary.totalDiscountAmount / summary.totalBillAmount * 100) : 0)}%</td>
                            </tr>
                        </table>
                        
                        <table>
                            <tr>
                                <th>Percentage-based Discounts</th>
                                <th>Amount-based Discounts</th>
                                <th>Maximum Discount</th>
                                <th>Minimum Discount</th>
                            </tr>
                            <tr>
                                <td>₹${formatCurrency(summary.discountByType.percent)}</td>
                                <td>₹${formatCurrency(summary.discountByType.amount)}</td>
                                <td>₹${formatCurrency(summary.maxDiscount.amount)}</td>
                                <td>₹${formatCurrency(summary.minDiscount.amount)}</td>
                            </tr>
                        </table>
                    </div>

                    ${Object.keys(summary.discountByDoctor).length > 0 ? `
                        <div class="summary-card">
                            <div class="summary-title">Doctor-wise Discount Breakdown (Top 10)</div>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Doctor Name</th>
                                        <th>Total Discount</th>
                                        <th>Bills Count</th>
                                        <th>Average per Bill</th>
                                        <th>% of Total Discount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${Object.entries(summary.discountByDoctor)
                    .sort(([, a], [, b]) => b.amount - a.amount)
                    .slice(0, 10)
                    .map(([doctor, data]) => `
                                            <tr>
                                                <td>${doctor}</td>
                                                <td>₹${formatCurrency(data.amount)}</td>
                                                <td>${data.count}</td>
                                                <td>₹${formatCurrency(data.amount / data.count)}</td>
                                                <td>${((data.amount / summary.totalDiscountAmount) * 100).toFixed(1)}%</td>
                                            </tr>
                                        `).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : ''}

                    <div class="summary-title">Detailed Discount Records</div>
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Bill Number</th>
                                <th>Patient ID</th>
                                <th>Patient Name</th>
                                <th>Doctor</th>
                                <th>Bill Amount</th>
                                <th>Discount Type</th>
                                <th>Discount Value</th>
                                <th>Discount Amount</th>
                                <th>Discount %</th>
                                <th>Final Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filteredDiscounts.map(bill => {
                        const patient = bill.patientId;
                        const doctor = bill.doctorId;
                        const discountAmount = calculateDiscountAmount(bill);
                        const discountPercent = calculateDiscountPercent(bill);

                        return `
                                    <tr>
                                        <td>${dayjs(bill.date).format('DD/MM/YYYY')}</td>
                                        <td>${bill.billNumber || 'N/A'}</td>
                                        <td>${patient?.patientId || 'N/A'}</td>
                                        <td>${patient ? `${patient.firstName || ''} ${patient.lastName || ''}`.trim() : 'N/A'}</td>
                                        <td>${doctor?.name || 'N/A'}</td>
                                        <td>₹${formatCurrency(bill.totals?.subtotal || 0)}</td>
                                        <td>
                                            <span class="discount-badge ${bill.discount?.type === 'percent' ? 'discount-percent' : 'discount-amount'}">
                                                ${(bill.discount?.type || 'N/A').toUpperCase()}
                                            </span>
                                        </td>
                                        <td>${getDiscountDisplayValue(bill)}</td>
                                        <td class="amount-red">₹${formatCurrency(discountAmount)}</td>
                                        <td class="amount-orange">${formatPercent(discountPercent)}%</td>
                                        <td>₹${formatCurrency(bill.totals?.grandTotal || 0)}</td>
                                        <td>
                                            <span class="discount-badge ${bill.status === 'paid' ? 'status-paid' :
                                bill.status === 'partial' ? 'status-partial' :
                                    bill.status === 'cancelled' ? 'status-cancelled' :
                                        'status-pending'
                            }">
                                                ${(bill.status || 'N/A').toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                `;
                    }).join('')}
                        </tbody>
                    </table>
                    
                    ${filteredDiscounts.length > 50 ? `
                        <div style="margin-top: 15px; padding: 10px; background-color: #fef3c7; border-radius: 4px; font-size: 12px; color: #92400e;">
                            <strong>Note:</strong> This report shows ${Math.min(filteredDiscounts.length, 50)} records. 
                            ${filteredDiscounts.length > 50 ? `Total ${filteredDiscounts.length} records match your criteria.` : ''}
                            For complete analysis, please use the system dashboard.
                        </div>
                    ` : ''}
                    
                    <button class="no-print" onclick="window.print();" 
                        style="
                            padding: 10px 20px; 
                            background: #2563eb; 
                            color: white; 
                            border: none; 
                            border-radius: 4px; 
                            cursor: pointer;
                            position: fixed;
                            bottom: 20px;
                            right: 20px;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        ">
                        Print PDF
                    </button>
                </body>
            </html>
        `;

        // Write the content to the new window
        printWindow.document.write(htmlContent);
        printWindow.document.close();
    };

    const refreshData = () => {
        dispatch(fetchBillings());
    };

    // Table columns with increased widths and wrap settings
    const columns = [
        {
            name: 'Serial Number',
            selector: (row, index) => index + 1,
            sortable: false,
            width: '120px',
            wrap: true
        },
        {
            name: 'Date',
            selector: row => dayjs(row.date).format('DD/MM/YYYY'),
            sortable: true,
            width: '140px',
            wrap: true
        },
        {
            name: 'Bill Number',
            selector: row => (<Link className='text-blue-500' href={`/billing/${row._id}`}>{row.billNumber}</Link> || row.billNumber) || 'N/A',
            sortable: true,
            width: '150px',
            wrap: true
        },
        {
            name: 'Patient ID',
            selector: row => (<Link className='text-blue-500' href={`/patients/${row.patientId?._id}`}>{row.patientId?.patientId}</Link> || row.patientId?.patientId)|| 'N/A',
            sortable: true,
            width: '140px',
            wrap: true
        },
        {
            name: 'Patient Name',
            selector: row => {
                const patient = row.patientId;
                return patient ? `${patient.firstName || ''} ${patient.lastName || ''}` : 'N/A';
            },
            sortable: true,
            width: '200px',
            wrap: true,
            cell: row => {
                const patient = row.patientId;
                const name = patient ? `${patient.firstName || ''} ${patient.lastName || ''}` : 'N/A';
                return (
                    <div className="py-2" style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
                        {name}
                    </div>
                );
            }
        },
        {
            name: 'Doctor Name',
            selector: row => row.doctorId?.name || 'N/A',
            sortable: true,
            width: '180px',
            wrap: true,
            cell: row => (
                <div className="py-2" style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
                    {row.doctorId?.name || 'N/A'}
                </div>
            )
        },
        {
            name: 'Bill Amount',
            selector: row => row.totals?.subtotal || 0,
            cell: row => (
                <div className="font-medium flex items-center gap-1 justify-end w-full py-2">
                    <IndianRupeeIcon size={14} />
                    <span style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
                        {formatCurrency(row.totals?.subtotal || 0)}
                    </span>
                </div>
            ),
            sortable: true,
            width: '150px',
            wrap: true
        },
        {
            name: 'Discount Type',
            selector: row => row.discount?.type || 'N/A',
            cell: row => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.discount?.type === 'percent'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                    }`} style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
                    {(row.discount?.type || 'N/A').toUpperCase()}
                </span>
            ),
            sortable: true,
            width: '140px',
            wrap: true
        },
        {
            name: 'Discount Value',
            selector: row => row.discount?.value || 0,
            cell: row => (
                <div className="font-medium text-center py-2" style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
                    {getDiscountDisplayValue(row)}
                </div>
            ),
            sortable: true,
            width: '150px',
            wrap: true
        },
        {
            name: 'Discount Amount',
            selector: row => calculateDiscountAmount(row),
            cell: row => (
                <div className="font-medium flex items-center gap-1 justify-end w-full text-red-600 py-2">
                    <IndianRupeeIcon size={14} />
                    <span style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
                        {formatCurrency(calculateDiscountAmount(row))}
                    </span>
                </div>
            ),
            sortable: true,
            width: '160px',
            wrap: true
        },
        {
            name: 'Discount Percentage',
            selector: row => calculateDiscountPercent(row),
            cell: row => (
                <div className="font-medium text-center text-orange-600 py-2" style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
                    {formatPercent(calculateDiscountPercent(row))}%
                </div>
            ),
            sortable: true,
            width: '160px',
            wrap: true
        },
        {
            name: 'Final Amount',
            selector: row => row.totals?.grandTotal || 0,
            cell: row => (
                <div className="font-medium flex items-center gap-1 justify-end w-full py-2">
                    <IndianRupeeIcon size={14} />
                    <span style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
                        {formatCurrency(row.totals?.grandTotal || 0)}
                    </span>
                </div>
            ),
            sortable: true,
            width: '150px',
            wrap: true
        },
        {
            name: 'Status',
            selector: row => row.status || 'N/A',
            cell: row => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === 'paid' ? 'bg-green-100 text-green-800' :
                    row.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                        row.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                    }`} style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
                    {(row.status || 'N/A').toUpperCase()}
                </span>
            ),
            sortable: true,
            width: '120px',
            wrap: true
        }
    ];

    const SummaryCards = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">Total Discount Given</p>
                        <p className="text-2xl font-bold text-red-600">₹{formatCurrency(summary.totalDiscountAmount)}</p>
                    </div>
                    <TrendingDown className="h-8 w-8 text-red-500" />
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">Bills with Discount</p>
                        <p className="text-2xl font-bold text-blue-600">{summary.totalBillsWithDiscount}</p>
                    </div>
                    <Receipt className="h-8 w-8 text-blue-500" />
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">Average Discount</p>
                        <p className="text-2xl font-bold text-orange-600">₹{formatCurrency(summary.averageDiscountAmount)}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-orange-500" />
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">Discount % of Total</p>
                        <p className="text-2xl font-bold text-purple-600">
                            {formatPercent(summary.totalBillAmount > 0 ? (summary.totalDiscountAmount / summary.totalBillAmount * 100) : 0)}%
                        </p>
                    </div>
                    <PieChart className="h-8 w-8 text-purple-500" />
                </div>
            </div>
        </div>
    );

    const DetailedSummaryTable = () => (
        <div className="bg-white rounded-lg shadow-sm border my-6">
            <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Detailed Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Discount Type Breakdown */}
                    <div>
                        <h4 className="font-medium text-gray-700 mb-3">Discount by Type</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                                <span className="text-sm text-gray-600">Percentage Based</span>
                                <span className="font-medium">₹{formatCurrency(summary.discountByType.percent)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                                <span className="text-sm text-gray-600">Amount Based</span>
                                <span className="font-medium">₹{formatCurrency(summary.discountByType.amount)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Min/Max Discounts */}
                    <div>
                        <h4 className="font-medium text-gray-700 mb-3">Discount Range</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                                <span className="text-sm text-gray-600">Maximum Discount</span>
                                <span className="font-medium">₹{formatCurrency(summary.maxDiscount.amount)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                                <span className="text-sm text-gray-600">Minimum Discount</span>
                                <span className="font-medium">₹{formatCurrency(summary.minDiscount.amount)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Doctor-wise breakdown */}
                {Object.keys(summary.discountByDoctor).length > 0 && (
                    <div className="mt-6">
                        <h4 className="font-medium text-gray-700 mb-3">Doctor-wise Discount Summary</h4>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="text-left p-2 font-medium text-gray-600">Doctor Name</th>
                                        <th className="text-right p-2 font-medium text-gray-600">Total Discount</th>
                                        <th className="text-right p-2 font-medium text-gray-600">Bills Count</th>
                                        <th className="text-right p-2 font-medium text-gray-600">Avg per Bill</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(summary.discountByDoctor)
                                        .sort(([, a], [, b]) => b.amount - a.amount)
                                        .slice(0, 5)
                                        .map(([doctor, data]) => (
                                            <tr key={doctor} className="border-t">
                                                <td className="p-2">{doctor}</td>
                                                <td className="p-2 text-right">₹{formatCurrency(data.amount)}</td>
                                                <td className="p-2 text-right">{data.count}</td>
                                                <td className="p-2 text-right">₹{formatCurrency(data.amount / data.count)}</td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <Layout>
            <div className="container mx-auto">
                <div className="mb-8">
                    <h1 className="text-xl font-bold text-gray-800 mb-2">Discount Report</h1>
                    <p className="text-sm text-gray-600">Analyze discount patterns and financial impact across all bills</p>
                </div>

                {/* Controls Section */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm border">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="text-gray-500" size={20} />
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="border border-gray-300 p-2 text-xs rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="From Date"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="text-gray-500" size={20} />
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="border border-gray-300 p-2 text-xs rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="To Date"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <select
                                value={discountTypeFilter}
                                onChange={(e) => setDiscountTypeFilter(e.target.value)}
                                className="border border-gray-300 p-2 text-xs rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Discount Types</option>
                                <option value="percent">Percentage</option>
                                <option value="amount">Amount</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <select
                                value={doctorFilter}
                                onChange={(e) => setDoctorFilter(e.target.value)}
                                className="border border-gray-300 p-2 text-xs rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Doctors</option>
                                {uniqueDoctors.map(doctor => (
                                    <option key={doctor._id} value={doctor._id}>
                                        {doctor.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="border border-gray-300 p-2 text-xs rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="paid">Paid</option>
                                <option value="partial">Partial</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={refreshData}
                            disabled={loading}
                            className="flex items-center text-xs gap-2 px-4 py-2 border rounded-md transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                            <span>Refresh</span>
                        </button>
                        <button
                            onClick={handleExport}
                            disabled={!filteredDiscounts.length || loading}
                            className="flex items-center text-xs gap-2 px-4 py-2 bg-blue-600 text-white rounded-md transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FileText size={16} />
                            <span>Export PDF Report</span>
                        </button>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-red-500" />
                            <p className="text-red-800 text-sm">
                                Error loading discount data: {error.message || 'Please try refreshing the page'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Show details only when date range is selected */}
                {dateFrom && dateTo ? (
                    <>
                        {/* Summary Cards */}
                        <SummaryCards />



                        {/* Discount Details Table */}
                        <div className="bg-white rounded-lg shadow-sm border">
                            <div className="p-6">
                                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                                    Discount Details ({dayjs(dateFrom).format('DD-MM-YYYY')} to {dayjs(dateTo).format('DD-MM-YYYY')})
                                </h2>
                                <div className="overflow-x-auto">
                                    <DataTable
                                        columns={columns}
                                        data={filteredDiscounts}
                                        pagination
                                        highlightOnHover
                                        responsive
                                        progressPending={loading}
                                        progressComponent={
                                            <div className="flex items-center justify-center p-6">
                                                <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
                                            </div>
                                        }
                                        noDataComponent={
                                            <div className="text-center py-8 text-gray-500">
                                                <TrendingDown className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                                                <p>No discount records found for the selected criteria</p>
                                                <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or date range</p>
                                            </div>
                                        }
                                        paginationPerPage={25}
                                        paginationRowsPerPageOptions={[10, 25, 50, 100]}
                                        customStyles={{
                                            headRow: {
                                                style: {
                                                    backgroundColor: '#f8fafc',
                                                    fontSize: '0.820rem',
                                                    color: '#475569',
                                                    fontWeight: '500',
                                                    minHeight: '50px',
                                                },
                                            },
                                            headCells: {
                                                style: {
                                                    whiteSpace: 'normal',
                                                    wordWrap: 'break-word',
                                                    paddingTop: '12px',
                                                    paddingBottom: '12px',
                                                },
                                            },
                                            rows: {
                                                style: {
                                                    fontSize: '0.775rem',
                                                    color: '#1e293b',
                                                    minHeight: '60px',
                                                },
                                            },
                                            cells: {
                                                style: {
                                                    whiteSpace: 'normal',
                                                    wordWrap: 'break-word',
                                                    paddingTop: '8px',
                                                    paddingBottom: '8px',
                                                },
                                            },
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    /* Date Selection Prompt */
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="p-12 text-center">
                            <TrendingDown className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">Select Date Range</h3>
                            <p className="text-gray-500 mb-4">
                                Please select both From Date and To Date to view the discount report details.
                            </p>
                            <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} />
                                    <span>From Date</span>
                                </div>
                                <span>→</span>
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} />
                                    <span>To Date</span>
                                </div>
                            </div>
                            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                <p className="text-blue-700 text-sm">
                                    💡 <strong>Tip:</strong> Select a date range to analyze discount patterns, track financial impact, and generate detailed reports for the specified period.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                {/* Detailed Summary */}
                <DetailedSummaryTable />
            </div>
        </Layout>
    );
};

export default DiscountReport;