import { useState, useEffect, useCallback } from 'react';
import { useApi } from '../../hooks/useApi';
import { 
  Users, 
  Search, 
  Mail, 
  Shield, 
  Clock,
  MoreVertical
} from 'lucide-react';
import { Skeleton } from '../../components/common/Skeleton';

export default function UserManagement() {
  const { loading, request } = useApi();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      const data = await request({ url: '/api/admin/dashboard/users/', method: 'GET' });
      setUsers(data);
    } catch (err) {}
  }, [request]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Users</h2>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
            <input 
              type="text" 
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ padding: '0.6rem 2.5rem', width: '300px' }}
            />
          </div>
        </div>
      </div>

      {loading && users.length === 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          {[1,2,3,4,5,6].map(i => (
             <div key={i} style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid #f0f0f0' }}>
                <Skeleton width="48px" height="48px" style={{ marginBottom: '1.25rem', borderRadius: '12px' }} />
                <Skeleton width="80%" style={{ marginBottom: '0.5rem' }} />
                <Skeleton width="60%" />
             </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          {filteredUsers.map((user) => (
            <div key={user.id} style={{ 
              padding: '1.5rem', 
              borderRadius: '16px', 
              border: '1px solid #f0f0f0', 
              backgroundColor: '#fafafa'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                 <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '12px', 
                    backgroundColor: user.isAdmin ? '#000' : '#fff',
                    border: '1px solid #eee',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: user.isAdmin ? '#fff' : '#000'
                 }}>
                    {user.isAdmin ? <Shield size={22} /> : <Users size={22} />}
                 </div>
                 <button style={{ color: '#ccc', background: 'none' }}><MoreVertical size={18} /></button>
              </div>
              
              <h4 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>{user.name}</h4>
              <p style={{ fontSize: '0.8rem', color: '#888', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
                 <Mail size={12} /> {user.email}
              </p>
              
              <div style={{ borderTop: '1px solid #eee', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#666', fontSize: '0.75rem' }}>
                    <Clock size={12} />
                    {new Date(user.date_joined).toLocaleDateString()}
                 </div>
                 {user.isAdmin && (
                    <span style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-gold)', backgroundColor: '#000', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                       Admin
                    </span>
                 )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
