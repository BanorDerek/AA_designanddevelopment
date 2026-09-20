import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatMoney } from '../utils/formatMoney';
import { X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import './ProductDetail.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  // Product data
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Image gallery
  const [selectedImage, setSelectedImage] = useState(null);
  const [allImages, setAllImages] = useState([]);
  
  // Quantity and cart
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  
  // Related products
  const [relatedProducts, setRelatedProducts] = useState([]);
  
  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/products/${slug}`);
        if (!res.ok) throw new Error('Product not found');
        const data = await res.json();
        setProduct(data);
        
        // Build image array
        const images = [];
        if (data.coverImageUrl) images.push(data.coverImageUrl);
        if (data.images && data.images.length > 0) {
          images.push(...data.images);
        }
        setAllImages(images);
        setSelectedImage(images[0] || null);
        
        // Get related products
        if (data.categoryId) {
          const params = new URLSearchParams();
          params.set('category', data.category?.slug || '');
          const relatedRes = await fetch(`${API_BASE}/products?${params.toString()}`);
          const relatedData = await relatedRes.json();
          const filtered = relatedData.filter(p => p.id !== data.id).slice(0, 4);
          setRelatedProducts(filtered);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchProduct();
  }, [slug]);

  // Add to cart with the selected quantity
  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleThumbnailClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  // Open modal
  const openModal = (imageUrl) => {
    const index = allImages.indexOf(imageUrl);
    setModalImageIndex(index >= 0 ? index : 0);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = '';
  };

  // Previous image in modal
  const prevImage = () => {
    setModalImageIndex(prev => 
      prev === 0 ? allImages.length - 1 : prev - 1
    );
  };

  // Next image in modal
  const nextImage = () => {
    setModalImageIndex(prev => 
      prev === allImages.length - 1 ? 0 : prev + 1
    );
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isModalOpen) return;
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  // Loading state
  if (loading) {
    return (
      <div className="product-detail-loading">
        <div className="product-detail-loading__spinner"></div>
        <p>Loading product...</p>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="product-detail-error">
        <p>{error || 'Product not found'}</p>
        <button onClick={() => navigate('/products')} className="product-detail-error__btn">
          Back to Products
        </button>
      </div>
    );
  }

  // Get product details from the details array (dynamic)
  const productDetails = product.details || [];

  // Get metadata for backward compatibility (if still using metadata field)
  const metadata = product.metadata || {};

  // Check if we have details in the new format (details array)
  const hasDetails = productDetails.length > 0;

  // Check if we have metadata fields (old format - backward compatible)
  const hasMetadata = Object.keys(metadata).some(key => 
    metadata[key] && metadata[key].toString().trim() !== ''
  );

  // Check if warranty exists in metadata (for backward compatibility)
  const warranty = metadata.warranty || '';

  // Function to check if a product has any details (new or old format)
  const hasProductInfo = hasDetails || hasMetadata || warranty;

  return (
    <>
      <main className="product-detail">
        <div className="product-detail__wrapper">
          
          {/* Back button */}
          <button onClick={() => navigate('/products')} className="product-detail__back">
            ← Back to Products
          </button>

          {/* Main product section */}
          <div className="product-detail__main">
            
            {/* LEFT - Images */}
            <div className="product-detail__images">
              {/* Main image */}
              <div 
                className="product-detail__main-image" 
                onClick={() => openModal(selectedImage)}
              >
                {selectedImage ? (
                  <>
                    <img src={selectedImage} alt={product.name} />
                    <div className="product-detail__zoom-overlay">
                      <ZoomIn size={24} />
                      <span>Click to enlarge</span>
                    </div>
                  </>
                ) : (
                  <div className="product-detail__placeholder">No image</div>
                )}
              </div>
              
              {/* Thumbnails - small images below */}
              {allImages.length > 0 && (
                <div className="product-detail__thumbnails">
                  {allImages.map((img, index) => (
                    <button
                      key={index}
                      className={`product-detail__thumbnail ${selectedImage === img ? 'product-detail__thumbnail--active' : ''}`}
                      onClick={() => handleThumbnailClick(img)}
                    >
                      <img src={img} alt={`${product.name} ${index + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT - Product info */}
            <div className="product-detail__info">
              <h1 className="product-detail__name">{product.name}</h1>
              
              {product.category && (
                <span className="product-detail__category">{product.category.name}</span>
              )}
              
              {/* Show brand if manufacturer exists in metadata (old format) */}
              {metadata.manufacturer && (
                <div className="product-detail__brand">
                  {metadata.manufacturer}
                </div>
              )}
              
              {/* Show brand if manufacturer exists in details (new format) */}
              {!metadata.manufacturer && productDetails.some(d => d.key === 'Manufacturer' || d.key === 'manufacturer') && (
                <div className="product-detail__brand">
                  {productDetails.find(d => d.key === 'Manufacturer' || d.key === 'manufacturer')?.value}
                </div>
              )}
              
              <div className="product-detail__price">
                {formatMoney(product.price, product.currency)}
              </div>

              {product.description && (
                <p className="product-detail__description">{product.description}</p>
              )}

              {/* Quantity selector */}
              <div className="product-detail__quantity">
                <label>Quantity</label>
                <div className="product-detail__quantity-controls">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <span>{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)}>+</button>
                </div>
              </div>

              {/* Add to cart */}
              <button 
                className={`product-detail__add-btn ${added ? 'product-detail__add-btn--added' : ''}`}
                onClick={handleAddToCart}
                disabled={!product}
              >
                {added ? '✓ Added to Cart' : `Add ${quantity > 1 ? quantity : ''} to Cart`}
              </button>

              {/* Availability */}
              <div className="product-detail__availability">
                <span className="product-detail__availability-dot"></span>
                In Stock
              </div>
            </div>
          </div>

          {/* ============================================================
              PRODUCT INFORMATION SECTION - DYNAMIC DETAILS
          ============================================================ */}
          
          {hasProductInfo && (
            <div className="product-detail__sections">
              <h2 className="product-detail__section-title">Product information</h2>
              
              {/* ITEM DETAILS - Using the details array (NEW FORMAT) */}
              {hasDetails && (
                <div className="product-detail__details-table">
                  <h3 className="product-detail__subsection-title">Item details</h3>
                  <table>
                    <tbody>
                      {productDetails.map((detail, index) => (
                        <tr key={index}>
                          <td className="product-detail__detail-label">{detail.key}</td>
                          <td className="product-detail__detail-value">{detail.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ITEM DETAILS - Using metadata (OLD FORMAT - Backward Compatible) */}
              {!hasDetails && hasMetadata && (
                <div className="product-detail__details-table">
                  <h3 className="product-detail__subsection-title">Item details</h3>
                  <table>
                    <tbody>
                      {Object.entries(metadata)
                        .filter(([key, value]) => 
                          key !== 'warranty' && value && value.toString().trim() !== ''
                        )
                        .map(([key, value]) => (
                          <tr key={key}>
                            <td className="product-detail__detail-label">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </td>
                            <td className="product-detail__detail-value">{value}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* WARRANTY & SUPPORT - Only show if warranty exists */}
              {warranty && (
                <div className="product-detail__warranty">
                  <h3 className="product-detail__subsection-title">Warranty & Support</h3>
                  <p>{warranty}</p>
                </div>
              )}
            </div>
          )}

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="product-detail__related">
              <div className="product-detail__related-header">
                <h2 className="product-detail__section-title">You May Also Like</h2>
                <button 
                  className="product-detail__related-view-all"
                  onClick={() => navigate('/products')}
                >
                  View All Products →
                </button>
              </div>
              
              <div className="product-detail__related-grid">
                {relatedProducts.map((related) => (
                  <div 
                    key={related.id} 
                    className="product-detail__related-card"
                    onClick={() => navigate(`/products/${related.slug}`)}
                  >
                    <div className="product-detail__related-image">
                      {related.coverImageUrl ? (
                        <img src={related.coverImageUrl} alt={related.name} />
                      ) : (
                        <div className="product-detail__placeholder">No image</div>
                      )}
                    </div>
                    <div className="product-detail__related-info">
                      <h4>{related.name}</h4>
                      <span>{formatMoney(related.price, related.currency)}</span>
                      <button 
                        className="product-detail__related-add"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(related, 1);
                        }}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
        </div>
      </main>

      {/* Image Modal - Full screen view */}
      {isModalOpen && allImages.length > 0 && (
        <div className="product-detail-modal" onClick={closeModal}>
          <div className="product-detail-modal__content" onClick={(e) => e.stopPropagation()}>
            
            {/* Close button */}
            <button className="product-detail-modal__close" onClick={closeModal}>
              <X size={28} />
            </button>
            
            {/* Image */}
            <div className="product-detail-modal__image-container">
              <img src={allImages[modalImageIndex]} alt={product.name} />
            </div>

            {/* Navigation arrows */}
            {allImages.length > 1 && (
              <>
                <button 
                  className="product-detail-modal__nav product-detail-modal__nav--prev"
                  onClick={prevImage}
                >
                  <ChevronLeft size={32} />
                </button>
                <button 
                  className="product-detail-modal__nav product-detail-modal__nav--next"
                  onClick={nextImage}
                >
                  <ChevronRight size={32} />
                </button>
                <div className="product-detail-modal__counter">
                  {modalImageIndex + 1} / {allImages.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}