import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Stethoscope, AlertCircle, Info, Thermometer, Search, Mic, MicOff, UserCheck, Calendar } from 'lucide-react';
import { toast } from '../hooks/use-toast';

interface SuggestedCondition {
  name: string;
  probability: number;
  severity: 'low' | 'medium' | 'high';
  recommendations: string[];
  specialists: string[];
  urgency: 'routine' | 'soon' | 'urgent';
}

const SymptomChecker: React.FC = () => {
  const { t } = useLanguage();
  const [symptoms, setSymptoms] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestedCondition[]>([]);
  const [isListening, setIsListening] = useState(false);

  // Mock conditions database
  const mockConditions: SuggestedCondition[] = [
    {
      name: 'Common Cold',
      probability: 85,
      severity: 'low',
      recommendations: [
        'Rest and stay hydrated',
        'Consider over-the-counter pain relievers',
        'Monitor symptoms for 7-10 days'
      ],
      specialists: ['General Physician', 'Family Medicine'],
      urgency: 'routine'
    },
    {
      name: 'Seasonal Allergies',
      probability: 70,
      severity: 'low',
      recommendations: [
        'Take antihistamines',
        'Avoid known allergens',
        'Consider nasal decongestants'
      ],
      specialists: ['Allergist', 'ENT Specialist', 'General Physician'],
      urgency: 'routine'
    },
    {
      name: 'Viral Infection',
      probability: 65,
      severity: 'medium',
      recommendations: [
        'Get plenty of rest',
        'Stay isolated to prevent spread',
        'Consult doctor if symptoms worsen'
      ],
      specialists: ['General Physician', 'Internal Medicine'],
      urgency: 'soon'
    },
    {
      name: 'Migraine',
      probability: 60,
      severity: 'medium',
      recommendations: [
        'Rest in a dark, quiet room',
        'Apply cold compress',
        'Consider prescribed medications'
      ],
      specialists: ['Neurologist', 'General Physician'],
      urgency: 'soon'
    },
    {
      name: 'Hypertension',
      probability: 55,
      severity: 'high',
      recommendations: [
        'Monitor blood pressure regularly',
        'Reduce sodium intake',
        'Exercise regularly',
        'Take prescribed medications'
      ],
      specialists: ['Cardiologist', 'Internal Medicine'],
      urgency: 'urgent'
    }
  ];

  const analyzeSymptoms = async () => {
    if (!symptoms.trim()) {
      toast({
        title: "Please enter symptoms",
        description: "Describe your symptoms to get AI-powered analysis.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate API call
    setTimeout(() => {
      // Mock analysis based on keywords
      const relevantConditions = mockConditions.filter(condition => {
        const keywords = symptoms.toLowerCase();
        if (keywords.includes('headache') || keywords.includes('head')) {
          return condition.name.includes('Migraine');
        }
        if (keywords.includes('fever') || keywords.includes('cold') || keywords.includes('cough')) {
          return condition.name.includes('Cold') || condition.name.includes('Viral');
        }
        if (keywords.includes('sneez') || keywords.includes('itch') || keywords.includes('runny')) {
          return condition.name.includes('Allergies');
        }
        return true;
      }).slice(0, 3);

      setSuggestions(relevantConditions);
      setIsAnalyzing(false);
      
      toast({
        title: "Analysis Complete",
        description: `Found ${relevantConditions.length} potential conditions based on your symptoms.`,
      });
    }, 2000);
  };

  const startVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      setIsListening(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSymptoms(prev => prev + ' ' + transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        toast({
          title: "Voice input failed",
          description: "Please try again or type your symptoms manually.",
          variant: "destructive"
        });
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      toast({
        title: "Voice input not supported",
        description: "Your browser doesn't support voice input. Please type your symptoms.",
        variant: "destructive"
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-success/10 text-success border-success/20';
      case 'medium': return 'bg-warning/10 text-warning border-warning/20';
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low': return <Info className="h-4 w-4" />;
      case 'medium': return <AlertCircle className="h-4 w-4" />;
      case 'high': return <Thermometer className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'routine': return 'text-muted-foreground';
      case 'soon': return 'text-warning';
      case 'urgent': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const bookAppointment = (specialists: string[]) => {
    // Navigate to appointment page with specialist pre-selected
    window.location.href = '/appointments';
  };

  return (
    <div className="container py-6 sm:py-8 space-y-6 sm:space-y-8 px-4">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-primary rounded-full mb-4">
          <Stethoscope className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">{t('symptomCheckerTitle')}</h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
          Describe your symptoms and get AI-powered health insights and recommendations.
        </p>
      </div>

      {/* Symptom Input */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Symptom Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Describe your symptoms</label>
            <Textarea
              placeholder={t('enterSymptoms')}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="min-h-[120px] resize-none"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={analyzeSymptoms}
              disabled={isAnalyzing}
              className="flex-1"
            >
              <Search className="h-4 w-4 mr-2" />
              {isAnalyzing ? t('loading') : t('checkSymptoms')}
            </Button>
            
            <Button
              variant="outline"
              onClick={startVoiceInput}
              disabled={isListening}
              className="flex items-center space-x-2"
            >
              {isListening ? (
                <>
                  <MicOff className="h-4 w-4 text-destructive" />
                  <span>Listening...</span>
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" />
                  <span>Voice Input</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {suggestions.length > 0 && (
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold text-center">{t('suggestedConditions')}</h2>
          
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {suggestions.map((condition, index) => (
              <Card key={index} className="medical-card hover:shadow-medical transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{condition.name}</CardTitle>
                    <Badge className={getSeverityColor(condition.severity)}>
                      {getSeverityIcon(condition.severity)}
                      <span className="ml-1 capitalize">{condition.severity}</span>
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${condition.probability}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{condition.probability}%</span>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Recommendations:</h4>
                      <ul className="space-y-2">
                        {condition.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-sm flex items-start space-x-2">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <UserCheck className="h-4 w-4" />
                        Suggested Specialists:
                      </h4>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {condition.specialists.map((specialist, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {specialist}
                          </Badge>
                        ))}
                      </div>
                      <p className={`text-xs mb-3 ${getUrgencyColor(condition.urgency)}`}>
                        Urgency: <span className="capitalize font-medium">{condition.urgency}</span>
                      </p>
                      <Button 
                        size="sm" 
                        className="w-full" 
                        onClick={() => bookAppointment(condition.specialists)}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Book Appointment
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Disclaimer */}
          <Card className="bg-warning/5 border-warning/20">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-semibold text-warning">Medical Disclaimer</h4>
                  <p className="text-sm text-muted-foreground">
                    This analysis is for informational purposes only and should not replace professional medical advice. 
                    Please consult with a healthcare provider for proper diagnosis and treatment.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SymptomChecker;