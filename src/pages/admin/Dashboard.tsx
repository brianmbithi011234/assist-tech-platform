
import { BarChart3, Package, ShoppingCart, Settings, Users, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';

const AdminDashboard = () => {
  const { isAdmin } = useAuth();

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

  const stats = [
    {
      title: 'Total Orders',
      value: '156',
      change: '+12%',
      icon: ShoppingCart,
      color: 'text-blue-600'
    },
    {
      title: 'Products in Stock',
      value: '89',
      change: '-3%',
      icon: Package,
      color: 'text-green-600'
    },
    {
      title: 'Service Requests',
      value: '42',
      change: '+8%',
      icon: Settings,
      color: 'text-orange-600'
    },
    {
      title: 'Active Users',
      value: '1,234',
      change: '+18%',
      icon: Users,
      color: 'text-purple-600'
    }
  ];

  const recentOrders = [
    { id: 'ORD-123456', customer: 'John Doe', amount: '$2,499', status: 'processing' },
    { id: 'ORD-123457', customer: 'Jane Smith', amount: '$999', status: 'shipped' },
    { id: 'ORD-123458', customer: 'Bob Johnson', amount: '$1,299', status: 'delivered' },
  ];

  const recentServices = [
    { id: 'SRV-789012', customer: 'Alice Brown', device: 'MacBook Pro', status: 'in-progress' },
    { id: 'SRV-789013', customer: 'Charlie Wilson', device: 'iPhone 14', status: 'completed' },
    { id: 'SRV-789014', customer: 'Diana Miller', device: 'iPad Pro', status: 'received' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'shipped':
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
      case 'received':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Overview of your business operations</p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/admin/sales"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <TrendingUp className="h-4 w-4" />
                Sales Report
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-gray-600">
                  <span className={stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                    {stat.change}
                  </span>
                  {' '}from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Recent Orders
              </CardTitle>
              <CardDescription>Latest customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="font-medium">{order.id}</p>
                      <p className="text-sm text-gray-600">{order.customer}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{order.amount}</p>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Recent Service Requests
              </CardTitle>
              <CardDescription>Latest service requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentServices.map((service) => (
                  <div key={service.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="font-medium">{service.id}</p>
                      <p className="text-sm text-gray-600">{service.customer}</p>
                      <p className="text-sm text-gray-500">{service.device}</p>
                    </div>
                    <div>
                      <Badge className={getStatusColor(service.status)}>
                        {service.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
