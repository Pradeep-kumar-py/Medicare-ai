import React, { createContext, useContext, useState, ReactNode } from 'react';

// Translation data structure
interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: Translations = {
  en: {
    // Navigation
    home: 'Home',
    symptoms: 'Symptom Checker',
    appointments: 'Appointments',
    reminders: 'Reminders',
    dashboard: 'Dashboard',
    teleconsultation: 'Teleconsultation',
    alerts: 'Health Alerts',
    trends: 'Health Trends',
    
    // Home Page
    welcomeTitle: 'Welcome to MediCare AI',
    welcomeSubtitle: 'Your Personal Healthcare Assistant',
    welcomeDescription: 'Get instant health insights, book appointments, and manage your wellness journey with AI-powered healthcare solutions.',
    getStarted: 'Get Started',
    
    // Symptom Checker
    symptomCheckerTitle: 'AI Symptom Checker',
    enterSymptoms: 'Describe your symptoms...',
    checkSymptoms: 'Check Symptoms',
    suggestedConditions: 'Suggested Conditions',
    
    // Appointments
    appointmentTitle: 'Book Appointment',
    selectDate: 'Select Date',
    selectTime: 'Select Time',
    bookAppointment: 'Book Appointment',
    
    // Reminders
    medicationTitle: 'Medication Reminders',
    addReminder: 'Add Reminder',
    medicationName: 'Medication Name',
    dosage: 'Dosage',
    frequency: 'Frequency',
    
    // Dashboard
    dashboardTitle: 'Health Dashboard',
    recentActivities: 'Recent Activities',
    healthMetrics: 'Health Metrics',
    
    // Common
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    submit: 'Submit',
    edit: 'Edit',
    delete: 'Delete',
    search: 'Search',
    filter: 'Filter',
    close: 'Close',
  },
  hi: {
    // Navigation
    home: 'होम',
    symptoms: 'लक्षण जांच',
    appointments: 'अपॉइंटमेंट',
    reminders: 'रिमाइंडर',
    dashboard: 'डैशबोर्ड',
    teleconsultation: 'टेली परामर्श',
    alerts: 'स्वास्थ्य अलर्ट',
    trends: 'स्वास्थ्य रुझान',
    
    // Home Page
    welcomeTitle: 'मेडिकेयर AI में आपका स्वागत है',
    welcomeSubtitle: 'आपका व्यक्तिगत स्वास्थ्य सहायक',
    welcomeDescription: 'AI-संचालित स्वास्थ्य समाधानों के साथ तुरंत स्वास्थ्य जानकारी प्राप्त करें, अपॉइंटमेंट बुक करें और अपनी कल्याण यात्रा को प्रबंधित करें।',
    getStarted: 'शुरू करें',
    
    // Symptom Checker
    symptomCheckerTitle: 'AI लक्षण जांच',
    enterSymptoms: 'अपने लक्षणों का वर्णन करें...',
    checkSymptoms: 'लक्षण जांचें',
    suggestedConditions: 'सुझाई गई स्थितियां',
    
    // Appointments
    appointmentTitle: 'अपॉइंटमेंट बुक करें',
    selectDate: 'दिनांक चुनें',
    selectTime: 'समय चुनें',
    bookAppointment: 'अपॉइंटमेंट बुक करें',
    
    // Reminders
    medicationTitle: 'दवा रिमाइंडर',
    addReminder: 'रिमाइंडर जोड़ें',
    medicationName: 'दवा का नाम',
    dosage: 'खुराक',
    frequency: 'आवृत्ति',
    
    // Dashboard
    dashboardTitle: 'स्वास्थ्य डैशबोर्ड',
    recentActivities: 'हाल की गतिविधियां',
    healthMetrics: 'स्वास्थ्य मेट्रिक्स',
    
    // Common
    loading: 'लोड हो रहा है...',
    save: 'सेव करें',
    cancel: 'रद्द करें',
    submit: 'जमा करें',
    edit: 'संपादित करें',
    delete: 'हटाएं',
    search: 'खोजें',
    filter: 'फिल्टर',
    close: 'बंद करें',
  }
};

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<string>('en');

  const t = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};