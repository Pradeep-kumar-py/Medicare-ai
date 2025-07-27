import { supabase } from './client';
import { HealthAlert } from '../../mock/health-alerts';
import mockAlerts from '../../mock/health-alerts';

// Fetch health alerts for a user
export const getHealthAlerts = async (userId: string): Promise<HealthAlert[]> => {
  try {
    // Uncomment this when Supabase table is set up
    /*
    const { data, error } = await supabase
      .from('health_alerts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as HealthAlert[];
    */

    // Return mock data for now
    return mockAlerts;
  } catch (error) {
    console.error('Error fetching health alerts:', error);
    throw error;
  }
};

// Mark an alert as read
export const markAlertAsRead = async (alertId: string): Promise<void> => {
  try {
    // Uncomment this when Supabase table is set up
    /*
    const { error } = await supabase
      .from('health_alerts')
      .update({ is_read: true })
      .eq('id', alertId);

    if (error) throw error;
    */
  } catch (error) {
    console.error('Error marking alert as read:', error);
    throw error;
  }
};

// Mark all alerts as read for a user
export const markAllAlertsAsRead = async (userId: string): Promise<void> => {
  try {
    // Uncomment this when Supabase table is set up
    /*
    const { error } = await supabase
      .from('health_alerts')
      .update({ is_read: true })
      .eq('user_id', userId);

    if (error) throw error;
    */
  } catch (error) {
    console.error('Error marking all alerts as read:', error);
    throw error;
  }
};

// Dismiss (hide) an alert
export const dismissAlert = async (alertId: string): Promise<void> => {
  try {
    // Uncomment this when Supabase table is set up
    /*
    const { error } = await supabase
      .from('health_alerts')
      .update({ is_dismissed: true })
      .eq('id', alertId);

    if (error) throw error;
    */
  } catch (error) {
    console.error('Error dismissing alert:', error);
    throw error;
  }
};

// Create a new health alert
export const createHealthAlert = async (alert: Omit<HealthAlert, 'id'>): Promise<HealthAlert> => {
  try {
    // Uncomment this when Supabase table is set up
    /*
    const { data, error } = await supabase
      .from('health_alerts')
      .insert([alert])
      .select();

    if (error) throw error;
    return data[0] as HealthAlert;
    */
    
    // Return mock implementation
    return {
      ...alert,
      id: Math.random().toString(36).substring(2, 9)
    } as HealthAlert;
  } catch (error) {
    console.error('Error creating health alert:', error);
    throw error;
  }
};

// Subscribe to real-time health alerts updates
export const subscribeToHealthAlerts = (
  userId: string,
  callback: (payload: { new: HealthAlert }) => void
) => {
  // Uncomment this when Supabase real-time is set up
  /*
  return supabase
    .channel('health_alerts_channel')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'health_alerts',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe();
  */
  
  // Return a mock unsubscribe function
  return () => {
    console.log('Unsubscribed from health alerts');
  };
};
