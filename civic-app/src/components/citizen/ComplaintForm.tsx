import React, { useState } from 'react';
import { complaintService } from '../../services/complaintService';
import { uploadFileToFirebase } from '../../services/storageService';
import type { Department, UrgencyLevel } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Upload, Send, CheckCircle, Image, Trash2, Navigation, Loader2 } from 'lucide-react';
import { showLocalBrowserNotification } from '../../services/fcmService';
import { LocationPickerMap } from './LocationPickerMap';

interface FileComplaintFormProps {
  onSuccess: (complaintId: string) => void;
}

export const FileComplaintForm: React.FC<FileComplaintFormProps> = ({ onSuccess }) => {
  const { currentUser } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Department>('infrastructure');
  const [urgency, setUrgency] = useState<UrgencyLevel>('medium');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [address, setAddress] = useState('123 ถนนมิตรภาพ เขตเทศบาลเมือง');
  const [latitude, setLatitude] = useState(13.7563);
  const [longitude, setLongitude] = useState(100.5018);
  const [isGettingGps, setIsGettingGps] = useState(false);

  const [uploadedPhotoUrls, setUploadedPhotoUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const [submittedId, setSubmittedId] = useState<string | null>(null);

  // Native HTML5 Geolocation API Location Detector
  const handleGetDeviceLocation = () => {
    if (!('geolocation' in navigator)) {
      alert('เบราว์เซอร์ของคุณไม่รองรับการดึงพิกัด GPS');
      return;
    }

    setIsGettingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));
        setLatitude(lat);
        setLongitude(lng);

        // Optional Reverse Geocoding via OpenStreetMap Nominatim Free API
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=th`);
          const data = await res.json();
          if (data && data.display_name) {
            setAddress(data.display_name);
          }
        } catch {
          setAddress(`ตำแหน่ง GPS พิกัด: ${lat}, ${lng}`);
        } finally {
          setIsGettingGps(false);
        }
      },
      (error) => {
        setIsGettingGps(false);
        alert(`ไม่สามารถดึงพิกัด GPS ได้: ${error.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleMapLocationChange = async (lat: number, lng: number) => {
    const roundedLat = Number(lat.toFixed(6));
    const roundedLng = Number(lng.toFixed(6));
    setLatitude(roundedLat);
    setLongitude(roundedLng);

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${roundedLat}&lon=${roundedLng}&accept-language=th`);
      const data = await res.json();
      if (data && data.display_name) {
        setAddress(data.display_name);
      }
    } catch {}
  };

  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = files.map(file => uploadFileToFirebase(file, 'complaint_photos'));
      const urls = await Promise.all(uploadPromises);
      setUploadedPhotoUrls(prev => [...prev, ...urls]);
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการอัปโหลดไฟล์: ' + err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setUploadedPhotoUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      alert('กรุณากรอกหัวข้อและรายละเอียดเรื่องร้องเรียนให้ครบถ้วน');
      return;
    }

    const created = await complaintService.createComplaint({
      title,
      description,
      category,
      urgency,
      isAnonymous,
      location: { address, latitude, longitude },
      citizenId: currentUser?.uid || 'usr_citizen_demo',
      citizenName: currentUser?.fullName || 'สมชาย ใจดี',
      attachmentsUrl: uploadedPhotoUrls
    });

    showLocalBrowserNotification(`ส่งเรื่องร้องเรียนสำเร็จ #${created.trackingNumber}`, {
      body: `เรื่องร้องเรียน "${title}" ถูกส่งไปยังหน่วยงานรับผิดชอบเรียบร้อยแล้ว`,
      icon: uploadedPhotoUrls[0]
    });

    setTimeout(() => {
      showLocalBrowserNotification(`[แจ้งเตือนเจ้าหน้าที่] มีเรื่องร้องเรียนใหม่ ${created.trackingNumber}`, {
        body: `ความเร่งด่วน: ${urgency.toUpperCase()} - ${title} สถานที่: ${address}`,
      });
    }, 1500);

    setSubmittedId(created.complaintId);
  };

  if (submittedId) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
        <CheckCircle size={64} color="#10b981" style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          ส่งเรื่องร้องเรียนเข้าสู่ระบบสำเร็จ!
        </h2>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
          เจ้าหน้าที่เทศบาลได้รับเรื่องร้องเรียนและอยู่ระหว่างจัดสรรผู้รับผิดชอบ
        </p>
        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', display: 'inline-block' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>รหัสติดตามเรื่อง:</span>
          <br />
          <strong style={{ fontSize: '1.25rem', color: '#2563eb' }}>{complaintService.getComplaintById(submittedId)?.trackingNumber}</strong>
        </div>
        <div>
          <button className="btn btn-primary" onClick={() => onSuccess(submittedId)}>
            ติดตามสถานะตอนนี้
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        แจ้งเรื่องร้องเรียน / ปัญหาความเดือดร้อน
      </h2>
      <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
        ส่งเรื่องร้องเรียนตรงถึงเจ้าหน้าที่เทศบาล เพื่อการตรวจสอบและแก้ไขปัญหาอย่างรวดเร็ว
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">ประเภทปัญหา / สำนักหน่วยงานเทศบาล</label>
          <select
            className="form-select"
            value={category}
            onChange={(e) => setCategory(e.target.value as Department)}
          >
            <option value="infrastructure">โครงสร้างพื้นฐาน (ถนน, ท่อระบายน้ำ, สะพาน)</option>
            <option value="sanitation">สาธารณสุขและขยะมูลฝอย</option>
            <option value="water_works">ประปาและสาธารณูปโภค</option>
            <option value="electricity">ไฟฟ้าและแสงสว่างสาธารณะ</option>
            <option value="traffic">จราจร ป้ายเตือน และสวนสาธารณะ</option>
          </select>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">ระดับความเร่งด่วน</label>
            <select
              className="form-select"
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
            >
              <option value="low">ปกติ (งานบำรุงรักษาทั่วไป)</option>
              <option value="medium">ปานกลาง (ควรได้รับการแก้ไข)</option>
              <option value="high">เร่งด่วน (เกิดอันตราย/เสี่ยงอุบัติเหตุ)</option>
              <option value="critical">ฉุกเฉินวิกฤต (อุบัติภัยร้ายแรง)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">ตัวเลือกข้อมูลผู้แจ้ง</label>
            <div style={{ paddingTop: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                />
                แจ้งเรื่องแบบปกปิดตัวตน (ไม่แสดงชื่อผู้แจ้งต่อสาธารณะ)
              </label>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">หัวข้อเรื่องร้องเรียน / สรุปปัญหา</label>
          <input
            type="text"
            className="form-input"
            placeholder="เช่น ถนนเป็นหลุมขนาดใหญ่ บริเวณสี่แยกมิตรภาพ"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">รายละเอียดปัญหาอย่างละเอียด</label>
          <textarea
            className="form-textarea"
            rows={4}
            placeholder="อธิบายสถานที่ จุดสังเกต สภาพความเสียหาย หรือข้อเสนอแนะเพิ่มเติม..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {/* GPS Location & Map Picker Section */}
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <label className="form-label" style={{ marginBottom: 0 }}>
              <MapPin size={16} /> สถานที่เกิดเหตุ & พิกัด GPS
            </label>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}
              onClick={handleGetDeviceLocation}
              disabled={isGettingGps}
            >
              {isGettingGps ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
              {isGettingGps ? 'กำลังระบุตำแหน่ง...' : 'ดึงพิกัด GPS ของฉัน'}
            </button>
          </div>

          <input
            type="text"
            className="form-input"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />

          <LocationPickerMap
            latitude={latitude}
            longitude={longitude}
            onLocationSelect={handleMapLocationChange}
          />

          <div style={{ background: '#f1f5f9', padding: '0.5rem 0.75rem', borderRadius: '8px', marginTop: '0.5rem', fontSize: '0.85rem' }}>
            พิกัดแผนที่: <strong>{latitude}, {longitude}</strong> (คลิกบนแผนที่เพื่อเปลี่ยนจุดปักหมุด)
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            <Upload size={16} /> อัปโหลดรูปภาพประกอบปัญหา
          </label>

          <div
            style={{
              border: '2px dashed #cbd5e1',
              borderRadius: '12px',
              padding: '1.5rem',
              textAlign: 'center',
              background: '#f8fafc',
              cursor: 'pointer',
              marginBottom: '1rem'
            }}
            onClick={() => document.getElementById('file-upload-input')?.click()}
          >
            <Image size={36} color="#64748b" style={{ margin: '0 auto 0.5rem' }} />
            <p style={{ fontWeight: 600, color: '#334155', fontSize: '0.95rem' }}>
              {isUploading ? 'กำลังอัปโหลดรูปภาพไปยังระบบ...' : 'คลิก หรือ ลากไฟล์รูปภาพมาวางที่นี่'}
            </p>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              รองรับไฟล์ PNG, JPG, WEBP (บันทึกใน Firebase Storage)
            </span>
            <input
              id="file-upload-input"
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={handleImageFileSelect}
            />
          </div>

          {uploadedPhotoUrls.length > 0 && (
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
                รูปภาพที่แนบแล้ว ({uploadedPhotoUrls.length} รูป):
              </span>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {uploadedPhotoUrls.map((url, idx) => (
                  <div key={idx} style={{ position: 'relative' }}>
                    <img
                      src={url}
                      alt={`รูปที่ ${idx + 1}`}
                      style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      style={{
                        position: 'absolute',
                        top: '-6px',
                        right: '-6px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '22px',
                        height: '22px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="ลบรูปภาพ"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={isUploading}>
          <Send size={18} /> ยืนยันส่งเรื่องร้องเรียน & ส่งการแจ้งเตือน
        </button>
      </form>
    </div>
  );
};
