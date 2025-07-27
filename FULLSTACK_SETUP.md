# MedCare AI - Full Stack Healthcare Application

A comprehensive healthcare management application built with React, TypeScript, and Supabase.

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** + **shadcn/ui** for styling
- **React Router** for navigation
- **TanStack Query** for server state management
- **Zustand** for client state management

### Backend (Supabase Cloud)
- **PostgreSQL** database with advanced features
- **Row Level Security (RLS)** for data protection
- **Real-time subscriptions** for live updates
- **Authentication** with multiple providers
- **Storage** for file uploads

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Supabase account

### Installation

1. **Clone and install dependencies:**
```bash
git clone <your-repo>
cd Medcare-ai
npm install
```

2. **Environment Setup:**
Create a `.env.local` file with your Supabase credentials:
```bash
# Production Configuration (Cloud Supabase)
VITE_SUPABASE_URL=https://hicokqyarvpoppxxcrit.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_RESEND_API_KEY=your_resend_key_here
```

3. **Start Development Server:**
```bash
npm run dev
```

Your app will be available at `http://localhost:8080`

## 📊 Database Schema

### Core Tables

#### Profiles
- User information extending Supabase auth
- Roles: patient, doctor, admin
- Medical history, allergies, medications

#### Doctors
- Professional information
- Specializations, ratings, availability
- Hospital affiliations

#### Appointments
- Patient-doctor scheduling
- Status tracking, notes, prescriptions
- Integration with hospital systems

#### Health Metrics
- Vital signs tracking
- Trends analysis
- Device integration support

#### Medications
- Prescription management
- Reminder system
- Dosage tracking

#### Health Alerts
- Community health notifications
- Personal health reminders
- Emergency alerts

## 🔧 Features & CRUD Operations

### ✅ Implemented Features

#### 🏥 Appointment Scheduler
- **Create**: Book appointments with doctors
- **Read**: View upcoming and past appointments
- **Update**: Reschedule or modify appointments
- **Delete**: Cancel appointments

#### 💊 Medication Reminder
- **Create**: Add new medications with schedules
- **Read**: View active medications
- **Update**: Modify dosages and schedules
- **Delete**: Remove medications

#### 📈 Health Dashboard
- **Create**: Log health metrics
- **Read**: View health trends and statistics
- **Update**: Modify recorded metrics
- **Delete**: Remove incorrect entries

#### 🚨 Health Alerts
- **Create**: Generate new alerts
- **Read**: View personal and community alerts
- **Update**: Mark as read/unread
- **Delete**: Dismiss alerts

#### 🔍 Symptom Checker
- **Create**: Log symptoms with severity
- **Read**: View symptom history
- **Update**: Modify symptom details
- **Delete**: Remove symptom logs

#### 🏥 Hospital Locator
- **Read**: Find nearby hospitals
- **Filter**: By speciality, emergency services
- **Map Integration**: Real-time location services

#### 💬 Teleconsultation
- **Create**: Schedule video consultations
- **Read**: View consultation history
- **Update**: Reschedule consultations
- **Delete**: Cancel consultations

#### 🛡️ Insurance Support
- **Read**: View insurance providers
- **Create**: Submit insurance claims
- **Update**: Track claim status

#### 💊 Medicine Hub
- **Read**: Browse available medicines
- **Search**: Find medicines by name/category
- **Filter**: By prescription requirements

### 🔐 Authentication & Authorization

- **User Registration/Login**
- **Role-based access control**
- **Protected routes**
- **Session management**

## 🎯 API Services

All CRUD operations are handled through Supabase services:

### Doctor Service
```typescript
doctorService.getDoctors(specialization?)
doctorService.getDoctorById(id)
doctorService.updateDoctor(id, updates)
```

### Appointment Service  
```typescript
appointmentService.createAppointment(data)
appointmentService.getAppointments()
appointmentService.updateAppointment(id, updates)
appointmentService.cancelAppointment(id)
```

### Medication Service
```typescript
medicationService.addMedication(medication)
medicationService.getMedications()
medicationService.updateMedication(id, updates)
medicationService.deleteMedication(id)
```

### Health Metrics Service
```typescript
healthMetricsService.addHealthMetric(metric)
healthMetricsService.getHealthMetrics()
healthMetricsService.updateHealthMetric(id, updates)
healthMetricsService.deleteHealthMetric(id)
```

## 🌐 Real-time Features

- **Live appointment updates**
- **Real-time health alerts**
- **Instant messaging in teleconsultations**
- **Live medication reminders**

## 📱 Responsive Design

- **Mobile-first approach**
- **Tablet and desktop optimized**
- **Touch-friendly interfaces**
- **Adaptive layouts**

## 🔒 Security

- **Row Level Security (RLS)** on all tables
- **User data isolation**
- **Secure authentication**
- **Data encryption in transit**

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Deploy to Netlify/Vercel
```bash
# Build automatically deploys with your connected repository
```

### Environment Variables for Production
```bash
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
```

## 📈 Monitoring & Analytics

- **Supabase Dashboard** for database monitoring
- **Real-time metrics** for app performance
- **User analytics** and engagement tracking

## 🛠️ Development

### Code Structure
```
src/
├── components/          # React components
├── context/            # React context providers
├── hooks/              # Custom React hooks
├── integrations/       # Supabase integration
│   └── supabase/      # Services and types
├── lib/               # Utility functions
└── pages/             # Page components
```

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

## 🆘 Need Help?

- Check the [Supabase Documentation](https://supabase.com/docs)
- Review the [React Documentation](https://react.dev)
- Open an issue for bugs or feature requests
