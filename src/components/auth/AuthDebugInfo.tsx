import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

export const AuthDebugInfo: React.FC = () => {
  const { user, profile, session, loading } = useAuth();
  
  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }
  
  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 opacity-90 hover:opacity-100 transition-opacity">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Auth Debug Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span>Loading:</span>
          <Badge variant={loading ? "destructive" : "default"}>
            {loading ? "true" : "false"}
          </Badge>
        </div>
        <div className="flex justify-between">
          <span>User:</span>
          <Badge variant={user ? "default" : "secondary"}>
            {user ? "authenticated" : "null"}
          </Badge>
        </div>
        <div className="flex justify-between">
          <span>Session:</span>
          <Badge variant={session ? "default" : "secondary"}>
            {session ? "active" : "null"}
          </Badge>
        </div>
        <div className="flex justify-between">
          <span>Profile:</span>
          <Badge variant={profile ? "default" : "secondary"}>
            {profile ? "loaded" : "null"}
          </Badge>
        </div>
        {user && (
          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground">
              Email: {user.email}
            </div>
            <div className="text-xs text-muted-foreground">
              ID: {user.id.slice(0, 8)}...
            </div>
          </div>
        )}
        <div className="pt-2 border-t">
          <div className="text-xs text-muted-foreground">
            Env Check:
          </div>
          <div className="text-xs">
            URL: {import.meta.env.VITE_SUPABASE_URL ? '✓' : '✗'}
          </div>
          <div className="text-xs">
            Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓' : '✗'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
