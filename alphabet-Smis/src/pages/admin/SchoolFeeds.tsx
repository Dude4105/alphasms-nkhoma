import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Image as ImageIcon, Loader } from 'lucide-react';
import '../../App.css';

interface SchoolFeed {
  id: number;
  title: string;
  content: string;
  images?: string[];
  createdAt: string;
}

export default function SchoolFeeds() {
  const [feeds, setFeeds] = useState<SchoolFeed[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchFeeds = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/feeds`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch feeds');
      const json = await res.json();
      setFeeds(Array.isArray(json) ? json : json.data ?? []);
    } catch (err: any) {
      setError(err.message || 'Failed to load feeds');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeds();
  }, []);

  const handleDelete = async (id: number) => {
    if (!await window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/feeds/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete feed');
      await fetchFeeds();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="animate-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--text-light)', marginBottom: '0.25rem' }}>School Feeds</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage posts for the Explore Campus public page.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline" onClick={() => navigate('/admin/gallery')}>
            <ImageIcon size={18} style={{ marginRight: '0.5rem' }} /> School Gallery
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/admin/feeds/add')}>
            <Plus size={18} style={{ marginRight: '0.5rem' }} /> Add Post
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <Loader size={32} className="spin" style={{ color: '#3b82f6' }} />
        </div>
      ) : error ? (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
          {error}
        </div>
      ) : (
        <div className="grid-3" style={{ gap: '1.5rem' }}>
          {feeds.length === 0 ? (
            <div className="glass-panel" style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No school feeds found. Add one to get started!
            </div>
          ) : feeds.map(feed => (
            <div key={feed.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {feed.images && feed.images.length > 0 ? (
                <div style={{ height: '160px', overflow: 'hidden', borderTopLeftRadius: '12px', borderTopRightRadius: '12px', position: 'relative' }}>
                  <img src={`${import.meta.env.VITE_API_URL}${feed.images[0]}`} alt={feed.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {feed.images.length > 1 && (
                    <div style={{ position: 'absolute', bottom: '0.5rem', right: '0.5rem', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.8rem' }}>
                      +{feed.images.length - 1} more
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ height: '160px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
                  <ImageIcon size={48} style={{ opacity: 0.2 }} />
                </div>
              )}
              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-light)', marginBottom: '0.5rem' }}>{feed.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {feed.content}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(feed.createdAt).toLocaleDateString()}
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-icon" onClick={() => navigate(`/admin/feeds/${feed.id}/edit`)} title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button className="btn-icon text-danger" onClick={() => handleDelete(feed.id)} title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
