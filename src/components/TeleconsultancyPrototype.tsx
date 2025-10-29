import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useTheme } from './ThemeProvider';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff,
  MessageSquare,
  Calendar,
  Star,
  Clock,
  User,
  Heart,
  Activity,
  FileText,
  Send,
  Camera,
  Monitor,
  Stethoscope
} from 'lucide-react';
import { toast } from '../hooks/use-toast';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  rating: number;
  experience: string;
  status: 'available' | 'busy' | 'offline';
  price: number;
  image: string;
  languages: string[];
  nextAvailable?: string;
}

interface Message {
  id: string;
  sender: 'patient' | 'doctor';
  content: string;
  timestamp: string;
  type: 'text' | 'prescription' | 'report';
}

const TeleconsultancyPrototype: React.FC = () => {
  const { theme } = useTheme();
  const [currentView, setCurrentView] = useState<'selection' | 'call' | 'post-call'>('selection');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Enhanced mock doctors with more realistic data
  const doctors: Doctor[] = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      specialization: 'General Physician & Family Medicine',
      rating: 4.9,
      experience: '12 years',
      status: 'available',
      price: 75,
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
      languages: ['English', 'Hindi', 'Spanish'],
      nextAvailable: 'Available Now'
    },
    {
      id: '2',
      name: 'Dr. Raj Patel',
      specialization: 'Cardiologist & Heart Specialist',
      rating: 4.8,
      experience: '15 years',
      status: 'available',
      price: 120,
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
      languages: ['English', 'Hindi', 'Gujarati'],
      nextAvailable: 'Available in 5 mins'
    },
    {
      id: '3',
      name: 'Dr. Emily Chen',
      specialization: 'Dermatologist & Skin Care',
      rating: 4.7,
      experience: '10 years',
      status: 'busy',
      price: 90,
      image: 'https://images.unsplash.com/photo-1594824388853-b22cd4c5d5aa?w=150&h=150&fit=crop&crop=face',
      languages: ['English', 'Mandarin'],
      nextAvailable: 'Available at 3:00 PM'
    },
    {
      id: '4',
      name: 'Dr. Michael Thompson',
      specialization: 'Pediatrician & Child Care',
      rating: 4.9,
      experience: '18 years',
      status: 'available',
      price: 85,
      image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face',
      languages: ['English', 'German'],
      nextAvailable: 'Available Now'
    }
  ];

  // Initialize messages when doctor is selected
  useEffect(() => {
    if (selectedDoctor && currentView === 'call') {
      setMessages([
        {
          id: '1',
          sender: 'doctor',
          content: `Hello! I'm ${selectedDoctor.name}. I can see you've joined our consultation. How are you feeling today?`,
          timestamp: new Date().toISOString(),
          type: 'text'
        },
        {
          id: '2',
          sender: 'patient',
          content: 'Hello Doctor, I\'ve been experiencing some chest discomfort and wanted to get it checked.',
          timestamp: new Date().toISOString(),
          type: 'text'
        },
        {
          id: '3',
          sender: 'doctor',
          content: 'I understand your concern. Can you describe the discomfort in more detail? When did it start?',
          timestamp: new Date().toISOString(),
          type: 'text'
        }
      ]);
    }
  }, [selectedDoctor, currentView]);

  // Call timer
  useEffect(() => {
    if (currentView === 'call') {
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
      if (currentView === 'selection') {
        setCallDuration(0);
      }
    }

    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [currentView]);

  const startConsultation = async (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    
    // Mock video stream setup
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.log('Camera access not available in demo mode');
    }
    
    setCurrentView('call');
    toast({
      title: "Consultation Started",
      description: `Connected with ${doctor.name}`,
    });
  };

  const endConsultation = () => {
    // Stop video stream
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    // Add prescription message
    const prescriptionMessage: Message = {
      id: Date.now().toString(),
      sender: 'doctor',
      content: 'Based on our consultation, I\'ve prepared a prescription and follow-up plan for you. Please check your patient portal for the complete report.',
      timestamp: new Date().toISOString(),
      type: 'prescription'
    };
    setMessages(prev => [...prev, prescriptionMessage]);
    
    setCurrentView('post-call');
    toast({
      title: "Consultation Completed",
      description: "Thank you for your time. Prescription has been sent.",
    });
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      sender: 'patient',
      content: newMessage,
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Auto doctor response for demo
    setTimeout(() => {
      const responses = [
        "Thank you for sharing that information.",
        "I understand. Let me ask you a few more questions.",
        "Based on what you've described, I'd like to examine this further.",
        "That's helpful context. Any other symptoms?",
        "I see. This information will help with the diagnosis."
      ];
      
      const doctorResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'doctor',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date().toISOString(),
        type: 'text'
      };
      setMessages(prev => [...prev, doctorResponse]);
    }, 1500);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-success/10 text-success border-success/20';
      case 'busy': return 'bg-warning/10 text-warning border-warning/20';
      case 'offline': return 'bg-muted text-muted-foreground border-muted';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  // Doctor Selection View
  if (currentView === 'selection') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary to-primary-light rounded-full mb-6">
              <Stethoscope className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="text-5xl font-bold text-foreground mb-4">MedCare Teleconsultation</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Connect with certified healthcare professionals through secure video consultations. 
              Get expert medical advice from the comfort of your home.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center p-6 medical-card">
              <div className="text-3xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">Certified Doctors</div>
            </Card>
            <Card className="text-center p-6 medical-card">
              <div className="text-3xl font-bold text-success mb-2">24/7</div>
              <div className="text-muted-foreground">Available Service</div>
            </Card>
            <Card className="text-center p-6 medical-card">
              <div className="text-3xl font-bold text-accent mb-2">98%</div>
              <div className="text-muted-foreground">Patient Satisfaction</div>
            </Card>
          </div>

          {/* Available Doctors */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground text-center mb-8">Available Doctors</h2>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {doctors.map((doctor) => (
                <Card 
                  key={doctor.id} 
                  className="medical-card hover:shadow-medical transition-all duration-300 transform hover:-translate-y-2"
                >
                  <CardHeader className="text-center pb-4">
                    <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-primary/20">
                      <AvatarImage src={doctor.image} alt={doctor.name} />
                      <AvatarFallback className="text-2xl bg-gradient-to-r from-primary to-primary-light text-primary-foreground">
                        {doctor.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-xl text-card-foreground">{doctor.name}</CardTitle>
                    <p className="text-primary font-medium">{doctor.specialization}</p>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="font-semibold">{doctor.rating}</span>
                      </div>
                      <Badge className={getStatusColor(doctor.status)}>
                        {doctor.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Experience:</span>
                        <span className="font-medium text-foreground">{doctor.experience}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fee:</span>
                        <span className="font-medium text-success">${doctor.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Next Available:</span>
                        <span className="font-medium text-primary">{doctor.nextAvailable}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Languages:</div>
                      <div className="flex flex-wrap gap-1">
                        {doctor.languages.map((lang, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button 
                      onClick={() => startConsultation(doctor)}
                      disabled={doctor.status !== 'available'}
                      className="w-full healthcare-gradient font-medium py-2"
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Start Consultation
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Video Call View
  if (currentView === 'call') {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto h-screen flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg mb-4">
            <div className="flex items-center space-x-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={selectedDoctor?.image} alt={selectedDoctor?.name} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {selectedDoctor?.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-card-foreground font-semibold">{selectedDoctor?.name}</h3>
                <p className="text-muted-foreground text-sm">{selectedDoctor?.specialization}</p>
              </div>
              <Badge className="bg-success text-success-foreground">
                <Activity className="h-3 w-3 mr-1" />
                Live Consultation
              </Badge>
            </div>
            <div className="flex items-center space-x-4 text-card-foreground">
              <Clock className="h-5 w-5" />
              <span className="font-mono text-lg">{formatDuration(callDuration)}</span>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Video Area */}
            <div className="lg:col-span-3 space-y-4">
              <div className="relative bg-muted/20 border border-border rounded-xl overflow-hidden aspect-video">
                {/* Doctor's Video */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary-light/20 flex items-center justify-center">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src={selectedDoctor?.image} alt={selectedDoctor?.name} />
                    <AvatarFallback className="bg-blue-600 text-white text-4xl">
                      {selectedDoctor?.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                {/* Patient's Video */}
                <div className="absolute bottom-4 right-4 w-48 h-36 bg-muted/50 rounded-lg overflow-hidden border-2 border-border">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {!isVideoEnabled && (
                    <div className="absolute inset-0 bg-muted flex items-center justify-center">
                      <VideoOff className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2">
                    <Badge className="bg-background/80 text-foreground text-xs">You</Badge>
                  </div>
                </div>

                {/* Call Controls */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-4">
                  <Button
                    variant={isAudioEnabled ? "default" : "destructive"}
                    size="lg"
                    onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                    className="rounded-full w-14 h-14 p-0 bg-gray-700 hover:bg-gray-600"
                  >
                    {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
                  </Button>
                  
                  <Button
                    variant={isVideoEnabled ? "default" : "destructive"}
                    size="lg"
                    onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                    className="rounded-full w-14 h-14 p-0 bg-gray-700 hover:bg-gray-600"
                  >
                    {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setShowChat(!showChat)}
                    className="rounded-full w-14 h-14 p-0 bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
                  >
                    <MessageSquare className="h-6 w-6" />
                  </Button>
                  
                  <Button
                    variant="destructive"
                    size="lg"
                    onClick={endConsultation}
                    className="rounded-full w-14 h-14 p-0"
                  >
                    <PhoneOff className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Chat Panel */}
            {showChat && (
              <div className="bg-card rounded-xl shadow-xl border border-border">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold text-card-foreground flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Consultation Chat
                  </h3>
                </div>
                
                <div className="h-96 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.sender === 'patient'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        {message.type === 'prescription' && (
                          <div className="mt-2">
                            <Badge className="bg-success/10 text-success">
                              <FileText className="h-3 w-3 mr-1" />
                              Prescription
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-4 border-t border-border">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 border border-input bg-background rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                    />
                    <Button onClick={sendMessage} size="sm" className="bg-primary hover:bg-primary/90">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Post-Call Summary View
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-success rounded-full mb-4">
            <Heart className="h-8 w-8 text-success-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Consultation Complete</h1>
          <p className="text-xl text-muted-foreground">Thank you for choosing MedCare Teleconsultation</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="flex items-center text-card-foreground">
                <FileText className="h-5 w-5 mr-2" />
                Consultation Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={selectedDoctor?.image} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {selectedDoctor?.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-foreground">{selectedDoctor?.name}</div>
                  <div className="text-sm text-muted-foreground">{selectedDoctor?.specialization}</div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium text-foreground">{formatDuration(callDuration)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium text-foreground">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Consultation Fee:</span>
                  <span className="font-medium text-success">${selectedDoctor?.price}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="flex items-center text-card-foreground">
                <Activity className="h-5 w-5 mr-2" />
                Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-success/10 rounded-lg">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-sm text-foreground">Prescription sent to your email</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-primary/10 rounded-lg">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm text-foreground">Follow-up scheduled in 2 weeks</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-accent/10 rounded-lg">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-sm text-foreground">Lab reports uploaded to portal</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8 space-x-4">
          <Button 
            onClick={() => setCurrentView('selection')}
            className="healthcare-gradient"
          >
            Book Another Consultation
          </Button>
          <Button variant="outline">
            Download Report
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TeleconsultancyPrototype;