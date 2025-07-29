import React, { useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  BarChart3, 
  Heart,
  Hospital, 
  Activity, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  Thermometer,
  Weight,
  Droplet,
  Clock
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

interface HealthMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
  icon: React.ComponentType<any>;
}

interface Activity {
  id: string;
  type: 'symptom_check' | 'appointment' | 'medication' | 'consultation';
  title: string;
  description: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'scheduled';
}

const HealthDashboard: React.FC = () => {
  const { t } = useLanguage();
  
  // Mock health metrics
  const healthMetrics: HealthMetric[] = [
    {
      id: '1',
      name: 'Blood Pressure',
      value: 120,
      unit: '/80 mmHg',
      status: 'normal',
      trend: 'stable',
      lastUpdated: '2 hours ago',
      icon: Hospital
    },
    {
      id: '2',
      name: 'Heart Rate',
      value: 72,
      unit: 'bpm',
      status: 'normal',
      trend: 'up',
      lastUpdated: '1 hour ago',
      icon: Activity
    },
    {
      id: '3',
      name: 'Temperature',
      value: 98.6,
      unit: '°F',
      status: 'normal',
      trend: 'stable',
      lastUpdated: '3 hours ago',
      icon: Thermometer
    },
    {
      id: '4',
      name: 'Weight',
      value: 165,
      unit: 'lbs',
      status: 'normal',
      trend: 'down',
      lastUpdated: '1 day ago',
      icon: Weight
    },
    {
      id: '5',
      name: 'Blood Sugar',
      value: 95,
      unit: 'mg/dL',
      status: 'normal',
      trend: 'stable',
      lastUpdated: '4 hours ago',
      icon: Droplet
    },
    {
      id: '6',
      name: 'Sleep Quality',
      value: 85,
      unit: '%',
      status: 'normal',
      trend: 'up',
      lastUpdated: '8 hours ago',
      icon: Clock
    }
  ];

  // Mock recent activities
  const recentActivities: Activity[] = [
    {
      id: '1',
      type: 'symptom_check',
      title: 'Symptom Analysis Completed',
      description: 'Analyzed headache and fatigue symptoms',
      timestamp: '2 hours ago',
      status: 'completed'
    },
    {
      id: '2',
      type: 'appointment',
      title: 'Appointment Scheduled',
      description: 'Dr. Sarah Johnson - General Checkup',
      timestamp: '1 day ago',
      status: 'scheduled'
    },
    {
      id: '3',
      type: 'medication',
      title: 'Medication Reminder',
      description: 'Vitamin D - 1000 IU taken',
      timestamp: '3 hours ago',
      status: 'completed'
    },
    {
      id: '4',
      type: 'consultation',
      title: 'Teleconsultation',
      description: 'Follow-up with Dr. Michael Chen',
      timestamp: '2 days ago',
      status: 'completed'
    }
  ];

  // Chart data
  const heartRateData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Heart Rate (bpm)',
        data: [68, 72, 70, 75, 73, 71, 72],
        borderColor: 'hsl(var(--primary))',
        backgroundColor: 'hsl(var(--primary) / 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const activityData = {
    labels: ['Steps', 'Calories', 'Active Minutes', 'Water Intake'],
    datasets: [
      {
        label: 'Daily Goals',
        data: [8500, 2200, 45, 8],
        backgroundColor: [
          'hsl(var(--primary))',
          'hsl(var(--accent))',
          'hsl(var(--success))',
          'hsl(var(--warning))'
        ],
        borderWidth: 0
      }
    ]
  };

  const sleepData = {
    labels: ['Deep Sleep', 'REM Sleep', 'Light Sleep', 'Awake'],
    datasets: [
      {
        data: [25, 20, 45, 10],
        backgroundColor: [
          'hsl(var(--primary))',
          'hsl(var(--accent))',
          'hsl(var(--primary-light))',
          'hsl(var(--muted))'
        ],
        borderWidth: 0
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-success/10 text-success border-success/20';
      case 'warning': return 'bg-warning/10 text-warning border-warning/20';
      case 'critical': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-success" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-destructive" />;
      default: return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'symptom_check': return '🔍';
      case 'appointment': return '📅';
      case 'medication': return '💊';
      case 'consultation': return '💻';
      default: return '📋';
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-success';
      case 'pending': return 'text-warning';
      case 'scheduled': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="container py-6 sm:py-8 space-y-6 sm:space-y-8 px-4">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-primary rounded-full mb-4">
          <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">{t('dashboardTitle')}</h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
          Monitor your health metrics and track your wellness journey with comprehensive insights.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {healthMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.id} className="medical-card hover:shadow-medical transition-all duration-300">
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  {getTrendIcon(metric.trend)}
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">{metric.name}</p>
                  <p className="text-lg sm:text-xl font-bold">
                    {metric.value}
                    <span className="text-xs sm:text-sm font-normal text-muted-foreground ml-1">
                      {metric.unit}
                    </span>
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge className={`${getStatusColor(metric.status)} text-xs`}>
                      {metric.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {metric.lastUpdated}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 lg:grid-cols-2">
        {/* Heart Rate Trend */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
              <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <span>Heart Rate Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 sm:h-64">
              <Line data={heartRateData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Daily Activity */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-primary" />
              <span>Daily Activity Goals</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Bar data={activityData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Sleep Analysis */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-primary" />
              <span>Sleep Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Doughnut 
                data={sleepData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom' as const
                    }
                  }
                }} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>{t('recentActivities')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 bg-muted/20 rounded-lg">
                  <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm">{activity.title}</h4>
                    <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getActivityColor(activity.status)}`}
                      >
                        {activity.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Insights */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="medical-card bg-gradient-to-br from-success/5 to-success/10 border-success/20">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <div>
                <h4 className="font-semibold text-success">Excellent Progress!</h4>
                <p className="text-sm text-muted-foreground">
                  Your health metrics show consistent improvement this week.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="medical-card bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Calendar className="h-6 w-6 text-warning" />
              </div>
              <div>
                <h4 className="font-semibold text-warning">Upcoming Appointment</h4>
                <p className="text-sm text-muted-foreground">
                  Don't forget your checkup with Dr. Johnson tomorrow.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="medical-card bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-primary">Stay Hydrated</h4>
                <p className="text-sm text-muted-foreground">
                  You're 2 glasses behind your daily water goal.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export & Share */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle>Health Report</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Generate and share your health summary with healthcare providers.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline">
              Export PDF Report
            </Button>
            <Button variant="outline">
              Share with Doctor
            </Button>
            <Button variant="outline">
              Download Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthDashboard;