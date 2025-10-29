import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Stethoscope, AlertCircle, Info, Thermometer, Search, Mic, MicOff, UserCheck, Calendar, X, Plus } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import { buildApiUrl, API_CONFIG, apiRequest } from '../config/api';
import ApiHealthCheck from './ApiHealthCheck';

interface SuggestedCondition {
  name: string;
  probability: number;
  severity: 'low' | 'medium' | 'high';
  recommendations: string[];
  specialists: string[];
  urgency: 'routine' | 'soon' | 'urgent';
}

interface AnalysisResponse {
  conditions: SuggestedCondition[];
  general_advice: string;
  emergency_warning: string;
}

const SymptomChecker: React.FC = () => {
  const { t } = useLanguage();
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [currentSymptom, setCurrentSymptom] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestedCondition[]>([]);
  const [generalAdvice, setGeneralAdvice] = useState('');
  const [emergencyWarning, setEmergencyWarning] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showApiDebug, setShowApiDebug] = useState(false);

  const addSymptom = (symptom: string) => {
    const trimmedSymptom = symptom.trim();
    if (trimmedSymptom && !symptoms.includes(trimmedSymptom)) {
      setSymptoms([...symptoms, trimmedSymptom]);
      setCurrentSymptom('');
    }
  };

  const removeSymptom = (index: number) => {
    setSymptoms(symptoms.filter((_, i) => i !== index));
  };

  const handleSymptomKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSymptom(currentSymptom);
    }
  };

  const analyzeSymptoms = async () => {
    if (symptoms.length === 0) {
      toast({
        title: "Please enter symptoms",
        description: "Add at least one symptom to get AI-powered analysis.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const requestData = {
        symptoms,
        age: age ? parseInt(age) : undefined,
        gender: gender || undefined,
        additional_info: additionalInfo || undefined
      };

      console.log('Sending request to:', buildApiUrl(API_CONFIG.ENDPOINTS.SYMPTOM_ANALYSIS));
      console.log('Request data:', requestData);

      const response = await apiRequest(buildApiUrl(API_CONFIG.ENDPOINTS.SYMPTOM_ANALYSIS), {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        
        // Fallback to demo data if API fails
        console.log('Falling back to demo analysis...');
        provideFallbackAnalysis();
        return;
      }

      const data: AnalysisResponse = await response.json();
      console.log('Response data:', data);
      
      setSuggestions(data.conditions);
      setGeneralAdvice(data.general_advice);
      setEmergencyWarning(data.emergency_warning);
      
      toast({
        title: "Analysis Complete",
        description: `Found ${data.conditions.length} potential conditions based on your symptoms.`,
      });
    } catch (error) {
      console.error('Network error:', error);
      
      toast({
        title: "API Temporarily Unavailable",
        description: "Using offline analysis mode. For accurate results, please try again later.",
        variant: "default"
      });
      
      // Provide fallback demo analysis
      provideFallbackAnalysis();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const provideFallbackAnalysis = () => {
    // Generate demo analysis based on common symptoms
    const commonConditions = generateFallbackConditions(symptoms);
    setSuggestions(commonConditions);
    setGeneralAdvice("This is a demo analysis since the AI backend is temporarily unavailable. Please consult with a healthcare professional for accurate diagnosis.");
    setEmergencyWarning(symptoms.some(s => 
      s.toLowerCase().includes('chest pain') || 
      s.toLowerCase().includes('difficulty breathing') ||
      s.toLowerCase().includes('severe headache')
    ) ? "If you're experiencing severe symptoms, please seek immediate medical attention or call emergency services." : "");
  };

  const generateFallbackConditions = (userSymptoms: string[]): SuggestedCondition[] => {
    const symptomKeywords = userSymptoms.join(' ').toLowerCase();
    const conditions: SuggestedCondition[] = [];

    // Common cold/flu symptoms
    if (symptomKeywords.includes('fever') || symptomKeywords.includes('cough') || symptomKeywords.includes('headache')) {
      conditions.push({
        name: "Common Cold/Flu",
        probability: 70,
        severity: "low" as const,
        recommendations: [
          "Get plenty of rest",
          "Stay hydrated with fluids",
          "Consider over-the-counter pain relievers",
          "Monitor temperature regularly"
        ],
        specialists: ["General Practitioner", "Family Medicine"],
        urgency: "routine" as const
      });
    }

    // Digestive issues
    if (symptomKeywords.includes('nausea') || symptomKeywords.includes('stomach') || symptomKeywords.includes('vomit')) {
      conditions.push({
        name: "Gastroenteritis",
        probability: 60,
        severity: "medium" as const,
        recommendations: [
          "Stay hydrated with clear fluids",
          "Follow BRAT diet (bananas, rice, applesauce, toast)",
          "Avoid dairy and fatty foods",
          "Rest and monitor symptoms"
        ],
        specialists: ["General Practitioner", "Gastroenterologist"],
        urgency: "soon" as const
      });
    }

    // Stress/anxiety symptoms
    if (symptomKeywords.includes('stress') || symptomKeywords.includes('anxiety') || symptomKeywords.includes('worry')) {
      conditions.push({
        name: "Stress/Anxiety",
        probability: 65,
        severity: "medium" as const,
        recommendations: [
          "Practice deep breathing exercises",
          "Consider meditation or mindfulness",
          "Maintain regular sleep schedule",
          "Talk to someone you trust"
        ],
        specialists: ["Psychologist", "Psychiatrist", "Counselor"],
        urgency: "routine" as const
      });
    }

    // Default general condition if no specific matches
    if (conditions.length === 0) {
      conditions.push({
        name: "General Health Concern",
        probability: 50,
        severity: "low" as const,
        recommendations: [
          "Monitor symptoms over the next 24-48 hours",
          "Maintain healthy lifestyle habits",
          "Stay hydrated and get adequate rest",
          "Consult healthcare provider if symptoms persist"
        ],
        specialists: ["General Practitioner"],
        urgency: "routine" as const
      });
    }

    return conditions;
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
        addSymptom(transcript);
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
        
        {/* API Debug Toggle */}
        <div className="flex justify-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowApiDebug(!showApiDebug)}
            className="text-xs text-muted-foreground"
          >
            {showApiDebug ? 'Hide' : 'Show'} API Status
          </Button>
        </div>
      </div>

      {/* API Health Check (Debug) */}
      {showApiDebug && (
        <div className="max-w-2xl mx-auto">
          <ApiHealthCheck />
        </div>
      )}

      {/* Symptom Input */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Symptom Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Symptoms */}
          <div className="space-y-3">
            <Label htmlFor="symptomInput" className="text-sm font-medium">
              Add Symptoms *
            </Label>
            <div className="flex gap-2">
              <Input
                id="symptomInput"
                placeholder="e.g., headache, fever, nausea (press Enter to add)"
                value={currentSymptom}
                onChange={(e) => setCurrentSymptom(e.target.value)}
                onKeyPress={handleSymptomKeyPress}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addSymptom(currentSymptom)}
                disabled={!currentSymptom.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={startVoiceInput}
                disabled={isListening}
              >
                {isListening ? (
                  <MicOff className="h-4 w-4 text-destructive" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {/* Symptom Tags */}
            {symptoms.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg">
                {symptoms.map((symptom, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="px-3 py-1 text-sm flex items-center gap-2"
                  >
                    {symptom}
                    <button
                      onClick={() => removeSymptom(index)}
                      className="hover:bg-destructive/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Age Input */}
          <div className="space-y-2">
            <Label htmlFor="patientAge" className="text-sm font-medium">
              Age (optional)
            </Label>
            <Input
              id="patientAge"
              type="number"
              placeholder="e.g., 35"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min="1"
              max="120"
            />
          </div>

          {/* Gender Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Gender (optional)</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Additional Information */}
          <div className="space-y-2">
            <Label htmlFor="additionalInfo" className="text-sm font-medium">
              Additional Information (optional)
            </Label>
            <Textarea
              id="additionalInfo"
              placeholder="Any additional details about your symptoms, duration, severity, etc."
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              className="min-h-[80px] resize-none"
            />
          </div>
          
          {/* Analyze Button */}
          <Button
            onClick={analyzeSymptoms}
            disabled={isAnalyzing || symptoms.length === 0}
            className="w-full"
            size="lg"
          >
            <Search className="h-4 w-4 mr-2" />
            {isAnalyzing ? 'Analyzing symptoms...' : '🔍 Analyze Symptoms'}
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {suggestions.length > 0 && (
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold text-center">{t('suggestedConditions')}</h2>
          
          {/* General Advice */}
          {generalAdvice && (
            <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">General Advice</h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200">{generalAdvice}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Emergency Warning */}
          {emergencyWarning && (
            <Card className="bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">⚠️ Emergency Warning</h4>
                    <p className="text-sm text-red-800 dark:text-red-200">{emergencyWarning}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
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
