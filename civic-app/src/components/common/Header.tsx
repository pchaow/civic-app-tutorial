import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Building2, Bell, Shield, User, FilePlus, LogOut } from 'lucide-react';
import { requestNotificationPermission, showLocalBrowserNotification } from '../../services/fcmService';

interface HeaderProps {
  activeTab: 'file' | 'track' | 'officer';
  setActiveTab: (tab: 'file' | 'track' | 'officer') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser, loginWithGoogle, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const isOfficerOrAdmin = currentUser?.role === 'officer' || currentUser?.role === 'admin';

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      showLocalBrowserNotification('เปิดการแจ้งเตือน CivicSolve สำเร็จ!', {
        body: 'คุณจะได้รับแจ้งเตือนสถานะเรื่องร้องเรียนผ่านบราวเซอร์ทันที'
      });
    } else {
      alert('บราวเซอร์ปฏิเสธสิทธิ์การแจ้งเตือน หรืออุปกรณ์ไม่รองรับ');
    }
  };

  const handleOfficerTabClick = () => {
    if (isOfficerOrAdmin) {
      setActiveTab('officer');
    } else {
      setShowLoginModal(true);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await loginWithGoogle();
      setShowLoginModal(false);
      setActiveTab('officer');
    } catch (e) {
      alert('เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google: ' + e);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <>
      <header className="navbar">
        <div className="brand">
          <Building2 className="w-6 h-6" />
          <span>CivicSolve</span>
          <span style={{ fontSize: '0.75rem', padding: '2px 8px', background: '#eff6ff', borderRadius: '10px', color: '#2563eb' }}>
            ระบบร้องเรียนเทศบาล
          </span>
        </div>

        <nav className="nav-controls">
          <button
            className={`role-btn ${activeTab === 'file' ? 'active' : ''}`}
            onClick={() => setActiveTab('file')}
          >
            <FilePlus size={16} /> แจ้งเรื่องร้องเรียน
          </button>

          <button
            className={`role-btn ${activeTab === 'track' ? 'active' : ''}`}
            onClick={() => setActiveTab('track')}
          >
            <User size={16} /> ติดตามสถานะ
          </button>

          <button
            className={`role-btn ${activeTab === 'officer' ? 'active' : ''}`}
            onClick={handleOfficerTabClick}
          >
            <Shield size={16} /> ระบบเจ้าหน้าที่ {isOfficerOrAdmin && '🔒'}
          </button>

          <button
            onClick={handleEnableNotifications}
            title="เปิดรับการแจ้งเตือน Push Notification"
            className="btn btn-secondary"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
          >
            <Bell size={16} /> เปิดการแจ้งเตือน
          </button>

          {/* User Account Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f1f5f9', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem' }}>
            <span style={{ fontWeight: 600, color: '#334155' }}>{currentUser?.fullName}</span>
            <span style={{ fontSize: '0.7rem', background: '#e2e8f0', padding: '1px 6px', borderRadius: '8px' }}>
              {currentUser?.role === 'officer' ? 'เจ้าหน้าที่' : currentUser?.role === 'admin' ? 'ผู้ดูแล' : 'ประชาชน'}
            </span>
            {isOfficerOrAdmin && (
              <button
                onClick={() => logout()}
                title="ออกจากระบบ"
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444', marginLeft: '0.25rem' }}
              >
                <LogOut size={14} />
              </button>
            )}
          </div>
        </nav>
      </header>

      {/* Google Login Authentication Modal for Officer Access */}
      {showLoginModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ textAlign: 'center', maxWidth: '420px', padding: '2.5rem 2rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Shield size={32} color="#2563eb" />
            </div>

            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              เข้าสู่ระบบสำหรับเจ้าหน้าที่เทศบาล
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '2rem' }}>
              เฉพาะเจ้าหน้าที่ที่ได้รับการยืนยันตัวตนผ่าน Google Workspace เท่านั้นที่สามารถเข้าถึงระบบจัดการได้
            </p>

            <button
              onClick={handleGoogleLogin}
              className="btn btn-primary"
              disabled={isLoggingIn}
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '0.75rem',
                fontSize: '0.95rem',
                background: '#ffffff',
                color: '#334155',
                border: '1px solid #cbd5e1',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: '0.5rem' }}>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              {isLoggingIn ? 'กำลังเข้าสู่ระบบด้วย Google...' : 'เข้าสู่ระบบด้วย Google (Sign in with Google)'}
            </button>

            <div style={{ marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => setShowLoginModal(false)}
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
