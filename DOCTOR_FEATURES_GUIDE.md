# Doctor Login and Teleconsultation Features

## Overview
This update adds comprehensive doctor authentication, dashboard, and teleconsultation features to the Medicare AI platform.

## New Features Added

### 1. Doctor Authentication
- **Doctor Signup**: Extended signup form with doctor-specific fields
- **Separate Login**: Doctors can sign up with specialized information
- **Role-based Authentication**: System recognizes doctor vs patient roles

### 2. Doctor Dashboard (`/doctor-dashboard`)
- **Appointment Management**: View and manage upcoming appointments
- **Online/Offline Status**: Toggle availability for new bookings
- **Real-time Updates**: Live notifications for new appointments
- **Patient Communication**: Start teleconsultation calls with patients

### 3. Enhanced Teleconsultation
- **Room-based Calls**: Support for direct doctor-patient video calls
- **URL Parameters**: Join calls via links (e.g., `/teleconsultation?room=abc123&doctor=true`)
- **Doctor-initiated Calls**: Doctors can start calls from their dashboard

### 4. Database Integration
- **Real Doctor Data**: Fetches doctors from Supabase database
- **Console Logging**: Debug information for doctor data fetching
- **Appointment Booking**: Save appointments to database with teleconsultation support

## How to Test

### Setup Doctor Account
1. Go to `/auth` page
2. Click "Sign up"
3. Fill in your details
4. **Toggle "I am a doctor"** switch
5. Fill in doctor-specific information:
   - Specialization (required)
   - Medical License Number (required)
   - Years of Experience (required)
   - Consultation Fee (required)
   - Bio, Education, Certifications (optional)
6. Complete signup

### Test Doctor Dashboard
1. Login with doctor credentials
2. You'll be automatically redirected to `/doctor-dashboard`
3. View your appointment statistics
4. Toggle your online/offline status
5. Manage appointments (confirm, cancel, complete)

### Test Teleconsultation
1. **As Doctor**: Click "Start Call" button on confirmed appointments
2. **As Patient**: Book a teleconsultation appointment type
3. **Direct Room Join**: Use URL parameters like:
   ```
   /teleconsultation?room=appointment123&doctor=true&patient=patient@email.com
   ```

### Test Database Integration
1. Open browser Developer Tools → Console
2. Navigate to `/appointments` page
3. You'll see detailed console logs:
   ```
   Starting to fetch doctors from database...
   Raw doctors data from database: [...]
   Transformed doctors for UI: [...]
   ```

## Database Requirements

### Sample Doctor Data
Run the following SQL in your Supabase SQL editor:

```sql
-- First, create a user profile with doctor role
INSERT INTO profiles (id, email, full_name, role) VALUES 
('doctor-uuid-1', 'doctor@example.com', 'Dr. John Smith', 'doctor');

-- Then create the doctor record
INSERT INTO doctors (profile_id, specialization, license_number, experience_years, consultation_fee, bio) VALUES 
('doctor-uuid-1', 'cardiology', 'MD123456', 10, 150.00, 'Experienced cardiologist specializing in heart disease treatment');
```

### Check Doctor Data
To verify doctors are in the database:
```sql
SELECT d.*, p.full_name, p.email 
FROM doctors d 
JOIN profiles p ON d.profile_id = p.id 
WHERE d.is_available = true;
```

## Console Debug Information

When testing, check the browser console for:
- Doctor fetching logs
- Appointment booking confirmations
- Authentication state changes
- Real-time appointment updates

## Navigation Updates
- **Doctors**: See Dashboard, Teleconsultation, Profile in navigation
- **Patients**: See standard patient navigation
- **Role Detection**: Automatic UI adaptation based on user role

## Known Limitations
- Video calling uses mock WebRTC (camera access only)
- Email invitations not yet implemented
- Real-time signaling needs WebSocket server setup

## Next Steps
1. Implement real WebRTC peer-to-peer connections
2. Add email invitation system for appointments
3. Enhance real-time notifications
4. Add prescription management
5. Implement payment processing for consultations
