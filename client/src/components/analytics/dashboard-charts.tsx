import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Calendar, TrendingUp, Users, Building, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChartData {
  monthlyRevenue: Array<{ month: string; income: number; expenses: number; }>;
  projectsByStatus: Array<{ status: string; count: number; }>;
  personnelActivity: Array<{ name: string; hours: number; }>;
  dailyActivity: Array<{ date: string; timesheets: number; transactions: number; }>;
}

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

export default function DashboardCharts() {
  const queryClient = useQueryClient();
  const { data: chartData, refetch } = useQuery<ChartData>({
    queryKey: ["/api/analytics/dashboard"],
    staleTime: 0,
    refetchOnMount: true,
  });

  console.log("Chart data:", chartData);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/analytics/dashboard"] });
    refetch();
  };

  if (!chartData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-dark-secondary border-dark-accent">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-600 rounded w-3/4 mb-4"></div>
                <div className="h-48 bg-gray-600 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Veri Analizi ve Raporlar</h2>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          className="border-dark-accent hover:bg-dark-accent text-gray-400 hover:text-white"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Yenile
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Monthly Revenue Chart */}
      <Card className="bg-dark-secondary border-dark-accent">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-400" />
            Aylık Gelir/Gider
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" tickFormatter={(value) => value.toLocaleString('tr-TR')} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '6px',
                    color: '#fff'
                  }} 
                />
                <Bar dataKey="income" fill="#10B981" name="Gelir" />
                <Bar dataKey="expenses" fill="#EF4444" name="Gider" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Project Status Distribution */}
      <Card className="bg-dark-secondary border-dark-accent">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center gap-2">
            <Building className="h-4 w-4 text-blue-400" />
            Proje Durumu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.projectsByStatus}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  label={({ status, count }) => `${status}: ${count}`}
                >
                  {chartData.projectsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '6px',
                    color: '#fff'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Personnel Activity */}
      <Card className="bg-dark-secondary border-dark-accent">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-400" />
            Personel Aktivitesi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.personnelActivity} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9CA3AF" />
                <YAxis dataKey="name" type="category" stroke="#9CA3AF" width={100} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '6px',
                    color: '#fff'
                  }} 
                />
                <Bar dataKey="hours" fill="#8B5CF6" name="Saat" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Daily Activity Trend */}
      <Card className="bg-dark-secondary border-dark-accent">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="h-4 w-4 text-orange-400" />
            Günlük Aktivite
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.dailyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '6px',
                    color: '#fff'
                  }} 
                />
                <Line type="monotone" dataKey="timesheets" stroke="#3B82F6" name="Puantaj" strokeWidth={2} />
                <Line type="monotone" dataKey="transactions" stroke="#10B981" name="İşlemler" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}