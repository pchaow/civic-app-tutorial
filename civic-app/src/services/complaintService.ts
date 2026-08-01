import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from './firebase';
import type { ComplaintDocument, ComplaintStatus, Department, ResolutionData, UrgencyLevel, CitizenFeedback } from '../types';

const LOCAL_STORAGE_KEY = 'civicsolve_complaints_v1';

class ComplaintService {
  private getStoredComplaints(): ComplaintDocument[] {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  private saveComplaints(complaints: ComplaintDocument[]) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(complaints));
  }

  public getAllComplaints(): ComplaintDocument[] {
    return this.getStoredComplaints();
  }

  public getComplaintById(id: string): ComplaintDocument | undefined {
    return this.getStoredComplaints().find(c => c.complaintId === id || c.trackingNumber === id);
  }

  // Real-time Firestore Subscription listener
  public subscribeComplaints(callback: (complaints: ComplaintDocument[]) => void) {
    try {
      const q = query(collection(db, 'complaints'), orderBy('createdAt', 'desc'));
      return onSnapshot(q, (snapshot) => {
        const firestoreComplaints: ComplaintDocument[] = [];
        snapshot.forEach((docSnap) => {
          firestoreComplaints.push(docSnap.data() as ComplaintDocument);
        });
        if (firestoreComplaints.length > 0) {
          this.saveComplaints(firestoreComplaints);
          callback(firestoreComplaints);
        } else {
          callback(this.getStoredComplaints());
        }
      }, (err) => {
        console.warn('Firestore subscription fallback to local storage:', err);
        callback(this.getStoredComplaints());
      });
    } catch {
      callback(this.getStoredComplaints());
      return () => {};
    }
  }

  public async createComplaint(data: {
    title: string;
    description: string;
    category: Department;
    urgency: UrgencyLevel;
    isAnonymous: boolean;
    location: { address: string; latitude: number; longitude: number };
    citizenId: string;
    citizenName: string;
    attachmentsUrl?: string[];
  }): Promise<ComplaintDocument> {
    const complaints = this.getStoredComplaints();
    const count = complaints.length + 1;
    const trackingNum = `MUN-2026-${String(8890 + count).padStart(4, '0')}`;
    const newId = `cmp_${Date.now()}`;
    const now = new Date().toISOString();

    const newComplaint: ComplaintDocument = {
      complaintId: newId,
      trackingNumber: trackingNum,
      citizenId: data.citizenId,
      citizenName: data.isAnonymous ? 'ประชาชนไม่ประสงค์ออกนาม' : data.citizenName,
      category: data.category,
      title: data.title,
      description: data.description,
      status: 'submitted',
      urgency: data.urgency,
      isAnonymous: data.isAnonymous,
      location: data.location,
      attachments: (data.attachmentsUrl || []).map((url, idx) => ({
        id: `att_${Date.now()}_${idx}`,
        url,
        type: 'image/jpeg',
        name: `photo_${idx + 1}.jpg`,
        uploadedAt: now
      })),
      assignedDepartment: data.category,
      createdAt: now,
      updatedAt: now,
      timeline: [
        {
          eventId: `evt_${Date.now()}`,
          type: 'submitted',
          performedBy: {
            uid: data.citizenId,
            name: data.isAnonymous ? 'ประชาชนไม่ประสงค์ออกนาม' : data.citizenName,
            role: 'citizen'
          },
          newStatus: 'submitted',
          message: `เรื่องร้องเรียน #${trackingNum} ถูกบันทึกเข้าสู่ระบบเรียบร้อยแล้ว`,
          timestamp: now
        }
      ]
    };

    // Save to local state
    complaints.unshift(newComplaint);
    this.saveComplaints(complaints);

    // Sync to Cloud Firestore
    try {
      const docRef = doc(db, 'complaints', newId);
      await setDoc(docRef, newComplaint, { merge: true });
    } catch (err) {
      console.warn('Cloud Firestore save notice:', err);
    }

    return newComplaint;
  }

  public async updateComplaintStatus(
    complaintId: string,
    newStatus: ComplaintStatus,
    performedBy: { uid: string; name: string; role: 'officer' | 'admin' },
    message: string,
    resolution?: ResolutionData
  ): Promise<ComplaintDocument> {
    const complaints = this.getStoredComplaints();
    const idx = complaints.findIndex(c => c.complaintId === complaintId);
    if (idx === -1) throw new Error('Complaint not found');

    const complaint = complaints[idx];
    const prevStatus = complaint.status;
    const now = new Date().toISOString();

    complaint.status = newStatus;
    complaint.updatedAt = now;

    if (resolution) {
      complaint.resolution = resolution;
    }

    if (!complaint.assignedOfficer && performedBy.role === 'officer') {
      complaint.assignedOfficer = {
        uid: performedBy.uid,
        name: performedBy.name,
        assignedAt: now
      };
    }

    complaint.timeline.unshift({
      eventId: `evt_${Date.now()}`,
      type: 'status_changed',
      performedBy: {
        uid: performedBy.uid,
        name: performedBy.name,
        role: performedBy.role
      },
      previousStatus: prevStatus,
      newStatus,
      message: message || `อัปเดตสถานะเป็น ${newStatus}`,
      timestamp: now
    });

    complaints[idx] = complaint;
    this.saveComplaints(complaints);

    // Sync Update to Cloud Firestore
    try {
      const docRef = doc(db, 'complaints', complaintId);
      await setDoc(docRef, complaint, { merge: true });
    } catch (err) {
      console.warn('Cloud Firestore status update notice:', err);
    }

    return complaint;
  }

  public async addFeedback(complaintId: string, feedback: CitizenFeedback): Promise<ComplaintDocument> {
    const complaints = this.getStoredComplaints();
    const idx = complaints.findIndex(c => c.complaintId === complaintId);
    if (idx === -1) throw new Error('Complaint not found');

    complaints[idx].feedback = feedback;
    complaints[idx].updatedAt = new Date().toISOString();
    this.saveComplaints(complaints);

    // Sync Feedback to Cloud Firestore
    try {
      const docRef = doc(db, 'complaints', complaintId);
      await updateDoc(docRef, {
        feedback: feedback,
        updatedAt: complaints[idx].updatedAt
      });
    } catch (err) {
      console.warn('Cloud Firestore feedback notice:', err);
    }

    return complaints[idx];
  }
}

export const complaintService = new ComplaintService();
