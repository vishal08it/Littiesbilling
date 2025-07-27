'use client';
import React from 'react';

const BillPrintPopup = ({ show, onClose, billData }) => {
  if (!show) return null;

  const totalAmount = billData.items.reduce((sum, item) => {
    return sum + item.quantity * item.price;
  }, 0);

  return (
    <div style={styles.overlay}>
      <div style={styles.printContent} id="printArea">
        <div style={styles.title}>🧾 Litties Restaurant</div>
        <div><strong>Cashier Name:</strong> {billData.cashier}</div>
        <div><strong>Customer Name:</strong> {billData.customerName} </div>
        <div><strong>Customer Mobile Number:</strong> ({billData.customerMobile})</div>
        <div style={styles.line}></div>

        {billData.items.map((item, idx) => (
          <div key={idx} style={styles.itemRow}>
            <span>{item.name} x{item.quantity}</span>
            <span>₹{item.quantity * item.price}</span>
          </div>
        ))}

        <div style={styles.line}></div>
        <div style={styles.itemRow}><strong>Total</strong><strong>₹{totalAmount}</strong></div>
        <div style={styles.line}></div>
        <div style={{ textAlign: 'center', marginTop: '5px' }}>🙏 Thank you for visiting!</div>

        <button onClick={() => window.print()} style={styles.printButton}>🖨️ Print</button>
        <button onClick={onClose} style={styles.closeButton}>❌ Close</button>
      </div>
    </div>
  );
};

export default BillPrintPopup;

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 9999,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  printContent: {
    width: '58mm',
    backgroundColor: 'white',
    padding: '10px',
    fontFamily: 'monospace',
    fontSize: '12px',
    lineHeight: '1.4',
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '14px',
    marginBottom: '10px',
  },
  line: {
    borderTop: '1px dashed #000',
    margin: '5px 0',
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  printButton: {
    marginTop: '10px',
    padding: '6px',
    width: '100%',
    background: 'green',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
  },
  closeButton: {
    marginTop: '5px',
    padding: '6px',
    width: '100%',
    background: 'red',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
  },
};
