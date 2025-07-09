// Demo receipt data for testing the receipt viewing functionality
export const createDemoReceipts = () => {
  const demoReceipts = [
    {
      id: "demo-receipt-1",
      order_id: "demo-order-1",
      payment_id: "demo-payment-1",
      receipt_number: "RCP-20250109-001234",
      receipt_data: {
        order_id: "demo-order-1",
        items: [
          { id: "1", name: "Wireless Headphones", price: 2500, quantity: 1 },
          { id: "2", name: "Phone Case", price: 800, quantity: 2 }
        ],
        total: 4100,
        currency: "KES",
        payment_method: "M-Pesa",
        customer: {
          name: "John Doe",
          email: "john.doe@example.com"
        },
        timestamp: "2025-01-09T10:30:00Z"
      },
      created_at: "2025-01-09T10:30:00Z"
    },
    {
      id: "demo-receipt-2",
      order_id: "demo-order-2",
      payment_id: "demo-payment-2",
      receipt_number: "RCP-20250108-005678",
      receipt_data: {
        order_id: "demo-order-2",
        items: [
          { id: "3", name: "Bluetooth Speaker", price: 3200, quantity: 1 }
        ],
        total: 3200,
        currency: "KES",
        payment_method: "Card Payment",
        customer: {
          name: "Jane Smith",
          email: "jane.smith@example.com"
        },
        timestamp: "2025-01-08T14:15:00Z"
      },
      created_at: "2025-01-08T14:15:00Z"
    },
    {
      id: "demo-receipt-3",
      order_id: "demo-order-3",
      payment_id: "demo-payment-3",
      receipt_number: "RCP-20250107-009012",
      receipt_data: {
        order_id: "demo-order-3",
        items: [
          { id: "4", name: "Smart Watch", price: 15000, quantity: 1 },
          { id: "5", name: "Screen Protector", price: 500, quantity: 1 }
        ],
        total: 15500,
        currency: "KES",
        payment_method: "PayPal",
        customer: {
          name: "Mike Johnson",
          email: "mike.johnson@example.com"
        },
        timestamp: "2025-01-07T16:45:00Z"
      },
      created_at: "2025-01-07T16:45:00Z"
    }
  ];

  // Store in localStorage
  localStorage.setItem('demoReceipts', JSON.stringify(demoReceipts));
  console.log('Demo receipts created:', demoReceipts.length, 'receipts');
  
  return demoReceipts;
};

// Initialize demo receipts if none exist
export const initializeDemoReceipts = () => {
  const existing = localStorage.getItem('demoReceipts');
  if (!existing || JSON.parse(existing).length === 0) {
    return createDemoReceipts();
  }
  return JSON.parse(existing);
};