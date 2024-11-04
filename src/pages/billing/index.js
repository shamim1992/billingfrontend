import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, Pen, Plus } from 'lucide-react';
import Layout from '@/components/Layout';
import { fetchBillings } from '@/redux/actions/billingActions';
import Link from 'next/link';
import PDFDownloadButton from './PDFDownloadButton';

const BillingTable = () => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const { billings, loading } = useSelector((state) => state.billing);

  useEffect(() => {
    dispatch(fetchBillings());
  }, [dispatch]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'paid':
        return 'text-success';
      case 'pending':
        return 'text-error';
      case 'partial':
        return 'text-warning';
      default:
        return '';
    }
  };

  const filteredBills = billings?.filter(bill => {
    // Check if the patient name exists and matches search query
    const patientName = `${bill.patientId?.firstName || ''} ${bill.patientId?.lastName || ''}`.toLowerCase();
    const billId = bill._id?.toLowerCase() || '';
    const searchTerm = searchQuery.toLowerCase();

    const matchesSearch = patientName.includes(searchTerm) || billId.includes(searchTerm);

    // Check status filter
    const matchesStatus = filterStatus === 'all' || bill.remarks?.toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <Layout>
      <div className="bg-base-100">
        <div className="">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-xl">Bills</h2>
            <div className="flex flex-col sm:flex-row gap-2 justify-between">
              <div className="form-control">
                <input
                  type="text"
                  placeholder="Search bills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input input-bordered input-sm w-full max-w-xs"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="select select-bordered select-sm w-full max-w-xs"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
              </select>
              <Link
                href="/billing/addbilling"
                className="flex items-center justify-center border px-4 rounded-lg text-xs font-semibold hover:shadow"
              >
                <Plus size={16}/> Billing
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Bill No</th>
                  <th>Date</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Amount</th>
                  <th>Paid</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody className=''>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="text-center">
                      <span className="loading loading-spinner loading-md"></span>
                    </td>
                  </tr>
                ) : filteredBills?.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center">No bills found</td>
                  </tr>
                ) : (
                  filteredBills?.map((bill) => (
                    <tr key={bill._id} className='text-xs'>
                      <td className="text-xs">{bill._id}</td>
                      <td className="text-xs">
                        {new Date(bill.createdAt).toLocaleDateString()}
                      </td>
                      <td className="text-xs">{bill.patientId.firstName} {bill.patientId.lastName}</td>
                      <td className="text-xs">{bill.doctorId.name}</td>
                      <td className="text-xs">₹{bill.totals.grandTotal}</td>
                      <td className="text-xs">₹{bill.payment.paid}</td>
                      <td className="text-xs">₹{bill.totals.balance}</td>
                      <td>
                        <span className={getStatusBadgeClass(bill.remarks)}>
                          {bill.remarks}
                        </span>
                      </td>
                      <td>
                        <div className="flex justify-center items-center gap-3">
                          <Link href={'/billing/' + bill._id}
                            className="tooltip text-green-500"
                            data-tip="View Bill"
                          >
                            <Eye size={16} />
                          </Link>
                          <PDFDownloadButton bill={bill} />
                          <Link href={'/billing/update/' + bill._id}
                            className="tooltip text-blue-500"
                            data-tip="Edit Bill"
                          >
                            <Pen size={16} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mt-4">
            <div className="join">
              <button className="join-item btn btn-sm">«</button>
              <button className="join-item btn btn-sm">Page 1</button>
              <button className="join-item btn btn-sm">»</button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BillingTable;