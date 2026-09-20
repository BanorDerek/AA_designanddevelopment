import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatMoney } from '../utils/formatMoney';
import './Products.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [addedId, setAddedId] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    fetch(`${API_BASE}/categories`).then((r) => r.json()).then(setCategories).catch(() => {});
  }, []);

  // Re-fetch whenever the category or search term changes — filtering
  // happens server-side so it scales past a small in-memory product list.
  useEffect(() => {
    const params = new URLSearchParams();
    if (activeCategory !== 'all') params.set('category', activeCategory);
    if (search.trim()) params.set('search', search.trim());

    const timer = setTimeout(() => {
      fetch(`${API_BASE}/products?${params.toString()}`)
        .then((r) => r.json())
        .then(setProducts)
        .catch(() => {});
    }, 300); // debounce so typing doesn't fire a request per keystroke

    return () => clearTimeout(timer);
  }, [activeCategory, search]);

  const handleAdd = (e, product) => {
    e.stopPropagation(); // Prevent navigating to product detail
    addToCart(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1200);
  };

  const handleCardClick = (slug) => {
    navigate(`/products/${slug}`);
  };

  return (
    <main className="products-page">
      <div className="products-wrapper">
        <div className="products-controls">
          <div className="products-search">
            <Search size={16} />
            <input
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="products-categories">
            <button
              className={`products-category ${activeCategory === 'all' ? 'products-category--active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`products-category ${activeCategory === cat.slug ? 'products-category--active' : ''}`}
                onClick={() => setActiveCategory(cat.slug)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {products.length === 0 ? (
          <p className="products-empty">No products match your search.</p>
        ) : (
          <div className="products-grid">
            {products.map((product, index) => (
              <div 
                className="product-card" 
                key={product.id}
                onClick={() => handleCardClick(product.slug)}
                style={{ '--card-delay': index % 12 }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick(product.slug);
                  }
                }}
              >
                <div className="product-card__frame">
                  {product.coverImageUrl ? (
                    <img src={product.coverImageUrl} alt={product.name} loading="lazy" />
                  ) : (
                    <span className="product-card__placeholder">No image</span>
                  )}
                  {!product.isPublished && (
                    <span className="product-card__draft-badge">Draft</span>
                  )}
                </div>
                <div className="product-card__info">
                  <span className="product-card__name">{product.name}</span>
                  <span className="product-card__price">{formatMoney(product.price, product.currency)}</span>
                </div>
                {product.category && (
                  <span className="product-card__category">{product.category.name}</span>
                )}
                <button 
                  className="product-card__add" 
                  onClick={(e) => handleAdd(e, product)}
                  disabled={addedId === product.id}
                >
                  {addedId === product.id ? 'Added ✓' : 'Add to Cart'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}