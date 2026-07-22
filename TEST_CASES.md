# 🧪 QA TEST CASES - NEURO VOICE COMPANION APP

**Document Version:** 1.0  
**Last Updated:** 2026-07-22  
**Created By:** Senior QA Engineer  
**Status:** Complete Test Suite  

---

## 📋 TABLE OF CONTENTS

1. [Login Test Cases](#login)
2. [Register Test Cases](#register)
3. [Home Screen Test Cases](#home)
4. [Voice Assistant Test Cases](#voice)
5. [Memories Test Cases](#memories)
6. [Reminders Test Cases](#reminders)
7. [Medications Test Cases](#medications)
8. [Contacts Test Cases](#contacts)
9. [Profile Test Cases](#profile)
10. [Navigation Test Cases](#navigation)
11. [Permissions Test Cases](#permissions)
12. [API Validation Test Cases](#api)
13. [Network Test Cases](#network)
14. [Regression Test Cases](#regression)

---

## <a id="login"></a>🔐 LOGIN TEST CASES

### Patient Login - Positive Tests

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_LOGIN_001 | Patient Login - Valid Credentials | 1. Launch app 2. Tap "Login" 3. Select "Patient" mode 4. Enter valid phone 5. Enter valid password 6. Tap "Login" | Phone: 9876543210, Password: Test@123 | Successfully logged in, redirected to home screen | P0 | Critical |
| TC_LOGIN_002 | Patient Login - UI Display | 1. Navigate to login screen 2. Verify all UI elements present | N/A | Logo, title, mode toggle, phone input, password input, login button visible | P1 | High |
| TC_LOGIN_003 | Patient Login - Mode Toggle | 1. Open login screen 2. Tap Patient mode 3. Verify UI updates 4. Tap Caretaker mode 5. Verify UI changes | N/A | Placeholder text changes to "Patient phone" and "Caretaker phone" respectively | P1 | Medium |
| TC_LOGIN_004 | Patient Login - Create Account Link | 1. Open login screen 2. Tap "Create Account" link | N/A | Navigate to register screen | P1 | Low |
| TC_LOGIN_005 | Patient Login - Error Handling | 1. Enter invalid phone 2. Enter invalid password 3. Tap Login | Phone: 9999999999, Password: wrong | Alert: "Invalid credentials" displayed | P0 | Critical |
| TC_LOGIN_006 | Patient Login - Empty Fields | 1. Leave phone field empty 2. Enter password 3. Tap Login | Phone: empty, Password: Test@123 | Alert: "Phone and password are required" | P1 | High |
| TC_LOGIN_007 | Patient Login - Token Storage | 1. Login successfully 2. Check AsyncStorage | Valid credentials | Token, user data, and role stored in AsyncStorage | P1 | High |

### Caretaker Login - Positive Tests

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_LOGIN_008 | Caretaker Login - Valid Credentials | 1. Launch app 2. Tap "Login" 3. Select "Caretaker" mode 4. Enter valid caretaker phone 5. Enter password 6. Tap Login | Phone: 9876543211, Password: Care@123 | Logged in, home screen shows managed patient name | P0 | Critical |
| TC_LOGIN_009 | Caretaker Login - Role Assignment | 1. Login as caretaker 2. Check role in AsyncStorage 3. Check home screen | Valid caretaker credentials | Role = "caretaker", caretaker data stored | P1 | High |
| TC_LOGIN_010 | Caretaker Login - Patient Link Display | 1. Login as caretaker 2. Check home greeting | Valid credentials | Home shows "Managed by [Patient Name]" | P1 | Medium |
| TC_LOGIN_011 | Caretaker Login - Invalid Patient Link | 1. Try login with caretaker not linked to patient | Unlinked caretaker credentials | Alert: "Invalid caretaker credentials" | P1 | High |
| TC_LOGIN_012 | Caretaker Login - Multiple Patients | 1. Caretaker linked to multiple patients 2. Login 3. Check selected patient | Valid credentials | Uses first linked patient (by created_at) | P2 | Medium |
| TC_LOGIN_013 | Caretaker Login - Session Token | 1. Login as caretaker 2. Check token structure | Valid credentials | Token includes caretaker_id, patient_id, role | P1 | High |
| TC_LOGIN_014 | Caretaker Login - Expired Session | 1. Wait for token expiry (7 days) 2. Try accessing app | Expired token | Redirect to login screen | P1 | High |

### Login - Negative Tests

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_LOGIN_015 | Login - Wrong Password | 1. Select mode 2. Enter valid phone 3. Enter wrong password 4. Tap Login | Phone: 9876543210, Password: wrong123 | Alert: "Invalid credentials" | P0 | Critical |
| TC_LOGIN_016 | Login - Non-existent User | 1. Select mode 2. Enter phone not registered 3. Enter any password | Phone: 1111111111 | Alert: "Invalid credentials" | P0 | Critical |
| TC_LOGIN_017 | Login - SQL Injection Attempt | 1. Enter SQL injection in phone field 2. Tap Login | Phone: " OR 1=1--" | Error handled, alert displayed | P1 | Critical |
| TC_LOGIN_018 | Login - Network Error | 1. Disable network 2. Try login | No internet | Alert: "Network error" or timeout | P1 | High |

---

## <a id="register"></a>📝 REGISTER TEST CASES

### Patient Registration - Positive Tests

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_REG_001 | Patient Register - Valid Data | 1. Open register screen 2. Select Patient mode 3. Enter full name 4. Enter phone 5. Enter age 6. Enter password 7. Tap Register | Name: John Doe, Phone: 9123456789, Age: 65, Password: Secure@123 | Success alert, redirect to login | P0 | Critical |
| TC_REG_002 | Patient Register - UI Display | 1. Navigate to register screen 2. Verify all fields | N/A | Full name, phone, age, password inputs visible | P1 | Medium |
| TC_REG_003 | Patient Register - Mode Selection | 1. Open register 2. Tap Patient mode 3. Verify fields | N/A | Shows name, phone, age, password fields | P1 | Medium |
| TC_REG_004 | Patient Register - Duplicate Phone | 1. Register with existing phone | Phone: 9123456789 (already exists) | Alert: "Phone already registered" | P1 | High |
| TC_REG_005 | Patient Register - Password Validation | 1. Enter weak password | Password: 123 | Should allow (no strength validation shown) | P2 | Low |
| TC_REG_006 | Patient Register - ScrollView | 1. Open register on small screen 2. Scroll down | N/A | All fields accessible via scroll | P1 | Medium |

### Caretaker Registration - Positive Tests

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_REG_007 | Caretaker Register - Valid Data | 1. Open register 2. Select Caretaker mode 3. Enter full name 4. Enter phone 5. Enter patient phone 6. Enter relationship 7. Enter password 8. Tap Register | Name: Jane Care, Phone: 9987654321, Patient Phone: 9123456789, Relationship: daughter, Password: Safe@123 | Success alert, caretaker created and linked to patient | P0 | Critical |
| TC_REG_008 | Caretaker Register - Patient Not Found | 1. Open register 2. Select Caretaker mode 3. Enter non-existent patient phone | Patient Phone: 9999999999 | Alert: "Patient phone not found" | P1 | High |
| TC_REG_009 | Caretaker Register - Duplicate Phone | 1. Register caretaker with existing caretaker phone | Phone: 9987654321 (exists) | Alert: "Caretaker phone already registered" | P1 | High |
| TC_REG_010 | Caretaker Register - Relationship Field | 1. Register caretaker 2. Verify relationship saved | Relationship: nurse | Relationship stored correctly | P1 | Medium |
| TC_REG_011 | Caretaker Register - Emergency Contact Auto-add | 1. Register caretaker 2. Check patient's emergency contacts | Valid data | Caretaker auto-added to patient's emergency contacts | P1 | High |
| TC_REG_012 | Caretaker Register - Mode Fields | 1. Select Caretaker mode 2. Verify fields shown | N/A | Name, phone, patient phone, relationship, password shown | P1 | Medium |

### Registration - Validation Tests

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_REG_013 | Register - Empty Fields | 1. Leave all fields empty 2. Tap Register | All empty | Alert: "Missing fields" | P1 | High |
| TC_REG_014 | Register - Special Characters in Name | 1. Enter special characters in name 2. Register | Name: John@Doe#123 | Should allow or reject (depends on validation) | P2 | Low |
| TC_REG_015 | Register - Network Error | 1. Disable network 2. Try register | No internet | Alert: "Network error" | P1 | High |
| TC_REG_016 | Register - Partial Entry | 1. Enter some fields 2. Try register | Incomplete data | Alert: "Missing fields" | P1 | High |
| TC_REG_017 | Register - Already Logged In | 1. Login first 2. Navigate to register | Already authenticated | Should redirect to home or show warning | P2 | Medium |
| TC_REG_018 | Register - Back Navigation | 1. Open register 2. Tap back/navigate to login | N/A | Redirect to login screen | P1 | Medium |

---

## <a id="home"></a>🏠 HOME SCREEN TEST CASES

### Dashboard Display & Loading

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_HOME_001 | Home - Initial Load | 1. Login 2. Verify dashboard loads | Valid login | Loading spinner shown, then dashboard displayed | P0 | Critical |
| TC_HOME_002 | Home - Welcome Message | 1. Login 2. Check greeting | Any user | Displays "Good Morning [User Name]" | P1 | Medium |
| TC_HOME_003 | Home - Caretaker Badge | 1. Login as caretaker 2. Check home | Caretaker login | Shows "Managed by [Patient Name]" | P1 | Medium |
| TC_HOME_004 | Home - Hero Card Display | 1. Login 2. Check hero section | N/A | Greeting, name, info text visible | P1 | Medium |
| TC_HOME_005 | Home - Voice Shortcut Button | 1. Login 2. Verify voice button in hero | N/A | Microphone icon button visible and tappable | P1 | Low |

### Metrics & Health Score

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_HOME_006 | Home - Memory Health Score | 1. Login 2. Check score display | User has data | Score 0-100 displayed with progress bar | P1 | Medium |
| TC_HOME_007 | Home - Score Calculation | 1. Login 2. Check score math | 10 memories, 5 completed reminders | Score = (10*5) + (5*3) = 65% | P1 | High |
| TC_HOME_008 | Home - Metric Cards Display | 1. Login 2. Verify 4 metric cards | N/A | Pending Tasks, Care Team, Medicines, Memories visible | P1 | Medium |
| TC_HOME_009 | Home - Metric Values | 1. Login 2. Check metric numbers | User data exists | Numbers match backend data | P1 | High |

### Navigation & Content

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_HOME_010 | Home - Voice Shortcut Navigation | 1. Login 2. Tap voice button in hero | N/A | Navigate to /voice screen | P1 | Medium |
| TC_HOME_011 | Home - Quick Actions | 1. Login 2. Verify 3 quick action buttons | N/A | Reminder, Memory, Contacts buttons visible | P1 | Medium |
| TC_HOME_012 | Home - Today Section | 1. Login 2. Check today reminders | Reminders exist for today | Display today's reminders with times | P1 | High |

### Refresh & Data Sync

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_HOME_013 | Home - Pull to Refresh | 1. Login 2. Pull down to refresh | N/A | Data reloads, spinner shows | P1 | Medium |
| TC_HOME_014 | Home - Empty States | 1. Login with no data 2. Check display | No reminders, medicines, memories | Shows "No reminders today", "No pending medicines" | P1 | Medium |
| TC_HOME_015 | Home - Recent Memory Display | 1. Login 2. Check recent memory card | Memories exist | Most recent memory displayed | P1 | Medium |

---

## <a id="voice"></a>🎤 VOICE ASSISTANT TEST CASES

### Voice Recognition

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_VOICE_001 | Voice - Microphone Permission | 1. Open voice screen 2. Tap mic button | First time | Permission request shown | P1 | High |
| TC_VOICE_002 | Voice - Start Listening | 1. Grant mic permission 2. Tap mic button | N/A | "Listening..." status shows, button turns green | P0 | Critical |
| TC_VOICE_003 | Voice - Voice to Text | 1. Tap mic 2. Say "remind me take medicine tomorrow" | Voice input | Text converts to "remind me take medicine tomorrow" | P0 | Critical |
| TC_VOICE_004 | Voice - Empty Voice Input | 1. Tap mic 2. Say nothing 3. Wait | Silence | Alert: "Please enter or speak a message" | P1 | Medium |
| TC_VOICE_005 | Voice - Voice Error Handling | 1. Tap mic 2. Noise/error occurs | Audio error | Alert: "Voice recognition is unavailable" | P1 | High |
| TC_VOICE_006 | Voice - Expo Go Limitation | 1. Run in Expo Go 2. Tap mic | Expo Go build | Alert shows voice unavailable, suggest dev build | P2 | Low |

### Manual Text Input

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_VOICE_007 | Voice - Text Input | 1. Open voice 2. Type in text field | "My doctor is Dr. Rao" | Text appears in input field | P1 | Medium |
| TC_VOICE_008 | Voice - Suggestion Chips | 1. Open voice 2. Tap suggestion | "summary" | Text populates in input field | P1 | Low |
| TC_VOICE_009 | Voice - Manual Send | 1. Type text 2. Tap "Ask Assistant" | Any text | Loading starts, AI processes | P1 | High |
| TC_VOICE_010 | Voice - Empty Text Submit | 1. Leave text empty 2. Tap send | Empty text | Alert: "Please enter or speak a message" | P1 | Medium |

### AI Chat Response

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_VOICE_011 | Voice - Summary Command | 1. Type "summary" 2. Tap send | "summary" | AI returns dashboard summary | P0 | Critical |
| TC_VOICE_012 | Voice - Remember Command | 1. Type "remember my doctor is Rao" | Voice/text input | Memory saved, confirmation shown | P0 | Critical |
| TC_VOICE_013 | Voice - Reminder Command | 1. Type "remind me take medicine tomorrow at 8 am" | Voice/text input | Reminder created, confirmation shown | P0 | Critical |
| TC_VOICE_014 | Voice - AI Loading State | 1. Send message 2. Wait for response | Any message | "Thinking..." shown, button disabled | P1 | Medium |

### Text-to-Speech

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_VOICE_015 | Voice - Speech Output | 1. Send message 2. Wait for reply | Any command | AI response spoken aloud (if audio enabled) | P1 | Medium |
| TC_VOICE_016 | Voice - Response Card | 1. Send message 2. Check reply card | Any command | Assistant reply displayed in reply card | P1 | Medium |

---

## <a id="memories"></a>📝 MEMORIES TEST CASES

### Create Memory

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_MEM_001 | Memories - Add Memory | 1. Open Memories 2. Type memory text 3. Tap "Save Memory" | "My neurologist is Dr. Rao" | Memory saved, appears in list | P0 | Critical |
| TC_MEM_002 | Memories - Empty Validation | 1. Leave text empty 2. Tap save | Empty text | Alert: "Please enter a memory" | P1 | High |
| TC_MEM_003 | Memories - Long Text | 1. Enter long memory | 500+ characters | Should allow and save | P1 | Medium |
| TC_MEM_004 | Memories - Special Characters | 1. Enter memory with special chars | "My address is 123 Main St. #456" | Saved with characters intact | P1 | Medium |

### Edit Memory

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_MEM_005 | Memories - Edit Memory | 1. Open memory 2. Tap edit 3. Change text 4. Save | Original: "Dr. Rao", New: "Dr. Rao MD" | Memory updated with new text | P1 | High |
| TC_MEM_006 | Memories - Edit Modal | 1. Tap edit on any memory 2. Check modal | N/A | Modal shows with current text | P1 | Medium |
| TC_MEM_007 | Memories - Edit Cancel | 1. Tap edit 2. Tap cancel | N/A | Memory unchanged, modal closes | P1 | Medium |
| TC_MEM_008 | Memories - Edit Empty | 1. Edit memory 2. Clear text 3. Save | Empty text | Should allow or prevent (check logic) | P2 | Low |

### Delete Memory

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_MEM_009 | Memories - Delete Memory | 1. Tap delete on memory 2. Confirm delete | Any memory | Memory removed from list | P1 | High |
| TC_MEM_010 | Memories - Delete Confirmation | 1. Tap delete 2. Check alert | N/A | Confirmation dialog shown with Cancel/Delete | P1 | Medium |
| TC_MEM_011 | Memories - Delete Cancel | 1. Tap delete 2. Tap Cancel | N/A | Memory retained, dialog closes | P1 | Medium |

### List & Display

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_MEM_012 | Memories - Empty State | 1. Clear all memories 2. Open Memories | No memories | "No memories saved" message shown | P1 | Medium |
| TC_MEM_013 | Memories - List Display | 1. Add 5 memories 2. Open Memories | Multiple memories | All memories displayed, sorted by newest | P1 | Medium |
| TC_MEM_014 | Memories - Refresh | 1. Add memory 2. Pull to refresh | New memory | New memory appears in list | P1 | Medium |

---

## <a id="reminders"></a>⏰ REMINDERS TEST CASES

### Create Reminder

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_REM_001 | Reminders - Add Reminder | 1. Open Reminders 2. Tap add button 3. Fill form 4. Save | Title: "Take Medicine", Date: 2026-07-25, Time: 08:00, Priority: high | Reminder created, appears in list | P0 | Critical |
| TC_REM_002 | Reminders - Validation | 1. Leave title empty 2. Tap save | Missing title | Alert: "Title, date, and time are required" | P1 | High |
| TC_REM_003 | Reminders - Date Format | 1. Add reminder with date | Date: 2026-07-25 | Date saved in YYYY-MM-DD format | P1 | Medium |
| TC_REM_004 | Reminders - Time Format | 1. Add reminder with time | Time: 08:30 | Time saved in HH:MM format | P1 | Medium |
| TC_REM_005 | Reminders - Priority Selection | 1. Create reminder 2. Select priority | Priority: high, medium, low | Selected priority saved correctly | P1 | Medium |

### Edit Reminder

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_REM_006 | Reminders - Edit Reminder | 1. Tap edit on reminder 2. Change title 3. Save | New title: "Call Doctor" | Reminder updated with new data | P1 | High |
| TC_REM_007 | Reminders - Edit Modal | 1. Tap edit 2. Check modal fields | N/A | All fields pre-populated with current data | P1 | Medium |
| TC_REM_008 | Reminders - Edit Cancel | 1. Tap edit 2. Change data 3. Tap cancel | N/A | Data unchanged, modal closes | P1 | Medium |
| TC_REM_009 | Reminders - Edit Validation | 1. Edit reminder 2. Clear title 3. Try save | Empty title | Alert: "Title, date, and time are required" | P1 | Medium |

### Mark Complete

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_REM_010 | Reminders - Mark Complete | 1. Tap "Complete" button on pending reminder | Pending reminder | Status changes to "completed", button becomes "Done" | P1 | High |
| TC_REM_011 | Reminders - Complete Badge | 1. Mark reminder complete 2. Check badge | Completed reminder | Badge shows "Done" with green background | P1 | Medium |
| TC_REM_012 | Reminders - Completed Opacity | 1. Mark reminder complete | Completed reminder | Reminder card opacity reduced | P2 | Low |

### Delete Reminder

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_REM_013 | Reminders - Delete Reminder | 1. Tap delete button 2. Confirm | Any reminder | Reminder removed from list | P1 | High |
| TC_REM_014 | Reminders - Delete Confirmation | 1. Tap delete 2. Check dialog | N/A | Confirmation shown with reminder title | P1 | Medium |
| TC_REM_015 | Reminders - Delete Cancel | 1. Tap delete 2. Tap Cancel | N/A | Reminder retained, dialog closes | P1 | Medium |

### Filter & Sort

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_REM_016 | Reminders - Summary Cards | 1. Open Reminders 2. Check summary | Multiple reminders | Cards show Pending, Done, Total counts | P1 | Medium |
| TC_REM_017 | Reminders - Sort by Date | 1. Add multiple reminders | Different dates | Reminders sorted by date ascending | P1 | Medium |
| TC_REM_018 | Reminders - Empty State | 1. Delete all reminders 2. Open Reminders | No reminders | "No reminders yet" message shown | P1 | Medium |

---

## <a id="medications"></a>💊 MEDICATIONS TEST CASES

### Add Medication

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_MED_001 | Medications - Add | 1. Open Medications 2. Tap add 3. Fill form 4. Save | Name: Aspirin, Dosage: 1 tablet, Time: 08:00 | Medication added, appears in list with "Pending" status | P0 | Critical |
| TC_MED_002 | Medications - Validation | 1. Leave name empty 2. Try save | Missing fields | Alert: "Medicine name, dosage, and time are required" | P1 | High |
| TC_MED_003 | Medications - Time Format | 1. Add medication with time | Time: 08:00 | Time saved in HH:MM format | P1 | Medium |
| TC_MED_004 | Medications - Dosage Field | 1. Add medication with dosage | Dosage: "2 tablets", "1 capsule" | Dosage text saved as-is | P1 | Medium |
| TC_MED_005 | Medications - Status Default | 1. Add medication | Any valid data | Status defaults to "pending" | P1 | Medium |

### Mark Taken/Pending

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_MED_006 | Medications - Mark Taken | 1. Open medication 2. Tap "Mark Taken" | Pending medication | Status changes to "completed", badge shows "Taken" | P1 | High |
| TC_MED_007 | Medications - Mark Pending | 1. Mark taken 2. Tap "Set Pending" | Completed medication | Status reverts to "pending", badge shows "Pending" | P1 | High |
| TC_MED_008 | Medications - Action Button Toggle | 1. Mark taken 2. Check button | Medication taken | Button changes to "Set Pending" | P1 | Medium |
| TC_MED_009 | Medications - Color Coding | 1. Mark taken/pending | Multiple medications | Pending shows orange badge, Taken shows green | P1 | Medium |

### Edit Medication

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_MED_010 | Medications - Edit | 1. Tap edit on medication 2. Change name 3. Save | New name: Ibuprofen | Medication updated with new data | P1 | High |
| TC_MED_011 | Medications - Edit Modal | 1. Tap edit 2. Check form | N/A | Fields pre-populated with current data | P1 | Medium |
| TC_MED_012 | Medications - Edit Validation | 1. Edit 2. Clear name 3. Try save | Empty name | Alert: "Medicine name, dosage, and time are required" | P1 | Medium |
| TC_MED_013 | Medications - Edit Cancel | 1. Tap edit 2. Tap Cancel | N/A | Data unchanged, modal closes | P1 | Medium |

### Delete Medication

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_MED_014 | Medications - Delete | 1. Tap delete 2. Confirm | Any medication | Medication removed from list | P1 | High |
| TC_MED_015 | Medications - Delete Confirmation | 1. Tap delete 2. Check dialog | N/A | Confirmation shown with medication name | P1 | Medium |
| TC_MED_016 | Medications - Delete Cancel | 1. Tap delete 2. Tap Cancel | N/A | Medication retained, dialog closes | P1 | Medium |

### Summary & Status

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_MED_017 | Medications - Summary Cards | 1. Open Medications 2. Check summary | Multiple medications | Pending, Taken, Total counts displayed | P1 | Medium |
| TC_MED_018 | Medications - Empty State | 1. Delete all medications | No medications | "No medicines added" message shown | P1 | Medium |

---

## <a id="contacts"></a>👥 CONTACTS TEST CASES

### Add Contact

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_CON_001 | Contacts - Add | 1. Open Contacts 2. Tap add 3. Fill form 4. Save | Name: Dr. Rao, Relationship: Doctor, Phone: 9876543210 | Contact added, appears in list | P0 | Critical |
| TC_CON_002 | Contacts - Validation | 1. Leave name empty 2. Try save | Missing fields | Alert: "Name, relationship, and phone are required" | P1 | High |
| TC_CON_003 | Contacts - Phone Format | 1. Add contact with phone | Phone: 9876543210 | Phone saved as entered | P1 | Medium |
| TC_CON_004 | Contacts - Primary Badge | 1. Add first contact 2. Check badge | First contact | "Primary" badge shown on first contact | P1 | Medium |

### Edit Contact

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_CON_005 | Contacts - Edit | 1. Tap edit 2. Change name 3. Save | New name: Dr. Rao, MD | Contact updated with new data | P1 | High |
| TC_CON_006 | Contacts - Edit Modal | 1. Tap edit 2. Check form | N/A | Fields pre-populated with current data | P1 | Medium |
| TC_CON_007 | Contacts - Edit Validation | 1. Edit 2. Clear phone 3. Try save | Empty phone | Alert: "Name, relationship, and phone are required" | P1 | Medium |
| TC_CON_008 | Contacts - Edit Cancel | 1. Tap edit 2. Tap Cancel | N/A | Data unchanged, modal closes | P1 | Medium |

### Delete Contact

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_CON_009 | Contacts - Delete | 1. Tap delete 2. Confirm | Any contact | Contact removed from list | P1 | High |
| TC_CON_010 | Contacts - Delete Confirmation | 1. Tap delete 2. Check dialog | N/A | Confirmation shown with contact name | P1 | Medium |
| TC_CON_011 | Contacts - Delete Cancel | 1. Tap delete 2. Tap Cancel | N/A | Contact retained, dialog closes | P1 | Medium |

### Call Contact

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_CON_012 | Contacts - Call | 1. Tap "Call" button on contact | Any contact | Phone app opens with contact number | P1 | High |
| TC_CON_013 | Contacts - Call Button Display | 1. Open contact 2. Check call button | N/A | Green "Call" button visible | P1 | Medium |

### Display & List

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_CON_014 | Contacts - Avatar | 1. Add contact 2. Check display | Name: John | Avatar shows "J" in blue circle | P1 | Low |
| TC_CON_015 | Contacts - Empty State | 1. Delete all contacts 2. Open Contacts | No contacts | "No care contacts" message shown | P1 | Medium |

---

## <a id="profile"></a>👤 PROFILE TEST CASES

### Display Profile

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_PRO_001 | Profile - Load Data | 1. Open Profile 2. Wait for load | Any user | Name, phone, age displayed | P1 | High |
| TC_PRO_002 | Profile - Header Display | 1. Open Profile 2. Check header | N/A | Avatar, name, subtitle visible | P1 | Medium |
| TC_PRO_003 | Profile - Info Card | 1. Open Profile 2. Check info section | N/A | Phone and age fields displayed | P1 | Medium |
| TC_PRO_004 | Profile - Stats Grid | 1. Open Profile 2. Check stats | User has data | Memories, Reminders, Medicines, Care Team counts shown | P1 | High |

### Logout

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_PRO_005 | Profile - Logout Confirmation | 1. Tap Logout 2. Check dialog | N/A | Confirmation dialog shown | P1 | High |
| TC_PRO_006 | Profile - Logout Confirm | 1. Tap Logout 2. Confirm | N/A | Session cleared, redirect to login | P0 | Critical |
| TC_PRO_007 | Profile - Logout Cancel | 1. Tap Logout 2. Tap Cancel | N/A | Dialog closes, remain on profile | P1 | Medium |

### Setup Checklist

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_PRO_008 | Profile - Checklist Display | 1. Open Profile 2. Check checklist | N/A | 4 checklist items shown | P1 | Medium |
| TC_PRO_009 | Profile - Checklist Checkmarks | 1. Add data for each item 2. Refresh profile | Added contacts, meds, reminders, memories | Checkmarks appear for completed items | P1 | Medium |
| TC_PRO_010 | Profile - Checklist Indicators | 1. Check profile with mixed data | Partial setup | Green checkmarks for completed, empty circles for pending | P1 | Medium |

### Stats Display

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_PRO_011 | Profile - Stat Icons | 1. Open Profile 2. Check stat cards | N/A | Icons visible for each stat type | P1 | Low |
| TC_PRO_012 | Profile - Stat Numbers | 1. Add data 2. Refresh profile | Multiple items | Stats update correctly | P1 | High |

---

## <a id="navigation"></a>🧭 NAVIGATION TEST CASES

### Tab Navigation

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_NAV_001 | Navigation - Tab Switch | 1. Login 2. Tap different tabs | N/A | Correct screen loads for each tab | P1 | High |
| TC_NAV_002 | Navigation - Home Tab | 1. Tap home tab | N/A | Home screen displays | P1 | Medium |
| TC_NAV_003 | Navigation - Reminders Tab | 1. Tap reminders tab | N/A | Reminders screen displays | P1 | Medium |
| TC_NAV_004 | Navigation - Tab Persistence | 1. Switch tabs 2. Return to home | N/A | State preserved, data not reloaded | P1 | Medium |

### Route Transitions

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_NAV_005 | Navigation - Voice Route | 1. Tap voice shortcut 2. Check route | N/A | Navigate to /voice screen | P1 | Medium |
| TC_NAV_006 | Navigation - Back Button | 1. Navigate to voice 2. Tap back | N/A | Return to home screen | P1 | Medium |
| TC_NAV_007 | Navigation - Multiple Levels | 1. Navigate through screens | Multiple screens | Navigation works smoothly | P1 | Medium |
| TC_NAV_008 | Navigation - Route Guards | 1. Not logged in 2. Try direct route | No auth | Redirect to login | P1 | High |

### Deep Linking

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_NAV_009 | Navigation - Deep Link | 1. Use deep link /reminders | Deep link | Correct screen loads | P2 | Medium |
| TC_NAV_010 | Navigation - Link with Data | 1. Deep link with params | Link with ID | Correct data displayed | P2 | Medium |

---

## <a id="permissions"></a>🔒 PERMISSIONS & SECURITY TEST CASES

### Microphone Permission

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_PERM_001 | Permissions - Mic Request | 1. First launch 2. Open voice 3. Tap mic | First time | Permission dialog shown | P1 | High |
| TC_PERM_002 | Permissions - Mic Grant | 1. Grant microphone permission | Permission granted | Voice recognition works | P1 | Critical |
| TC_PERM_003 | Permissions - Mic Deny | 1. Deny microphone permission | Permission denied | Alert shown, voice disabled | P1 | High |

### Camera Permission

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_PERM_004 | Permissions - Camera Check | 1. Open app 2. Check camera requirements | N/A | No camera permission needed currently | P2 | Low |
| TC_PERM_005 | Permissions - Camera Future | 1. Check if camera accessed | Future feature | Not used in current version | P2 | Low |

### Storage Permission

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_PERM_006 | Permissions - AsyncStorage | 1. Use app features 2. Check data persistence | Any operation | Data persists in AsyncStorage | P1 | High |
| TC_PERM_007 | Permissions - Storage Access | 1. Perform data operations | Multiple operations | Storage accessible without additional permission | P1 | High |

### Phone Permission

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_PERM_008 | Permissions - Call Permission | 1. Open Contacts 2. Tap "Call" | Contact number | Phone app launches | P1 | High |
| TC_PERM_009 | Permissions - Phone Link | 1. Call contact 2. Check phone app | Valid contact | Number dialed correctly | P1 | Medium |

### Session Security

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_PERM_010 | Security - Token Storage | 1. Login 2. Check AsyncStorage | Valid login | Token encrypted/secure | P1 | Critical |
| TC_PERM_011 | Security - Session Timeout | 1. Login 2. Wait 7+ days | Token expires | Auto logout after expiry | P1 | High |

### Token Validation

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_PERM_012 | Security - Invalid Token | 1. Manually clear token 2. Try API call | No token | Redirect to login | P1 | High |

---

## <a id="api"></a>🌐 API VALIDATION TEST CASES

### API Connectivity

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_API_001 | API - Connect to Backend | 1. Login 2. Check API response | Valid credentials | API returns 200 OK | P0 | Critical |
| TC_API_002 | API - Endpoint Response Time | 1. Call endpoint 2. Measure response | Any endpoint | Response < 2 seconds | P1 | High |
| TC_API_003 | API - Concurrent Requests | 1. Make multiple requests | 5+ parallel requests | All complete successfully | P1 | Medium |
| TC_API_004 | API - Base URL Configuration | 1. Check API initialization | N/A | Correct backend URL set | P1 | High |

### Error Handling

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_API_005 | API - 401 Unauthorized | 1. Use invalid token 2. Call API | Invalid token | 401 error handled, redirect to login | P1 | Critical |
| TC_API_006 | API - 404 Not Found | 1. Call non-existent endpoint | Wrong endpoint | 404 error handled gracefully | P1 | High |
| TC_API_007 | API - 500 Server Error | 1. Server returns 500 | Server error | Alert shown to user | P1 | High |
| TC_API_008 | API - Validation Errors | 1. Send invalid data | Invalid data | 400 error with message | P1 | High |
| TC_API_009 | API - Network Timeout | 1. No internet 2. API call | Timeout | Timeout error handled | P1 | High |

### Response Validation

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_API_010 | API - Response Structure | 1. Get API response 2. Validate format | Any endpoint | Response matches expected schema | P1 | High |
| TC_API_011 | API - Data Types | 1. Check response data types | Expected types | All fields have correct types | P1 | Medium |
| TC_API_012 | API - Missing Fields | 1. Check response completeness | Required fields | No missing required fields | P1 | High |
| TC_API_013 | API - Null Values | 1. Check optional fields | Optional fields | Nulls handled correctly in UI | P1 | Medium |

### Timeout Handling

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_API_014 | API - Request Timeout | 1. Slow network 2. Wait 30s | Slow connection | Timeout alert shown | P1 | High |
| TC_API_015 | API - Timeout Recovery | 1. Timeout occurs 2. Retry | After timeout | Can retry request | P1 | Medium |
| TC_API_016 | API - Loading State | 1. Make slow request 2. Check UI | Slow endpoint | Loading indicator shown | P1 | Medium |

### Offline Mode

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_API_017 | API - Offline Detection | 1. Disable internet 2. Try action | No network | Offline mode detected | P1 | High |
| TC_API_018 | API - Offline Alert | 1. Go offline 2. Try API call | No network | Alert: "Network error" or similar | P1 | High |
| TC_API_019 | API - Reconnect | 1. Go online again 2. Retry | Network restored | API works again | P1 | Medium |

### Data Sync

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_API_020 | API - Data Consistency | 1. Create data 2. Refresh 3. Check | Same data | Data consistent across requests | P1 | High |

---

## <a id="network"></a>🌐 NETWORK TEST CASES

### Slow Network

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_NET_001 | Network - Slow Connection | 1. Simulate 2G/3G 2. Use app | Slow network | App functions, may be slow | P1 | Medium |
| TC_NET_002 | Network - Data Usage | 1. Monitor data with slow network | Slow connection | Reasonable data usage | P2 | Low |

### Network Switching

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_NET_003 | Network - WiFi to Mobile | 1. Switch from WiFi to mobile | Network change | App continues working | P1 | High |
| TC_NET_004 | Network - Mobile to WiFi | 1. Switch from mobile to WiFi | Network change | App continues working | P1 | High |

### Offline Scenarios

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_NET_005 | Network - Go Offline | 1. Disable all connectivity | Offline | App shows appropriate state | P1 | High |
| TC_NET_006 | Network - Offline UI | 1. Go offline 2. Check UI | Offline | Error messages shown appropriately | P1 | Medium |

---

## <a id="regression"></a>🔄 REGRESSION TEST SUITE

### Critical User Flows

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_REG_001 | Regression - Complete Flow | 1. Register 2. Login 3. Add data 4. Use all screens | Full user flow | All features work end-to-end | P0 | Critical |
| TC_REG_002 | Regression - Patient Journey | 1. Register as patient 2. Add meds 3. Use voice 4. Check reminders | Patient scenario | Complete patient workflow works | P0 | Critical |
| TC_REG_003 | Regression - Caretaker Journey | 1. Register caretaker 2. Link patient 3. View patient data | Caretaker scenario | Caretaker can manage patient | P0 | Critical |
| TC_REG_004 | Regression - Voice Workflow | 1. Open voice 2. Try all commands | Voice commands | Remember, remind, summary work | P0 | Critical |
| TC_REG_005 | Regression - Data CRUD | 1. Create 2. Read 3. Update 4. Delete data | All data types | All CRUD operations work | P0 | Critical |
| TC_REG_006 | Regression - Session Management | 1. Login 2. Switch screens 3. Logout | Session flow | Session properly maintained | P0 | Critical |

### Cross-Module Integration

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_REG_007 | Integration - Voice to Memory | 1. Use voice to create memory | Voice command | Memory created, appears in list | P1 | High |
| TC_REG_008 | Integration - Voice to Reminder | 1. Use voice to create reminder | Voice command | Reminder created, appears in list | P1 | High |
| TC_REG_009 | Integration - Home to Detail Screens | 1. Tap quick actions from home | Home screen | Navigate to respective screens | P1 | High |
| TC_REG_010 | Integration - Data in Multiple Screens | 1. Create data 2. Check all screens | Any data | Data visible where applicable | P1 | High |
| TC_REG_011 | Integration - Dashboard Updates | 1. Add data 2. Check home dashboard | Multiple data types | Dashboard metrics update | P1 | High |

### Data Persistence

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_REG_012 | Persistence - Local Storage | 1. Add data 2. Close app 3. Reopen | Any data | Local data persists | P1 | High |
| TC_REG_013 | Persistence - Session Token | 1. Login 2. Close app 3. Reopen | After login | Session maintained if token valid | P1 | High |
| TC_REG_014 | Persistence - Offline Data | 1. Go offline 2. Check cached data | Offline | Previously loaded data available | P1 | Medium |

### Performance Benchmarks

| TC ID | Feature | Test Steps | Test Data | Expected Result | Priority | Severity |
|-------|---------|-----------|-----------|-----------------|----------|----------|
| TC_REG_015 | Performance - App Startup | 1. Cold start app 2. Measure time | Fresh start | Launch < 5 seconds | P2 | Medium |

---

## 📊 TEST EXECUTION SUMMARY

**Total Test Cases: 183**

| Module | Count | Status |
|--------|-------|--------|
| Authentication | 18 | ✅ Documented |
| Home Screen | 15 | ✅ Documented |
| Voice Assistant | 16 | ✅ Documented |
| Memories | 14 | ✅ Documented |
| Reminders | 18 | ✅ Documented |
| Medications | 18 | ✅ Documented |
| Contacts | 15 | ✅ Documented |
| Profile | 12 | ✅ Documented |
| Navigation | 10 | ✅ Documented |
| Permissions | 12 | ✅ Documented |
| API Validation | 20 | ✅ Documented |
| Network | 6 | ✅ Documented |
| Regression | 15 | ✅ Documented |
| **TOTAL** | **183** | **✅ Complete** |

---

## 🎯 TEST EXECUTION GUIDELINES

### Priority Levels
- **P0 (Blocker):** Critical features, must pass
- **P1 (High):** Important features, should pass
- **P2 (Medium):** Nice-to-have features, can be deferred

### Severity Levels
- **Critical:** Application crash or complete feature failure
- **High:** Major functionality impaired
- **Medium:** Minor functionality affected
- **Low:** Cosmetic or non-critical issues

### Execution Timeline
- **Smoke Tests:** Daily (Critical test cases)
- **Regression Tests:** Before each release
- **Full Suite:** Weekly or after major changes

---

**Document Created:** 2026-07-22  
**Created By:** Senior QA Engineer  
**Version:** 1.0
