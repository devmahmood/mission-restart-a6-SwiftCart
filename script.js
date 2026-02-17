// Global Selectors
const categoryContainer = document.getElementById("category-container");
const productsContainer = document.querySelector(".cards-container");
const trendingContainer = document.getElementById("trending-container");

// 1. HOME PAGE LOGIC (Trending)
const loadTrendingProducts = async () => {
  try {
    const res = await fetch("https://fakestoreapi.com/products");
    const products = await res.json();

    // Sort by rating (highest first) and take top 3
    const topRated = products.sort((a, b) => b.rating.rate - a.rating.rate).slice(0, 3);
    
    displayTrending(topRated);
  } catch (error) {
    console.error("Error loading trending:", error);
  }
};

const displayTrending = (products) => {
  if (!trendingContainer) return;
  trendingContainer.innerHTML = "";

  products.forEach((product) => {
    const card = document.createElement("div");
    card.className = "bg-white rounded-lg p-3 shadow-sm border border-gray-200 w-full sm:w-[280px] md:w-[320px] h-[380px] flex flex-col hover:shadow-xl transition-shadow duration-300";
    
    card.innerHTML = `
        <div class="bg-gray-50 rounded-t-lg h-[180px] flex items-center justify-center p-4 mb-3 relative overflow-hidden group">
          <img src="${product.image}" alt="${product.title}" class="h-full object-contain group-hover:scale-105 transition-transform duration-300" />
        </div>

        <div class="flex flex-col flex-grow justify-between">
          <div class="flex justify-between items-center mb-2">
            <span class="bg-[#e0e7ff] text-[#4338ca] text-[10px] font-bold px-2 py-1 rounded-full capitalize">
              ${product.category}
            </span>
            <div class="flex items-center text-gray-500 text-xs font-medium">
              <i class="fa-solid fa-star text-yellow-400 mr-1 text-[10px]"></i>
              <span>${product.rating.rate} (${product.rating.count})</span>
            </div>
          </div>

          <h3 class="text-gray-800 font-bold text-sm leading-tight truncate mb-1" title="${product.title}">
            ${product.title}
          </h3>

          <div class="text-gray-900 font-extrabold text-lg mb-3">$${product.price}</div>

          <div class="flex gap-2 mt-auto">
            <button onclick="loadProductDetails(${product.id})" class="flex-1 flex items-center justify-center gap-2 border border-gray-300 rounded-md py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              <i class="fa-regular fa-eye"></i> Details
            </button>

            <button class="flex-1 flex items-center justify-center gap-2 bg-[#4f46e5] rounded-md py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm">
              <i class="fa-solid fa-cart-shopping"></i> Add
            </button>
          </div>
        </div>
    `;
    trendingContainer.appendChild(card);
  });
};


// 2. PRODUCTS PAGE LOGIC (Categories & Product Grid)
const loadCategories = async () => {
  try {
    const res = await fetch("https://fakestoreapi.com/products/categories");
    const data = await res.json();
    displayCategories(data);
  } catch (error) {
    console.error("Error loading categories:", error);
  }
};

const displayCategories = (categories) => {
  if (!categoryContainer) return;
  categoryContainer.innerHTML = "";

  const allBtn = document.createElement("button");
  allBtn.className = "btn btn-outline rounded-full px-4 hover:bg-blue-600 hover:text-white transition";
  allBtn.innerText = "All";
  allBtn.addEventListener("click", () => loadProducts("all"));
  categoryContainer.appendChild(allBtn);

  categories.forEach((category) => {
    const btn = document.createElement("button");
    btn.className = "btn btn-outline rounded-full px-4 capitalize hover:bg-blue-600 hover:text-white transition";
    btn.innerText = category;
    btn.addEventListener("click", () => loadProducts(category));
    categoryContainer.appendChild(btn);
  });
};

const loadProducts = async (category = "all") => {
  if (!productsContainer) return;
  productsContainer.innerHTML = '<span class="loading loading-spinner loading-lg mx-auto block my-10"></span>';

  let url = "https://fakestoreapi.com/products";
  if (category !== "all") {
    url = `https://fakestoreapi.com/products/category/${category}`;
  }

  try {
    const res = await fetch(url);
    const data = await res.json();
    displayProducts(data);
  } catch (error) {
    console.error("Error loading products:", error);
  }
};

