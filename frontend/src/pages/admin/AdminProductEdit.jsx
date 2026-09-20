import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminProductEdit.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function AdminProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authFetch } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categories, setCategories] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    slug: '',
    price: '',
    currency: 'USD',
    categoryId: '',
    description: '',
    isPublished: true,
    details: [], // Array of {key: '', value: ''}
    coverImageUrl: '',
    images: []
  });

  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  // Load product data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load categories
        const catRes = await authFetch('/categories/admin/all');
        const catData = await catRes.json();
        setCategories(catData);

        // Load product if editing
        if (id) {
          const productRes = await authFetch(`/products/admin/${id}`);
          const productData = await productRes.json();
          
          setForm({
            ...productData,
            details: productData.details || []
          });
          setCoverPreview(productData.coverImageUrl);
        }
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, authFetch]);

  const slugify = (str) => {
    return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle detail changes
  const handleDetailChange = (index, field, value) => {
    setForm(prev => {
      const newDetails = [...prev.details];
      newDetails[index] = { ...newDetails[index], [field]: value };
      return { ...prev, details: newDetails };
    });
  };

  // Add new detail field
  const addDetailField = () => {
    setForm(prev => ({
      ...prev,
      details: [...prev.details, { key: '', value: '' }]
    }));
  };

  // Remove detail field
  const removeDetailField = (index) => {
    setForm(prev => ({
      ...prev,
      details: prev.details.filter((_, i) => i !== index)
    }));
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload additional images
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImage(true);
    setError('');

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });

      const res = await authFetch(`/products/${id}/images`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to upload images');
      }

      const data = await res.json();
      setForm(prev => ({
        ...prev,
        images: data.images || []
      }));
      setSuccess('Images uploaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  // Remove an image
  const handleRemoveImage = async (imageUrl) => {
    if (!confirm('Remove this image?')) return;

    try {
      const res = await authFetch(`/products/${id}/images`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: [imageUrl] })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to remove image');
      }

      const data = await res.json();
      setForm(prev => ({
        ...prev,
        images: data.images || []
      }));
      setSuccess('Image removed successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      // Filter out empty detail fields
      const filteredDetails = form.details.filter(
        detail => detail.key.trim() !== '' && detail.value.trim() !== ''
      );

      // If there's a cover file to upload, handle it first
      if (coverFile && id) {
        const coverFormData = new FormData();
        coverFormData.append('image', coverFile);
        await authFetch(`/products/${id}/cover-image`, {
          method: 'POST',
          body: coverFormData
        });
      }

      // Update product details
      const updateData = {
        name: form.name,
        slug: form.slug,
        price: form.price,
        currency: form.currency,
        categoryId: form.categoryId || null,
        description: form.description || '',
        isPublished: form.isPublished,
        details: filteredDetails
      };

      const url = id ? `/products/admin/${id}` : '/products';
      const method = id ? 'PUT' : 'POST';

      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save product');
      }

      const data = await res.json();
      setSuccess('Product saved successfully!');
      
      if (!id) {
        navigate(`/admin/products/edit/${data.id}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="admin-product-edit__loading">Loading...</div>;
  }

  return (
    <div className="admin-product-edit">
      <div className="admin-product-edit__header">
        <h1>{id ? 'Edit Product' : 'Create New Product'}</h1>
        <button 
          className="admin-btn admin-btn--ghost"
          onClick={() => navigate('/admin/products')}
        >
          ← Back to Products
        </button>
      </div>

      {error && <div className="admin-product-edit__error">{error}</div>}
      {success && <div className="admin-product-edit__success">{success}</div>}

      <form className="admin-product-edit__form" onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div className="admin-product-edit__section">
          <h2>Basic Information</h2>
          
          <div className="admin-product-edit__row">
            <div className="admin-product-edit__field">
              <label>Name *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={(e) => {
                  handleChange(e);
                  if (!id) {
                    setForm(prev => ({ ...prev, slug: slugify(e.target.value) }));
                  }
                }}
                required
              />
            </div>
            
            <div className="admin-product-edit__field">
              <label>Slug *</label>
              <input
                type="text"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="admin-product-edit__row">
            <div className="admin-product-edit__field">
              <label>Price *</label>
              <input
                type="number"
                step="0.01"
                name="price"
                value={form.price}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="admin-product-edit__field">
              <label>Currency</label>
              <select
                name="currency"
                value={form.currency}
                onChange={handleChange}
              >
                <option value="USD">USD ($)</option>
                <option value="NGN">NGN (₦)</option>
              </select>
            </div>
          </div>

          <div className="admin-product-edit__field">
            <label>Category</label>
            <select
              name="categoryId"
              value={form.categoryId || ''}
              onChange={handleChange}
            >
              <option value="">Uncategorized</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="admin-product-edit__field">
            <label>Description</label>
            <textarea
              name="description"
              rows={4}
              value={form.description || ''}
              onChange={handleChange}
            />
          </div>

          <div className="admin-product-edit__field">
            <label>
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => setForm(prev => ({ ...prev, isPublished: e.target.checked }))}
              />
              Published
            </label>
          </div>
        </div>

        {/* Cover Image */}
        <div className="admin-product-edit__section">
          <h2>Cover Image</h2>
          
          <div className="admin-product-edit__field">
            {coverPreview && (
              <div className="admin-product-edit__cover-preview">
                <img src={coverPreview} alt="Cover preview" />
                <button 
                  type="button"
                  className="admin-product-edit__remove-image"
                  onClick={() => {
                    setCoverPreview(null);
                    setCoverFile(null);
                    const input = document.getElementById('cover-input');
                    if (input) input.value = '';
                  }}
                >
                  Remove
                </button>
              </div>
            )}
            <input
              id="cover-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleCoverChange}
            />
            <small>Recommended: Square image, at least 800x800px</small>
          </div>
        </div>

        {/* Additional Images */}
        <div className="admin-product-edit__section">
          <h2>Additional Images</h2>
          
          <div className="admin-product-edit__field">
            {form.images && form.images.length > 0 && (
              <div className="admin-product-edit__image-grid">
                {form.images.map((img, index) => (
                  <div key={index} className="admin-product-edit__image-item">
                    <img src={img} alt={`Product ${index + 1}`} />
                    <button
                      type="button"
                      className="admin-product-edit__remove-image"
                      onClick={() => handleRemoveImage(img)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleImageUpload}
              disabled={uploadingImage || !id}
            />
            {!id && (
              <small>Save the product first, then you can add images</small>
            )}
            {uploadingImage && <small>Uploading...</small>}
            {id && (
              <small>Upload additional images (JPG, PNG, WebP). Max 10 images.</small>
            )}
          </div>
        </div>

        {/* Product Details - Dynamic Fields */}
        <div className="admin-product-edit__section">
          <div className="admin-product-edit__section-header">
            <h2>Product Details</h2>
            <button 
              type="button" 
              className="admin-btn admin-btn--small"
              onClick={addDetailField}
            >
              + Add Detail
            </button>
          </div>
          
          <p className="admin-product-edit__section-desc">
            Add custom details for your product. Each detail will appear as a row in the "Item details" section.
          </p>

          {form.details.length === 0 ? (
            <div className="admin-product-edit__empty-details">
              <p>No details added yet. Click "Add Detail" to add product information.</p>
            </div>
          ) : (
            <div className="admin-product-edit__details-list">
              {form.details.map((detail, index) => (
                <div key={index} className="admin-product-edit__detail-row">
                  <div className="admin-product-edit__detail-field">
                    <label>Label</label>
                    <input
                      type="text"
                      placeholder="e.g., Manufacturer, Color, Size"
                      value={detail.key}
                      onChange={(e) => handleDetailChange(index, 'key', e.target.value)}
                    />
                  </div>
                  <div className="admin-product-edit__detail-field">
                    <label>Value</label>
                    <input
                      type="text"
                      placeholder="e.g., Apple, Red, Large"
                      value={detail.value}
                      onChange={(e) => handleDetailChange(index, 'value', e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    className="admin-product-edit__detail-remove"
                    onClick={() => removeDetailField(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="admin-product-edit__actions">
          <button 
            type="submit" 
            className="admin-btn"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Product'}
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--ghost"
            onClick={() => navigate('/admin/products')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}