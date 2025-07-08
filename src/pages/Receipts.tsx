
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, Search, Download } from 'lucide-react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { formatKES } from '@/utils/currency';

interface Receipt {
  id: string;
  receipt_number: string;
  created_at: string;
  receipt_data: {
    total: number;
    currency: string;
    payment_method: string;
    customer: {
      name: string;
      email: string;
    };
    items: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
    }>;
  };
}

const Receipts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchReceipts();
  }, [user, navigate]);

  const fetchReceipts = async () => {
    try {
      console.log('Fetching demo receipts for user:', user);
      
      // Get receipts from localStorage for demo purposes
      const demoReceipts = JSON.parse(localStorage.getItem('demoReceipts') || '[]');
      
      console.log('Demo receipts found:', demoReceipts);
      
      // Transform the data to match our Receipt interface
      const transformedReceipts: Receipt[] = demoReceipts.map((receipt: any) => ({
        id: receipt.id,
        receipt_number: receipt.receipt_number,
        created_at: receipt.created_at,
        receipt_data: receipt.receipt_data
      }));
      
      setReceipts(transformedReceipts);
    } catch (error) {
      console.error('Error loading demo receipts:', error);
      toast.error('Failed to load receipts');
    } finally {
      setLoading(false);
    }
  };

  const filteredReceipts = receipts.filter(receipt =>
    receipt.receipt_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.receipt_data.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const viewReceipt = (receiptId: string, receiptNumber: string) => {
    navigate('/receipt', {
      state: {
        receiptId: receiptId,
        orderNumber: receiptNumber,
        isDemo: true
      }
    });
  };

  const downloadReceipt = (receipt: Receipt) => {
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
            <p className="text-gray-600">Loading receipts...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Demo Receipts</h1>
          <p className="text-gray-600">View and download your demo purchase receipts</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Receipt History (Demo Mode)</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search receipts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredReceipts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  {receipts.length === 0 ? 'No demo receipts found' : 'No receipts match your search'}
                </p>
                {receipts.length === 0 && (
                  <Button onClick={() => navigate('/products')} variant="outline">
                    Start Shopping (Demo)
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReceipts.map((receipt) => (
                  <div
                    key={receipt.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="font-semibold text-lg">
                            {receipt.receipt_number}
                          </h3>
                          <span className="text-sm text-gray-500">
                            {new Date(receipt.created_at).toLocaleDateString()}
                          </span>
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            DEMO
                          </span>
                        </div>
                        <p className="text-gray-600 mb-1">
                          Customer: {receipt.receipt_data.customer.name}
                        </p>
                        <p className="text-gray-600 mb-2">
                          Items: {receipt.receipt_data.items.length} item(s)
                        </p>
                        <p className="font-semibold text-lg">
                          Total: {formatKES(receipt.receipt_data.total)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => viewReceipt(receipt.id, receipt.receipt_number)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadReceipt(receipt)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Receipts;
