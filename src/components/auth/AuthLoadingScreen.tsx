import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Loader2, Heart, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';

interface AuthLoadingScreenProps {
  timeout?: number;
}

export const AuthLoadingScreen: React.FC<AuthLoadingScreenProps> = ({ timeout = 30000 }) => {
  const [showTimeout, setShowTimeout] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTimeout(true);
    }, timeout);
    
    return () => clearTimeout(timer);
  }, [timeout]);
  
  const handleRefresh = () => {
    window.location.reload();
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardContent className="flex flex-col items-center justify-center p-8 space-y-6">
          <div className="relative">
            <Heart className="h-12 w-12 text-primary fill-current" />
            <div className="absolute -top-1 -right-1">
              {showTimeout ? (
                <AlertCircle className="h-6 w-6 text-yellow-500" />
              ) : (
                <Loader2 className="h-6 w-6 animate-spin text-primary/70" />
              )}
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              Medcare AI
            </h2>
            {showTimeout ? (
              <div className="space-y-2">
                <p className="text-yellow-600 dark:text-yellow-400 text-sm">
                  Taking longer than expected...
                </p>
                <p className="text-muted-foreground text-sm">
                  Please check your internet connection
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">
                Initializing your healthcare companion...
              </p>
            )}
          </div>
          
          <div className="w-full max-w-xs">
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  showTimeout ? 'bg-yellow-500' : 'bg-primary animate-pulse'
                }`} 
                style={{width: showTimeout ? '100%' : '60%'}} 
              />
            </div>
          </div>
          
          {showTimeout && (
            <Button 
              onClick={handleRefresh}
              variant="outline"
              className="mt-4"
            >
              Refresh Page
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
