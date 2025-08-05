import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBillings } from '@/redux/actions/billingActions';
import Layout from '@/components/Layout';
import DataTable from 'react-data-table-component';
import { Download, EyeIcon } from 'lucide-react';
import dayjs from 'dayjs';
import Link from 'next/link';

const ConsultationFeeReport = () => {
  const dispatch = useDispatch();
  const { billings, loading } = useSelector((state) => state.billing);

  // State
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');

  const [filteredBills, setFilteredBills] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [summary, setSummary] = useState({
    cash: 0,
    card: 0,
    upi: 0,
    neft: 0,
    totalConsultationFees: 0,
    totalTDS: 0,
    netConsultationFees: 0,
    billCount: 0,
    averageFee: 0,
    averageNetFee: 0
  });

  // Initial data fetch
  useEffect(() => {
    dispatch(fetchBillings());
  }, [dispatch]);

  // Calculate summary for consultation fees only with TDS
  const calculateSummary = (bills) => {
    const newSummary = bills.reduce((acc, bill) => {
      const consultationItem = bill.billingItems?.find(
        item => item.name.toLowerCase().includes('consultation fee')
      );
      
      if (consultationItem) {
        const consultationFee = parseFloat(consultationItem.total) || 0;
        const tdsAmount = consultationFee * 0.10; // 10% TDS
        const netFee = consultationFee - tdsAmount;
        const paymentType = bill.payment?.type?.toLowerCase() || 'cash';
        
        // Count net amount for payment types (after TDS deduction)
        acc[paymentType] += netFee;
        acc.totalConsultationFees += consultationFee;
        acc.totalTDS += tdsAmount;
        acc.netConsultationFees += netFee;
      }

      return acc;
    }, {
      cash: 0,
      card: 0,
      upi: 0,
      neft: 0,
      totalConsultationFees: 0,
      totalTDS: 0,
      netConsultationFees: 0,
      billCount: bills.length,
      averageFee: 0,
      averageNetFee: 0
    });

    // Calculate averages
    if (newSummary.billCount > 0) {
      newSummary.averageFee = newSummary.totalConsultationFees / newSummary.billCount;
      newSummary.averageNetFee = newSummary.netConsultationFees / newSummary.billCount;
    }

    setSummary(newSummary);
  };

  // Filter handling - only bills with consultation fees
  useEffect(() => {
    if (billings?.length) {
      let filtered = [...billings];

      // First filter: Only bills with consultation fees
      filtered = filtered.filter(bill => {
        const consultationItem = bill.billingItems?.find(
          item => item.name.toLowerCase().includes('consultation fee')
        );
        return consultationItem && consultationItem.total > 0;
      });

      // Date filter
      if (dateFrom && dateTo) {
        filtered = filtered.filter(bill => {
          const billDate = dayjs(bill.date);
          return billDate.isAfter(dayjs(dateFrom)) && 
                 billDate.isBefore(dayjs(dateTo).add(1, 'day'));
        });
      }

      // Doctor filter
      if (selectedDoctor) {
        filtered = filtered.filter(bill => bill.doctorId?._id === selectedDoctor);
      }

      // Search filter
      if (searchQuery) {
        const search = searchQuery.toLowerCase();
        filtered = filtered.filter(bill => 
          bill._id?.toLowerCase().includes(search) ||
          bill.receiptNumber?.toLowerCase().includes(search) ||
          `${bill.patientId?.firstName} ${bill.patientId?.lastName}`.toLowerCase().includes(search) ||
          bill.doctorId?.name?.toLowerCase().includes(search)
        );
      }

      setFilteredBills(filtered);
      calculateSummary(filtered);
    }
  }, [billings, dateFrom, dateTo, selectedDoctor, searchQuery]);

  // Currency formatter
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  // PDF Export Function - Doctor-wise Summary Format
// PDF Export Function - Doctor-wise Summary Format
  const handleSummaryExport = () => {
    // Group data by doctor and consultation type
    const doctorSummary = {};
    
    filteredBills.forEach(bill => {
      const doctorName = bill.doctorId?.name || 'Unknown Doctor';
      const consultationItem = bill.billingItems?.find(
        item => item.name.toLowerCase().includes('consultation fee')
      );
      
      if (consultationItem) {
        const itemName = consultationItem.name;
        const grossFee = parseFloat(consultationItem.total) || 0;
        
        if (!doctorSummary[doctorName]) {
          doctorSummary[doctorName] = {};
        }
        
        if (!doctorSummary[doctorName][itemName]) {
          doctorSummary[doctorName][itemName] = {
            patients: 0,
            amount: 0
          };
        }
        
        doctorSummary[doctorName][itemName].patients += 1;
        doctorSummary[doctorName][itemName].amount += grossFee;
      }
    });

    // Get selected doctor name
    const selectedDoctorName = selectedDoctor ? 
      getUniqueDoctors().find(d => d._id === selectedDoctor)?.name : null;

    const printWindow = window.open('', '_blank');
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Summary Report - ${dayjs().format('DD-MM-YYYY')}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px; 
              margin: 0;
              font-size: 12px;
            }
            .clinic-header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #000;
            }
            .clinic-name {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 5px;
              color: #000;
            }
            .clinic-address {
              font-size: 14px;
              margin-bottom: 3px;
              color: #333;
            }
            .clinic-contact {
              font-size: 14px;
              margin-bottom: 15px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 15px;
              border-bottom: 1px solid #ccc;
            }
            .report-title { 
              font-size: 16px; 
              font-weight: bold; 
              margin-bottom: 5px; 
            }
            .doctor-info {
              font-size: 14px;
              font-weight: bold;
              color: #2563eb;
              margin-top: 10px;
              padding: 10px;
              background-color: #f0f9ff;
              border: 1px solid #2563eb;
              border-radius: 4px;
            }
            .date-range {
              font-size: 12px;
              color: #666;
              margin-top: 5px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 20px; 
            }
            th, td { 
              border: 1px solid #000; 
              padding: 8px; 
              text-align: left; 
              vertical-align: top;
            }
            th { 
              background-color: #f0f0f0; 
              font-weight: bold;
              text-align: center;
            }
            .doctor-name {
              font-weight: bold;
            }
            .item-row {
              padding-left: 20px;
            }
            .total-row {
              font-weight: bold;
              background-color: #f9f9f9;
            }
            .amount-cell {
              text-align: right;
            }
            .patients-cell {
              text-align: center;
            }
            @media print {
              .no-print { display: none; }
              body { font-size: 11px; }
            }
          </style>
        </head>
        <body>
          <div class="clinic-header">
            <div class="clinic-name">CHANRE VEENA RHEUMATOLOGY & IMMUNOLOGY CENTER</div>
            <div class="clinic-address">#531/B, 19th Main, HSR 3rd Sector, Bengaluru-102</div>
            <div class="clinic-contact">PH- 080-44214500, Email: infochanreveena@chanrericr.com</div>
          </div>
          
          <div class="header">
            <div class="report-title">Summary Report</div>
            <div class="date-range">
              From ${dateFrom ? dayjs(dateFrom).format('DD-MM-YYYY') : 'Start'} to ${dateTo ? dayjs(dateTo).format('DD-MM-YYYY') : dayjs().format('DD-MM-YYYY')}
            </div>
            ${selectedDoctorName ? `
              <div class="doctor-info">
                Doctor: ${selectedDoctorName}
              </div>
            ` : ''}
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 8%">S No.</th>
                <th style="width: 25%">Doctor</th>
                <th style="width: 35%">Item Name</th>
                <th style="width: 12%">Patients</th>
                <th style="width: 20%">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(doctorSummary).map(([doctorName, items], doctorIndex) => {
                let doctorTotal = 0;
                let doctorPatients = 0;
                
                const doctorRows = Object.entries(items).map(([itemName, data], itemIndex) => {
                  doctorTotal += data.amount;
                  doctorPatients += data.patients;
                  
                  return `
                    <tr>
                      ${itemIndex === 0 ? `<td rowspan="${Object.keys(items).length + 3}" class="doctor-name">${doctorIndex + 1}</td>` : ''}
                      ${itemIndex === 0 ? `<td rowspan="${Object.keys(items).length + 3}" class="doctor-name">${doctorName}</td>` : ''}
                      <td class="item-row">${itemName}</td>
                      <td class="patients-cell">${data.patients}</td>
                      <td class="amount-cell">${formatCurrency(data.amount)}</td>
                    </tr>
                  `;
                }).join('');

                const tdsAmount = doctorTotal * 0.10;
                const netTotal = doctorTotal - tdsAmount;

                return `
                  ${doctorRows}
                  <tr class="total-row">
                    <td><strong>Grand Total</strong></td>
                    <td class="patients-cell"><strong>${doctorPatients}</strong></td>
                    <td class="amount-cell"><strong>${formatCurrency(doctorTotal)}</strong></td>
                  </tr>
                  <tr class="total-row">
                    <td><strong>TDS (10%)</strong></td>
                    <td class="patients-cell">-</td>
                    <td class="amount-cell"><strong>(-)${formatCurrency(tdsAmount)}</strong></td>
                  </tr>
                  <tr class="total-row">
                    <td><strong>Net Total</strong></td>
                    <td class="patients-cell"><strong>${doctorPatients}</strong></td>
                    <td class="amount-cell"><strong>${formatCurrency(netTotal)}</strong></td>
                  </tr>
                `;
              }).join('')}
              
              ${Object.keys(doctorSummary).length > 1 ? `
                <tr style="background-color: #e0e0e0; font-weight: bold;">
                  <td colspan="2"><strong>OVERALL TOTAL</strong></td>
                  <td><strong>All Items</strong></td>
                  <td class="patients-cell"><strong>${summary.billCount}</strong></td>
                  <td class="amount-cell"><strong>${formatCurrency(summary.totalConsultationFees)}</strong></td>
                </tr>
                <tr style="background-color: #e0e0e0; font-weight: bold;">
                  <td colspan="3"><strong>OVERALL TDS (10%)</strong></td>
                  <td class="patients-cell">-</td>
                  <td class="amount-cell"><strong>(-)${formatCurrency(summary.totalTDS)}</strong></td>
                </tr>
                <tr style="background-color: #e0e0e0; font-weight: bold;">
                  <td colspan="3"><strong>OVERALL NET TOTAL</strong></td>
                  <td class="patients-cell"><strong>${summary.billCount}</strong></td>
                  <td class="amount-cell"><strong>${formatCurrency(summary.netConsultationFees)}</strong></td>
                </tr>
              ` : ''}
            </tbody>
          </table>
          
          <button class="no-print" onclick="window.print();" 
            style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 20px;">
            Print PDF
          </button>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // PDF Export Function - Detailed Report
  const handleDetailedExport = () => {
    // Get selected doctor name
    const selectedDoctorName = selectedDoctor ? 
      getUniqueDoctors().find(d => d._id === selectedDoctor)?.name : null;

    const printWindow = window.open('', '_blank');
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Detailed Consultation Fee Report - ${dayjs().format('DD-MM-YYYY')}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px; 
              margin: 0;
            }
            .clinic-header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #000;
            }
            .clinic-name {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 5px;
              color: #000;
            }
            .clinic-address {
              font-size: 14px;
              margin-bottom: 3px;
              color: #333;
            }
            .clinic-contact {
              font-size: 14px;
              margin-bottom: 15px;
              color: #333;
            }
            .doctor-info {
              font-size: 14px;
              font-weight: bold;
              color: #2563eb;
              margin-top: 10px;
              padding: 10px;
              background-color: #f0f9ff;
              border: 1px solid #2563eb;
              border-radius: 4px;
              text-align: center;
            }
            .filter-info {
              font-size: 12px;
              color: #666;
              margin-top: 5px;
              text-align: center;
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
              padding-bottom: 15px;
              border-bottom: 1px solid #ccc;
              text-align: center;
            }
            .report-title { 
              font-size: 20px; 
              font-weight: bold; 
              margin-bottom: 5px; 
              color: #1a1a1a;
            }
            .report-date {
              font-size: 12px;
              color: #666;
              margin-top: 5px;
            }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="clinic-header">
            <div class="clinic-name">CHANRE VEENA RHEUMATOLOGY & IMMUNOLOGY CENTER</div>
            <div class="clinic-address">#531/B, 19th Main, HSR 3rd Sector, Bengaluru-102</div>
            <div class="clinic-contact">PH- 080-44214500, Email: infochanreveena@chanrericr.com</div>
          </div>
          
          <div class="header">
            <div class="report-title">Detailed Consultation Fee Report (with 10% TDS)</div>
            <div class="report-date">Generated on: ${dayjs().format('DD/MM/YYYY HH:mm')}</div>
            
            ${dateFrom && dateTo ? `
              <div class="filter-info">
                Period: ${dayjs(dateFrom).format('DD/MM/YYYY')} to ${dayjs(dateTo).format('DD/MM/YYYY')}
              </div>
            ` : ''}
            
            ${selectedDoctorName ? `
              <div class="doctor-info">
                Doctor: ${selectedDoctorName}
              </div>
            ` : ''}
          </div>

          <div class="summary-card">
            <div class="summary-title">Consultation Fee Summary (with 10% TDS)</div>
            <table>
              <tr>
                <th>Gross Consultation Fees</th>
                <th>TDS (10%)</th>
                <th>Net Consultation Fees</th>
                <th>Average Gross Fee</th>
                <th>Average Net Fee</th>
                <th>Cash (Net)</th>
                <th>Card (Net)</th>
                <th>UPI (Net)</th>
                <th>NEFT (Net)</th>
                <th>Total Consultations</th>
              </tr>
              <tr>
                <td>${formatCurrency(summary.totalConsultationFees)}</td>
                <td>${formatCurrency(summary.totalTDS)}</td>
                <td>${formatCurrency(summary.netConsultationFees)}</td>
                <td>${formatCurrency(summary.averageFee)}</td>
                <td>${formatCurrency(summary.averageNetFee)}</td>
                <td>${formatCurrency(summary.cash)}</td>
                <td>${formatCurrency(summary.card)}</td>
                <td>${formatCurrency(summary.upi)}</td>
                <td>${formatCurrency(summary.neft)}</td>
                <td>${summary.billCount}</td>
              </tr>
            </table>
          </div>

          <div class="summary-title">Detailed Consultation Fee Records</div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Bill No</th>
              
                <th>Patient</th>
                <th>Consultation Type</th>
                <th>Gross Fee</th>
                <th>TDS (10%)</th>
                <th>Net Fee</th>
                <th>Payment Type</th>
                
              </tr>
            </thead>
            <tbody>
              ${filteredBills.map(bill => {
                const consultationItem = bill.billingItems?.find(
                  item => item.name.toLowerCase().includes('consultation fee')
                );
                const grossFee = consultationItem?.total || 0;
                const tdsAmount = grossFee * 0.10;
                const netFee = grossFee - tdsAmount;
                return `
                  <tr>
                    <td>${dayjs(bill.date).format('DD/MM/YYYY')}</td>
                    <td>${bill.billNumber}</td>
                   
                    <td>${bill.patientId?.firstName} ${bill.patientId?.lastName}</td>
                    <td>${consultationItem?.name || 'N/A'}</td>
                    <td>${formatCurrency(grossFee)}</td>
                    <td>${formatCurrency(tdsAmount)}</td>
                    <td>${formatCurrency(netFee)}</td>
                    <td>${bill.payment?.type?.toUpperCase() || 'N/A'}</td>
                  
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          
          <button class="no-print" onclick="window.print();" 
            style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Print PDF
          </button>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const columns = [
    {
      name: 'S.No.',
      selector: (row, index) => index + 1,
      sortable: true,
      width: '70px'
    },
    {
      name: 'Date',
      selector: row => dayjs(row.date).format('DD/MM/YYYY'),
      sortable: true,
    },
    {
      name: 'Bill No',
      selector: row => row.billNumber,
      sortable: true,
    },
    {
      name: 'Doctor',
      selector: row => row.doctorId?.name,
      sortable: true,
    },
    {
      name: 'Patient',
      selector: row => `${row.patientId?.firstName} ${row.patientId?.lastName}`,
      sortable: true,
    },
    {
      name: 'Gross Consultation Fee',
      selector: row => {
        const consultationItem = row.billingItems?.find(
          item => item.name.toLowerCase().includes('consultation fee')
        );
        return consultationItem?.total || 0;
      },
      format: row => {
        const consultationItem = row.billingItems?.find(
          item => item.name.toLowerCase().includes('consultation fee')
        );
        return formatCurrency(consultationItem?.total || 0);
      },
      sortable: true,
    },
    {
      name: 'TDS (10%)',
      selector: row => {
        const consultationItem = row.billingItems?.find(
          item => item.name.toLowerCase().includes('consultation fee')
        );
        const grossFee = consultationItem?.total || 0;
        return grossFee * 0.10;
      },
      format: row => {
        const consultationItem = row.billingItems?.find(
          item => item.name.toLowerCase().includes('consultation fee')
        );
        const grossFee = consultationItem?.total || 0;
        return formatCurrency(grossFee * 0.10);
      },
      sortable: true,
    },
    {
      name: 'Net Consultation Fee',
      selector: row => {
        const consultationItem = row.billingItems?.find(
          item => item.name.toLowerCase().includes('consultation fee')
        );
        const grossFee = consultationItem?.total || 0;
        return grossFee * 0.90; // Net after 10% TDS
      },
      format: row => {
        const consultationItem = row.billingItems?.find(
          item => item.name.toLowerCase().includes('consultation fee')
        );
        const grossFee = consultationItem?.total || 0;
        return formatCurrency(grossFee * 0.90);
      },
      sortable: true,
    },
    {
      name: 'Payment Type',
      selector: row => row.payment?.type,
      cell: row => (
        <div className={`px-2 py-1 rounded-full text-xs ${
          row.payment?.type?.toLowerCase() === 'cash' ? 'bg-green-100 text-green-800' :
          row.payment?.type?.toLowerCase() === 'card' ? 'bg-blue-100 text-blue-800' :
          row.payment?.type?.toLowerCase() === 'upi' ? 'bg-purple-100 text-purple-800' :
          'bg-orange-100 text-orange-800'
        }`}>
          {row.payment?.type?.toUpperCase() || 'N/A'}
        </div>
      ),
      sortable: true,
    },
    {
      name: 'Status',
      selector: row => row.remarks,
      cell: row => (
        <div className={`px-2 py-1 rounded text-xs ${
          row.remarks === 'paid' ? 'bg-green-100 text-green-800' :
          row.remarks === 'pending' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {row.remarks?.toUpperCase() || 'N/A'}
        </div>
      ),
      sortable: true,
    },
    {
      name: 'Action',
      selector: row => row._id,
      cell: row => (
          <Link
              href={'/billing/' + row._id}
              className="tooltip text-blue-500"
              data-tip="View details"
          >
              <EyeIcon size={16} />
          </Link>
      ),
      sortable: true,
  }
  ];

  // Get unique doctors who have consultation fee bills
  const getUniqueDoctors = () => {
    if (!billings?.length) return [];
    const uniqueDoctors = new Map();
    billings.forEach(billing => {
      const consultationItem = billing.billingItems?.find(
        item => item.name.toLowerCase().includes('consultation fee')
      );
      if (consultationItem && billing.doctorId?._id && billing.doctorId?.name) {
        uniqueDoctors.set(billing.doctorId._id, billing.doctorId);
      }
    });
    return Array.from(uniqueDoctors.values());
  };

  const SummaryCards = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-4 mb-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="text-xs font-semibold text-blue-700">Gross Consultation Fees</div>
        <div className="text-sm font-bold text-blue-900">{formatCurrency(summary.totalConsultationFees)}</div>
      </div>
      <div className="bg-red-50 p-4 rounded-lg">
        <div className="text-xs font-semibold text-red-700">TDS (10%)</div>
        <div className="text-sm font-bold text-red-900">{formatCurrency(summary.totalTDS)}</div>
      </div>
      <div className="bg-green-50 p-4 rounded-lg">
        <div className="text-xs font-semibold text-green-700">Net Consultation Fees</div>
        <div className="text-sm font-bold text-green-900">{formatCurrency(summary.netConsultationFees)}</div>
      </div>
      <div className="bg-purple-50 p-4 rounded-lg">
        <div className="text-xs font-semibold text-purple-700">Avg Net Fee</div>
        <div className="text-sm font-bold text-purple-900">{formatCurrency(summary.averageNetFee)}</div>
      </div>
      <div className="bg-green-50 p-4 rounded-lg">
        <div className="text-xs font-semibold text-green-700">Cash (Net)</div>
        <div className="text-sm font-bold text-green-900">{formatCurrency(summary.cash)}</div>
      </div>
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="text-xs font-semibold text-blue-700">Card (Net)</div>
        <div className="text-sm font-bold text-blue-900">{formatCurrency(summary.card)}</div>
      </div>
      <div className="bg-purple-50 p-4 rounded-lg">
        <div className="text-xs font-semibold text-purple-700">UPI (Net)</div>
        <div className="text-sm font-bold text-purple-900">{formatCurrency(summary.upi)}</div>
      </div>
      <div className="bg-orange-50 p-4 rounded-lg">
        <div className="text-xs font-semibold text-orange-700">NEFT (Net)</div>
        <div className="text-sm font-bold text-orange-900">{formatCurrency(summary.neft)}</div>
      </div>
      <div className="bg-gray-100 p-4 rounded-lg">
        <div className="text-xs font-semibold text-gray-700">Total Consultations</div>
        <div className="text-sm font-bold text-gray-900">{summary.billCount}</div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-lg font-bold">Consultation Fee Report</h1>
          <div className="flex gap-2">
            <button 
              onClick={handleSummaryExport}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg hover:shadow-md border transition-colors bg-green-500 text-white hover:bg-green-600"
            >
              <Download size={16} />
              Summary PDF
            </button>
            <button 
              onClick={handleDetailedExport}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg hover:shadow-md border transition-colors bg-blue-500 text-white hover:bg-blue-600"
            >
              <Download size={16} />
              Detailed PDF
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text">From Date</span>
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="input input-bordered input-sm"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">To Date</span>
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="input input-bordered input-sm"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Select Doctor</span>
            </label>
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="select select-bordered select-sm"
            >
              <option value="">All Doctors</option>
              {getUniqueDoctors().map(doctor => (
                <option key={doctor._id} value={doctor._id}>
                  {doctor.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Search</span>
            </label>
            <input
              type="text"
              placeholder="Search consultations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-bordered input-sm"
            />
          </div>
        </div>

        {/* Summary Cards */}
        {filteredBills.length > 0 && <SummaryCards />}

        {/* DataTable */}
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <DataTable
              columns={columns}
              data={filteredBills}
              pagination
              highlightOnHover
              responsive
              progressPending={loading}
              progressComponent={
                <div className="text-center py-4">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              }
              noDataComponent={
                <div className="text-center py-4">
                  {(dateFrom && dateTo) || selectedDoctor || searchQuery
                    ? "No consultation fees found for the selected filters"
                    : "Please apply filters to view consultation fees"}
                </div>
              }
              paginationPerPage={10}
              paginationRowsPerPageOptions={[10, 25, 50, 100]}
              dense
              customStyles={{
                headRow: {
                  style: {
                    backgroundColor: '#f8fafc',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#475569',
                  },
                },
                rows: {
                  style: {
                    fontSize: '12px',
                    fontWeight: '400',
                    color: '#1e293b',
                  },
                },
                cells: {
                  style: {
                    padding: '4px 4px',
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Expanded Summary Table */}
        {filteredBills.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow">
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-4">Consultation Fee Summary (with 10% TDS)</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 border">Gross Consultation Fees</th>
                      <th className="px-4 py-2 border">TDS (10%)</th>
                      <th className="px-4 py-2 border">Net Consultation Fees</th>
                      <th className="px-4 py-2 border">Average Gross Fee</th>
                      <th className="px-4 py-2 border">Average Net Fee</th>
                      <th className="px-4 py-2 border">Cash (Net)</th>
                      <th className="px-4 py-2 border">Card (Net)</th>
                      <th className="px-4 py-2 border">UPI (Net)</th>
                      <th className="px-4 py-2 border">NEFT (Net)</th>
                      <th className="px-4 py-2 border">Total Consultations</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="text-center">
                      <td className="px-4 py-2 border font-medium text-blue-600">
                        {formatCurrency(summary.totalConsultationFees)}
                      </td>
                      <td className="px-4 py-2 border text-red-600 font-medium">
                        {formatCurrency(summary.totalTDS)}
                      </td>
                      <td className="px-4 py-2 border text-green-600 font-medium">
                        {formatCurrency(summary.netConsultationFees)}
                      </td>
                      <td className="px-4 py-2 border text-purple-600">
                        {formatCurrency(summary.averageFee)}
                      </td>
                      <td className="px-4 py-2 border text-purple-600">
                        {formatCurrency(summary.averageNetFee)}
                      </td>
                      <td className="px-4 py-2 border">{formatCurrency(summary.cash)}</td>
                      <td className="px-4 py-2 border">{formatCurrency(summary.card)}</td>
                      <td className="px-4 py-2 border">{formatCurrency(summary.upi)}</td>
                      <td className="px-4 py-2 border">{formatCurrency(summary.neft)}</td>
                      <td className="px-4 py-2 border font-medium">
                        {summary.billCount}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ConsultationFeeReport;