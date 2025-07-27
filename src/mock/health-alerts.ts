import { 
  Heart,
  TrendingUp,
  Wind,
  Shield,
  CloudRain,
  Thermometer,
  User,
  Bell
} from 'lucide-react';

export interface HealthAlert {
  id: string;
  type: 'personal' | 'community' | 'environmental' | 'epidemic' | 'weather' | 'medication' | 'appointment';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  recommendation?: string;
  timestamp: string;
  location?: string;
  affectedPopulation?: number;
  isRead: boolean;
  isDismissed: boolean;
  icon?: any;
  relatedMedication?: string;
  appointmentId?: string;
}

// Mock health alerts
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
    description: 'High pollen count predicted for the next 3 days. Current level: 8.5/10.',
    recommendation: 'Take allergy medication preemptively and keep windows closed in the morning.',
    timestamp: '6 hours ago',
    location: 'Metro Area',
    isRead: false,
    isDismissed: false,
    icon: CloudRain
  },
  {
    id: '6',
    type: 'personal',
    severity: 'critical',
    title: 'High Temperature Alert',
    description: 'Your last temperature reading was 101.3°F, which is above normal range.',
    recommendation: 'Take fever-reducing medication and contact your doctor if it persists.',
    timestamp: '30 minutes ago',
    isRead: false,
    isDismissed: false,
    icon: Thermometer
  },
  {
    id: '7',
    type: 'epidemic',
    severity: 'high',
    title: 'COVID-19 Exposure Alert',
    description: 'You may have been exposed to COVID-19 based on contact tracing data.',
    recommendation: 'Get tested as soon as possible and self-isolate until results are available.',
    timestamp: '1 day ago',
    isRead: false,
    isDismissed: false,
    icon: User
  },
  {
    id: '8',
    type: 'appointment',
    severity: 'medium',
    title: 'Appointment Reminder',
    description: 'You have an upcoming appointment with Dr. Johnson tomorrow at 2:30 PM.',
    recommendation: 'Prepare any questions you have and bring your current medication list.',
    timestamp: '1 day ago',
    isRead: true,
    isDismissed: false,
    icon: Bell
  }
];

export default mockAlerts;
