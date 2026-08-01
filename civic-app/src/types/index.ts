export type UserRole = 'citizen' | 'officer' | 'supervisor' | 'admin';
export type Department = 'infrastructure' | 'sanitation' | 'water_works' | 'electricity' | 'traffic';
export type ComplaintStatus = 'submitted' | 'under_review' | 'assigned' | 'in_progress' | 'resolved' | 'rejected' | 'closed';
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

export const DEPARTMENT_TH: Record<Department, string> = {
  infrastructure: 'โครงสร้างพื้นฐาน (ถนน, ท่อระบายน้ำ, สะพาน)',
  sanitation: 'สาธารณสุขและขยะมูลฝอย',
  water_works: 'ประปาและสาธารณูปโภค',
  electricity: 'ไฟฟ้าและแสงสว่างสาธารณะ',
  traffic: 'จราจร ป้ายเตือน และสวนสาธารณะ'
};

export const STATUS_TH: Record<ComplaintStatus, string> = {
  submitted: 'รับเรื่องแล้ว',
  under_review: 'กำลังตรวจสอบ',
  assigned: 'มอบหมายเจ้าหน้าที่แล้ว',
  in_progress: 'กำลังดำเนินการแก้ไข',
  resolved: 'แก้ไขเรียบร้อยแล้ว',
  rejected: 'ไม่อนุญาต / ไม่ผ่านเกณฑ์',
  closed: 'ปิดเรื่อง'
};

export const URGENCY_TH: Record<UrgencyLevel, string> = {
  low: 'ปกติ',
  medium: 'ปานกลาง',
  high: 'เร่งด่วน',
  critical: 'ฉุกเฉินวิกฤต'
};

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  department?: Department | null;
  fcmTokens: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GeoLocation {
  address: string;
  latitude: number;
  longitude: number;
  geohash?: string;
}

export interface Attachment {
  id: string;
  url: string;
  type: string;
  name: string;
  uploadedAt: string;
}

export interface ResolutionData {
  notes: string;
  proofAttachments: string[];
  resolvedAt: string;
  resolvedByOfficerName: string;
}

export interface CitizenFeedback {
  rating: number; // 1 - 5
  comment?: string;
  submittedAt: string;
}

export interface TimelineEvent {
  eventId: string;
  type: 'submitted' | 'status_changed' | 'officer_assigned' | 'comment_added';
  performedBy: {
    uid: string;
    name: string;
    role: UserRole;
  };
  previousStatus?: ComplaintStatus;
  newStatus?: ComplaintStatus;
  message: string;
  timestamp: string;
}

export interface ComplaintDocument {
  complaintId: string;
  trackingNumber: string;
  citizenId: string;
  citizenName: string;
  category: Department;
  title: string;
  description: string;
  status: ComplaintStatus;
  urgency: UrgencyLevel;
  isAnonymous: boolean;
  location: GeoLocation;
  attachments: Attachment[];
  assignedDepartment?: Department;
  assignedOfficer?: {
    uid: string;
    name: string;
    assignedAt: string;
  };
  resolution?: ResolutionData;
  feedback?: CitizenFeedback;
  createdAt: string;
  updatedAt: string;
  timeline: TimelineEvent[];
}
