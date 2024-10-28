import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPatients } from '../../redux/actions/patientActions';
import { fetchAppointments } from '../../redux/actions/appointmentActions';
import Layout from '../../components/Layout';
import DataTable from 'react-data-table-component';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { IndianRupeeIcon, ArrowUp, ArrowDown, User, Users, Calendar, Eye } from 'lucide-react';
import dayjs from 'dayjs';
import Link from 'next/link';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const ReportPage = () => {
  const dispatch = useDispatch();
  const { patients } = useSelector((state) => state.patients);
  const { appointments } = useSelector((state) => state.appointments);
  console.log(appointments)

  const [patientStatistics, setPatientStatistics] = useState({
    totalPatients: 0,
    malePatients: 0,
    femalePatients: 0
  });

  const [appointmentTrends, setAppointmentTrends] = useState({
    weekly: [],
    monthly: []
  });

  const [consultationFees, setConsultationFees] = useState({
    daily: { total: 0, max: 0, change: 0 },
    monthly: { total: 0, max: 0, change: 0 },
    yearly: { total: 0, max: 0, change: 0 },
  });

  const [activeTab, setActiveTab] = useState('weekly');

  const columns = [
    {
      name: 'Patient',
      selector: (row) => `${row.patient?.firstName} ${row.patient?.lastName}`,
      sortable: true
    },
    {
      name: 'Doctor',
      selector: (row) => row.doctor.name,
      sortable: true
    },
    {
      name: 'Department',
      selector: (row) => row.department.name,
      sortable: true
    },
    {
      name: 'Date',
      selector: (row) => dayjs(row.date).format('DD/MM/YYYY'),
      sortable: true
    },
  
    {
      name: 'Status',
      selector: (row) => row.paymentStatus,
      cell: (row) => (
        <div className={` ${row.paymentStatus === 'Paid' ? 'text-success' :
            row.paymentStatus === 'PENDING' ? 'badge-warning' :
              'badge-error'
          }`}>
          {row.paymentStatus}
        </div>
      ),
      sortable: true
    },
    {
      name: 'Payment Status',
      selector: (row) => row.paymentStatus,
      cell: (row) => (
        <div className={` ${row.paymentStatus === 'Paid' ? 'text-dark-500' :
            row.paymentStatus === 'PENDING' ? 'badge-warning' :
              'badge-error'
          }`}>
          {row.consultationFee}
        </div>
      ),
      sortable: true
    },
    {
      name: 'Actions',
      selector: (row) => row.paymentStatus,
      cell: (row) => (
        <Link href={`/appointments/${row._id}`} className='text-blue-500'>
         <Eye/>
        </Link>
      ),
      sortable: true
    },
  ];

  useEffect(() => {
    dispatch(fetchPatients());
    dispatch(fetchAppointments());
  }, [dispatch]);

  useEffect(() => {
    if (patients?.length > 0) {
      const malePatients = patients.filter((p) => p.gender === 'male').length;
      const femalePatients = patients.filter((p) => p.gender === 'female').length;

      setPatientStatistics({
        totalPatients: patients.length,
        malePatients,
        femalePatients,
      });
    }
  }, [patients]);

  useEffect(() => {
    if (appointments?.length > 0) {
      calculateConsultationFees();
      calculateAppointmentTrends();
    }
  }, [appointments]);

  const calculateConsultationFees = () => {
    const today = dayjs();
    const yesterday = today.subtract(1, 'day');
    const lastMonth = today.subtract(1, 'month');
    const lastYear = today.subtract(1, 'year');

    let dailyTotal = 0, dailyMax = 0, dailyPrevTotal = 0;
    let monthlyTotal = 0, monthlyMax = 0, monthlyPrevTotal = 0;
    let yearlyTotal = 0, yearlyMax = 0, yearlyPrevTotal = 0;

    appointments.forEach((appointment) => {
      const fee = Number(appointment.consultationFee) || 0;
      const appointmentDate = dayjs(appointment.updatedAt);

      // Daily calculations
      if (appointmentDate.isSame(today, 'day')) {
        dailyTotal += fee;
        dailyMax = Math.max(dailyMax, fee);
      } else if (appointmentDate.isSame(yesterday, 'day')) {
        dailyPrevTotal += fee;
      }

      // Monthly calculations
      if (appointmentDate.isSame(today, 'month')) {
        monthlyTotal += fee;
        monthlyMax = Math.max(monthlyMax, fee);
      } else if (appointmentDate.isSame(lastMonth, 'month')) {
        monthlyPrevTotal += fee;
      }

      // Yearly calculations
      if (appointmentDate.isSame(today, 'year')) {
        yearlyTotal += fee;
        yearlyMax = Math.max(yearlyMax, fee);
      } else if (appointmentDate.isSame(lastYear, 'year')) {
        yearlyPrevTotal += fee;
      }
    });

    const calculateChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    setConsultationFees({
      daily: {
        total: dailyTotal,
        max: dailyMax,
        change: calculateChange(dailyTotal, dailyPrevTotal),
      },
      monthly: {
        total: monthlyTotal,
        max: monthlyMax,
        change: calculateChange(monthlyTotal, monthlyPrevTotal),
      },
      yearly: {
        total: yearlyTotal,
        max: yearlyMax,
        change: calculateChange(yearlyTotal, yearlyPrevTotal),
      },
    });
  };

  const renderChangeIndicator = (change) => {
    // Handle invalid or undefined values
    if (typeof change !== 'number' || isNaN(change)) {
      return null;
    }

    const formattedChange = Math.abs(change).toFixed(1);
    const isPositive = change >= 0;

    return (
      <div className={`flex items-center gap-1 ${isPositive ? 'text-success' : 'text-error'}`}>
        {isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
        <span>{formattedChange}%</span>
      </div>
    );
  };

  // const calculateConsultationFees = () => {
  //   const today = dayjs();
  //   const yesterday = today.subtract(1, 'day');
  //   const lastMonth = today.subtract(1, 'month');
  //   const lastYear = today.subtract(1, 'year');

  //   let dailyTotal = 0, dailyMax = 0, dailyPrevTotal = 0;
  //   let monthlyTotal = 0, monthlyMax = 0, monthlyPrevTotal = 0;
  //   let yearlyTotal = 0, yearlyMax = 0, yearlyPrevTotal = 0;

  //   appointments.forEach((appointment) => {
  //     const fee = appointment.consultationFee || 0;
  //     const appointmentDate = dayjs(appointment.updatedAt);

  //     if (appointmentDate.isSame(today, 'day')) {
  //       dailyTotal += fee;
  //       dailyMax = Math.max(dailyMax, fee);
  //     } else if (appointmentDate.isSame(yesterday, 'day')) {
  //       dailyPrevTotal += fee;
  //     }

  //     if (appointmentDate.isSame(today, 'month')) {
  //       monthlyTotal += fee;
  //       monthlyMax = Math.max(monthlyMax, fee);
  //     } else if (appointmentDate.isSame(lastMonth, 'month')) {
  //       monthlyPrevTotal += fee;
  //     }

  //     if (appointmentDate.isSame(today, 'year')) {
  //       yearlyTotal += fee;
  //       yearlyMax = Math.max(yearlyMax, fee);
  //     } else if (appointmentDate.isSame(lastYear, 'year')) {
  //       yearlyPrevTotal += fee;
  //     }
  //   });

  //   const calculateChange = (current, previous) =>
  //     previous ? ((current - previous) / previous) * 100 : 0;

  //   setConsultationFees({
  //     daily: {
  //       total: dailyTotal,
  //       max: dailyMax,
  //       change: calculateChange(dailyTotal, dailyPrevTotal),
  //     },
  //     monthly: {
  //       total: monthlyTotal,
  //       max: monthlyMax,
  //       change: calculateChange(monthlyTotal, monthlyPrevTotal),
  //     },
  //     yearly: {
  //       total: yearlyTotal,
  //       max: yearlyMax,
  //       change: calculateChange(yearlyTotal, yearlyPrevTotal),
  //     },
  //   });
  // };

  const calculateAppointmentTrends = () => {
    const today = dayjs();

    // Last 7 days
    const weeklyData = Array.from({ length: 7 }, (_, i) => {
      const date = today.subtract(i, 'day');
      const count = appointments.filter(apt =>
        dayjs(apt.date).isSame(date, 'day')
      ).length;
      return {
        date: date.format('DD/MM'),
        count
      };
    }).reverse();

    // Last 30 days
    const monthlyData = Array.from({ length: 30 }, (_, i) => {
      const date = today.subtract(i, 'day');
      const count = appointments.filter(apt =>
        dayjs(apt.date).isSame(date, 'day')
      ).length;
      return {
        date: date.format('DD/MM'),
        count
      };
    }).reverse();

    setAppointmentTrends({
      weekly: weeklyData,
      monthly: monthlyData
    });
  };

  // const renderChangeIndicator = (change) => (
  //   <div className={`flex items-center ${change >= 0 ? 'text-success' : 'text-error'}`}>
  //     {change >= 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
  //     {Math.abs(change.toFixed(2))}%
  //   </div>
  // );

  const patientChartData = {
    labels: ['Total Patients', 'Male Patients', 'Female Patients'],
    datasets: [
      {
        label: 'Patient Statistics',
        data: [
          patientStatistics.totalPatients,
          patientStatistics.malePatients,
          patientStatistics.femalePatients,
        ],
        backgroundColor: ['#3498db', '#2ecc71', '#e74c3c'],
      },
    ],
  };

  const appointmentChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Appointment Trends'
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  const weeklyAppointmentData = {
    labels: appointmentTrends.weekly.map(data => data.date),
    datasets: [
      {
        label: 'Appointments',
        data: appointmentTrends.weekly.map(data => data.count),
        borderColor: '#3498db',
        backgroundColor: 'rgba(52, 152, 219, 0.2)',
        tension: 0.4
      }
    ]
  };

  const monthlyAppointmentData = {
    labels: appointmentTrends.monthly.map(data => data.date),
    datasets: [
      {
        label: 'Appointments',
        data: appointmentTrends.monthly.map(data => data.count),
        borderColor: '#2ecc71',
        backgroundColor: 'rgba(46, 204, 113, 0.2)',
        tension: 0.4
      }
    ]
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-sm font-bold mb-6">Hospital Report</h1>

        {/* Patient Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="stats border">
            <div className="stat">
              <div className="stat-figure text-primary">
                <User size={24} />
              </div>
              <div className="text-sm">Total Patients</div>
              <div className="">{patientStatistics.totalPatients}</div>
            </div>
          </div>

          <div className="stats border">
            <div className="stat">
              <div className="stat-figure text-secondary">
                <Users size={24} />
              </div>
              <div className="text-sm">Male Patients</div>
              <div className="">{patientStatistics.malePatients}</div>
            </div>
          </div>

          <div className="stats border">
            <div className="stat">
              <div className="stat-figure text-accent">
                <Users size={24} />
              </div>
              <div className="text-sm">Female Patients</div>
              <div className="">{patientStatistics.femalePatients}</div>
            </div>
          </div>
        </div>

        {/* Consultation Fee Summary */}


        <h2 className="text-sm font-bold mb-4">Consultation Fee</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="stats border">
            <div className="stat">
              <div className="stat-figure text-success">
               
              </div>
              <div className="text-sm">Today</div>
              <div className=" text-xs flex  items-center py-3"> <IndianRupeeIcon size={14} /> {consultationFees.daily.total.toLocaleString()}</div>
              <div className="stat-desc flex justify-end">
                {renderChangeIndicator(consultationFees.daily.change)}
              </div>
            </div>
          </div>

          <div className="stats border">
            <div className="stat">
            
              <div className="text-sm">This Month</div>
              <div className=" text-xs flex  items-center py-3"> <IndianRupeeIcon size={14} />{consultationFees.monthly.total.toLocaleString()}</div>
              <div className="stat-desc flex justify-end">
                {renderChangeIndicator(consultationFees.monthly.change)}
              </div>
            </div>
          </div>

          <div className="stats border">
            <div className="stat">
              
              <div className="text-sm">This Year</div>
              <div className=" text-xs flex  items-center py-3"> <IndianRupeeIcon size={14} />{consultationFees.yearly.total.toLocaleString()}</div>
              <div className="stat-desc flex justify-end">
                {renderChangeIndicator(consultationFees.yearly.change)}
              </div>
            </div>
          </div>
        </div>


        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="card  border">
            <div className="card-body">
              <h2 className="text-sm font-bold py-3">Patient Distribution</h2>
              <Bar data={patientChartData} />
            </div>
          </div>

          <div className="card  border">
            <div className="card-body">
              <h2 className="text-sm font-bold py-3">Appointment Trends</h2>
              <div className=" mb-4 flex gap-2">
                <a
                  className={`px-4 py-1 text-xs cursor-pointer rounded-2xl text-white ${activeTab === 'weekly' ? 'tab-active bg-blue-600 ' : ''} bg-blue-500`}
                  onClick={() => setActiveTab('weekly')}
                >
                  Last 7 Days
                </a>
                <a
                  className={`px-4 py-1 text-xs cursor-pointer rounded-2xl text-white ${activeTab === 'monthly' ? 'tab-active bg-blue-600' : 'bg-blue-500 '}`}
                  onClick={() => setActiveTab('monthly')}
                >
                  Last 30 Days
                </a>
              </div>
              {activeTab === 'weekly' ? (
                <Line options={appointmentChartOptions} data={weeklyAppointmentData} />
              ) : (
                <Line options={appointmentChartOptions} data={monthlyAppointmentData} />
              )}
            </div>
          </div>
        </div>

        {/* Recent Appointments Table */}
        <div className="card  border">
          <div className="card-body">
            <h2 className="text-sm font-bold mb-4">Recent Appointments</h2>
            <DataTable
              columns={columns}
              data={appointments || []}
              pagination
              highlightOnHover
              className="w-full"
              paginationPerPage={10}
              paginationRowsPerPageOptions={[10, 20, 30, 50]}
              customStyles={{
                headRow: {
                  style: {
                    backgroundColor: 'hsl(var(--b2))',
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ReportPage;