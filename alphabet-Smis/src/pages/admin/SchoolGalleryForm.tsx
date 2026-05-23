import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, Image as ImageIcon, Loader, ArrowLeft } from 'lucide-react';
import '../../App.css';

export default function SchoolGalleryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      const fetchItem = async () => {
        try {
          const token = localStorage.getItem('accessToken');
          const res = await fetch(`http://localhost:3000/gallery/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!res.ok) throw new Error('Failed to fetch gallery item');
          const data = await res.json();
          setTitle(data.title || '');
          setDescription(data.description || '');
          setImagePreview(`http://localhost:3000${data.imageUrl}`);
        } catch (err: any) {
          alert(err.message);
          navigate('/admin/gallery');
        } finally {
          setIsLoading(false);
        }
      };
      fetchItem();
    }
  }, [id, isEdit, navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePreview) {
      alert('Please select an image');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const url = isEdit ? `http://localhost:3000/gallery/${id}` : 'http://localhost:3000/gallery';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (!res.ok) throw new Error('Failed to save gallery item');
      navigate('/admin/gallery');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
        <Loader size={48} className="spin" style={{ color: '#3b82f6' }} />
      </div>
    );
  }

  return (
    <div className="animate-fade">
      <div style={{ marginBottom: '2rem' }}>
        <button className="btn btn-outline" onClick={() => navigate('/admin/gallery')} style={{ marginBottom: '1rem' }}>
          <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} /> Back to Gallery
        </button>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--text-light)' }}>
          {isEdit ? 'Edit Gallery Photo' : 'Add Gallery Photo'}
        </h1>
      </div>

      <div className="glass-panel" style={{ maxWidth: '800px', padding: '2.5rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
          <div className="form-group">
            <label>Title (Optional)</label>
            <input
              type="text"
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g., Science Lab, Main Entrance"
            />
          </div>

          <div className="form-group">
            <label>Description (Optional)</label>
            <textarea
              className="form-control"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide some details about this photo..."
            />
          </div>

          <div className="form-group">
            <label>Photo</label>
            <div style={{ marginTop: '0.5rem' }}>
              <input
                type="file"
                accept="image/*"
                id="gallery-image"
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />
              <label
                htmlFor="gallery-image"
                style={{
                  display: 'block', //Check
                  width: '100%',
                  height: '300px',
                  border: '2px dashed rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  background: 'rgba(255,255,255,0.02)'
                }}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <>
                    <ImageIcon size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                    <span style={{ color: 'var(--text-muted)' }}>Click to upload a campus photo</span>
                  </>
                )}
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader size={18} className="spin" /> : <Save size={18} style={{ marginRight: '0.5rem' }} />}
              {isEdit ? 'Update Photo' : 'Save Photo'}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              style={{ flex: 1 }}
              onClick={() => navigate('/admin/gallery')}
            >
              <X size={18} style={{ marginRight: '0.5rem' }} /> Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
