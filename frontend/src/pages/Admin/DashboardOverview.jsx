import { useState, useEffect, useCallback } from 'react';
import { useApi } from '../../hooks/useApi';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  IndianRupee, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  Eye,
  MoreVertical
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import { Skeleton } from '../../components/common/Skeleton';

export default function DashboardOverview() {
  const { loading, request } = useApi();
  const [data, setData] = useState(null);

  const fetchOverview = useCallback(async () => {
    try {
      const response = await request({ url: '/api/admin/dashboard/overview/', method: 'GET' });
      setData(response);
    } catch (err) {}
  }, [request]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  if (loading && !data) return (
     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
        {[1,2,3,4].map(i => <Skeleton key={i} height="140px" style={{ borderRadius: '16px' }} />)}
        <div style={{ gridColumn: 'span 3' }}><Skeleton height="350px" style={{ borderRadius: '16px' }} /></div>
        <div style={{ gridColumn: 'span 1' }}><Skeleton height="350px" style={{ borderRadius: '16px' }} /></div>
     </div>
  );
  
  if (!data) return <div style={{ padding: '2rem', textAlign: 'center', color: '#ff4d4f' }}>Data unavailable. Please check your connection.</div>;

  const { stats, recent_orders, sales_over_time } = data;

  const statCards = [
    { label: 'Revenue', value: `₹${stats.total_revenue.toLocaleString()}`, trend: '+12%', icon: IndianRupee, color: '#4ade80' },
    { label: 'Orders', value: stats.total_orders, trend: '+8%', icon: ShoppingBag, color: '#60a5fa' },
    { label: 'Users', value: stats.total_users, trend: '+5%', icon: Users, color: '#fb923c' },
    { label: 'Inventory', value: stats.total_products, trend: 'Flat', icon: TrendingUp, color: '#8b5cf6' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
      {statCards.map((stat, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          className="admin-card stat-card"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ padding: '0.6rem', borderRadius: '10px', backgroundColor: `${stat.color}15`, color: stat.color }}>
              <stat.icon size={20} />
            </div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#4ade80', backgroundColor: '#f0fdf4', padding: '0.2rem 0.6rem', borderRadius: '20px' }}>
              {stat.trend}
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stat.value}</h3>
            <p style={{ fontSize: '0.8rem', color: '#888' }}>{stat.label}</p>
          </div>
        </motion.div>
      ))}

      <div style={{ gridColumn: 'span 3' }} className="admin-card">
         <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '2rem' }}>Revenue Flow</h3>
         <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={sales_over_time}>
                  <defs>
                     <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#000" stopOpacity={0.08}/>
                        <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                     </linearGradient>
                  </defs>
                  <Tooltip 
                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}
                  />
                  <XAxis dataKey="date" hide />
                  <YAxis hide />
                  <Area type="monotone" dataKey="revenue" stroke="#000" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
               </AreaChart>
            </ResponsiveContainer>
         </div>
      </div>

      <div style={{ gridColumn: 'span 1' }} className="admin-card">
         <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.5rem' }}>Recent Activity</h3>
         <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {recent_orders.map((order, idx) => (
               <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <Clock size={16} color="#888" />
                  </div>
                  <div style={{ flexGrow: 1, minWidth: 0 }}>
                     <p style={{ fontSize: '0.8rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.user}</p>
                     <p style={{ fontSize: '0.65rem', color: '#aaa' }}>₹{order.total} • {order.status}</p>
                  </div>
               </div>
            ))}
         </div>
         <Link to="/admin/orders" className="btn btn-block btn-outline" style={{ marginTop: '2rem', fontSize: '0.75rem' }}>
            All Activity
         </Link>
      </div>
    </div>
  );
}
