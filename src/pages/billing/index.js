import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, Download } from 'lucide-react';
import Layout from '@/components/Layout';
import { fetchBillings } from '@/redux/actions/billingActions';
import Link from 'next/link';

const BillingTable = () => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Assuming you have a bills reducer that stores the bills
  const { billings, loading } = useSelector((state) => state.billing);
 

  useEffect(() => {
    // Assuming you have an action to fetch bills
    dispatch(fetchBillings());
  }, [dispatch]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'paid':
        return 'badge badge-success badge-sm';
      case 'pending':
        return 'badge badge-error badge-sm';
      case 'partial':
        return 'badge badge-warning badge-sm';
      default:
        return 'badge badge-ghost badge-sm';
    }
  };

  const filteredBills = billings?.filter(billings => {
    const matchesSearch = 
    billings.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    billings._id?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || billings.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  console.log(filteredBills)

  return (
    <Layout>
      <div className="bg-base-100">
        <div className="">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-xl">Bills</h2>
            <div className="flex flex-col sm:flex-row gap-2 justify-around">
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

              <Link href="/billing/addbilling" className='text-xs border px-2 py-2 '>Add billing</Link>
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
              <tbody>
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
                    <tr key={bill._id}>
                      <td className="text-sm">{bill._id}</td>
                      <td className="text-sm">
                        {new Date(bill.createdAt).toLocaleDateString()}
                      </td>
                      <td className="text-sm">{bill.patientId.firstName} {bill.patientId.lastName}</td>
                      <td className="text-sm">{bill.doctorId.name}</td>
                      <td className="text-sm">₹{bill.totals.grandTotal}</td>
                      <td className="text-sm">₹{bill.payment.paid}</td>
                      <td className="text-sm">₹{bill.totals.balance}</td>
                      <td>
                        <span className={getStatusBadgeClass(bill.remarks)}>
                          {bill.remarks}
                        </span>
                      </td>
                      <td>
                        <div className="flex justify-center gap-2">
                          <button 
                            className="btn btn-ghost btn-xs tooltip" 
                            data-tip="View Bill"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            className="btn btn-ghost btn-xs tooltip" 
                            data-tip="Download Bill"
                          >
                            <Download size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination - Optional */}
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