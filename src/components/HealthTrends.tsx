import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  TrendingUp, 
  MapPin, 
  Users, 
  Calendar,
  Filter,
  Download,
  Share2,
  AlertTriangle,
  ThermometerSun,
  Droplets,
  Wind,
  Activity
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface TrendData {
  id: string;
  name: string;
  category: 'disease' | 'environmental' | 'lifestyle' | 'emergency';
  currentValue: number;
  previousValue: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  severity: 'low' | 'medium' | 'high';
  location: string;
  population: number;
  description: string;
  icon: React.ComponentType<any>;
}

interface HistoricalData {
  labels: string[];
  datasets: any[];
}

const HealthTrends: React.FC = () => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'disease' | 'environmental' | 'lifestyle' | 'emergency'>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('city');
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter'>('month');

  // Mock trend data
  const trendsData: TrendData[] = [
    {
      id: '1',
      name: 'Flu Cases',
      category: 'disease',
      currentValue: 1250,
      previousValue: 980,
      unit: 'cases',
      trend: 'up',
      severity: 'high',
      location: 'Downtown District',
      population: 45000,
      description: 'Significant increase in flu cases over the past month',
      icon: Activity
    },
    {
      id: '2',
      name: 'Air Quality Index',
      category: 'environmental',
      currentValue: 85,
      previousValue: 72,
      unit: 'AQI',
      trend: 'up',
      severity: 'medium',
      location: 'City-wide',
      population: 500000,
      description: 'Air quality has declined due to increased traffic',
      icon: Wind
    },
    {
      id: '3',
      name: 'Allergy Reports',
      category: 'disease',
      currentValue: 890,
      previousValue: 1200,
      unit: 'cases',
      trend: 'down',
      severity: 'low',
      location: 'Suburban Areas',
      population: 75000,
      description: 'Pollen levels decreasing as season changes',
      icon: Droplets
    },
    {
      id: '4',
      name: 'Heat-related Illness',
      category: 'environmental',
      currentValue: 45,
      previousValue: 28,
      unit: 'cases',
      trend: 'up',
      severity: 'medium',
      location: 'Regional',
      population: 200000,
      description: 'Rising temperatures leading to more heat-related health issues',
      icon: ThermometerSun
    },
    {
      id: '5',
      name: 'Emergency Room Visits',
      category: 'emergency',
      currentValue: 320,
      previousValue: 285,
      unit: 'visits/day',
      trend: 'up',
      severity: 'medium',
      location: 'Metro Area',
      population: 800000,
      description: 'Slight increase in ER visits across metro hospitals',
      icon: AlertTriangle
    },
    {
      id: '6',
      name: 'Mental Health Consultations',
      category: 'lifestyle',
      currentValue: 540,
      previousValue: 480,
      unit: 'sessions',
      trend: 'up',
      severity: 'low',
      location: 'City-wide',
      population: 500000,
      description: 'Increased awareness leading to more mental health support',
      icon: Users
    }
  ];

  // Mock historical data for charts
  const fluTrendData: HistoricalData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
    datasets: [
      {
        label: 'Flu Cases',
        data: [680, 750, 820, 920, 1100, 1250],
        borderColor: 'hsl(var(--destructive))',
        backgroundColor: 'hsl(var(--destructive) / 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Previous Year',
        data: [580, 620, 590, 610, 650, 680],
        borderColor: 'hsl(var(--muted-foreground))',
        backgroundColor: 'hsl(var(--muted-foreground) / 0.1)',
        tension: 0.4,
        fill: false,
        borderDash: [5, 5]
      }
    ]
  };

  const categoryDistribution = {
    labels: ['Respiratory', 'Digestive', 'Skin Conditions', 'Mental Health', 'Injuries'],
    datasets: [
      {
        data: [35, 20, 15, 20, 10],
        backgroundColor: [
          'hsl(var(--destructive))',
          'hsl(var(--warning))',
          'hsl(var(--primary))',
          'hsl(var(--accent))',
          'hsl(var(--success))'
        ],
        borderWidth: 0
      }
    ]
  };

  const ageGroupData = {
    labels: ['0-18', '19-35', '36-50', '51-65', '65+'],
    datasets: [
      {
        label: 'Affected Population',
        data: [180, 420, 380, 290, 150],
        backgroundColor: 'hsl(var(--primary))',
        borderWidth: 0
      }
    ]
  };

  const getFilteredTrends = () => {
    return trendsData.filter(trend => 
      selectedCategory === 'all' || trend.category === selectedCategory
    );
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-destructive';
      case 'down': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↗';
      case 'down': return '↘';
      default: return '→';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-success/10 text-success border-success/20';
      case 'medium': return 'bg-warning/10 text-warning border-warning/20';
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'disease': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'environmental': return 'bg-warning/10 text-warning border-warning/20';
      case 'lifestyle': return 'bg-primary/10 text-primary border-primary/20';
      case 'emergency': return 'bg-accent/10 text-accent border-accent/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const calculatePercentageChange = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return change.toFixed(1);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const filteredTrends = getFilteredTrends();

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-full mb-4">
          <TrendingUp className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold">{t('trends')}</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Monitor community health trends and environmental factors affecting your area.
        </p>
      </div>

      {/* Filters */}
      <div className="max-w-6xl mx-auto">
        <Card className="medical-card">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <div className="flex flex-wrap gap-2">
                  {['all', 'disease', 'environmental', 'lifestyle', 'emergency'].map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category as any)}
                      className="capitalize"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Region</label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="city">City-wide</option>
                  <option value="county">County</option>
                  <option value="state">State</option>
                  <option value="national">National</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Timeframe</label>
                <div className="flex gap-2">
                  {['week', 'month', 'quarter'].map((period) => (
                    <Button
                      key={period}
                      variant={timeframe === period ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTimeframe(period as any)}
                      className="capitalize"
                    >
                      {period}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Cards */}
      <div className="max-w-6xl mx-auto">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTrends.map((trend) => {
            const Icon = trend.icon;
            const percentageChange = calculatePercentageChange(trend.currentValue, trend.previousValue);
            
            return (
              <Card key={trend.id} className="medical-card hover:shadow-medical transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{trend.name}</CardTitle>
                    </div>
                    <div className={`text-2xl ${getTrendColor(trend.trend)}`}>
                      {getTrendIcon(trend.trend)}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">
                        {trend.currentValue.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">{trend.unit}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${getTrendColor(trend.trend)}`}>
                        {trend.trend === 'up' ? '+' : trend.trend === 'down' ? '-' : ''}
                        {Math.abs(parseFloat(percentageChange))}%
                      </p>
                      <p className="text-xs text-muted-foreground">vs last period</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getCategoryColor(trend.category)}>
                      {trend.category}
                    </Badge>
                    <Badge className={getSeverityColor(trend.severity)}>
                      {trend.severity} risk
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      {trend.location}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-2" />
                      {trend.population.toLocaleString()} population
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">{trend.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Charts Section */}
      <div className="max-w-6xl mx-auto space-y-8">
        <h2 className="text-2xl font-bold text-center">Detailed Analytics</h2>
        
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Flu Trend Chart */}
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Flu Cases Trend</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Line data={fluTrendData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>

          {/* Age Group Distribution */}
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Age Group Distribution</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Bar data={ageGroupData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card className="medical-card lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Health Issues by Category</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-8 lg:grid-cols-2">
                <div className="h-64">
                  <Doughnut 
                    data={categoryDistribution} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'right' as const
                        }
                      }
                    }} 
                  />
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold">Key Insights</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Respiratory conditions show the highest prevalence (35%)</li>
                    <li>• Mental health awareness has increased consultations by 12%</li>
                    <li>• Seasonal allergies are declining as expected for this time of year</li>
                    <li>• Emergency room capacity is at 78% utilization</li>
                    <li>• Air quality improvements needed in downtown area</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Actions */}
      <div className="max-w-6xl mx-auto">
        <Card className="medical-card">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h4 className="font-semibold mb-2">Export & Share Data</h4>
                <p className="text-sm text-muted-foreground">
                  Generate reports or share insights with healthcare providers and researchers.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Report
                </Button>
                <Button>
                  <Filter className="h-4 w-4 mr-2" />
                  Custom Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Sources */}
      <div className="max-w-6xl mx-auto">
        <Card className="medical-card bg-muted/20">
          <CardContent className="pt-6">
            <h4 className="font-semibold mb-3">Data Sources & Methodology</h4>
            <div className="grid gap-4 md:grid-cols-2 text-sm text-muted-foreground">
              <div>
                <p className="font-medium mb-2">Healthcare Providers</p>
                <ul className="space-y-1">
                  <li>• Regional hospital networks</li>
                  <li>• Primary care clinics</li>
                  <li>• Emergency departments</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-2">Environmental Data</p>
                <ul className="space-y-1">
                  <li>• EPA air quality monitoring</li>
                  <li>• Weather service data</li>
                  <li>• Pollen count stations</li>
                </ul>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Data is aggregated and anonymized to protect patient privacy. Updates occur every 24 hours.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HealthTrends;