import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Calendar, Loader } from 'lucide-react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { formatKES } from '@/utils/currency';
import { supabase } from '@/integrations/supabase/client';

const SalesReport = () => {
  const { isAdmin } = useAuth();
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [salesStats, setSalesStats] = useState([]);
  const [dailySalesData, setDailySalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

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

  const getDaysFromTimeRange = (range: string) => {
    switch (range) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      case '1y': return 365;
      default: return 7;
    }
  };

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      const days = getDaysFromTimeRange(timeRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      // Fetch orders data
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          created_at,
          user_id,
          order_items (
            quantity,
            total_price,
            product_id,
            products (
              name,
              category
            )
          )
        `)
        .gte('created_at', startDate.toISOString())
        .eq('status', 'completed');

      if (ordersError) throw ordersError;

      // Calculate stats
      const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const totalOrders = orders?.length || 0;
      const uniqueCustomers = new Set(orders?.map(order => order.user_id) || []).size;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      setSalesStats([
        {
          title: 'Total Revenue',
          value: formatKES(totalRevenue),
          change: '+15.2%',
          icon: DollarSign,
          trend: 'up'
        },
        {
          title: 'Total Orders',
          value: totalOrders.toString(),
          change: '+8.1%',
          icon: ShoppingBag,
          trend: 'up'
        },
        {
          title: 'New Customers',
          value: uniqueCustomers.toString(),
          change: '-2.4%',
          icon: Users,
          trend: 'down'
        },
        {
          title: 'Avg Order Value',
          value: formatKES(avgOrderValue),
          change: '+5.7%',
          icon: Calendar,
          trend: 'up'
        }
      ]);

      // Process daily sales data
      const dailySales: Record<string, { sales: number; orders: number }> = {};
      orders?.forEach(order => {
        const date = new Date(order.created_at).toISOString().split('T')[0];
        if (!dailySales[date]) {
          dailySales[date] = { sales: 0, orders: 0 };
        }
        dailySales[date].sales += Number(order.total_amount);
        dailySales[date].orders += 1;
      });

      const dailyData = Object.entries(dailySales)
        .map(([date, data]) => ({
          date,
          sales: data.sales,
          orders: data.orders
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setDailySalesData(dailyData);

      // Process category data
      const categoryRevenue: Record<string, number> = {};
      orders?.forEach(order => {
        order.order_items?.forEach(item => {
          const category = item.products?.category || 'Other';
          if (!categoryRevenue[category]) {
            categoryRevenue[category] = 0;
          }
          categoryRevenue[category] += Number(item.total_price);
        });
      });

      const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
      const categoryChartData = Object.entries(categoryRevenue)
        .map(([name, value], index) => ({
          name,
          value: value as number,
          color: colors[index % colors.length]
        }))
        .sort((a, b) => (b.value as number) - (a.value as number));

      setCategoryData(categoryChartData);

      // Process top products data
      const productRevenue: Record<string, number> = {};
      const productSales: Record<string, number> = {};
      orders?.forEach(order => {
        order.order_items?.forEach(item => {
          const productName = item.products?.name || 'Unknown Product';
          if (!productRevenue[productName]) {
            productRevenue[productName] = 0;
            productSales[productName] = 0;
          }
          productRevenue[productName] += Number(item.total_price);
          productSales[productName] += item.quantity;
        });
      });

      const topProductsData = Object.entries(productRevenue)
        .map(([name, revenue]) => ({
          name,
          sales: productSales[name] as number,
          revenue: revenue as number,
          trend: 'up' as const
        }))
        .sort((a, b) => (b.revenue as number) - (a.revenue as number))
        .slice(0, 5);

      setTopProducts(topProductsData);

    } catch (error) {
      console.error('Error fetching sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, [timeRange]);

  const chartConfig = {
    sales: {
      label: "Sales",
      color: "hsl(var(--chart-1))",
    },
    orders: {
      label: "Orders",
      color: "hsl(var(--chart-2))",
    },
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center gap-2">
              <Loader className="h-6 w-6 animate-spin" />
              <span>Loading sales data...</span>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sales Report</h1>
              <p className="text-gray-600">Analyze your sales performance and trends</p>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {salesStats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  {stat.trend === 'up' ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span className={stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                    {stat.change}
                  </span>
                  from last period
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Daily Sales Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Sales Trend</CardTitle>
              <CardDescription>Revenue and order count over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="min-h-[300px]">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailySalesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis yAxisId="sales" orientation="left" />
                    <YAxis yAxisId="orders" orientation="right" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      yAxisId="sales"
                      type="monotone" 
                      dataKey="sales" 
                      stroke="var(--color-sales)"
                      strokeWidth={2}
                      name="Sales (KES)"
                    />
                    <Line 
                      yAxisId="orders"
                      type="monotone" 
                      dataKey="orders" 
                      stroke="var(--color-orders)"
                      strokeWidth={2}
                      name="Orders"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Sales by Category</CardTitle>
              <CardDescription>Revenue distribution across product categories</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="min-h-[300px]">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Products</CardTitle>
            <CardDescription>Best selling products by revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.sales} units sold</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold">{formatKES(product.revenue)}</p>
                      </div>
                      <Badge variant={product.trend === 'up' ? 'default' : 'secondary'}>
                        {product.trend === 'up' ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {product.trend === 'up' ? 'Rising' : 'Falling'}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No sales data available for the selected time period
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SalesReport;