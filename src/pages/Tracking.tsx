
import { useState } from 'react';
import { Search, Package, Clock, CheckCircle, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/Layout';

const Tracking = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingResult, setTrackingResult] = useState<any>(null);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock tracking data
    const mockData = {
      id: trackingNumber,
      type: trackingNumber.startsWith('ORD-') ? 'order' : 'service',
      status: 'in-progress',
      createdAt: '2024-01-15',
      estimatedCompletion: '2024-01-20',
      updates: [
        { date: '2024-01-15', status: 'received', description: 'Request received and logged' },
        { date: '2024-01-16', status: 'processing', description: 'Item being processed' },
        { date: '2024-01-17', status: 'in-progress', description: 'Work in progress' }
      ]
    };

    setTrackingResult(mockData);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'received':
        return <Package className="h-5 w-5" />;
      case 'processing':
        return <Clock className="h-5 w-5" />;
      case 'in-progress':
        return <Clock className="h-5 w-5" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5" />;
      case 'shipped':
        return <Truck className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Track Your Order or Service
          </h1>
          <p className="text-gray-600">
            Enter your tracking number to see the current status
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Enter Tracking Number</CardTitle>
            <CardDescription>
              Your tracking number starts with ORD- for orders or SRV- for service requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTrack} className="space-y-4">
              <div>
                <Label htmlFor="tracking-number">Tracking Number</Label>
                <div className="flex gap-2">
                  <Input
                    id="tracking-number"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g., ORD-123456 or SRV-789012"
                    required
                  />
                  <Button type="submit">
                    <Search className="h-4 w-4 mr-2" />
                    Track
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {trackingResult && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(trackingResult.status)}
                    Tracking: {trackingResult.id}
                  </CardTitle>
                  <CardDescription>
                    {trackingResult.type === 'order' ? 'Product Order' : 'Service Request'}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(trackingResult.status)}>
                  {trackingResult.status.replace('-', ' ').toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Created</Label>
                  <p className="text-sm">{trackingResult.createdAt}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Estimated Completion</Label>
                  <p className="text-sm">{trackingResult.estimatedCompletion}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500 mb-3 block">
                  Status Updates
                </Label>
                <div className="space-y-4">
                  {trackingResult.updates.map((update: any, index: number) => (
                    <div key={index} className="flex gap-4 pb-4 border-b border-gray-100 last:border-b-0">
                      <div className="mt-1">
                        {getStatusIcon(update.status)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 capitalize">
                          {update.status.replace('-', ' ')}
                        </p>
                        <p className="text-sm text-gray-600">{update.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{update.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!trackingResult && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Enter a tracking number above to see status updates</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Tracking;
