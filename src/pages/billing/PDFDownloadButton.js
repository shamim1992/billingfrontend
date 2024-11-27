import React from 'react';
import { Page, Text, View, Document, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { Download, IndianRupee } from 'lucide-react';

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginTop: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  companyInfo: {
    fontSize: 10,
    marginBottom: 20,
  },
  billInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoColumn: {
    flex: 1,
  },
  label: {
    fontSize: 10,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 11,
    marginBottom: 8,
  },
  table: {
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 5,
    marginBottom: 5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableCol: {
    flex: 1,
    fontSize: 10,
  },
  totals: {
    marginTop: 30,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    marginVertical: 3,
  },
  totalLabel: {
    fontSize: 11,
    marginRight: 50,
  },
  totalValue: {
    fontSize: 11,
    width: 100,
    textAlign: 'right',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#666',
  },
});

// PDF Document component
const BillPDF = ({ bill }) => (


    
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>ChanRe Veena Rheumatology & Immunology Center</Text>
        <Text style={styles.companyInfo}>#531/B, Ground Floor, 19th MAIN, 3rd SECTOR HSR LAYOUT, BANGALORE 560102</Text>
        <Text style={styles.companyInfo}>Contact: +91 9856000000</Text>
        <Text style={styles.companyInfo}>Email: corporaterelation@chanrericr.com</Text>
      </View>

      <View style={styles.billInfo}>
        <View style={styles.infoColumn}>
          <Text style={styles.label}>Bill To:</Text>
          <Text style={styles.value}>{`${bill.patientId.firstName} ${bill.patientId.lastName}`}</Text>
          <Text style={styles.value}>Patient ID: {bill.patientId.patientId}</Text>
          <Text style={styles.value}>Contact: {bill.patientId.mobileNumber}</Text>
        </View>
        <View style={styles.infoColumn}>
          <Text style={styles.label}>Bill Details:</Text>
          <Text style={styles.value}>Bill No: {bill._id}</Text>
          <Text style={styles.value}>Date: {new Date(bill.createdAt).toLocaleDateString()}</Text>
          <Text style={styles.value}>Doctor: {bill.doctorId.name}</Text>
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCol, { flex: 2 }]}>Name</Text>
          <Text style={styles.tableCol}>Quantity</Text>
          <Text style={styles.tableCol}>Rate</Text>
          <Text style={styles.tableCol}>Amount</Text>
        </View>
        
        {/* Add your bill items here */}
       {
        bill.billingItems?.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCol, { flex: 2 }]}>{item.name}</Text>
            <Text style={styles.tableCol}>{item.quantity}</Text>
            <Text style={styles.tableCol}>{item.price}</Text>
            <Text style={styles.tableCol}>{item.total}</Text>
          </View>
        ))}
      </View>

      <View style={styles.totals}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal:</Text>
          <Text style={styles.totalValue}><IndianRupee/> {bill.totals.subtotal}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tax:</Text>
          <Text style={styles.totalValue}><IndianRupee/> {bill.totals.totalTax}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}><IndianRupee/> {bill.totals.grandTotal}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Discount:</Text>
          <Text style={styles.totalValue}><IndianRupee/> {bill.discount.type === 'percent' ?  `${bill.discount.value}%` : `₹${bill.discount.value}` || 0 }</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Paid:</Text>
          <Text style={styles.totalValue}>{bill.payment.paid}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Balance:</Text>
          <Text style={styles.totalValue}><IndianRupee/> {bill.totals.balance}</Text>
        </View>
      </View>

      <Text style={styles.footer}>
        Thank you for choosing our services. For any queries, please contact our billing department.
      </Text>
    </Page>
  </Document>
);

// PDF Download Button component
const PDFDownloadButton = ({ bill }) => (
  <PDFDownloadLink
    document={<BillPDF bill={bill} />}
    fileName={`bill-${bill._id}.pdf`}
  >
    {({ blob, url, loading, error }) => (
      <button 
        className=" text-warning tooltip" 
        data-tip="Download Bill"
        disabled={loading}
      >
        <Download size={16} />
      </button>
    )}
  </PDFDownloadLink>
);

export default PDFDownloadButton;