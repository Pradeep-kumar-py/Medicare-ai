import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Database, 
  Check, 
  X, 
  RefreshCw, 
  Users, 
  Calendar, 
  Pill, 
  Activity,
  AlertTriangle
} from 'lucide-react';
import { 
  doctorService, 
  appointmentService, 
  medicationService, 
  healthMetricsService,
  alertService 
} from '../integrations/supabase/services';

interface ServiceStatus {
  name: string;
  status: 'checking' | 'online' | 'offline' | 'error';
  icon: React.ReactNode;
  lastChecked?: string;
  error?: string;
}

const DatabaseStatus: React.FC = () => {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'Doctors', status: 'checking', icon: <Users className="h-4 w-4" /> },
    { name: 'Appointments', status: 'checking', icon: <Calendar className="h-4 w-4" /> },
    { name: 'Medications', status: 'checking', icon: <Pill className="h-4 w-4" /> },
    { name: 'Health Metrics', status: 'checking', icon: <Activity className="h-4 w-4" /> },
    { name: 'Health Alerts', status: 'checking', icon: <AlertTriangle className="h-4 w-4" /> },
  ]);

  const checkService = async (serviceName: string, serviceFunction: () => Promise<any>) => {
    try {
      await serviceFunction();
      return { status: 'online' as const, error: undefined };
    } catch (error) {
      return { 
        status: 'error' as const, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  };

  const checkAllServices = async () => {
    const serviceChecks = [
      { name: 'Doctors', check: () => doctorService.getDoctors() },
      { name: 'Appointments', check: () => appointmentService.getAppointments() },
      { name: 'Medications', check: () => medicationService.getMedications() },
      { name: 'Health Metrics', check: () => healthMetricsService.getHealthMetrics() },
      { name: 'Health Alerts', check: () => alertService.getAlerts() },
    ];

    const results = await Promise.allSettled(
      serviceChecks.map(async ({ name, check }) => {
        const result = await checkService(name, check);
        return { name, ...result, lastChecked: new Date().toLocaleTimeString() };
      })
    );

    setServices(prevServices => 
      prevServices.map((service, index) => {
        const result = results[index];
        if (result.status === 'fulfilled') {
          return { ...service, ...result.value };
        } else {
          return { 
            ...service, 
            status: 'error', 
            error: 'Check failed',
            lastChecked: new Date().toLocaleTimeString()
          };
        }
      })
    );
  };

  useEffect(() => {
    checkAllServices();
    
    // Check every 30 seconds
    const interval = setInterval(checkAllServices, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'online': return 'default';
      case 'error': return 'destructive';
      case 'checking': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'online': return <Check className="h-3 w-3" />;
      case 'error': return <X className="h-3 w-3" />;
      case 'checking': return <RefreshCw className="h-3 w-3 animate-spin" />;
      default: return <Database className="h-3 w-3" />;
    }
  };

  const overallStatus = services.every(s => s.status === 'online') ? 'online' :
                       services.some(s => s.status === 'error') ? 'error' : 'checking';

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Status
          <Badge variant={getStatusColor(overallStatus)} className="ml-auto">
            {getStatusIcon(overallStatus)}
            {overallStatus === 'online' && 'All Systems Online'}
            {overallStatus === 'error' && 'Issues Detected'}
            {overallStatus === 'checking' && 'Checking...'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {services.map((service) => (
            <div key={service.name} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {service.icon}
                <div>
                  <div className="font-medium">{service.name}</div>
                  {service.lastChecked && (
                    <div className="text-xs text-muted-foreground">
                      Last checked: {service.lastChecked}
                    </div>
                  )}
                  {service.error && (
                    <div className="text-xs text-destructive">
                      Error: {service.error}
                    </div>
                  )}
                </div>
              </div>
              <Badge variant={getStatusColor(service.status)}>
                {getStatusIcon(service.status)}
                {service.status}
              </Badge>
            </div>
          ))}
        </div>
        
        <div className="flex gap-2 pt-4 border-t">
          <Button 
            onClick={checkAllServices} 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh All
          </Button>
          <div className="text-xs text-muted-foreground flex items-center">
            Auto-refresh every 30 seconds
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DatabaseStatus;
