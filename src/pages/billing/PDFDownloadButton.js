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
    marginTop: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 16,
  },
  companyInfo: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 4,
  },
  billInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
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
    marginBottom: 4,
  },
  table: {
    marginBottom: 32,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 8,
    paddingTop: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 8,
  },
  tableCol: {
    fontSize: 11,
  },
  tableColName: {
    flex: 2,
  },
  tableColRight: {
    flex: 1,
    textAlign: 'right',
  },
  totals: {
    marginLeft: 'auto',
    width: '40%',
    marginBottom: 32,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 11,
  },
  totalValue: {
    fontSize: 11,
    textAlign: 'right',
    width: 80,
  },
  boldText: {
    fontFamily: 'Helvetica-Bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 9,
    color: '#666',
  },
});

const BillPDF = ({ bill }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Chanre Veena Rheumatology And Immunology Center</Text>
        <Text style={styles.companyInfo}># 531/B, 19th Main, HSR 3rd Sector, Bengaluru-102 | Phone : 080 44214500 | Mob: 9606957688</Text>
        <Text style={styles.companyInfo}>Email: infochanreveena@chanrericr.com | Website: https://chanreveena.chanrericr.com</Text>
      </View>

      {/* Bill Info */}
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

      {/* Items Table */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCol, styles.tableColName, styles.boldText]}>Name</Text>
          <Text style={[styles.tableCol, styles.tableColRight, styles.boldText]}>Quantity</Text>
          <Text style={[styles.tableCol, styles.tableColRight, styles.boldText]}>Rate</Text>
          <Text style={[styles.tableCol, styles.tableColRight, styles.boldText]}>Amount</Text>
        </View>
        
        {bill.billingItems?.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCol, styles.tableColName]}>{item.name}</Text>
            <Text style={[styles.tableCol, styles.tableColRight]}>{item.quantity}</Text>
            <Text style={[styles.tableCol, styles.tableColRight]}>{item.price.toFixed(2)}</Text>
            <Text style={[styles.tableCol, styles.tableColRight]}>{item.total.toFixed(2)}</Text>
          </View>
        ))}
      </View>

      {/* Totals */}
      <View style={styles.totals}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal:</Text>
          <Text style={styles.totalValue}>{bill.totals.subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tax:</Text>
          <Text style={styles.totalValue}>{bill.totals.totalTax.toFixed(2)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, styles.boldText]}>Total:</Text>
          <Text style={[styles.totalValue, styles.boldText]}>{bill.totals.grandTotal.toFixed(2)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, styles.boldText]}>Discount:</Text>
          <Text style={[styles.totalValue, styles.boldText]}>
            {bill.discount.type === 'percent' ? `${bill.discount.value}%` : `${bill.discount.value}` || 0}
          </Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Paid:</Text>
          <Text style={styles.totalValue}>{bill.payment.paid.toFixed(2)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, styles.boldText]}>Balance:</Text>
          <Text style={[styles.totalValue, styles.boldText]}>{bill.totals.balance.toFixed(2)}</Text>
        </View>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        Thank you for choosing our services. For any queries, please contact our billing department.
      </Text>
    </Page>
  </Document>
);

const PDFDownloadButton = ({ bill }) => (
  <PDFDownloadLink
    document={<BillPDF bill={bill} />}
    fileName={`bill-${bill._id}.pdf`}
  >
    {({ blob, url, loading, error }) => (
      <button 
        className="tooltip" 
        data-tip="Download Bill"
        disabled={loading}
      >
        <Download size={16} />
      </button>
    )}
  </PDFDownloadLink>
);

export default PDFDownloadButton;