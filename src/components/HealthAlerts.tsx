import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  AlertTriangle, 
  X, 
  Bell, 
  Shield, 
  TrendingUp,
  MapPin,
  Clock,
  User,
  Heart,
  Thermometer,
  CloudRain,
  Wind
} from 'lucide-react';
import { toast } from '../hooks/use-toast';

interface HealthAlert {
  id: string;
  type: 'personal' | 'community' | 'environmental' | 'epidemic';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  recommendation: string;
  timestamp: string;
  location?: string;
  affectedPopulation?: number;
  isRead: boolean;
  isDismissed: boolean;
  icon: React.ComponentType<any>;
}

const HealthAlerts: React.FC = () => {
  const { t } = useLanguage();
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'personal' | 'community'>('all');

  // Mock health alerts
  useEffect(() => {
    const mockAlerts: HealthAlert[] = [
      {
        id: '1',
        type: 'personal',
        severity: 'medium',
        title: 'Blood Pressure Alert',
        description: 'Your recent blood pressure readings show an upward trend. Consider lifestyle adjustments.',
        recommendation: 'Schedule a consultation with your cardiologist and monitor daily readings.',
        timestamp: '2 hours ago',
        isRead: false,
        isDismissed: false,
        icon: Heart
      },
      {
        id: '2',
        type: 'community',
        severity: 'high',
        title: 'Flu Outbreak in Your Area',
        description: 'High flu activity reported in your zip code area with 15% increase in cases.',
        recommendation: 'Consider getting a flu shot if not already vaccinated. Maintain good hygiene practices.',
        timestamp: '5 hours ago',
        location: 'Downtown District',
        affectedPopulation: 1200,
        isRead: false,
        isDismissed: false,
        icon: TrendingUp
      },
      {
        id: '3',
        type: 'environmental',
        severity: 'medium',
        title: 'Air Quality Warning',
        description: 'Poor air quality due to wildfire smoke. AQI level: 155 (Unhealthy).',
        recommendation: 'Limit outdoor activities and keep windows closed. Use air purifiers if available.',
        timestamp: '1 day ago',
        location: 'City-wide',
        isRead: true,
        isDismissed: false,
        icon: Wind
      },
      {
        id: '4',
        type: 'personal',
        severity: 'low',
        title: 'Medication Reminder',
        description: 'You\'ve missed 2 doses of your blood pressure medication this week.',
        recommendation: 'Set up automatic reminders and consider using a pill organizer.',
        timestamp: '1 day ago',
        isRead: true,
        isDismissed: false,
        icon: Shield
      },
      {
        id: '5',
        type: 'community',
        severity: 'medium',
        title: 'Pollen Forecast Alert',
        description: 'High pollen count expected this week. Tree pollen levels: Very High.',
        recommendation: 'Allergy sufferers should take preventive antihistamines and limit outdoor exposure.',
        timestamp: '2 days ago',
        location: 'Regional',
        affectedPopulation: 25000,
        isRead: false,
        isDismissed: false,
        icon: CloudRain
      },
      {
        id: '6',
        type: 'epidemic',
        severity: 'critical',
        title: 'COVID-19 Surge Alert',
        description: 'New COVID-19 variant detected with 30% increase in hospitalizations.',
        recommendation: 'Follow updated CDC guidelines. Consider wearing masks in crowded indoor spaces.',
        timestamp: '3 days ago',
        location: 'State-wide',
        affectedPopulation: 150000,
        isRead: true,
        isDismissed: false,
        icon: AlertTriangle
      }
    ];
    
    setAlerts(mockAlerts);
  }, []);

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, isDismissed: true }
          : alert
      )
    );
    
    toast({
      title: "Alert Dismissed",
      description: "The alert has been removed from your list.",
    });
  };

  const markAsRead = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, isRead: true }
          : alert
      )
    );
  };

  const markAllAsRead = () => {
    setAlerts(prev => 
      prev.map(alert => ({ ...alert, isRead: true }))
    );
    
    toast({
      title: "All Alerts Read",
      description: "All alerts have been marked as read.",
    });
  };

  const getFilteredAlerts = () => {
    return alerts.filter(alert => {
      if (alert.isDismissed) return false;
      
      switch (filter) {
        case 'unread': return !alert.isRead;
        case 'personal': return alert.type === 'personal';
        case 'community': return alert.type === 'community' || alert.type === 'environmental' || alert.type === 'epidemic';
        default: return true;
      }
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'medium': return 'bg-warning/10 border-warning/20 text-warning';
      case 'high': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'critical': return 'bg-destructive/10 border-destructive/20 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low': return <Shield className="h-4 w-4" />;
      case 'medium': return <Bell className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'personal': return 'bg-primary/10 text-primary border-primary/20';
      case 'community': return 'bg-accent/10 text-accent border-accent/20';
      case 'environmental': return 'bg-success/10 text-success border-success/20';
      case 'epidemic': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const filteredAlerts = getFilteredAlerts();
  const unreadCount = alerts.filter(alert => !alert.isRead && !alert.isDismissed).length;

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-full mb-4">
          <AlertTriangle className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold">{t('alerts')}</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Stay informed about health risks and get personalized alerts for better health management.
        </p>
      </div>

      {/* Alert Summary */}
      <div className="max-w-4xl mx-auto">
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="medical-card">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-destructive/10 rounded-lg">
                  <Bell className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Unread Alerts</p>
                  <p className="text-2xl font-bold">{unreadCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="medical-card">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Personal</p>
                  <p className="text-2xl font-bold">
                    {alerts.filter(a => a.type === 'personal' && !a.isDismissed).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="medical-card">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <MapPin className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Community</p>
                  <p className="text-2xl font-bold">
                    {alerts.filter(a => ['community', 'environmental', 'epidemic'].includes(a.type) && !a.isDismissed).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="medical-card">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">High Priority</p>
                  <p className="text-2xl font-bold">
                    {alerts.filter(a => ['high', 'critical'].includes(a.severity) && !a.isDismissed).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {['all', 'unread', 'personal', 'community'].map((filterType) => (
              <Button
                key={filterType}
                variant={filter === filterType ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(filterType as any)}
                className="capitalize"
              >
                {filterType}
              </Button>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Mark All Read
            </Button>
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="max-w-4xl mx-auto space-y-4">
        {filteredAlerts.length === 0 ? (
          <Card className="medical-card">
            <CardContent className="pt-6 text-center">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Alerts</h3>
              <p className="text-muted-foreground">
                {filter === 'unread' 
                  ? "You're all caught up! No unread alerts."
                  : "No alerts match your current filter."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map((alert) => {
            const Icon = alert.icon;
            return (
              <Card 
                key={alert.id} 
                className={`medical-card cursor-pointer transition-all duration-300 hover:shadow-medical
                  ${!alert.isRead ? 'border-l-4 border-l-primary bg-primary/5' : ''}
                `}
                onClick={() => markAsRead(alert.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${getSeverityColor(alert.severity).replace('text-', 'bg-').replace('-800', '/10').replace('-200', '/20')}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <CardTitle className="text-lg">{alert.title}</CardTitle>
                          {!alert.isRead && (
                            <div className="w-2 h-2 bg-primary rounded-full" />
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <Badge className={getSeverityColor(alert.severity)}>
                            {getSeverityIcon(alert.severity)}
                            <span className="ml-1 capitalize">{alert.severity}</span>
                          </Badge>
                          <Badge className={getTypeColor(alert.type)}>
                            {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
                          </Badge>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {alert.timestamp}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        dismissAlert(alert.id);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-muted-foreground">{alert.description}</p>
                    
                    {(alert.location || alert.affectedPopulation) && (
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        {alert.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{alert.location}</span>
                          </div>
                        )}
                        {alert.affectedPopulation && (
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>{alert.affectedPopulation.toLocaleString()} affected</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="p-4 bg-muted/30 rounded-lg border-l-4 border-l-primary">
                      <h4 className="font-semibold text-sm mb-2">Recommendation:</h4>
                      <p className="text-sm">{alert.recommendation}</p>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        Learn More
                      </Button>
                      <Button size="sm">
                        Take Action
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Emergency Contact */}
      <Card className="max-w-4xl mx-auto medical-card bg-destructive/5 border-destructive/20">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-destructive/10 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-destructive mb-1">Emergency Situations</h4>
              <p className="text-sm text-muted-foreground">
                If you're experiencing a medical emergency, call emergency services immediately.
              </p>
            </div>
            <Button variant="destructive">
              Emergency: 911
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthAlerts;