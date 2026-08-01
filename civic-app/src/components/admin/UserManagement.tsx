import React, { useState } from 'react';
import type { UserProfile, UserRole, Department } from '../../types';
import { MOCK_USERS } from '../../services/mockData';
import { Users, Save, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const UserManagement: React.FC = () => {
  const { currentUser } = useAuth();

  const getStoredUsers = (): UserProfile[] => {
    const raw = localStorage.getItem('civicsolve_registered_users');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    // Always include current logged-in user if not present
    if (currentUser) return [currentUser];
    return MOCK_USERS;
  };

  const [users, setUsers] = useState<UserProfile[]>(getStoredUsers);
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);

  const handleRoleChange = (uid: string, newRole: UserRole) => {
    setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role: newRole } : u));
  };

  const handleDepartmentChange = (uid: string, newDept: Department) => {
    setUsers(prev => prev.map(u => u.uid === uid ? { ...u, department: newDept } : u));
  };

  const handleSaveUserPermissions = (userToSave: UserProfile) => {
    const updatedUsers = users.map(u => u.uid === userToSave.uid ? userToSave : u);
    setUsers(updatedUsers);
    localStorage.setItem('civicsolve_registered_users', JSON.stringify(updatedUsers));
    setSavedSuccessId(userToSave.uid);
    setTimeout(() => setSavedSuccessId(null), 2000);
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={22} color="#2563eb" /> จัดการผู้ใช้งานและมอบหมายสิทธิ์เจ้าหน้าที่ (User & Officer Management)
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
            เข้าสู่ระบบด้วยสิทธิ์ผู้ดูแลระบบสูงสุด (Super Admin): <strong>{currentUser?.email}</strong>
          </p>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '0.75rem' }}>ชื่อ-นามสกุล / อีเมล</th>
              <th style={{ padding: '0.75rem' }}>สิทธิ์ผู้ใช้งาน (Role)</th>
              <th style={{ padding: '0.75rem' }}>สังกัดหน่วยงาน (Department)</th>
              <th style={{ padding: '0.75rem' }}>บันทึกสิทธิ์</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.uid} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '0.75rem' }}>
                  <strong>{u.fullName}</strong>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>{u.email}</span>
                </td>
                <td style={{ padding: '0.75rem' }}>
                  <select
                    className="form-select"
                    style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.uid, e.target.value as UserRole)}
                  >
                    <option value="citizen">ประชาชนทั่วไป (Citizen)</option>
                    <option value="officer">เจ้าหน้าที่เทศบาล (Officer)</option>
                    <option value="admin">ผู้ดูแลระบบ (Admin/Super Admin)</option>
                  </select>
                </td>
                <td style={{ padding: '0.75rem' }}>
                  {u.role === 'officer' ? (
                    <select
                      className="form-select"
                      style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                      value={u.department || 'infrastructure'}
                      onChange={(e) => handleDepartmentChange(u.uid, e.target.value as Department)}
                    >
                      <option value="infrastructure">โครงสร้างพื้นฐาน</option>
                      <option value="sanitation">สาธารณสุขและขยะ</option>
                      <option value="water_works">การประปา</option>
                      <option value="electricity">ไฟฟ้าและแสงสว่าง</option>
                      <option value="traffic">จราจรและสวนสาธารณะ</option>
                    </select>
                  ) : (
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>-</span>
                  )}
                </td>
                <td style={{ padding: '0.75rem' }}>
                  <button
                    className={`btn ${savedSuccessId === u.uid ? 'btn-success' : 'btn-primary'}`}
                    style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}
                    onClick={() => handleSaveUserPermissions(u)}
                  >
                    {savedSuccessId === u.uid ? <Check size={14} /> : <Save size={14} />}
                    {savedSuccessId === u.uid ? 'บันทึกแล้ว' : 'บันทึกสิทธิ์'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
