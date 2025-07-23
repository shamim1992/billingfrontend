import React from 'react';
import { Printer } from 'lucide-react';

const PrintBillComponent = ({ bill }) => {
  const handlePrint = () => {
    const printContent = document.getElementById('printable-bill');
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload(); // Reload to restore React functionality
  };

  const calculateDiscountAmount = (bill) => {
    if (!bill.discount) return 0;
    if (bill.discount.type === 'percent') {
      return (bill.totals.subtotal * bill.discount.value) / 100;
    }
    return bill.discount.value;
  };

  const getStatusDisplayText = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'Due';
      case 'paid':
        return 'Paid';
      case 'partial':
        return 'Partial Payment';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status || 'Unknown';
    }
  };

  const billStatus = bill.status || bill.remarks; // Support both new and legacy
  const dueAmount = bill.totals?.dueAmount ?? bill.totals?.balance ?? 0;

  return (
    <>
      <button
        onClick={handlePrint}
        className="inline-flex items-center shadow gap-2 px-4 py-1 text-xs rounded-2xl hover:shadow-md border transition-colors"
        title="Print Bill"
      >
        <Printer size={16} />
        Print
      </button>

      <div id="printable-bill" className="hidden">
        <div className="m-2 p-3 print-container">
          {/* Header */}
          <div className="print-header mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div>
                <img
                  src="https://chanrericr.com/_next/image?url=https%3A%2F%2Fapiphysio.chanrericr.com%2Fuploads%2FprofilePhoto-1740208687310-634539952.jpg&w=256&q=85"
                  alt="Organization Logo"
                  className="w-20 h-20 object-contain"
                />
              </div>
              <div className="flex-1">
                <h1 className="text-xl text-center font-bold">ChanRe Veena Rheumatology and Immunology Center</h1>
                <div className='text-center text-xs font-medium'>
                  <div># 531/B, 19th Main, HSR 3rd Sector, Bengaluru-102 | Phone: 080 44214500 |</div>
                  <div>Mob: 9606957688 Email: infochanreveena@chanrericr.com </div>
                  <div> Website: https://chanreveena.chanrericr.com</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bill Header with Status */}
          <div className="text-center mb-4 print-section">
            <h2 className="text-lg font-bold">MEDICAL BILL</h2>
            <div className="flex justify-center items-center gap-4 mt-2">
              <span className="text-sm">Status: <strong>{getStatusDisplayText(billStatus)}</strong></span>
              {dueAmount > 0 && (
                <span className="text-sm text-red-600">Due: <strong>₹{dueAmount.toFixed(2)}</strong></span>
              )}
            </div>
          </div>

          {/* Bill Info */}
          <div className="flex justify-between mb-4 print-section">
            <div>
              <p className="font-bold mb-2">Bill To:</p>
              <p className="mb-1"><span className="font-bold">Name:</span> {`${bill.patientId.firstName} ${bill.patientId.lastName}`}</p>
              <p className="mb-1"><span className="font-bold">Patient ID:</span> {bill.patientId.patientId}</p>
              <p className="mb-1"><span className="font-bold">Contact:</span> {bill.patientId.mobileNumber}</p>
            </div>
            <div className="text-right">
              <p className="font-bold mb-2">Bill Details:</p>
              <p className="mb-1"><span className="font-bold">Bill Number:</span> {bill.billNumber || bill._id}</p>
              <p className="mb-1"><span className="font-bold">Date:</span> {new Date(bill.createdAt).toLocaleDateString()}</p>
              <p className="mb-1"><span className="font-bold">Doctor:</span> {bill.doctorId.name}</p>
              <p className="mb-1"><span className="font-bold">Payment:</span> {bill.payment?.type?.toUpperCase()}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-4 print-table-container">
            <table className="w-full border-collapse print-table">
              <thead className="print-table-header">
                <tr>
                  <th className="border-2 border-black p-3 text-left font-bold">Service/Product Name</th>
                  <th className="border-2 border-black p-3 text-center font-bold">Qty</th>
                  <th className="border-2 border-black p-3 text-center font-bold">Rate</th>
                  <th className="border-2 border-black p-3 text-center font-bold">Tax</th>
                  <th className="border-2 border-black p-3 text-center font-bold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {bill.billingItems?.map((item, index) => (
                  <tr key={index} className="print-table-row">
                    <td className="border-2 border-black p-1">
                      <div className="font-semibold">{item.name}</div>
                    </td>
                    <td className="border-2 border-black p-1 text-center">{item.quantity}</td>
                    <td className="border-2 border-black p-1 text-center">₹{item.price.toFixed(2)}</td>
                    <td className="border-2 border-black p-1 text-center">₹{item.tax?.toFixed(2) || '0.00'}</td>
                    <td className="border-2 border-black p-1 text-center">₹{item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="print-totals-section">
            <div className="flex justify-end mb-8">
              <div className="text-right space-y-1">
                <div className="flex justify-between min-w-64">
                  <span className="font-bold">Subtotal:</span>
                  <span>₹{bill.totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Tax:</span>
                  <span>₹{bill.totals.totalTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Discount:</span>
                  <span>₹{bill.discount?.type === 'percent' ? calculateDiscountAmount(bill).toFixed(2) : (bill.discount?.value || 0)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Grand Total:</span>
                  <span>₹{bill.totals.grandTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Paid Amount:</span>
                  <span>₹{bill.payment.paid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Due Amount:</span>
                  <span className={dueAmount > 0 ? 'text-red-600' : 'text-green-600'}>
                    ₹{dueAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            {(bill.payment?.cardNumber || bill.payment?.utrNumber) && (
              <div className="mb-6">
                <h4 className="font-bold mb-2">Payment Details:</h4>
                {bill.payment.cardNumber && (
                  <p>Card Number: **** {bill.payment.cardNumber}</p>
                )}
                {bill.payment.utrNumber && (
                  <p>UTR Number: {bill.payment.utrNumber}</p>
                )}
              </div>
            )}

            {/* Important Notes */}
            <div className="mb-6 text-xs">
              <h4 className="font-bold mb-2">Important Notes:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>This is a computer-generated bill and does not require a signature.</li>
                <li>For any queries, please contact us at the above mentioned contact details.</li>
                {dueAmount > 0 && (
                  <li className="text-red-600 font-semibold">Outstanding amount of ₹{dueAmount.toFixed(2)} is pending.</li>
                )}
                <li>Please retain this bill for your records.</li>
              </ul>
            </div>
          </div>

          {/* Footer - Generated By */}
          <div className="print-footer">
            <div className="flex justify-between items-end mt-auto pt-8">
              <div className="text-left">
                <p className="text-xs">Generated on: {new Date().toLocaleString()}</p>
                <p className="text-xs">Bill Number: {bill.billNumber || bill._id}</p>
              </div>
              <div className="text-center">
                <div className="mb-2">
                  <span className="font-bold">Authorized Signatory</span>
                </div>
                <div className="border-b-2 border-black w-48">
                  <span className="text-xs">{bill.createdBy?.name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @media print {
            @page {
              size: A4;
              margin: 0.5cm;
            }
            
            body {
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              color-adjust: exact;
              font-size: 12px;
              line-height: 1.4;
            }
            
            .hidden {
              display: block !important;
            }
            
            button {
              display: none !important;
            }
            
            #printable-bill {
              margin: 0;
              padding: 2px;
              width: 100%;
              height: 100%;
            }
            
            /* Main container with fixed border and outer padding */
            .print-container {
              margin: 2px;
              padding: 1.5rem;
              box-sizing: border-box;
              width: calc(100% - 4px);
              height: calc(100vh - 4px);
              min-height: calc(100vh - 4px);
              border: 2px solid #000000 !important;
              border-style: solid !important;
              border-width: 4px !important;
              border-color: #000000 !important;
              outline: 2px solid #000000 !important;
              background: white;
              position: relative;
            }
            
            /* Ensure border is always visible */
            .print-container::before {
              content: '';
              position: absolute;
              top: -4px;
              left: -4px;
              right: -4px;
              bottom: -4px;
              border: 2px solid #000000 !important;
              pointer-events: none;
              z-index: -1;
            }
            
            /* Header should not break */
            .print-header {
              page-break-inside: avoid;
              page-break-after: auto;
              margin-bottom: 1rem;
            }
            
            /* Bill info section should not break */
            .print-section {
              page-break-inside: avoid;
              margin-bottom: 1rem;
            }
            
            /* Table container */
            .print-table-container {
              page-break-inside: auto;
              margin-bottom: 1rem;
            }
            
            /* Table styling for multi-page */
            .print-table {
              width: 100%;
              border-collapse: collapse !important;
              page-break-inside: auto;
              border-spacing: 0 !important;
            }
            
            /* Table header should repeat on each page */
            .print-table-header {
              display: table-header-group;
              page-break-inside: avoid;
              page-break-after: auto;
            }
            
            /* Table rows should not break */
            .print-table-row {
              page-break-inside: avoid;
              page-break-after: auto;
            }
            
            /* Totals section should stay together */
            .print-totals-section {
              page-break-inside: avoid;
              page-break-before: auto;
              margin-top: 1rem;
            }
            
            /* Footer should stay together and be at the end */
            .print-footer {
              page-break-inside: avoid;
              page-break-before: auto;
              margin-top: 2rem;
            }
            
            /* Enhanced table borders */
            table, th, td {
              border: 2px solid #000000 !important;
              border-style: solid !important;
              border-width: 2px !important;
              border-color: #000000 !important;
              print-color-adjust: exact !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            
            /* Double check table borders */
            .print-table th,
            .print-table td {
              border: 2px solid #000000 !important;
              border-collapse: collapse !important;
            }
            
            /* Ensure table borders don't disappear */
            .print-table {
              outline: 2px solid #000000 !important;
            }
            
            /* Ensure table cells don't overflow */
            td, th {
              word-wrap: break-word;
              max-width: 200px;
              overflow-wrap: break-word;
              padding: 4px !important;
            }
            
            /* Color preservation */
            .text-red-600 {
              color: #dc2626 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            
            .text-green-600 {
              color: #16a34a !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            
            /* Border color preservation */
            .border-black,
            .border-2,
            .border-b-2 {
              border-color: #000000 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            
            /* Prevent orphaned content */
            p, div {
              orphans: 2;
              widows: 2;
            }
            
            /* Improve spacing for readability */
            .space-y-1 > * + * {
              margin-top: 0.25rem;
            }
            
            /* Force all borders to be visible */
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            
            /* Additional border reinforcement */
            .print-container {
              box-shadow: inset 0 0 0 4px #000000 !important;
            }
          }
        `}</style>
      </div>
    </>
  );
};

export default PrintBillComponent;