const displayProducts = (products) => {
  productsContainer.innerHTML = "";
  productsContainer.className = "cards-container grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto px-4 py-8";

  products.forEach((product) => {
    const card = document.createElement("div");
    card.className = "card bg-base-100 shadow-xl border border-gray-200 hover:shadow-2xl transition-shadow duration-300";
    card.innerHTML = `
      <figure class="px-4 pt-4 relative h-64 bg-white">
        <span class="badge badge-secondary absolute top-4 right-4 capitalize">${product.category}</span>
        <img src="${product.image}" alt="${product.title}" class="h-full w-full object-contain hover:scale-105 transition-transform duration-300" />
      </figure>
      <div class="card-body p-5">
        <h2 class="card-title text-base font-bold h-12 overflow-hidden" title="${product.title}">
          ${product.title.length > 40 ? product.title.slice(0, 40) + "..." : product.title}
        </h2>
        <div class="flex items-center justify-between mt-2">
           <span class="text-xl font-bold text-primary">$${product.price}</span>
           <div class="flex items-center text-yellow-500 text-sm">
             ${getStars(product.rating.rate)}
             <span class="text-gray-400 ml-1">(${product.rating.count})</span>
           </div>
        </div>
        <div class="card-actions justify-between mt-4">
          <button onclick="loadProductDetails(${product.id})" class="btn btn-outline btn-sm btn-primary flex-1 mr-2">Details</button>
          <button class="btn btn-sm btn-primary flex-1 text-white">Add</button>
        </div>
      </div>
    `;
    productsContainer.appendChild(card);
  });
};


// 3. Modal & Helpers
const loadProductDetails = async (id) => {
  try {
    const res = await fetch(`https://fakestoreapi.com/products/${id}`);
    const product = await res.json();
    showModal(product);
  } catch (error) {
    console.error("Error loading details:", error);
  }
};

const showModal = (product) => {
  const modalContainer = document.getElementById("details-modal-container");
  if(!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="modal-box w-11/12 max-w-3xl p-0 overflow-hidden bg-white">
      <div class="flex flex-col md:flex-row">
        <div class="w-full md:w-1/2 p-8 flex items-center justify-center bg-gray-50">
          <img src="${product.image}" alt="${product.title}" class="max-h-[300px] object-contain" />
        </div>
        <div class="w-full md:w-1/2 p-8 flex flex-col relative">
          <form method="dialog">
             <button class="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-xl">✕</button>
          </form>
          <span class="text-sm text-gray-500 uppercase tracking-wide font-semibold mb-2">${product.category}</span>
          <h3 class="text-2xl font-bold text-gray-800 mb-4 leading-tight">${product.title}</h3>
          <p class="text-gray-600 mb-6 text-sm leading-relaxed flex-grow">${product.description}</p>
          <div class="flex items-center justify-between mb-6">
             <span class="text-3xl font-bold text-indigo-600">$${product.price}</span>
             <div class="flex items-center gap-1 text-yellow-500">
                ${getStars(product.rating.rate)}
             </div>
          </div>
          <div class="flex gap-3 mt-auto">
             <button class="btn btn-primary flex-1 text-white text-lg">Buy Now</button>
          </div>
        </div>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  `;
  document.getElementById("my_modal_details").showModal();
};

const getStars = (rating) => {
  let starsHtml = "";
  for (let i = 1; i <= 5; i++) {
    starsHtml += i <= Math.round(rating) ? '<i class="fa-solid fa-star"></i>' : '<i class="fa-regular fa-star"></i>';
  }
  return starsHtml;
};

// 4. INITIALIZATION
if (categoryContainer) {
  loadCategories();
  loadProducts("all");
}

if (trendingContainer) {
  loadTrendingProducts();
}

// 5. ACTIVE LINK HIGHLIGHTER
function highlightActiveLink() {
  // Get current filename (e.g., "index.html" or "products.html")
  // If path is empty (root), default to "index.html"
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  // Select all links in the menu (both desktop and mobile)
  const navLinks = document.querySelectorAll(".menu a");

  navLinks.forEach((link) => {
    // Check if the link's href matches the current page
    if (link.getAttribute("href") === currentPage) {
      // Add the active classes (Blue text + Bold)
      link.classList.add("text-blue-700", "font-bold");
    }
  });
}

highlightActiveLink();