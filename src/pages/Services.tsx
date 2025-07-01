
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
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const Services = () => {
  const [formData, setFormData] = useState({
    deviceType: '',
    deviceModel: '',
    serialNumber: '',
    issueDescription: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to submit a service request.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
    try {
      // Generate a service number
      const serviceNumber = 'SRV-' + Date.now().toString().slice(-6);
      
      const { error } = await supabase
        .from('service_requests')
        .insert({
          user_id: user.id,
          service_number: serviceNumber,
          device_type: formData.deviceType,
          device_model: formData.deviceModel,
          serial_number: formData.serialNumber || null,
          issue_description: formData.issueDescription,
          status: 'received'
        });

      if (error) throw error;

      toast({
        title: 'Service Request Submitted',
        description: `Your service request has been submitted. Tracking number: ${serviceNumber}`,
      });

      // Reset form
      setFormData({
        deviceType: '',
        deviceModel: '',
        serialNumber: '',
        issueDescription: '',
      });
    } catch (error) {
      console.error('Error submitting service request:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit service request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
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
              {!user && (
                <span className="block mt-2 text-orange-600 font-medium">
                  Please log in to submit a service request
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="device-type">Device Type</Label>
                  <Select 
                    value={formData.deviceType} 
                    onValueChange={(value) => handleInputChange('deviceType', value)}
                    disabled={!user}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select device type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="laptop">Laptop</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="tablet">Tablet</SelectItem>
                      <SelectItem value="desktop">Desktop</SelectItem>
                      <SelectItem value="smart_speaker">Smart Speaker</SelectItem>
                      <SelectItem value="television">Television</SelectItem>
                      <SelectItem value="game_console">Game Console</SelectItem>
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
                    disabled={!user}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="serial-number">Serial Number (Optional)</Label>
                  <Input
                    id="serial-number"
                    value={formData.serialNumber}
                    onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                    placeholder="Serial number if available"
                    disabled={!user}
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
                  disabled={!user}
                />
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full" 
                disabled={!user || loading}
              >
                {loading ? 'Submitting...' : 'Submit Service Request'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Services;
