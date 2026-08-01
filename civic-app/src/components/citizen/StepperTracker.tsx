import React, { useState, useEffect } from 'react';
import { complaintService } from '../../services/complaintService';
import { STATUS_TH, URGENCY_TH } from '../../types';
import type { ComplaintDocument, ComplaintStatus } from '../../types';
import { CheckCircle, Clock, Search, Star } from 'lucide-react';
import { showLocalBrowserNotification } from '../../services/fcmService';

interface StepperTrackerProps {
  initialComplaintId?: string | null;
}

export const StepperTracker: React.FC<StepperTrackerProps> = ({ initialComplaintId }) => {
  const [complaints, setComplaints] = useState<ComplaintDocument[]>(() => complaintService.getAllComplaints());

  useEffect(() => {
    const unsubscribe = complaintService.subscribeComplaints((liveComplaints) => {
      setComplaints(liveComplaints);
    });
    return () => unsubscribe();
  }, []);

  const [selectedId, setSelectedId] = useState<string>(
    initialComplaintId || complaints[0]?.complaintId || ''
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const selectedComplaint = complaints.find(
    c => c.complaintId === selectedId || c.trackingNumber === searchQuery.trim()
  ) || complaints[0];

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    complaintService.addFeedback(selectedComplaint.complaintId, {
      rating,
      comment: feedbackComment,
      submittedAt: new Date().toISOString()
    });

    setFeedbackSuccess(true);
    showLocalBrowserNotification('บันทึกการประเมินสำเร็จ!', {
      body: `ขอบคุณสำหรับการประเมินความพึงพอใจในการแก้ไขปัญหา: ${rating} ดาว`
    });
  };

  const getStepStatus = (stepKey: ComplaintStatus, currentStatus: ComplaintStatus) => {
    const order: ComplaintStatus[] = ['submitted', 'under_review', 'assigned', 'in_progress', 'resolved'];
    const currIdx = order.indexOf(currentStatus);
    const stepIdx = order.indexOf(stepKey);

    if (currIdx > stepIdx || currentStatus === 'resolved') return 'completed';
    if (currIdx === stepIdx) return 'active';
    return 'pending';
  };

  if (!selectedComplaint) {
    return <div className="card">ยังไม่มีข้อมูลเรื่องร้องเรียนในระบบ</div>;
  }

  return (
    <div>
      <div className="card" style={{ padding: '1rem 1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder="ค้นหาด้วยรหัสติดตามเรื่อง (เช่น MUN-2026-8890)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '12px', color: '#64748b' }} />
          </div>
          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={selectedComplaint.complaintId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {complaints.map(c => (
              <option key={c.complaintId} value={c.complaintId}>
                {c.trackingNumber} - {c.title.substring(0, 30)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className={`badge badge-${selectedComplaint.status}`}>
              {STATUS_TH[selectedComplaint.status] || selectedComplaint.status}
            </span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0.5rem 0 0.25rem' }}>
              {selectedComplaint.title}
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              รหัสติดตามเรื่อง: <strong style={{ color: '#2563eb' }}>{selectedComplaint.trackingNumber}</strong> • วันที่แจ้ง: {new Date(selectedComplaint.createdAt).toLocaleDateString('th-TH')}
            </p>
          </div>
          <div>
            <span className={`urgency-${selectedComplaint.urgency}`} style={{ fontSize: '0.9rem' }}>
              ระดับความเร่งด่วน: {URGENCY_TH[selectedComplaint.urgency] || selectedComplaint.urgency}
            </span>
          </div>
        </div>

        <div className="stepper">
          {[
            { key: 'submitted', label: 'รับเรื่องแล้ว' },
            { key: 'under_review', label: 'ตรวจสอบ' },
            { key: 'assigned', label: 'มอบหมายงาน' },
            { key: 'in_progress', label: 'กำลังซ่อมแซม' },
            { key: 'resolved', label: 'แก้ไขสำเร็จ' }
          ].map((st, idx) => {
            const state = getStepStatus(st.key as ComplaintStatus, selectedComplaint.status);
            return (
              <div key={st.key} className={`step ${state}`}>
                <div className="step-number">
                  {state === 'completed' ? '✓' : idx + 1}
                </div>
                <div className="step-label">{st.label}</div>
              </div>
            );
          })}
        </div>

        {selectedComplaint.resolution && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#166534', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={20} /> หลักฐานการแก้ไขและบันทึกจากเจ้าหน้าที่
            </h3>
            <p style={{ margin: '0.5rem 0 1rem', color: '#14532d' }}>
              "{selectedComplaint.resolution.notes}"
            </p>
            {selectedComplaint.resolution.proofAttachments.length > 0 && (
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#166534' }}>ภาพถ่ายหลังการซ่อมแซม/แก้ไขเสร็จสิ้น:</span>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  {selectedComplaint.resolution.proofAttachments.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt="หลักฐานการแก้ไข"
                      style={{ width: '120px', height: '90px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #86efac' }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {selectedComplaint.status === 'resolved' && (
          <div style={{ background: '#fafafa', border: '1px solid #e5e5e5', padding: '1.25rem', borderRadius: '12px', marginTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              ⭐ ประเมินความพึงพอใจการให้บริการ
            </h3>
            {selectedComplaint.feedback || feedbackSuccess ? (
              <div style={{ color: '#16a34a', fontWeight: 600 }}>
                ขอบคุณสำหรับการประเมิน! คะแนนของคุณ: {selectedComplaint.feedback?.rating || rating} ดาว
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <Star size={24} fill={star <= rating ? '#f59e0b' : 'none'} color="#f59e0b" />
                    </button>
                  ))}
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="ข้อเสนอแนะเพิ่มเติมถึงเจ้าหน้าที่เทศบาล..."
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem 1rem' }}>
                  ส่งข้อเสนอแนะ
                </button>
              </form>
            )}
          </div>
        )}

        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={18} /> ประวัติและไทม์ไลน์การดำเนินงาน
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {selectedComplaint.timeline.map(evt => (
              <div key={evt.eventId} style={{ borderLeft: '3px solid #2563eb', paddingLeft: '1rem', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '0 8px 8px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <strong>{evt.performedBy.name} ({evt.performedBy.role === 'officer' ? 'เจ้าหน้าที่' : evt.performedBy.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ประชาชน'})</strong>
                  <span style={{ color: '#64748b' }}>{new Date(evt.timestamp).toLocaleString('th-TH')}</span>
                </div>
                <p style={{ fontSize: '0.9rem', marginTop: '0.25rem', color: '#334155' }}>
                  {evt.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
