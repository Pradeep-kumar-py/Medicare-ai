import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { 
  Pill, 
  Plus, 
  Clock, 
  Bell, 
  Trash2, 
  Edit,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { toast } from '../hooks/use-toast';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string[];
  startDate: string;
  endDate: string;
  notes?: string;
  completed: boolean;
}

interface Reminder {
  id: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  time: string;
  date: string;
  completed: boolean;
}

const MedicationReminder: React.FC = () => {
  const { t } = useLanguage();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [todayReminders, setTodayReminders] = useState<Reminder[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'daily',
    times: ['09:00'],
    startDate: '',
    endDate: '',
    notes: ''
  });

  // Mock medications
  useEffect(() => {
    const mockMedications: Medication[] = [
      {
        id: '1',
        name: 'Vitamin D',
        dosage: '1000 IU',
        frequency: 'daily',
        time: ['09:00'],
        startDate: '2024-01-01',
        endDate: '2024-03-01',
        completed: false
      },
      {
        id: '2',
        name: 'Blood Pressure Medication',
        dosage: '10mg',
        frequency: 'twice-daily',
        time: ['08:00', '20:00'],
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        completed: false
      },
      {
        id: '3',
        name: 'Antibiotic',
        dosage: '500mg',
        frequency: 'three-times',
        time: ['08:00', '14:00', '20:00'],
        startDate: '2024-01-10',
        endDate: '2024-01-20',
        completed: false
      }
    ];
    setMedications(mockMedications);
    generateTodayReminders(mockMedications);
  }, []);

  const generateTodayReminders = (meds: Medication[]) => {
    const today = new Date().toISOString().split('T')[0];
    const reminders: Reminder[] = [];

    meds.forEach(med => {
      if (today >= med.startDate && today <= med.endDate) {
        med.time.forEach(time => {
          reminders.push({
            id: `${med.id}-${time}`,
            medicationId: med.id,
            medicationName: med.name,
            dosage: med.dosage,
            time,
            date: today,
            completed: Math.random() > 0.7 // Random completion for demo
          });
        });
      }
    });

    setTodayReminders(reminders.sort((a, b) => a.time.localeCompare(b.time)));
  };

  const addMedication = () => {
    if (!formData.name || !formData.dosage || !formData.startDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const newMedication: Medication = {
      id: Date.now().toString(),
      name: formData.name,
      dosage: formData.dosage,
      frequency: formData.frequency,
      time: formData.times,
      startDate: formData.startDate,
      endDate: formData.endDate || '2024-12-31',
      notes: formData.notes,
      completed: false
    };

    setMedications(prev => [...prev, newMedication]);
    generateTodayReminders([...medications, newMedication]);
    
    // Reset form
    setFormData({
      name: '',
      dosage: '',
      frequency: 'daily',
      times: ['09:00'],
      startDate: '',
      endDate: '',
      notes: ''
    });
    setShowAddForm(false);

    toast({
      title: "Medication Added",
      description: `${newMedication.name} has been added to your reminders.`,
    });

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          toast({
            title: "Notifications Enabled",
            description: "You'll receive medication reminders.",
          });
        }
      });
    }
  };

  const markAsCompleted = (reminderId: string) => {
    setTodayReminders(prev =>
      prev.map(reminder =>
        reminder.id === reminderId
          ? { ...reminder, completed: !reminder.completed }
          : reminder
      )
    );

    const reminder = todayReminders.find(r => r.id === reminderId);
    if (reminder && !reminder.completed) {
      toast({
        title: "Medication Taken",
        description: `${reminder.medicationName} marked as completed.`,
      });
    }
  };

  const deleteMedication = (medicationId: string) => {
    setMedications(prev => prev.filter(med => med.id !== medicationId));
    setTodayReminders(prev => prev.filter(rem => rem.medicationId !== medicationId));
    
    toast({
      title: "Medication Removed",
      description: "Medication has been removed from your list.",
    });
  };

  const sendTestNotification = () => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('MediCare Reminder', {
          body: 'Time to take your Vitamin D - 1000 IU',
          icon: '/favicon.ico',
          badge: '/favicon.ico'
        });
        
        toast({
          title: "Test Notification Sent",
          description: "Check your browser notifications.",
        });
      } else if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            sendTestNotification();
          }
        });
      } else {
        toast({
          title: "Notifications Blocked",
          description: "Please enable notifications in your browser settings.",
          variant: "destructive"
        });
      }
    }
  };

  const getFrequencyDisplay = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'Once daily';
      case 'twice-daily': return 'Twice daily';
      case 'three-times': return 'Three times daily';
      case 'weekly': return 'Once weekly';
      default: return frequency;
    }
  };

  const getNextReminder = () => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    return todayReminders.find(reminder => 
      !reminder.completed && reminder.time > currentTime
    );
  };

  const nextReminder = getNextReminder();

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-full mb-4">
          <Pill className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold">{t('medicationTitle')}</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Never miss a dose with smart medication reminders and tracking.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="max-w-4xl mx-auto">
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card className="medical-card">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Next Reminder</p>
                  <p className="font-semibold">
                    {nextReminder ? `${nextReminder.time} - ${nextReminder.medicationName}` : 'All done today!'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="medical-card">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed Today</p>
                  <p className="font-semibold">
                    {todayReminders.filter(r => r.completed).length} / {todayReminders.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="medical-card">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Pill className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Medications</p>
                  <p className="font-semibold">{medications.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <Button onClick={() => setShowAddForm(true)} className="bg-gradient-primary">
            <Plus className="h-4 w-4 mr-2" />
            {t('addReminder')}
          </Button>
          <Button variant="outline" onClick={sendTestNotification}>
            <Bell className="h-4 w-4 mr-2" />
            Test Notification
          </Button>
        </div>
      </div>

      {/* Today's Reminders */}
      <div className="max-w-4xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold">Today's Reminders</h2>
        
        {todayReminders.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No reminders for today</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {todayReminders.map((reminder) => (
              <Card key={reminder.id} className={`medical-card ${reminder.completed ? 'opacity-75' : ''}`}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${reminder.completed ? 'bg-success/10' : 'bg-primary/10'}`}>
                        {reminder.completed ? (
                          <CheckCircle2 className="h-6 w-6 text-success" />
                        ) : (
                          <Pill className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold">{reminder.medicationName}</h4>
                        <p className="text-muted-foreground">{reminder.dosage}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            {reminder.time}
                          </Badge>
                          {reminder.completed && (
                            <Badge className="bg-success/10 text-success border-success/20">
                              Completed
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant={reminder.completed ? "outline" : "default"}
                      size="sm"
                      onClick={() => markAsCompleted(reminder.id)}
                    >
                      {reminder.completed ? 'Undo' : 'Mark Done'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Medication List */}
      <div className="max-w-4xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold">Your Medications</h2>
        
        {medications.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No medications added yet</p>
              <Button onClick={() => setShowAddForm(true)} className="mt-4">
                Add Your First Medication
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {medications.map((medication) => (
              <Card key={medication.id} className="medical-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{medication.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteMedication(medication.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Dosage</p>
                      <p className="font-medium">{medication.dosage}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Frequency</p>
                      <p className="font-medium">{getFrequencyDisplay(medication.frequency)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Times</p>
                      <div className="flex flex-wrap gap-1">
                        {medication.time.map((time, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {time}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-medium text-xs">
                        {medication.startDate} to {medication.endDate}
                      </p>
                    </div>
                  </div>
                  {medication.notes && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm">{medication.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Medication Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Add New Medication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('medicationName')} *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Vitamin D"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dosage">{t('dosage')} *</Label>
                  <Input
                    id="dosage"
                    value={formData.dosage}
                    onChange={(e) => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
                    placeholder="e.g., 1000 IU"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency">{t('frequency')}</Label>
                <select
                  id="frequency"
                  value={formData.frequency}
                  onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                  className="w-full p-2  border rounded-md dark:bg-black dark:text-gray-200"
                >
                  <option value="daily">Once daily</option>
                  <option value="twice-daily">Twice daily</option>
                  <option value="three-times">Three times daily</option>
                  <option value="weekly">Once weekly</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="e.g., Take with food"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  {t('cancel')}
                </Button>
                <Button onClick={addMedication}>
                  {t('save')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MedicationReminder;