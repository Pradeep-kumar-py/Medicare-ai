import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Loader2, Heart } from 'lucide-react';

export const AuthLoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardContent className="flex flex-col items-center justify-center p-8 space-y-6">
          <div className="relative">
            <Heart className="h-12 w-12 text-primary fill-current" />
            <div className="absolute -top-1 -right-1">
              <Loader2 className="h-6 w-6 animate-spin text-primary/70" />
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              Medcare AI
            </h2>
            <p className="text-muted-foreground">
              Initializing your healthcare companion...
            </p>
          </div>
          
          <div className="w-full max-w-xs">
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full animate-pulse" style={{width: '60%'}} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
