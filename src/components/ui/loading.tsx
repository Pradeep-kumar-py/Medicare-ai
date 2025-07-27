import React from 'react';
import { Card, CardContent } from './card';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ 
  message = 'Loading...', 
  size = 'md',
  fullScreen = false
}) => {
  const sizeMap = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const content = (
    <div className={`flex items-center justify-center ${fullScreen ? 'min-h-screen' : 'w-full py-8'}`}>
      <Card className={fullScreen ? 'w-[300px]' : 'w-full max-w-md'}>
        <CardContent className="flex flex-col items-center space-y-4 p-6">
          <Loader2 className={`${sizeMap[size]} animate-spin text-primary`} />
          <p className="text-sm text-muted-foreground">{message}</p>
        </CardContent>
      </Card>
    </div>
  );

  return content;
};

export default Loading;
