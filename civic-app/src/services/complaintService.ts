import type { ComplaintDocument, ComplaintStatus, Department, ResolutionData, UrgencyLevel, CitizenFeedback } from '../types';
import { INITIAL_COMPLAINTS } from './mockData';

const LOCAL_STORAGE_KEY = 'civicsolve_complaints_v1';

class ComplaintService {
  private getStoredComplaints(): ComplaintDocument[] {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_COMPLAINTS));
      return INITIAL_COMPLAINTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_COMPLAINTS;
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

  public createComplaint(data: {
    title: string;
    description: string;
    category: Department;
    urgency: UrgencyLevel;
    isAnonymous: boolean;
    location: { address: string; latitude: number; longitude: number };
    citizenId: string;
    citizenName: string;
    attachmentsUrl?: string[];
  }): ComplaintDocument {
    const complaints = this.getStoredComplaints();
    const count = complaints.length + 1;
    const trackingNum = `MUN-2026-${String(8890 + count).padStart(4, '0')}`;
    const newId = `cmp_${Date.now()}`;
    const now = new Date().toISOString();

    const newComplaint: ComplaintDocument = {
      complaintId: newId,
      trackingNumber: trackingNum,
      citizenId: data.citizenId,
      citizenName: data.isAnonymous ? 'Anonymous Resident' : data.citizenName,
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
            name: data.isAnonymous ? 'Anonymous Resident' : data.citizenName,
            role: 'citizen'
          },
          newStatus: 'submitted',
          message: `Complaint #${trackingNum} successfully registered into municipal portal.`,
          timestamp: now
        }
      ]
    };

    complaints.unshift(newComplaint);
    this.saveComplaints(complaints);
    return newComplaint;
  }

  public updateComplaintStatus(
    complaintId: string,
    newStatus: ComplaintStatus,
    performedBy: { uid: string; name: string; role: 'officer' | 'admin' },
    message: string,
    resolution?: ResolutionData
  ): ComplaintDocument {
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
      message: message || `Status updated from ${prevStatus} to ${newStatus}`,
      timestamp: now
    });

    complaints[idx] = complaint;
    this.saveComplaints(complaints);
    return complaint;
  }

  public addFeedback(complaintId: string, feedback: CitizenFeedback): ComplaintDocument {
    const complaints = this.getStoredComplaints();
    const idx = complaints.findIndex(c => c.complaintId === complaintId);
    if (idx === -1) throw new Error('Complaint not found');

    complaints[idx].feedback = feedback;
    complaints[idx].updatedAt = new Date().toISOString();
    this.saveComplaints(complaints);
    return complaints[idx];
  }
}

export const complaintService = new ComplaintService();
