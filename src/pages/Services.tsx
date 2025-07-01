
import { useState } from 'react';
import { Settings, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';

const Services = () => {
  const [formData, setFormData] = useState({
    deviceType: '',
    deviceModel: '',
    serialNumber: '',
    issueDescription: '',
    customerName: '',
    customerEmail: '',
    customerPhone: ''
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Generate a random tracking number
    const trackingNumber = 'SRV-' + Date.now().toString().slice(-6);
    
    toast({
      title: 'Service Request Submitted',
      description: `Your tracking number is: ${trackingNumber}`,
    });

    // Reset form
    setFormData({
      deviceType: '',
      deviceModel: '',
      serialNumber: '',
      issueDescription: '',
      customerName: '',
      customerEmail: '',
      customerPhone: ''
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const services = [
    {
      icon: Settings,
      title: 'Device Repair',
      description: 'Professional repair services for laptops, phones, and tablets',
      features: ['Hardware diagnostics', 'Component replacement', 'Software troubleshooting']
    },
    {
      icon: Clock,
      title: 'Quick Service',
      description: 'Fast turnaround for urgent repairs and maintenance',
      features: ['Same-day service', 'Express diagnostics', 'Priority support']
    },
    {
      icon: CheckCircle,
      title: 'Warranty Service',
      description: 'Comprehensive warranty and maintenance programs',
      features: ['Extended warranty', 'Regular maintenance', 'Quality guarantee']
    }
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Professional Repair Services
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Expert technicians ready to fix your devices with quality parts and reliable service
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {services.map((service, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <service.icon className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>{service.title}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Service Request Form */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Request a Service</CardTitle>
            <CardDescription>
              Fill out the form below to submit your service request
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="device-type">Device Type</Label>
                  <Select value={formData.deviceType} onValueChange={(value) => handleInputChange('deviceType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select device type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="laptop">Laptop</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="tablet">Tablet</SelectItem>
                      <SelectItem value="desktop">Desktop</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="device-model">Device Model</Label>
                  <Input
                    id="device-model"
                    value={formData.deviceModel}
                    onChange={(e) => handleInputChange('deviceModel', e.target.value)}
                    placeholder="e.g., MacBook Pro 16"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="serial-number">Serial Number (Optional)</Label>
                  <Input
                    id="serial-number"
                    value={formData.serialNumber}
                    onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                    placeholder="Serial number if available"
                  />
                </div>

                <div>
                  <Label htmlFor="customer-name">Your Name</Label>
                  <Input
                    id="customer-name"
                    value={formData.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="customer-email">Email</Label>
                  <Input
                    id="customer-email"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="customer-phone">Phone Number</Label>
                  <Input
                    id="customer-phone"
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="issue-description">Issue Description</Label>
                <Textarea
                  id="issue-description"
                  value={formData.issueDescription}
                  onChange={(e) => handleInputChange('issueDescription', e.target.value)}
                  placeholder="Please describe the issue in detail..."
                  rows={4}
                  required
                />
              </div>

              <Button type="submit" size="lg" className="w-full">
                Submit Service Request
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Services;
