import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from './ui/card';
import { Loader2 } from 'lucide-react';

const AppLoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-[350px] shadow-lg">
        <CardContent className="flex flex-col items-center justify-center p-6 space-y-6">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
          </div>
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold">MediCare AI</h2>
            <p className="text-muted-foreground">Loading your health dashboard...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppLoadingScreen;
