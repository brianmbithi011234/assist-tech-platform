
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download, Home } from 'lucide-react';
import Layout from '@/components/Layout';
import { toast } from 'sonner';
import { formatKES } from '@/utils/currency';

interface ReceiptData {
  receipt_number: string;
  receipt_data: {
    order_id: string;
    items: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
    }>;
    total: number;
    currency: string;
    payment_method: string;
    customer: {
      name: string;
      email: string;
    };
    timestamp: string;
  };
  created_at: string;
}

const Receipt = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);

  const { receiptId, orderNumber, isDemo } = location.state || {};

  useEffect(() => {
    if (!receiptId) {
      toast.error('Receipt not found');
      navigate('/');
      return;
    }

    fetchReceipt();
  }, [receiptId]);

  const fetchReceipt = async () => {
    try {
      console.log('Fetching demo receipt with ID:', receiptId);
      
      // Get receipts from localStorage for demo purposes
      const demoReceipts = JSON.parse(localStorage.getItem('demoReceipts') || '[]');
      const foundReceipt = demoReceipts.find((r: any) => r.id === receiptId);

      if (!foundReceipt) {
        console.error('No demo receipt found with ID:', receiptId);
        throw new Error('Receipt not found');
      }
      
      console.log('Demo receipt data fetched:', foundReceipt);
      
      // Transform the data to match our interface
      const transformedReceipt: ReceiptData = {
        receipt_number: foundReceipt.receipt_number,
        receipt_data: foundReceipt.receipt_data,
        created_at: foundReceipt.created_at
      };
      
      console.log('Transformed receipt:', transformedReceipt);
      setReceipt(transformedReceipt);
    } catch (error) {
      console.error('Error fetching demo receipt:', error);
      toast.error('Failed to load receipt. This is a demo system.');
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = () => {
    if (!receipt) return;

    const receiptContent = `
BETMO ENTERPRISES
Official Receipt (DEMO)

Receipt Number: ${receipt.receipt_number}
Date: ${new Date(receipt.created_at).toLocaleDateString()}
Time: ${new Date(receipt.created_at).toLocaleTimeString()}

Customer Details:
Name: ${receipt.receipt_data.customer.name}
Email: ${receipt.receipt_data.customer.email}

Order Details:
${receipt.receipt_data.items.map(item => 
  `${item.name} x${item.quantity} - ${formatKES(item.price * item.quantity)}`
).join('\n')}

Payment Method: ${receipt.receipt_data.payment_method}
Total Amount: ${formatKES(receipt.receipt_data.total)}

This is a demo transaction - no real payment was processed.
Thank you for testing our system!
    `.trim();

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `demo-receipt-${receipt.receipt_number}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading receipt...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!receipt) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Demo Receipt not found</h2>
            <p className="text-gray-600 mb-8">We couldn't find the demo receipt you're looking for.</p>
            <div className="space-x-4">
              <Button onClick={fetchReceipt} variant="outline">
                Try Again
              </Button>
              <Button onClick={() => navigate('/')}>
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Demo Payment Successful!</h1>
          <p className="text-gray-600">Your demo order has been processed successfully.</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4 inline-block">
            <p className="text-sm text-blue-700">
              This is a demo transaction - no real payment was processed.
            </p>
          </div>
        </div>

        {/* Receipt */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center bg-blue-50">
            <CardTitle className="text-2xl">BETMO ENTERPRISES</CardTitle>
            <p className="text-sm text-gray-600">Official Demo Receipt</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Receipt Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold">Receipt Number:</p>
                  <p>{receipt.receipt_number}</p>
                </div>
                <div>
                  <p className="font-semibold">Date:</p>
                  <p>{new Date(receipt.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Customer Details */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Customer Details</h3>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Name:</span> {receipt.receipt_data.customer.name}</p>
                  <p><span className="font-medium">Email:</span> {receipt.receipt_data.customer.email}</p>
                </div>
              </div>

              {/* Order Items */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-4">Order Details</h3>
                <div className="space-y-2">
                  {receipt.receipt_data.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-medium">{formatKES(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Payment Method:</span>
                  <span>{receipt.receipt_data.payment_method}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Amount:</span>
                  <span>{formatKES(receipt.receipt_data.total)}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t pt-4 text-center text-sm text-gray-600">
                <p className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-2">
                  This is a demo transaction - no real payment was processed.
                </p>
                <p>Thank you for testing our system!</p>
                <p>For any inquiries, please contact our customer service.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-8">
          <Button onClick={downloadReceipt} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Receipt
          </Button>
          <Button onClick={() => navigate('/')}>
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Receipt;
