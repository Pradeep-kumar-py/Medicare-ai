import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff,
  MessageSquare,
  Share2,
  Settings,
  Clock,
  Star,
  Calendar,
  User
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
}

interface Message {
  id: string;
  sender: 'user' | 'doctor';
  content: string;
  timestamp: string;
  type: 'text' | 'file' | 'prescription';
}

const Teleconsultation: React.FC = () => {
  const { t } = useLanguage();
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const callTimerRef = useRef<NodeJS.Timeout>();

  // Mock doctors
  const doctors: Doctor[] = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      specialization: 'General Physician',
      rating: 4.8,
      experience: '12 years',
      status: 'available',
      price: 75,
      image: '👩‍⚕️',
      languages: ['English', 'Hindi']
    },
    {
      id: '2',
      name: 'Dr. Michael Chen',
      specialization: 'Cardiologist',
      rating: 4.9,
      experience: '15 years',
      status: 'available',
      price: 120,
      image: '👨‍⚕️',
      languages: ['English']
    },
    {
      id: '3',
      name: 'Dr. Emily Rodriguez',
      specialization: 'Dermatologist',
      rating: 4.7,
      experience: '8 years',
      status: 'busy',
      price: 90,
      image: '👩‍⚕️',
      languages: ['English', 'Spanish']
    },
    {
      id: '4',
      name: 'Dr. Raj Patel',
      specialization: 'Pediatrician',
      rating: 4.9,
      experience: '20 years',
      status: 'available',
      price: 85,
      image: '👨‍⚕️',
      languages: ['English', 'Hindi', 'Gujarati']
    }
  ];

  // Mock messages
  useEffect(() => {
    if (selectedDoctor) {
      setMessages([
        {
          id: '1',
          sender: 'doctor',
          content: `Hello! I'm ${selectedDoctor.name}. How can I help you today?`,
          timestamp: new Date().toISOString(),
          type: 'text'
        }
      ]);
    }
  }, [selectedDoctor]);

  // Call timer
  useEffect(() => {
    if (isInCall) {
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
      setCallDuration(0);
    }

    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [isInCall]);

  const startVideoCall = async () => {
    if (!selectedDoctor) {
      toast({
        title: "Select a Doctor",
        description: "Please select a doctor before starting the consultation.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Mock video stream setup
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setIsInCall(true);
      setIsVideoEnabled(true);
      setIsAudioEnabled(true);
      
      toast({
        title: "Call Started",
        description: `Connected with ${selectedDoctor.name}`,
      });
    } catch (error) {
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera and microphone access for video calls.",
        variant: "destructive"
      });
    }
  };

  const endCall = () => {
    // Stop video stream
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    setIsInCall(false);
    setIsVideoEnabled(false);
    setIsAudioEnabled(false);
    setCallDuration(0);
    
    // Add call summary message
    const summaryMessage: Message = {
      id: Date.now().toString(),
      sender: 'doctor',
      content: 'Thank you for the consultation. I\'ve sent a prescription and follow-up instructions to your account.',
      timestamp: new Date().toISOString(),
      type: 'prescription'
    };
    setMessages(prev => [...prev, summaryMessage]);
    
    toast({
      title: "Call Ended",
      description: "Consultation completed successfully.",
    });
  };

  const toggleVideo = () => {
    setIsVideoEnabled(prev => !prev);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
      }
    }
  };

  const toggleAudio = () => {
    setIsAudioEnabled(prev => !prev);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
      }
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: newMessage,
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Mock doctor response
    setTimeout(() => {
      const doctorResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'doctor',
        content: 'Thank you for sharing that information. Based on what you\'ve described, I recommend...',
        timestamp: new Date().toISOString(),
        type: 'text'
      };
      setMessages(prev => [...prev, doctorResponse]);
    }, 2000);
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

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'available': return 'bg-success';
      case 'busy': return 'bg-warning';
      case 'offline': return 'bg-muted-foreground';
      default: return 'bg-muted-foreground';
    }
  };

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-full mb-4">
          <Video className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold">{t('teleconsultation')}</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Connect with qualified healthcare professionals from the comfort of your home.
        </p>
      </div>

      {!isInCall ? (
        /* Doctor Selection */
        <div className="max-w-6xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold text-center">Choose Your Doctor</h2>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {doctors.map((doctor) => (
              <Card 
                key={doctor.id} 
                className={`medical-card cursor-pointer transition-all duration-300
                  ${selectedDoctor?.id === doctor.id 
                    ? 'ring-2 ring-primary shadow-medical' 
                    : 'hover:shadow-medical'
                  }`}
                onClick={() => setSelectedDoctor(doctor)}
              >
                <CardHeader>
                  <div className="flex items-start space-x-4">
                    <div className="relative">
                      <div className="text-4xl">{doctor.image}</div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusDot(doctor.status)}`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{doctor.name}</CardTitle>
                      <p className="text-muted-foreground">{doctor.specialization}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="secondary">
                          <Star className="h-3 w-3 mr-1" />
                          {doctor.rating}
                        </Badge>
                        <Badge className={getStatusColor(doctor.status)}>
                          {doctor.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Experience</span>
                      <span className="text-sm font-medium">{doctor.experience}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Consultation Fee</span>
                      <span className="text-sm font-medium">${doctor.price}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Languages</span>
                      <div className="flex flex-wrap gap-1">
                        {doctor.languages.map((lang, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedDoctor && (
            <div className="max-w-2xl mx-auto">
              <Card className="medical-card">
                <CardHeader>
                  <CardTitle className="text-center">Ready to Connect?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-muted/20 rounded-lg">
                    <h4 className="font-semibold">{selectedDoctor.name}</h4>
                    <p className="text-muted-foreground">{selectedDoctor.specialization}</p>
                    <Badge className="mt-2">
                      Consultation Fee: ${selectedDoctor.price}
                    </Badge>
                  </div>

                  <div className="flex justify-center space-x-4">
                    <Button 
                      onClick={startVideoCall}
                      disabled={selectedDoctor.status !== 'available'}
                      className="bg-gradient-primary"
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Start Video Call
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setShowChat(true)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Start Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      ) : (
        /* Video Call Interface */
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Video Area */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="medical-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="text-3xl">{selectedDoctor?.image}</div>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-success border border-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{selectedDoctor?.name}</CardTitle>
                        <p className="text-muted-foreground">{selectedDoctor?.specialization}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-mono">{formatDuration(callDuration)}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                    {/* Doctor's Video (Mock) */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-8xl">{selectedDoctor?.image}</div>
                    </div>
                    
                    {/* User's Video */}
                    <div className="absolute bottom-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden border-2 border-white">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      {!isVideoEnabled && (
                        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                          <VideoOff className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Call Status */}
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-success/90 text-white">
                        Live Call
                      </Badge>
                    </div>
                  </div>

                  {/* Call Controls */}
                  <div className="flex justify-center space-x-4 mt-6">
                    <Button
                      variant={isAudioEnabled ? "default" : "destructive"}
                      size="lg"
                      onClick={toggleAudio}
                      className="rounded-full w-12 h-12 p-0"
                    >
                      {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                    </Button>
                    
                    <Button
                      variant={isVideoEnabled ? "default" : "destructive"}
                      size="lg"
                      onClick={toggleVideo}
                      className="rounded-full w-12 h-12 p-0"
                    >
                      {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setShowChat(!showChat)}
                      className="rounded-full w-12 h-12 p-0"
                    >
                      <MessageSquare className="h-5 w-5" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="lg"
                      className="rounded-full w-12 h-12 p-0"
                    >
                      <Share2 className="h-5 w-5" />
                    </Button>
                    
                    <Button
                      variant="destructive"
                      size="lg"
                      onClick={endCall}
                      className="rounded-full w-12 h-12 p-0"
                    >
                      <PhoneOff className="h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chat Panel */}
            <div className={`${showChat || !isInCall ? 'block' : 'hidden lg:block'}`}>
              <Card className="medical-card h-96">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5" />
                    <span>Chat</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col h-80">
                  <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg text-sm ${
                            message.sender === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p>{message.content}</p>
                          {message.type === 'prescription' && (
                            <Badge className="mt-2 bg-success/10 text-success">
                              Prescription Sent
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 border rounded-md text-sm"
                    />
                    <Button size="sm" onClick={sendMessage}>
                      Send
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teleconsultation;