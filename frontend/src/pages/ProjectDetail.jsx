import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatMoney } from '../utils/formatMoney';
import './ProductDetail.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/products/${slug}`);
        if (!res.ok) throw new Error('Product not found');
        const data = await res.json();
        setProduct(data);
        setSelectedImage(data.coverImageUrl);
        
        // Fetch related products
        if (data.categoryId) {
          const relatedRes = await fetch(`${API_BASE}/products?category=${data.category?.slug}&limit=4`);
          const relatedData = await relatedRes.json();
          setRelatedProducts(relatedData.filter(p => p.id !== data.id));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchProduct();
  }, [slug]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleThumbnailClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  if (loading) {
    return (
      <div className="product-detail-loading">
        <div className="product-detail-loading__spinner"></div>
        <p>Loading product...</p>
      </div>
    );
  }

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

  // Parse product details from metadata or use defaults
  const productDetails = product.metadata || {
    manufacturer: 'AA Design & Development',
    styleName: 'Modern',
    manufacturerPartNumber: 'N/A',
    asin: 'N/A'
  };

  return (
    <main className="product-detail">
      <div className="product-detail__wrapper">
        {/* Back button */}
        <button onClick={() => navigate('/products')} className="product-detail__back">
          ← Back to Products
        </button>

        {/* Main product section */}
        <div className="product-detail__main">
          {/* Left: Images */}
          <div className="product-detail__images">
            <div className="product-detail__main-image">
              {selectedImage ? (
                <img src={selectedImage} alt={product.name} />
              ) : (
                <div className="product-detail__placeholder">No image</div>
              )}
            </div>
            
            {/* Thumbnails */}
            {product.images && product.images.length > 0 && (
              <div className="product-detail__thumbnails">
                {[product.coverImageUrl, ...product.images].map((img, index) => (
                  <button
                    key={index}
                    className={`product-detail__thumbnail ${selectedImage === img ? 'product-detail__thumbnail--active' : ''}`}
                    onClick={() => handleThumbnailClick(img)}
                  >
                    <img src={img} alt={`${product.name} view ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product info */}
          <div className="product-detail__info">
            <h1 className="product-detail__name">{product.name}</h1>
            
            {product.category && (
              <span className="product-detail__category">{product.category.name}</span>
            )}
            
            <div className="product-detail__brand">
              {productDetails.manufacturer || 'AA Design & Development'}
            </div>
            
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
            >
              {added ? '✓ Added to Cart' : 'Add to Cart'}
            </button>

            {/* Availability */}
            <div className="product-detail__availability">
              <span className="product-detail__availability-dot"></span>
              In Stock
            </div>
          </div>
        </div>

        {/* Product information section */}
        <div className="product-detail__sections">
          <h2 className="product-detail__section-title">Product information</h2>
          
          {/* Item details in table */}
          <div className="product-detail__details-table">
            <h3 className="product-detail__subsection-title">Item details</h3>
            <table>
              <tbody>
                <tr>
                  <td className="product-detail__detail-label">Manufacturer</td>
                  <td className="product-detail__detail-value">{productDetails.manufacturer || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="product-detail__detail-label">Style Name</td>
                  <td className="product-detail__detail-value">{productDetails.styleName || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="product-detail__detail-label">Manufacturer Part Number</td>
                  <td className="product-detail__detail-value">{productDetails.manufacturerPartNumber || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="product-detail__detail-label">ASIN</td>
                  <td className="product-detail__detail-value">{productDetails.asin || 'N/A'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Warranty & Support */}
          <div className="product-detail__warranty">
            <h3 className="product-detail__subsection-title">Warranty & Support</h3>
            <p>{productDetails.warranty || 'Standard manufacturer warranty applies.'}</p>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="product-detail__related">
            <h2 className="product-detail__section-title">Related Products</h2>
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
                  <h4>{related.name}</h4>
                  <span>{formatMoney(related.price, related.currency)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}