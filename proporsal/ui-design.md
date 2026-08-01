# UI/UX Wireframe & Design Specification: CivicSolve

This document outlines the UI/UX layout and wireframe specifications for the **CivicSolve Municipality Citizen Complaint & Management System**, directly reflecting the interactive flows defined in **Section 3 (Data Flow & Sequence Diagrams)** of [`system-design.md`](file:///home/chaow/testagy/proporsal/system-design.md).

---

## 1. Sequence Flow 3.1 Wireframes: Citizen Complaint Submission & Push Alert

This section maps directly to **Flow 3.1: Filing a Complaint & Automatic Push Alert Flow**.

### Wireframe 1.1: Citizen Complaint Submission Form (`/file-complaint`)
*Corresponds to Step 1 & 2 in Flow 3.1: Citizen selects location, picks category, uploads photo, and submits.*

```
+-----------------------------------------------------------------------------------+
|  [CivicSolve Logo]  Home   My Complaints   Notifications (1)   [User Profile (Jane)]|
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  < Back to Dashboard                                                              |
|                                                                                   |
|  # File a New Civic Issue / Complaint                                             |
|  Help us keep our municipality safe and clean.                                     |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  | 1. Category & Title                                                         |  |
|  | Department/Category: [ Infrastructure (Roads, Bridges, Potholes)     v ]      |  |
|  | Urgency Level:       ( ) Low   ( ) Medium   (*) High   ( ) Critical         |  |
|  | Title:               [ Large Pothole near Main Street Intersection        ] |  |
|  | Description:         [ Deep pothole causing severe traffic slowdown and   ] |  |
|  |                      [ hazard for motorcycles. Need repair urgently.      ] |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  | 2. Incident Geolocation (Interactive Map)                                  |  |
|  | Address Search: [ 123 Main St, District 4                        ] [Find]    |  |
|  | +-------------------------------------------------------------------------+ |  |
|  | | [ + ]                                                                   | |  |
|  | | [ - ]                  ( RED PIN: 13.7563, 100.5018 )                   | |  |
|  | |                                                                         | |  |
|  | |                      [ Drag Pin to Adjust Location ]                     | |  |
|  | +-------------------------------------------------------------------------+ |  |
|  | Selected: 123 Main St, District 4 (Geohash: w4rqp2m)                       |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  | 3. Upload Issue Photos & Media                                              |  |
|  | +-------------------------------------------------------------------------+ |  |
|  | |  [📷 Drag & Drop Photos Here or Click to Upload]                         | |  |
|  | |  Supported: JPG, PNG, MP4 (Max 10MB)                                    | |  |
|  | +-------------------------------------------------------------------------+ |  |
|  | Uploaded Files:                                                           |  |
|  |  [🖼️ pothole_photo1.jpg (2.4MB)]  [❌ Remove]                               |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
|  [ ] Submit Anonymously (Hide my contact info from public view)                   |
|                                                                                   |
|  [ Cancel ]                                            [ Submit Complaint  🚀 ]  |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

---

### Wireframe 1.2: Officer Real-Time Browser Push Alert Notification
*Corresponds to Step 8 & 9 in Flow 3.1: FCM delivers browser push alert to Officer's desktop/phone.*

```
+-----------------------------------------------------------------------------------+
|  🌐 BROWSER SYSTEM PUSH NOTIFICATION                                              |
+-----------------------------------------------------------------------------------+
|  [🏛️ CivicSolve Municipality System]                                             |
|  🚨 URGENT COMPLAINT FILED #MUN-2026-8890                                         |
|                                                                                   |
|  Category: Infrastructure                                                         |
|  Title: Large Pothole near Main Street Intersection                               |
|  Location: 123 Main St, District 4                                                |
|                                                                                   |
|  [ View Complaint in Dashboard ]                          [ Dismiss ]             |
+-----------------------------------------------------------------------------------+
```

---

## 2. Sequence Flow 3.2 Wireframes: Officer Resolution & Citizen Push Alert

This section maps directly to **Flow 3.2: Status Update & Citizen Browser Push Notification**.

### Wireframe 2.1: Officer Triage & Resolution Dashboard (`/officer/dashboard`)
*Corresponds to Step 1 & 2 in Flow 3.2: Officer changes status to "Resolved" and uploads proof-of-work.*

```
+-----------------------------------------------------------------------------------+
|  [🏛️ CivicSolve OFFICER PORTAL]  Department: [Infrastructure v]   [Officer Smith (Logout)]|
+-----------------------------------------------------------------------------------+
|  Dashboard Metrics:                                                               |
|  [ 42 Open Complaints ]  [ 12 In Progress ]  [ 8 Overdue (SLA) ]  [ 158 Resolved ]  |
+-----------------------------------------------------------------------------------+
|  Ticket Filter: [Status: All v]  [Urgency: All v]  [Sort: Newest First v]         |
|                                                                                   |
|  TICKET DETAILS & RESOLUTION MODAL (#MUN-2026-8890)                               |
|  +-----------------------------------------------------------------------------+  |
|  | Status: [ Assigned v ] ➔ Change to: [ Resolved                      v ]    |  |
|  | Citizen: Jane Doe (Phone: +66812345678)                                     |  |
|  | Category: Infrastructure  |  Urgency: HIGH 🔴                              |  |
|  | Title: Large Pothole near Main Street Intersection                          |  |
|  | Filed Image: [🖼️ view_original_pothole.jpg]                                 |  |
|  +-----------------------------------------------------------------------------+  |
|  | WORK RESOLUTION PROOF & NOTES                                               |  |
|  | Resolution Notes:                                                           |  |
|  | +-------------------------------------------------------------------------+ |  |
|  | | Pothole filled with asphalt, compacted, and leveled. Road cleared.      | |
|  +-----------------------------------------------------------------------------+
### 3.2 Officer Triage & Complaint Detail Modal
+-----------------------------------------------------------------------+
|  [#MUN-2026-8890] ถนนเป็นหลุมขนาดใหญ่ บริเวณสี่แยกมิตรภาพ      [กำลังดำเนินการ] |
+-----------------------------------------------------------------------+
|  ผู้แจ้งเรื่อง: สมชาย ใจดี         สำนักหน่วยงาน: โครงสร้างพื้นฐาน           |
|  ความเร่งด่วน: เร่งด่วน (High)   วันที่แจ้ง: 02/08/2026 10:05 น.        |
|                                                                       |
|  รายละเอียดปัญหา:                                                      |
|  หลุมลึกมากทำให้รถชะลอตัวและเกิดอันตรายต่อรถจักรยานยนต์อย่างยิ่ง          |
|                                                                       |
|  สถานที่เกิดเหตุ & พิกัด GPS:                                           |
|  📍 123 ถนนมิตรภาพ เขตเทศบาลเมือง (GPS: 13.756300, 100.501800)         |
|                                                                       |
|  รูปภาพประกอบปัญหาจากประชาชน (1 รูป):                                   |
|  [ 📷 pothole.jpg ]                                                   |
+-----------------------------------------------------------------------+
|  อัปเดตสถานะเรื่องร้องเรียน: [ แก้ไขเรียบร้อยแล้ว (สำเร็จ)        v ]    |
|  บันทึกข้อความเจ้าหน้าที่: [ ส่งทีมช่างลงพื้นที่บดอัดยางแอสฟัลต์แล้ว ]      |
|  อัปโหลดรูปภาพหลักฐานหลังแก้ไข: [ 📷 proof_work.webp ]                   |
|                                                                       |
|                                        [ ยกเลิก ] [ บันทึกข้อมูล & Push ]|
+-----------------------------------------------------------------------+
```

---

### Wireframe 2.2: Citizen Browser Push Alert & Real-time Stepper Tracker (`/track/MUN-2026-8890`)
*Corresponds to Step 5, 6 & 7 in Flow 3.2: FCM pushes alert to citizen browser, leading to updated status tracker.*

#### Browser Push Alert Received by Citizen:
```
+-----------------------------------------------------------------------------------+
|  🌐 BROWSER SYSTEM PUSH NOTIFICATION                                              |
+-----------------------------------------------------------------------------------+
|  [🏛️ CivicSolve Notification]                                                      |
|  ✅ COMPLAINT RESOLVED #MUN-2026-8890                                             |
|                                                                                   |
|  Your reported issue "Large Pothole near Main Street" has been marked as RESOLVED.|
|  Click to view proof photo and submit your rating.                                |
|                                                                                   |
|  [ Track Status & Rate ]                                  [ Dismiss ]             |
+-----------------------------------------------------------------------------------+
```

#### Citizen Interactive Tracking & Feedback Screen:
```
+-----------------------------------------------------------------------------------+
|  [CivicSolve Logo]  Home   My Complaints   Notifications (0)   [User Profile (Jane)]|
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  # Complaint Status Tracker: #MUN-2026-8890                                       |
|  Category: Infrastructure  |  Filed Date: Aug 1, 2026                           |
|                                                                                   |
|  PROGRESS TRACKER STEPPER                                                         |
|  [ (✓) Submitted ] --- [ (✓) Under Review ] --- [ (✓) In Progress ] --- [ (✓) RESOLVED ]
|        Aug 1, 10:05           Aug 1, 11:00            Aug 1, 12:00          Aug 1, 15:30   
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  | Resolution Proof from Municipality Officer Smith                            |  |
|  | "Pothole filled with asphalt, compacted, and leveled. Road cleared."       |  |
|  |                                                                             |  |
|  | Proof Photo:                                                                |  |
|  | +-----------------------+                                                   |  |
|  | | [🖼️ Fixed Road Photo] |                                                   |  |
|  | +-----------------------+                                                   |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  | ⭐ How satisfied are you with this resolution?                              |  |
|  | Rating:  (★) (★) (★) (★) (★)  [ 5 / 5 Stars - Excellent! ]                  |  |
|  | Feedback Comment: [ Fast response and great job repairing the road!       ] |  |
|  | [ Submit Feedback ]                                                         |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

---

## 3. Summary of UI Component Wireframe Order

| Flow Order in `system-design.md` | Wireframe Screen Name | Primary User | Key Interactive Elements |
| :--- | :--- | :--- | :--- |
| **Flow 3.1 (Step 1-5)** | Citizen Complaint Form (`/file-complaint`) | Citizen | Category select, GPS map picker, image drag & drop, urgency selector. |
| **Flow 3.1 (Step 8-9)** | Officer Browser FCM Push Alert | Officer | Native OS/Browser push toast, deep-link to ticket detail modal. |
| **Flow 3.2 (Step 1-2)** | Officer Resolution Modal (`/officer/dashboard`) | Officer | Status dropdown, resolution notes text area, proof photo upload. |
| **Flow 3.2 (Step 5-7)** | Citizen Push Alert & Stepper Tracker (`/track/MUN-2026-8890`) | Citizen | Real-time progress stepper, proof photo viewer, star rating feedback. |
