import React, { useState } from 'react';
import { complaintService } from '../../services/complaintService';
import { uploadFileToFirebase } from '../../services/storageService';
import { DEPARTMENT_TH, STATUS_TH, URGENCY_TH } from '../../types';
import type { ComplaintDocument, ComplaintStatus } from '../../types';
import { Shield, Send, Upload, Users } from 'lucide-react';
import { showLocalBrowserNotification } from '../../services/fcmService';
import { useAuth } from '../../context/AuthContext';
import { UserManagement } from '../admin/UserManagement';

export const OfficerDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [complaints, setComplaints] = useState<ComplaintDocument[]>(() => complaintService.getAllComplaints());

  const [activeTab, setActiveTab] = useState<'queue' | 'users'>('queue');
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [activeModalComplaint, setActiveModalComplaint] = useState<ComplaintDocument | null>(null);

  const [newStatus, setNewStatus] = useState<ComplaintStatus>('in_progress');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [proofPhotoUrls, setProofPhotoUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const isSuperAdmin = currentUser?.role === 'admin';

  const handleRefresh = () => {
    setComplaints([...complaintService.getAllComplaints()]);
  };

  const filteredComplaints = complaints.filter(c => {
    const matchDept = selectedDepartmentFilter === 'all' || c.assignedDepartment === selectedDepartmentFilter;
    const matchStatus = selectedStatusFilter === 'all' || c.status === selectedStatusFilter;
    return matchDept && matchStatus;
  });

  const openResolutionModal = (c: ComplaintDocument) => {
    setActiveModalComplaint(c);
    setNewStatus(c.status);
    setResolutionNotes(c.resolution?.notes || '');
    setProofPhotoUrls(c.resolution?.proofAttachments || ['https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80']);
  };

  const handleProofFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = files.map(file => uploadFileToFirebase(file, 'proof_photos'));
      const urls = await Promise.all(uploadPromises);
      setProofPhotoUrls(prev => [...prev, ...urls]);
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพหลักฐาน: ' + err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveResolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalComplaint) return;

    const updated = complaintService.updateComplaintStatus(
      activeModalComplaint.complaintId,
      newStatus,
      {
        uid: currentUser?.uid || 'usr_officer_1',
        name: currentUser?.fullName || 'ช่างอภิสิทธิ์ (เจ้าหน้าที่เทศบาล)',
        role: 'officer'
      },
      resolutionNotes ? `บันทึกเจ้าหน้าที่: ${resolutionNotes}` : `อัปเดตสถานะเป็น ${STATUS_TH[newStatus]}`,
      newStatus === 'resolved' ? {
        notes: resolutionNotes || 'เจ้าหน้าที่เข้าดำเนินการแก้ไขปัญหาเสร็จเรียบร้อยแล้ว',
        proofAttachments: proofPhotoUrls,
        resolvedAt: new Date().toISOString(),
        resolvedByOfficerName: currentUser?.fullName || 'ช่างอภิสิทธิ์ (เจ้าหน้าที่เทศบาล)'
      } : undefined
    );

    showLocalBrowserNotification(`[แจ้งเตือนประชาชน] เรื่องร้องเรียน #${updated.trackingNumber}`, {
      body: `สถานะถูกอัปเดตเป็น: ${STATUS_TH[newStatus]} คลิกเพื่อดูรายละเอียดหลักฐาน`,
      icon: proofPhotoUrls[0]
    });

    setActiveModalComplaint(null);
    handleRefresh();
  };

  return (
    <div>
      {/* Sub navigation for Officers & Admins */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <button
          className={`btn ${activeTab === 'queue' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('queue')}
        >
          <Shield size={16} /> รายการร้องเรียน & คัดกรอง
        </button>
        {isSuperAdmin && (
          <button
            className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={16} /> จัดการสิทธิ์เจ้าหน้าที่ (Super Admin)
          </button>
        )}
      </div>

      {activeTab === 'users' && isSuperAdmin ? (
        <UserManagement />
      ) : (
        <>
          <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
            <div className="card" style={{ padding: '1rem', borderLeft: '4px solid #2563eb' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>เรื่องร้องเรียนทั้งหมด</span>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{complaints.length}</h3>
            </div>
            <div className="card" style={{ padding: '1rem', borderLeft: '4px solid #f59e0b' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>อยู่ระหว่างดำเนินการ</span>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                {complaints.filter(c => ['submitted', 'under_review', 'assigned', 'in_progress'].includes(c.status)).length}
              </h3>
            </div>
            <div className="card" style={{ padding: '1rem', borderLeft: '4px solid #10b981' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>แก้ไขเรียบร้อยแล้ว</span>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                {complaints.filter(c => c.status === 'resolved').length}
              </h3>
            </div>
            <div className="card" style={{ padding: '1rem', borderLeft: '4px solid #ef4444' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>เรื่องเร่งด่วน/วิกฤต</span>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                {complaints.filter(c => ['high', 'critical'].includes(c.urgency)).length}
              </h3>
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Shield size={22} color="#2563eb" /> ระบบคัดกรองและจัดการรายการเรื่องร้องเรียน (สำหรับเจ้าหน้าที่)
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                  ผู้ใช้งานปัจจุบัน: <strong>{currentUser?.fullName}</strong> ({currentUser?.role === 'officer' ? 'เจ้าหน้าที่' : currentUser?.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ประชาชน'})
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <select
                  className="form-select"
                  value={selectedDepartmentFilter}
                  onChange={(e) => setSelectedDepartmentFilter(e.target.value)}
                >
                  <option value="all">ทุกสำนักหน่วยงาน</option>
                  <option value="infrastructure">โครงสร้างพื้นฐาน</option>
                  <option value="sanitation">สาธารณสุขและขยะ</option>
                  <option value="water_works">การประปา</option>
                  <option value="electricity">ไฟฟ้าและแสงสว่าง</option>
                  <option value="traffic">จราจรและสวนสาธารณะ</option>
                </select>

                <select
                  className="form-select"
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                >
                  <option value="all">ทุกสถานะ</option>
                  <option value="submitted">รับเรื่องแล้ว</option>
                  <option value="assigned">มอบหมายแล้ว</option>
                  <option value="in_progress">กำลังดำเนินการ</option>
                  <option value="resolved">แก้ไขแล้ว</option>
                </select>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '0.75rem' }}>รหัสติดตาม</th>
                    <th style={{ padding: '0.75rem' }}>หน่วยงาน & หัวข้อ</th>
                    <th style={{ padding: '0.75rem' }}>สถานที่</th>
                    <th style={{ padding: '0.75rem' }}>ความเร่งด่วน</th>
                    <th style={{ padding: '0.75rem' }}>สถานะ</th>
                    <th style={{ padding: '0.75rem' }}>จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComplaints.map(c => (
                    <tr key={c.complaintId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 600, color: '#2563eb' }}>
                        {c.trackingNumber}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>
                          {DEPARTMENT_TH[c.category] || c.category}
                        </span>
                        <strong>{c.title}</strong>
                      </td>
                      <td style={{ padding: '0.75rem', color: '#475569' }}>
                        {c.location.address}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span className={`urgency-${c.urgency}`}>
                          {URGENCY_TH[c.urgency] || c.urgency}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span className={`badge badge-${c.status}`}>
                          {STATUS_TH[c.status] || c.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                          onClick={() => openResolutionModal(c)}
                        >
                          จัดการ / อัปเดต
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {activeModalComplaint && (
            <div className="modal-overlay">
              <div className="modal-card">
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  จัดการเรื่องร้องเรียน #{activeModalComplaint.trackingNumber}
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                  หัวข้อ: {activeModalComplaint.title} ({DEPARTMENT_TH[activeModalComplaint.category] || activeModalComplaint.category})
                </p>

                <form onSubmit={handleSaveResolution}>
                  <div className="form-group">
                    <label className="form-label">อัปเดตสถานะเรื่องร้องเรียน</label>
                    <select
                      className="form-select"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
                    >
                      <option value="submitted">รับเรื่องแล้ว</option>
                      <option value="under_review">กำลังตรวจสอบ</option>
                      <option value="assigned">มอบหมายเจ้าหน้าที่</option>
                      <option value="in_progress">กำลังดำเนินการแก้ไข</option>
                      <option value="resolved">แก้ไขเรียบร้อยแล้ว (สำเร็จ)</option>
                      <option value="rejected">ปฏิเสธ / ไม่ผ่านเกณฑ์</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">บันทึกข้อความจากเจ้าหน้าที่ / รายละเอียดการซ่อมแซม</label>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      placeholder="ระบุการสั่งการ การส่งทีมช่างลงพื้นที่ หรือวิธีแก้ไข..."
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                    />
                  </div>

                  {newStatus === 'resolved' && (
                    <div className="form-group">
                      <label className="form-label">
                        <Upload size={16} /> อัปโหลดรูปภาพหลักฐานหลังการแก้ไขเสร็จสิ้น
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        className="form-input"
                        onChange={handleProofFileSelect}
                      />
                      {proofPhotoUrls.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                          {proofPhotoUrls.map((url, i) => (
                            <img
                              key={i}
                              src={url}
                              alt="หลักฐาน"
                              style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setActiveModalComplaint(null)}
                    >
                      ยกเลิก
                    </button>
                    <button type="submit" className="btn btn-success" disabled={isUploading}>
                      <Send size={16} /> บันทึกข้อมูล & ส่งการแจ้งเตือน Push
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
