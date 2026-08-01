import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/common/Header';
import { FileComplaintForm } from './components/citizen/ComplaintForm';
import { StepperTracker } from './components/citizen/StepperTracker';
import { OfficerDashboard } from './components/officer/OfficerDashboard';
import { ShieldCheck } from 'lucide-react';

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'file' | 'track' | 'officer'>('file');
  const [trackedId, setTrackedId] = useState<string | null>(null);

  const handleComplaintSuccess = (id: string) => {
    setTrackedId(id);
    setActiveTab('track');
  };

  return (
    <div className="app-container">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="main-content">
        {/* Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
            color: 'white',
            borderRadius: '16px',
            padding: '1.5rem 2rem',
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
              ระบบแจ้งเรื่องร้องเรียนเทศบาล (CivicSolve)
            </h1>
            <p style={{ opacity: 0.9, fontSize: '0.95rem' }}>
              แจ้งเรื่องร้องเรียนความเดือดร้อน • ติดตามสถานะเรียลไทม์ผ่าน Firebase • รับการแจ้งเตือนผ่านบราวเซอร์ FCM Push
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.15)', padding: '0.5rem 1rem', borderRadius: '12px', fontSize: '0.85rem' }}>
            <ShieldCheck size={18} /> พัฒนาด้วย Firebase & TypeScript
          </div>
        </div>

        {/* Tab Switch Views */}
        {activeTab === 'file' && <FileComplaintForm onSuccess={handleComplaintSuccess} />}
        {activeTab === 'track' && <StepperTracker initialComplaintId={trackedId} />}
        {activeTab === 'officer' && <OfficerDashboard />}
      </main>

      <footer style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b', fontSize: '0.85rem', borderTop: '1px solid #e2e8f0' }}>
        © 2026 ระบบการจัดการเรื่องร้องเรียนเทศบาล CivicSolve พัฒนาด้วย Vite, React, TypeScript และ Firebase Cloud Services
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
