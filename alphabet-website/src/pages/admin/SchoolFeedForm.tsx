import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Loader, Image as ImageIcon, X } from 'lucide-react';

export default function SchoolFeedForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing) {
      fetchFeed();
    }
  }, [id]);

  const fetchFeed = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/feeds/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load feed details');
      const data = await res.json();
      setTitle(data.title);
      setContent(data.content);
      if (data.images && Array.isArray(data.images)) {
        setExistingImages(data.images);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    
    setIsSubmitting(true);
    const token = localStorage.getItem('accessToken');
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    
    imageFiles.forEach(file => {
      formData.append('images', file);
    });

    if (isEditing) {
      existingImages.forEach(url => {
        formData.append('existingImages', url);
      });
    }

    try {
      const url = isEditing 
        ? `${import.meta.env.VITE_API_URL}/feeds/${id}`
        : `${import.meta.env.VITE_API_URL}/feeds`;
        
      const res = await fetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (!res.ok) throw new Error('Failed to save feed');
      
      navigate('/admin/feeds');
    } catch (err: any) {
      alert(err.message);
      setIsSubmitting(false);
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewFile = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <Loader size={32} className="spin" style={{ color: '#3b82f6' }} />
      </div>
    );
  }

  return (
    <div className="animate-fade" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button 
        onClick={() => navigate('/admin/feeds')} 
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '1.5rem' }}
      >
        <ArrowLeft size={16} /> Back to Feeds
      </button>

      <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--text-light)', marginBottom: '0.5rem' }}>
          {isEditing ? 'Edit Post' : 'Create New Post'}
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Fill in the details below to {isEditing ? 'update' : 'publish'} a campus feed.
        </p>

        {error && (
          <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="form-group">
            <label>Post Title</label>
            <input 
              type="text" 
              className="form-control" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="e.g. Science Fair 2026 Registration Open"
              required 
            />
          </div>

          <div className="form-group">
            <label>Post Content</label>
            <textarea 
              className="form-control" 
              value={content} 
              onChange={e => setContent(e.target.value)} 
              rows={8} 
              placeholder="Write the full details here..."
              required 
            />
          </div>

          <div className="form-group">
            <label>Images (Optional)</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input 
                type="file" 
                multiple
                className="form-control" 
                accept="image/*"
                onChange={e => {
                  if (e.target.files) {
                    setImageFiles(prev => [...prev, ...Array.from(e.target.files as FileList)]);
                  }
                }} 
              />
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                You can select multiple images. Recommended size: 1200x600 pixels (JPG or PNG).
              </p>

              {(existingImages.length > 0 || imageFiles.length > 0) && (
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                  {existingImages.map((url, i) => (
                    <div key={`existing-${i}`} style={{ position: 'relative', width: '120px', height: '90px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                      <img src={`${import.meta.env.VITE_API_URL}${url}`} alt="Existing preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button 
                        type="button" 
                        onClick={() => removeExistingImage(i)}
                        style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', padding: '4px', cursor: 'pointer' }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {imageFiles.map((file, i) => (
                    <div key={`new-${i}`} style={{ position: 'relative', width: '120px', height: '90px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                      <img src={URL.createObjectURL(file)} alt="New preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button 
                        type="button" 
                        onClick={() => removeNewFile(i)}
                        style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', padding: '4px', cursor: 'pointer' }}
                      >
                        <X size={12} />
                      </button>
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(59, 130, 246, 0.8)', color: '#fff', fontSize: '0.65rem', textAlign: 'center', padding: '2px' }}>
                        New
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
            <button type="button" className="btn btn-outline" onClick={() => navigate('/admin/feeds')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? <Loader size={18} className="spin" style={{ marginRight: '0.5rem' }} /> : <Save size={18} style={{ marginRight: '0.5rem' }} />} 
              {isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Publish Post')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
