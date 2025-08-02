import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { API_CONFIG, buildApiUrl } from '../config/api';
import { Activity, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

interface ApiStatus {
  endpoint: string;
  status: 'checking' | 'online' | 'offline' | 'error';
  responseTime?: number;
  error?: string;
}

const ApiHealthCheck: React.FC = () => {
  const [apiStatuses, setApiStatuses] = useState<ApiStatus[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const endpoints = [
    { name: 'Health Check', endpoint: API_CONFIG.ENDPOINTS.HEALTH_CHECK },
    { name: 'System Info', endpoint: API_CONFIG.ENDPOINTS.SYSTEM_INFO },
    { name: 'Symptom Analysis', endpoint: API_CONFIG.ENDPOINTS.SYMPTOM_ANALYSIS },
  ];

  const checkEndpoint = async (endpoint: string): Promise<ApiStatus> => {
    const startTime = Date.now();
    
    try {
      const url = buildApiUrl(endpoint);
      const isGetEndpoint = endpoint === API_CONFIG.ENDPOINTS.HEALTH_CHECK || 
                           endpoint === API_CONFIG.ENDPOINTS.SYSTEM_INFO;
      
      const response = await fetch(url, {
        method: isGetEndpoint ? 'GET' : 'POST',
        headers: API_CONFIG.DEFAULT_HEADERS,
        body: isGetEndpoint ? undefined : JSON.stringify({
          symptoms: ["headache"],
          age: 30,
          gender: "other"
        }),
        signal: AbortSignal.timeout(10000)
      });

      const responseTime = Date.now() - startTime;
      
      return {
        endpoint,
        status: response.ok ? 'online' : 'error',
        responseTime,
        error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        endpoint,
        status: 'offline',
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const checkAllEndpoints = async () => {
    setIsChecking(true);
    
    // Initialize statuses
    const initialStatuses: ApiStatus[] = endpoints.map(ep => ({
      endpoint: ep.endpoint,
      status: 'checking' as const
    }));
    setApiStatuses(initialStatuses);

    // Check each endpoint
    const promises = endpoints.map(ep => checkEndpoint(ep.endpoint));
    const results = await Promise.all(promises);
    
    setApiStatuses(results);
    setIsChecking(false);
  };

  useEffect(() => {
    checkAllEndpoints();
  }, []);

  const getStatusIcon = (status: ApiStatus['status']) => {
    switch (status) {
      case 'checking':
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'offline':
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: ApiStatus['status']) => {
    switch (status) {
      case 'checking':
        return <Badge variant="secondary">Checking...</Badge>;
      case 'online':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Online</Badge>;
      case 'offline':
        return <Badge variant="destructive">Offline</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getEndpointName = (endpoint: string) => {
    const found = endpoints.find(ep => ep.endpoint === endpoint);
    return found?.name || endpoint;
  };

  const overallStatus = apiStatuses.length > 0 ? 
    apiStatuses.every(s => s.status === 'online') ? 'online' :
    apiStatuses.some(s => s.status === 'online') ? 'partial' : 'offline'
    : 'checking';

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>API Health Status</span>
          {overallStatus === 'online' && <Badge className="bg-green-100 text-green-800">All Systems Online</Badge>}
          {overallStatus === 'partial' && <Badge variant="secondary">Partial Service</Badge>}
          {overallStatus === 'offline' && <Badge variant="destructive">Service Unavailable</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <strong>Backend URL:</strong> {API_CONFIG.BASE_URL}
        </div>
        
        <div className="space-y-3">
          {apiStatuses.map((status, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(status.status)}
                <div>
                  <div className="font-medium">{getEndpointName(status.endpoint)}</div>
                  <div className="text-sm text-muted-foreground">{status.endpoint}</div>
                  {status.error && (
                    <div className="text-sm text-red-600 mt-1">{status.error}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {status.responseTime && (
                  <span className="text-sm text-muted-foreground">
                    {status.responseTime}ms
                  </span>
                )}
                {getStatusBadge(status.status)}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={checkAllEndpoints} 
            disabled={isChecking}
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            Refresh Status
          </Button>
          
          <div className="text-sm text-muted-foreground">
            Last checked: {new Date().toLocaleTimeString()}
          </div>
        </div>

        {overallStatus === 'offline' && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Backend Unavailable</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  The backend service is currently unavailable. This could be due to:
                </p>
                <ul className="text-sm text-yellow-700 mt-2 list-disc list-inside space-y-1">
                  <li>Cold start delay (Render free tier can take 30+ seconds)</li>
                  <li>Temporary server issues</li>
                  <li>Network connectivity problems</li>
                </ul>
                <p className="text-sm text-yellow-700 mt-2">
                  The app will use fallback demo data for symptom analysis until the service is restored.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApiHealthCheck;
