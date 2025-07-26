# Vital Vue Assist - Healthcare Application Backend Setup

This document provides instructions for setting up the Supabase backend for the Vital Vue Assist healthcare application.

## 🚀 Backend Architecture

### Database Schema

The backend includes comprehensive tables for:

- **User Management**: Profiles, roles, authentication
- **Healthcare Providers**: Doctors, hospitals, specializations
- **Appointments**: Scheduling, status tracking, teleconsultations
- **Health Data**: Metrics, trends, symptoms tracking
- **Medications**: Prescriptions, reminders, interaction checks
- **Insurance**: Providers, claims, coverage
- **Communication**: Chat messages, alerts, notifications

### Key Features

- 🔐 **Row Level Security (RLS)** - Data isolation per user
- 📊 **Health Analytics** - Automated insights and trends
- 💊 **Medication Management** - Smart reminders and interactions
- 🏥 **Hospital Locator** - Geographic search capabilities
- 📱 **Real-time Updates** - Live data synchronization
- 🤖 **AI Integration** - Symptom analysis and recommendations

## 🛠️ Setup Instructions

### 1. Supabase Project Setup

1. **Create a new Supabase project** at [supabase.com](https://supabase.com)
2. **Note your project credentials**:
   - Project URL
   - Public anon key
   - Service role key (for migrations)

### 2. Environment Configuration

Update your `.env.local` file with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_RESEND_API_KEY=your_resend_api_key_for_emails
```

### 3. Database Migration

Run the migration files in order using the Supabase SQL editor:

1. **001_initial_schema.sql** - Creates all tables, types, and relationships
2. **002_seed_data.sql** - Populates with sample data
3. **003_functions.sql** - Adds helper functions and procedures

### 4. Enable Required Extensions

In Supabase dashboard > Database > Extensions, enable:
- `uuid-ossp` - For UUID generation
- `postgis` - For geographic queries (hospital locations)

### 5. Storage Configuration (Optional)

For file uploads (prescriptions, medical documents):
1. Go to Storage in Supabase dashboard
2. Create buckets: `avatars`, `documents`, `prescriptions`
3. Set appropriate policies for each bucket

## 📋 API Services

The application includes pre-built services for:

### Authentication
```typescript
import { authService } from './src/integrations/supabase/services';

// Sign up new user
await authService.signUp(email, password, userData);

// Sign in
await authService.signIn(email, password);
```

### Profile Management
```typescript
import { profileService } from './src/integrations/supabase/services';

// Get current user profile
const profile = await profileService.getCurrentProfile();

// Update profile
await profileService.updateProfile(updates);
```

### Appointments
```typescript
import { appointmentService } from './src/integrations/supabase/services';

// Get user appointments
const appointments = await appointmentService.getAppointments();

// Create new appointment
await appointmentService.createAppointment(appointmentData);
```

### Health Metrics
```typescript
import { healthMetricsService } from './src/integrations/supabase/services';

// Record health metric
await healthMetricsService.addHealthMetric({
  metric_name: 'blood_pressure',
  value: 120,
  unit: 'mmHg'
});
```

## 🔒 Security Features

### Row Level Security Policies

All tables implement RLS to ensure:
- Users can only access their own data
- Doctors can access their patients' appointment data
- Public data (hospitals, medicines) is accessible to all authenticated users

### Data Validation

- Input validation on all forms
- SQL injection prevention
- XSS protection
- Medication interaction warnings

## 📊 Analytics & Insights

### Health Trends
- Community health monitoring
- Environmental factors tracking
- Disease outbreak detection

### Personal Analytics
- Health metric trends over time
- Medication adherence tracking
- Appointment history analysis

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   - Copy credentials to `.env.local`
   - Run database migrations

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Test authentication**:
   - Visit `/auth` to create an account
   - Explore the dashboard features

## 🔧 Development Tools

### Database Management
- **Supabase Dashboard** - Web interface for data management
- **SQL Editor** - Run custom queries and migrations
- **API Documentation** - Auto-generated API docs

### Monitoring
- **Real-time Database** - Watch live data changes
- **Auth Management** - User session monitoring
- **Storage Analytics** - File upload tracking

## 📝 Sample Data

The seed data includes:
- 5 sample hospitals with locations
- 6 common medications
- 4 insurance providers
- Health trend data for analytics
- Sample user profiles and appointments

## 🤝 Contributing

When adding new features:

1. **Database Changes**: Update migration files
2. **Type Safety**: Regenerate TypeScript types
3. **Security**: Add appropriate RLS policies
4. **Services**: Create service functions for new endpoints
5. **Testing**: Test with different user roles

## 📞 Support

For issues with:
- **Database**: Check Supabase logs and RLS policies
- **Authentication**: Verify environment variables
- **Permissions**: Review user roles and policies
- **Performance**: Check query optimization and indexes

## 🔄 Deployment

For production deployment:

1. **Environment Variables**: Set production Supabase credentials
2. **Database**: Run migrations on production database
3. **Security**: Review and update RLS policies
4. **Monitoring**: Set up alerts and logging
5. **Backup**: Configure automated database backups

---

## 🎯 Next Steps

After setup, you can:
- Customize the database schema for your needs
- Add more specialized medical features
- Integrate with external APIs (payment, telemedicine)
- Implement advanced AI features for health analysis
- Add more sophisticated notification systems

The backend is designed to be scalable and can handle thousands of users while maintaining security and performance.
