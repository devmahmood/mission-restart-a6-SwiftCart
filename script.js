document.addEventListener("DOMContentLoaded", () => {
  // STATE VARIABLES
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let allProductsCache = [];
  let currentCategory = "all";

  // DOM ELEMENTS
  const categoryContainer = document.getElementById("category-container");
  const productsContainer = document.querySelector(".cards-container");
  const trendingContainer = document.getElementById("trending-container");
  const cartCountElement = document.getElementById("cart-count");
  const cartModal = document.getElementById("cart_modal");
  const cartItemsContainer = document.getElementById("cart-items-container");
  const cartTotalElement = document.getElementById("cart-total-price");

  // EXPOSE FUNCTIONS TO WINDOW FOR INLINE ONCLICK
  window.addToCart = (productId, btn) => {
    if (btn) {
      const originalContent = btn.innerHTML;

      btn.classList.add(
        "transition-transform",
        "duration-150",
        "scale-90",
        "bg-green-600",
        "border-green-600",
        "text-white",
      );

      btn.innerHTML = '<i class="fa-solid fa-check"></i> Added';

      setTimeout(() => {
        btn.classList.remove(
          "scale-90",
          "bg-green-600",
          "border-green-600",
          "text-white",
        );
        btn.innerHTML = originalContent;
      }, 500);
    }

    // LOGIC (Add to Cart)
    let product = allProductsCache.find((p) => p.id === productId);

    if (!product) {
      fetch(`https://fakestoreapi.com/products/${productId}`)
        .then((res) => res.json())
        .then((data) => pushToCart(data))
        .catch((err) => console.error("Error adding to cart:", err));
    } else {
      pushToCart(product);
    }
  };

  window.removeFromCart = (productId) => {
    cart = cart.filter((item) => item.id !== productId);
    updateCartUI();
    renderCartItems();
  };

  window.toggleCartModal = () => {
    renderCartItems();
    if (cartModal) cartModal.showModal();
  };

  window.loadProductDetails = async (id) => {
    try {
      const res = await fetch(`https://fakestoreapi.com/products/${id}`);
      const product = await res.json();
      showModal(product);
    } catch (error) {
      console.error("Error loading details:", error);
    }
  };

  // CORE FUNCTIONS
  const pushToCart = (product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    updateCartUI();

    if (cartCountElement) {
      cartCountElement.classList.add("scale-125");
      setTimeout(() => cartCountElement.classList.remove("scale-125"), 200);
    }
  };

  const updateCartUI = () => {
    localStorage.setItem("cart", JSON.stringify(cart));
    if (cartCountElement) {
      const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
      cartCountElement.innerText = totalCount;
      cartCountElement.classList.remove("hidden");
    }
  };

  const renderCartItems = () => {
    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
      cartItemsContainer.innerHTML =
        '<p class="text-center text-gray-500 py-4">Your cart is empty.</p>';
      if (cartTotalElement) cartTotalElement.innerText = "$0.00";
      return;
    }

    cart.forEach((item) => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;

      const itemDiv = document.createElement("div");
      itemDiv.className =
        "flex items-center gap-4 bg-base-100 p-2 rounded shadow-sm border";
      itemDiv.innerHTML = `
        <img src="${item.image}" class="w-12 h-12 object-contain" />
        <div class="flex-grow">
          <h4 class="font-bold text-sm truncate w-32 md:w-48">${item.title}</h4>
          <p class="text-xs text-gray-500">$${item.price} x ${item.quantity}</p>
        </div>
        <div class="font-bold text-sm">$${itemTotal.toFixed(2)}</div>
        <button onclick="removeFromCart(${item.id})" class="btn btn-ghost btn-xs text-red-500">
          <i class="fa-solid fa-trash"></i>
        </button>
      `;
      cartItemsContainer.appendChild(itemDiv);
    });

    if (cartTotalElement) cartTotalElement.innerText = `$${total.toFixed(2)}`;
  };

  // PRODUCTS & CATEGORIES
  const loadCategories = async () => {
    if (!categoryContainer) return;
    try {
      const res = await fetch("https://fakestoreapi.com/products/categories");
      const data = await res.json();
      displayCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const displayCategories = (categories) => {
    categoryContainer.innerHTML = "";

    const createBtn = (text, value) => {
      const btn = document.createElement("button");
      const isActive = currentCategory === value;
      btn.className = `btn rounded-full px-4 capitalize transition ${
        isActive
          ? "btn-primary text-white"
          : "btn-outline hover:bg-blue-600 hover:text-white"
      }`;
      btn.innerText = text;

      btn.addEventListener("click", () => {
        currentCategory = value;
        loadProducts(value);
        displayCategories(categories); // Re-render buttons to update active class
      });
      return btn;
    };

    categoryContainer.appendChild(createBtn("All", "all"));

    categories.forEach((cat) => {
      categoryContainer.appendChild(createBtn(cat, cat));
    });
  };

  const loadProducts = async (category) => {
    if (!productsContainer) {
      console.warn("Products Container not found on this page.");
      return;
    }

    productsContainer.innerHTML =
      '<span class="loading loading-spinner loading-lg mx-auto block my-10 col-span-full"></span>';

    let url = "https://fakestoreapi.com/products";
    if (category !== "all") {
      url = `https://fakestoreapi.com/products/category/${encodeURIComponent(category)}`;
    }

    try {
      const res = await fetch(url);
      const data = await res.json();

      data.forEach((p) => {
        if (!allProductsCache.find((c) => c.id === p.id))
          allProductsCache.push(p);
      });

      displayProducts(data);
    } catch (error) {
      console.error("Fetch error:", error);
      productsContainer.innerHTML =
        '<p class="text-center text-red-500 col-span-full">Failed to load products. API might be down.</p>';
    }
  };

  const displayProducts = (products) => {
    productsContainer.innerHTML = "";
    productsContainer.className =
      "cards-container grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto px-4 py-8";

    if (products.length === 0) {
      productsContainer.innerHTML =
        '<p class="col-span-full text-center">No products found.</p>';
      return;
    }

    products.forEach((product) => {
      const card = document.createElement("div");
      card.className =
        "card bg-base-100 shadow-xl border border-gray-200 hover:shadow-2xl transition-shadow duration-300 flex flex-col h-full";

      card.innerHTML = `
          <figure class="px-4 pt-4 relative h-48 bg-white">
            <span class="badge badge-secondary absolute top-4 right-4 capitalize">${product.category}</span>
            <img src="${product.image}" alt="${product.title}" class="h-full w-full object-contain" />
          </figure>
          <div class="card-body p-4 flex flex-col flex-grow">
            <h2 class="card-title text-sm font-bold h-10 overflow-hidden mb-2" title="${product.title}">
              ${product.title.length > 40 ? product.title.slice(0, 40) + "..." : product.title}
            </h2>
            
            <div class="flex items-center justify-between mt-auto mb-3">
               <span class="text-lg font-bold text-primary">$${product.price}</span>
               <div class="flex items-center text-yellow-500 text-xs">
                 <i class="fa-solid fa-star mr-1"></i> ${product.rating.rate}
               </div>
            </div>

            <div class="flex gap-2">
              <button onclick="loadProductDetails(${product.id})" class="btn btn-outline btn-xs sm:btn-sm btn-primary flex-1">
                Details
              </button>
                <button onclick="addToCart(${product.id}, this)" class="btn btn-xs sm:btn-sm btn-primary flex-1 text-white">
                    Add
                </button>
            </div>
          </div>
        `;
      productsContainer.appendChild(card);
    });
  };

  // HOME PAGE TRENDING SECTION
  const loadTrendingProducts = async () => {
    if (!trendingContainer) return;

    trendingContainer.innerHTML =
      '<span class="loading loading-spinner loading-lg mx-auto block my-10 col-span-full"></span>';

    try {
      const res = await fetch("https://fakestoreapi.com/products");
      const data = await res.json();

      allProductsCache = data;

      const topRated = data
        .sort((a, b) => b.rating.rate - a.rating.rate)
        .slice(0, 3);
      displayTrending(topRated);
    } catch (error) {
      console.error("Error loading trending:", error);
    }
  };

  const displayTrending = (products) => {
    trendingContainer.innerHTML = "";
    products.forEach((product) => {
      const card = document.createElement("div");
      card.className =
        "bg-white rounded-lg p-3 shadow-sm border border-gray-200 w-full sm:w-[280px] md:w-[320px] h-[380px] flex flex-col hover:shadow-xl transition-shadow duration-300 mx-auto";
      card.innerHTML = `
          <div class="bg-gray-50 rounded-t-lg h-[180px] flex items-center justify-center p-4 mb-3 relative group">
            <img src="${product.image}" class="h-full object-contain group-hover:scale-105 transition-transform duration-300" />
          </div>
          <div class="flex flex-col flex-grow justify-between">
            <h3 class="text-gray-800 font-bold text-sm truncate mb-1">${product.title}</h3>
            <div class="text-gray-900 font-extrabold text-lg mb-3">$${product.price}</div>
            <div class="flex gap-2 mt-auto">
               <button onclick="loadProductDetails(${product.id})" class="flex-1 flex items-center justify-center gap-2 border border-gray-300 rounded-md py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Details</button>
               <button onclick="addToCart(${product.id}, this)" class="flex-1 flex items-center justify-center gap-2 bg-[#4f46e5] rounded-md py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm">
  <i class="fa-solid fa-cart-shopping"></i> Add
</button>
          </div>
      `;
      trendingContainer.appendChild(card);
    });
  };

  // MODAL HELPER FUNCTION
  const showModal = (product) => {
    const modalContainer = document.getElementById("details-modal-container");
    const modal = document.getElementById("my_modal_details");

    if (!modal || !modalContainer) return;

    modalContainer.innerHTML = `
      <div class="modal-box w-11/12 max-w-3xl p-0 overflow-hidden bg-white">
        <div class="flex flex-col md:flex-row">
          <div class="w-full md:w-1/2 p-8 flex items-center justify-center bg-gray-50">
            <img src="${product.image}" class="max-h-[300px] object-contain" />
          </div>
          <div class="w-full md:w-1/2 p-8 flex flex-col relative">
            <form method="dialog">
               <button class="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-xl">✕</button>
            </form>
            <span class="text-sm text-gray-500 uppercase font-semibold mb-2">${product.category}</span>
            <h3 class="text-2xl font-bold text-gray-800 mb-4">${product.title}</h3>
            <p class="text-gray-600 mb-6 text-sm flex-grow">${product.description}</p>
            <div class="flex items-center justify-between mb-6">
               <span class="text-3xl font-bold text-indigo-600">$${product.price}</span>
            </div>
            <div class="flex gap-3 mt-auto">
               <button onclick="addToCart(${product.id}, this)" class="btn btn-primary flex-1 text-white text-lg">Add to Cart</button>
            </div>
          </div>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    `;
    modal.showModal();
  };

  // NAV HIGHLIGHTER
  const highlightActiveLink = () => {
    const currentPage =
      window.location.pathname.split("/").pop() || "index.html";
    const navLinks = document.querySelectorAll(".menu a");
    navLinks.forEach((link) => {
      if (link.getAttribute("href") === currentPage) {
        link.classList.add("text-blue-700", "font-bold");
      }
    });
  };

  // INITIALIZATION ON PAGE LOAD
  updateCartUI();
  highlightActiveLink();

  if (categoryContainer) {
    loadCategories();
    loadProducts("all");
  }

  if (trendingContainer) {
    loadTrendingProducts();
  }
});
