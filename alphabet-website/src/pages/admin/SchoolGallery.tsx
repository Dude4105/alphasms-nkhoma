import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Image as ImageIcon, Loader, ArrowLeft } from 'lucide-react';
import '../../App.css';

interface GalleryItem {
  id: number;
  title?: string;
  description?: string;
  imageUrl: string;
  createdAt: string;
}

export default function SchoolGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/gallery`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch gallery items');
      const json = await res.json();
      setItems(Array.isArray(json) ? json : json.data ?? []);
    } catch (err: any) {
      setError(err.message || 'Failed to load gallery items');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = async (id: number) => {
    if (!await window.confirm('Are you sure you want to delete this gallery item?')) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/gallery/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete gallery item');
      await fetchItems();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="animate-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <button className="btn btn-outline" onClick={() => navigate('/admin/feeds')} style={{ marginBottom: '1rem', padding: '0.4rem 0.8rem' }}>
            <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} /> Back to Feeds
          </button>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--text-light)', marginBottom: '0.25rem' }}>School Gallery</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage campus photos and their descriptions.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/admin/gallery/add')}>
          <Plus size={18} style={{ marginRight: '0.5rem' }} /> Add Photo
        </button>
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
        <div className="grid-4" style={{ gap: '1.5rem' }}>
          {items.length === 0 ? (
            <div className="glass-panel" style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No gallery items found. Add one to get started!
            </div>
          ) : items.map(item => (
            <div key={item.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0' }}>
              <div style={{ height: '180px', overflow: 'hidden', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
                <img src={`${import.meta.env.VITE_API_URL}${item.imageUrl}`} alt={item.title || 'Gallery item'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-light)', marginBottom: '0.4rem' }}>{item.title || 'Untitled'}</h3>
                {item.description && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem', flex: 1 }}>
                    {item.description}
                  </p>
                )}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: 'auto' }}>
                  <button className="btn-icon" onClick={() => navigate(`/admin/gallery/${item.id}/edit`)} title="Edit">
                    <Edit2 size={16} />
                  </button>
                  <button className="btn-icon text-danger" onClick={() => handleDelete(item.id)} title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
