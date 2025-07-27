import { 
  Heart, 
  Activity, 
  Thermometer,
  Weight,
  Droplet,
  Clock
} from 'lucide-react';

// Mock health metrics data
const mockHealthMetrics = [
  {
    id: '1',
    name: 'Blood Pressure',
    value: 120,
    unit: '/80 mmHg',
    status: 'normal',
    trend: 'stable',
    lastUpdated: '2 hours ago',
    icon: Heart
  },
  {
    id: '2',
    name: 'Heart Rate',
    value: 72,
    unit: 'bpm',
    status: 'normal',
    trend: 'up',
    lastUpdated: '1 hour ago',
    icon: Activity
  },
  {
    id: '3',
    name: 'Temperature',
    value: 98.6,
    unit: '°F',
    status: 'normal',
    trend: 'stable',
    lastUpdated: '3 hours ago',
    icon: Thermometer
  },
  {
    id: '4',
    name: 'Weight',
    value: 165,
    unit: 'lbs',
    status: 'normal',
    trend: 'down',
    lastUpdated: '1 day ago',
    icon: Weight
  },
  {
    id: '5',
    name: 'Blood Glucose',
    value: 95,
    unit: 'mg/dL',
    status: 'normal',
    trend: 'stable',
    lastUpdated: '4 hours ago',
    icon: Droplet
  },
  {
    id: '6',
    name: 'Sleep',
    value: 85,
    unit: '%',
    status: 'normal',
    trend: 'stable',
    lastUpdated: '8 hours ago',
    icon: Clock
  }
];

// Mock activities
const mockActivities = [
  {
    id: '1',
    type: 'symptom_check',
    title: 'Symptom Check',
    description: 'Logged symptoms: Headache, Fatigue',
    timestamp: '2 hours ago',
    status: 'completed'
  },
  {
    id: '2',
    type: 'appointment',
    title: 'Doctor Appointment',
    description: 'With Dr. Sarah Johnson',
    timestamp: 'Tomorrow, 10:00 AM',
    status: 'scheduled'
  },
  {
    id: '3',
    type: 'medication',
    title: 'Medication Taken',
    description: 'Vitamin D, 1000 IU',
    timestamp: '4 hours ago',
    status: 'completed'
  },
  {
    id: '4',
    type: 'consultation',
    title: 'Teleconsultation',
    description: 'With Dr. Michael Chen',
    timestamp: 'July 30, 2:30 PM',
    status: 'scheduled'
  },
  {
    id: '5',
    type: 'medication',
    title: 'Medication Reminder',
    description: 'Allergy medication',
    timestamp: 'In 2 hours',
    status: 'pending'
  }
];

export { mockHealthMetrics, mockActivities };
