import React from 'react';
import { IndianRupee, Printer } from 'lucide-react';

const PrintBillComponent = ({ bill }) => {
  const handlePrint = () => {
    const printContent = document.getElementById('printable-bill');
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload(); // Reload to restore React functionality
  };

  return (
    <>
      <button 
        onClick={handlePrint} 
        className=" tooltip" 
        data-tip="Print Bill"
      >
        <Printer size={16} />
      </button>

      <div id="printable-bill" className="hidden">
        <div className="p-8 max-w-4xl mx-auto">
          {/* Header */}
          <div className="mt-10 mb-6">
            <h1 className="text-xl text-center mb-4">Chanre Veena Rheumatology And Immunology Center</h1>
            <div className='text-center text-xs px-6'>
<h3>#531/B, Ground Floor, 19th MAIN, 3rd SECTOR HSR LAYOUT, BANGALORE 560102</h3>
            </div>
            

          </div>

          {/* Bill Info */}
          <div className="flex justify-between mb-6 text-sm">
            <div>
              <p className="text-gray-600 mb-1">Bill To:</p>
              <p className="mb-1">{`${bill.patientId.firstName} ${bill.patientId.lastName}`}</p>
              <p className="mb-1">Patient ID: {bill.patientId.patientId}</p>
              <p>Contact: {bill.patientId.mobileNumber}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Bill Details:</p>
              <p className="mb-1">Bill No: {bill._id}</p>
              <p className="mb-1">Date: {new Date(bill.createdAt).toLocaleDateString()}</p>
              <p>Doctor: {bill.doctorId.name}</p>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full mb-8 text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-2 w-1/2">Name</th>
                <th className="text-right py-2">Quantity</th>
                <th className="text-right py-2">Rate</th>
                <th className="text-right py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {bill.billingItems?.map((item, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-2">{item.name}</td>
                  <td className="text-right py-2">{item.quantity}</td>
                  <td className="text-right py-2">₹{item.price.toFixed(2)}</td>
                  <td className="text-right py-2">₹{item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex flex-col items-end mb-8 text-sm">
            <div className="flex justify-between w-64 mb-1">
              <span>Subtotal:</span>
              <span>₹{bill.totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-64 mb-1">
              <span>Tax:</span>
              <span>₹{bill.totals.totalTax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-64 mb-1 font-bold">
              <span>Total:</span>
              <span>₹{bill.totals.grandTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-64 mb-1 font-bold">
              <span>Discount:</span>
              <span>{bill.discount.type === 'percent' ?  `${bill.discount.value}%` : `₹${bill.discount.value}` || 0 }</span>
            </div>
            <div className="flex justify-between w-64 mb-1">
              <span>Paid:</span>
              <span>₹{bill.payment.paid.toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-64 font-bold">
              <span>Balance:</span>
              <span>₹{bill.totals.balance.toFixed(2)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-600 mt-16">
            Thank you for choosing our services. For any queries, please contact our billing department.
          </div>
        </div>

        <style>{`
          @media print {
            @page {
              size: A4;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .hidden {
              display: block !important;
            }
            button {
              display: none !important;
            }
          }
        `}</style>
      </div>
    </>
  );
};

export default PrintBillComponent;