
import { useState } from 'react';
import { Search, Eye, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';

const AdminServices = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [services, setServices] = useState([
    {
      id: 'SRV-789012',
      customer: 'Alice Brown',
      email: 'alice@example.com',
      phone: '+1234567890',
      deviceType: 'laptop',
      deviceModel: 'MacBook Pro',
      serialNumber: 'MP12345',
      issue: 'Screen flickering and random shutdowns',
      status: 'in-progress',
      date: '2024-01-12',
      notes: 'Diagnosed hardware issue with display connector'
    },
    {
      id: 'SRV-789013',
      customer: 'Charlie Wilson',
      email: 'charlie@example.com',
      phone: '+1234567891',
      deviceType: 'phone',
      deviceModel: 'iPhone 14',
      serialNumber: 'IP98765',
      issue: 'Battery drains quickly, phone gets hot',
      status: 'completed',
      date: '2024-01-10',
      notes: 'Replaced battery and cooling system'
    },
    {
      id: 'SRV-789014',
      customer: 'Diana Miller',
      email: 'diana@example.com',
      phone: '+1234567892',
      deviceType: 'tablet',
      deviceModel: 'iPad Pro',
      serialNumber: 'IP54321',
      issue: 'Touch screen not responding properly',
      status: 'received',
      date: '2024-01-15',
      notes: 'Initial inspection pending'
    }
  ]);

  if (!isAdmin) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600">You need admin privileges to access this page</p>
          </div>
        </div>
      </Layout>
    );
  }

  const filteredServices = services.filter(service => {
    const matchesSearch = service.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.deviceModel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || service.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = (serviceId: string, newStatus: string, notes?: string) => {
    setServices(prev => prev.map(service => 
      service.id === serviceId 
        ? { ...service, status: newStatus, ...(notes && { notes }) }
        : service
    ));
    toast({ title: 'Service status updated successfully' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'received':
        return 'bg-yellow-100 text-yellow-800';
      case 'on-hold':
        return 'bg-orange-100 text-orange-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Service Management</h1>
          <p className="text-gray-600">Track and manage customer service requests</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Service Requests</CardTitle>
                <CardDescription>Manage customer service requests and update statuses</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{service.customer}</p>
                        <p className="text-sm text-gray-600">{service.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{service.deviceModel}</p>
                        <p className="text-sm text-gray-600 capitalize">{service.deviceType}</p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate" title={service.issue}>
                      {service.issue}
                    </TableCell>
                    <TableCell>{service.date}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(service.status)}>
                        {service.status.replace('-', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <ServiceDetailsDialog service={service} onStatusUpdate={handleStatusUpdate} />
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

const ServiceDetailsDialog = ({ service, onStatusUpdate }: any) => {
  const [notes, setNotes] = useState(service.notes || '');
  const [status, setStatus] = useState(service.status);

  const handleUpdate = () => {
    onStatusUpdate(service.id, status, notes);
  };

  return (
    <DialogContent className="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>Service Request Details</DialogTitle>
        <DialogDescription>
          View and manage service request information
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Service ID</p>
            <p className="font-medium">{service.id}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Date</p>
            <p>{service.date}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Customer</p>
            <p className="font-medium">{service.customer}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p>{service.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Phone</p>
            <p>{service.phone}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Device Type</p>
            <p className="capitalize">{service.deviceType}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Device Model</p>
            <p className="font-medium">{service.deviceModel}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Serial Number</p>
            <p>{service.serialNumber}</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500 mb-2">Issue Description</p>
          <div className="p-3 bg-gray-50 rounded-md">
            <p>{service.issue}</p>
          </div>
        </div>

        <div>
          <Label htmlFor="notes">Service Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about the service progress..."
            rows={3}
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            <Label htmlFor="status">Status:</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleUpdate}>
            Update Service
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};

export default AdminServices;
