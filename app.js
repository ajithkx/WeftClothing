const products = [
  {
    id: 1,
    name: "Weathered Leather Jacket",
    category: "Vintage Leather",
    price: 180,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 2,
    name: "Washed Denim Trucker",
    category: "Retro Denim",
    price: 95,
    image:
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 3,
    name: "Corduroy Work Jacket",
    category: "Thrift Classic",
    price: 72,
    image:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 4,
    name: "Heritage Field Jacket",
    category: "Military Surplus",
    price: 120,
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 5,
    name: "Vintage Varsity Jacket",
    category: "Collector",
    price: 140,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 6,
    name: "Suede Aviator Jacket",
    category: "Rare Find",
    price: 210,
    image:
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=600&q=80",
  },
];

function App() {
  const [page, setPage] = React.useState("shop");
  const [cart, setCart] = React.useState([]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div>
      <header className="nav">
        <div className="container nav-inner">
          <div className="brand">VINTAGE YARD</div>
          <nav className="nav-links">
            <button className="btn" onClick={() => setPage("shop")}>
              Shop
            </button>
            <button className="btn" onClick={() => setPage("cart")}>
              Cart
            </button>
            <button className="btn" onClick={() => setPage("checkout")}>
              Checkout
            </button>
          </nav>
          <div className="nav-actions">
            <button className="btn">Search</button>
            <button className="btn btn-accent" onClick={() => setPage("cart")}>
              Cart ({cart.reduce((sum, item) => sum + item.qty, 0)})
            </button>
          </div>
        </div>
      </header>

      <main className="container">
        {page === "shop" && (
          <>
            <section className="hero">
              <div>
                <h1>Vintage jackets with stories worth wearing.</h1>
                <p>
                  Curated thrift finds with heritage textures, washed finishes,
                  and timeless silhouettes. One‑of‑a‑kind pieces, each restored
                  with care.
                </p>
                <div className="nav-actions">
                  <button className="btn btn-accent">Explore the drop</button>
                  <button className="btn">Archive picks</button>
                </div>
              </div>
              <div className="hero-card">
                <span className="tag">vintage edit</span>
                <h3>Rustic Leather Rider</h3>
                <p className="card-meta">
                  Softened leather, brushed lining, and hand‑finished seams.
                </p>
                <div className="price">$210</div>
                <button className="btn btn-accent">Add to cart</button>
              </div>
            </section>

            <section className="section" id="new">
              <div className="section-header">
                <h2>Jackets collection</h2>
                <div className="filter">
                  <span className="chip active">All</span>
                  <span className="chip">Leather</span>
                  <span className="chip">Denim</span>
                  <span className="chip">Utility</span>
                </div>
              </div>
              <div className="grid">
                {products.map((product) => (
                  <article className="card" key={product.id}>
                    <img src={product.image} alt={product.name} />
                    <div className="card-body">
                      <div className="card-title">{product.name}</div>
                      <div className="card-meta">{product.category}</div>
                      <div className="card-price">
                        ${product.price}
                        <span className="accent"> • rare</span>
                      </div>
                      <button
                        className="btn btn-accent"
                        onClick={() => addToCart(product)}
                      >
                        Add to cart
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}

        {page === "cart" && (
          <section className="page">
            <div className="page-title">Your cart</div>
            <div className="subtle">
              Curated pieces held for you. Adjust quantities or proceed to
              checkout.
            </div>
            <div className="cart-list">
              {cart.length === 0 && (
                <div className="subtle">Your cart is empty.</div>
              )}
              {cart.map((item) => (
                <div className="cart-item" key={item.id}>
                  <img src={item.image} alt={item.name} />
                  <div>
                    <div className="card-title">{item.name}</div>
                    <div className="card-meta">{item.category}</div>
                    <div className="card-price">${item.price}</div>
                  </div>
                  <div className="cart-actions">
                    <button className="btn" onClick={() => updateQty(item.id, -1)}>
                      −
                    </button>
                    <div>{item.qty}</div>
                    <button className="btn" onClick={() => updateQty(item.id, 1)}>
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-summary">
              <div className="card-meta">Subtotal</div>
              <div className="price">${total.toFixed(2)}</div>
              <div className="divider"></div>
              <button className="btn btn-accent" onClick={() => setPage("checkout")}>
                Proceed to checkout
              </button>
            </div>
          </section>
        )}

        {page === "checkout" && (
          <section className="page">
            <div className="page-title">Checkout</div>
            <div className="subtle">
              Provide delivery details and confirm your vintage finds.
            </div>
            <div className="form-grid">
              <input className="input" placeholder="Full name" />
              <input className="input" placeholder="Email address" />
              <input className="input" placeholder="Phone number" />
              <input className="input" placeholder="Shipping address" />
              <input className="input" placeholder="City / Country" />
            </div>
            <div className="cart-summary">
              <div className="card-meta">Order total</div>
              <div className="price">${total.toFixed(2)}</div>
              <div className="divider"></div>
              <button className="btn btn-accent">Place order</button>
            </div>
          </section>
        )}
      </main>

      <footer className="container footer">
        <span>© 2026 VINTAGE YARD</span>
        <span>Thrifted. Restored. Reworn.</span>
      </footer>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

