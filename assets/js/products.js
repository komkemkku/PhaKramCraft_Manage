// -------- MOCK DATA ---------
let categories = [
  { id: 1, name: "ผ้าพันคอ" },
  { id: 2, name: "เสื้อ" },
  { id: 3, name: "กระเป๋า" },
];

let products = [
  {
    id: 1,
    name: "ผ้าพันคอคราม",
    category: "ผ้าพันคอ",
    cost: 120,
    price: 180,
    profitPercent: 50,
    status: "แสดง",
    images: [],
    visible: true,
  },
  {
    id: 2,
    name: "เสื้อคราม",
    category: "เสื้อ",
    cost: 250,
    price: 350,
    profitPercent: 40,
    status: "แสดง",
    images: [],
    visible: true,
  },
];

// -------------- RENDER ---------------
const productTableBody = document.getElementById("productTableBody");
const searchProductInput = document.getElementById("searchProductInput");
let searchProductKeyword = "";

// ----------- Render Category options in Modal -----------
const categorySelect = document.getElementById("productCategory");
function renderCategoryOptions() {
  categorySelect.innerHTML = '<option value="">เลือกประเภทสินค้า</option>';
  categories.forEach((cat) => {
    categorySelect.innerHTML += `<option value="${cat.name}">${cat.name}</option>`;
  });
}
renderCategoryOptions();

// ------------- Render Table --------------
function renderProducts() {
  let keyword = searchProductKeyword.trim().toLowerCase();
  let filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(keyword) ||
      p.category.toLowerCase().includes(keyword)
  );
  productTableBody.innerHTML = "";
  filtered.forEach((p) => {
    productTableBody.innerHTML += `
        <tr>
            <td>
                ${
                  p.images && p.images[0]
                    ? `<img src="${p.images[0]}" class="product-thumb">`
                    : '<span class="text-muted small">ไม่มีรูป</span>'
                }
            </td>
            <td>${p.name}</td>
            <td>${p.category}</td>
            <td>${p.cost.toLocaleString()}</td>
            <td>${p.price.toLocaleString()}</td>
            <td>${p.profitPercent.toFixed(2)}%</td>
            <td>${p.status}</td>
            <td class="text-center">
                <div class="form-check form-switch d-inline-block">
                  <input class="form-check-input" type="checkbox" ${
                    p.visible ? "checked" : ""
                  } 
                  onchange="toggleProductVisible(${p.id})">
                </div>
            </td>
            <td class="text-center">
                <button class="btn btn-sm btn-outline-info" onclick="editProduct(${
                  p.id
                })"><i class="bi bi-pencil"></i></button>
            </td>
            <td class="text-center">
                <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct(${
                  p.id
                })"><i class="bi bi-trash"></i></button>
            </td>
        </tr>
        `;
  });
}
window.renderProducts = renderProducts;

// -------------- SEARCH -------------
searchProductInput.addEventListener("input", function (e) {
  searchProductKeyword = e.target.value;
  renderProducts();
});

// --------- TOGGLE VISIBLE ---------
window.toggleProductVisible = function (id) {
  const p = products.find((x) => x.id === id);
  if (p) {
    p.visible = !p.visible;
    p.status = p.visible ? "แสดง" : "ซ่อน";
    renderProducts();
  }
};

// --------- ADD/EDIT PRODUCT MODAL ---------
const productModal = new bootstrap.Modal(
  document.getElementById("productModal")
);
const productForm = document.getElementById("productForm");
const productFormError = document.getElementById("formError");
let editProductId = null;
let imageFiles = [];

document
  .getElementById("btnAddProduct")
  .addEventListener("click", () => openProductModal());

function openProductModal(product = null) {
  productForm.reset();
  productFormError.classList.add("d-none");
  imageFiles = [];
  renderProductImagesPreview();

  if (product) {
    document.getElementById("productModalTitle").textContent = "แก้ไขสินค้า";
    document.getElementById("productId").value = product.id;
    document.getElementById("productName").value = product.name;
    document.getElementById("productCategory").value = product.category;
    document.getElementById("productCost").value = product.cost;
    document.getElementById("productProfitPercent").value =
      product.profitPercent;
    document.getElementById("productPrice").value = product.price;
    document.getElementById("productStatus").value = product.status;
    editProductId = product.id;
    imageFiles = [...(product.images || [])];
    renderProductImagesPreview();
  } else {
    document.getElementById("productModalTitle").textContent = "เพิ่มสินค้า";
    document.getElementById("productId").value = "";
    editProductId = null;
  }
  productModal.show();
}

// ----------- SYNC COST/PROFIT/PERCENT ---------------
const costInput = document.getElementById("productCost");
const profitPercentInput = document.getElementById("productProfitPercent");
const priceInput = document.getElementById("productPrice");

costInput.addEventListener("input", syncProfitPrice);
profitPercentInput.addEventListener("input", function () {
  if (costInput.value) {
    const cost = parseFloat(costInput.value);
    const percent = parseFloat(profitPercentInput.value);
    if (!isNaN(cost) && !isNaN(percent)) {
      const price = cost + (cost * percent) / 100;
      priceInput.value = price.toFixed(2);
    }
  }
});
priceInput.addEventListener("input", function () {
  if (costInput.value) {
    const cost = parseFloat(costInput.value);
    const price = parseFloat(priceInput.value);
    if (!isNaN(cost) && !isNaN(price) && cost > 0) {
      const percent = ((price - cost) / cost) * 100;
      profitPercentInput.value = percent.toFixed(2);
    }
  }
});

function syncProfitPrice() {
  // เมื่อแก้ไขต้นทุน ให้ sync ข้อมูลกำไร/ราคาขาย
  if (costInput.value) {
    if (profitPercentInput.value) {
      const cost = parseFloat(costInput.value);
      const percent = parseFloat(profitPercentInput.value);
      if (!isNaN(cost) && !isNaN(percent)) {
        const price = cost + (cost * percent) / 100;
        priceInput.value = price.toFixed(2);
      }
    } else if (priceInput.value) {
      const cost = parseFloat(costInput.value);
      const price = parseFloat(priceInput.value);
      if (!isNaN(cost) && !isNaN(price) && cost > 0) {
        const percent = ((price - cost) / cost) * 100;
        profitPercentInput.value = percent.toFixed(2);
      }
    }
  }
}

// ----------- IMAGE PREVIEW -----------
const productImagesInput = document.getElementById("productImages");
const productImagesPreview = document.getElementById("productImagesPreview");

productImagesInput.addEventListener("change", function (e) {
  const files = Array.from(e.target.files);
  if (imageFiles.length + files.length > 3) {
    showFormError("สามารถเพิ่มรูปได้สูงสุด 3 รูปเท่านั้น");
    return;
  }
  files.forEach((file) => {
    const reader = new FileReader();
    reader.onload = function (evt) {
      imageFiles.push(evt.target.result);
      renderProductImagesPreview();
    };
    reader.readAsDataURL(file);
  });
  // Reset input (allow re-upload same file)
  productImagesInput.value = "";
});
function renderProductImagesPreview() {
  productImagesPreview.innerHTML = "";
  imageFiles.forEach((src, idx) => {
    productImagesPreview.innerHTML += `
            <span class="image-preview-wrap me-1 mb-1">
                <img src="${src}" class="product-thumb">
                <span class="btn-image-remove" onclick="removeImage(${idx})">&times;</span>
            </span>`;
  });
}
window.removeImage = function (idx) {
  imageFiles.splice(idx, 1);
  renderProductImagesPreview();
};

// ---------- SUBMIT FORM ----------
productForm.onsubmit = function (e) {
  e.preventDefault();
  const name = document.getElementById("productName").value.trim();
  const category = document.getElementById("productCategory").value;
  const cost = parseFloat(costInput.value);
  const profitPercent = parseFloat(profitPercentInput.value);
  const price = parseFloat(priceInput.value);
  const status = document.getElementById("productStatus").value;
  if (!name || !category || isNaN(cost) || isNaN(price)) {
    showFormError("กรุณากรอกข้อมูลให้ครบถ้วน");
    return;
  }
  if (price < cost) {
    showFormError("ราคาขายต้องมากกว่าหรือเท่ากับราคาต้นทุน");
    return;
  }
  const productData = {
    name,
    category,
    cost,
    profitPercent,
    price,
    status,
    images: [...imageFiles],
    visible: status === "แสดง",
  };
  if (editProductId) {
    // Edit
    const idx = products.findIndex((p) => p.id === editProductId);
    if (idx > -1) {
      products[idx] = { ...products[idx], ...productData };
    }
  } else {
    // Add
    const newId = products.length
      ? Math.max(...products.map((p) => p.id)) + 1
      : 1;
    products.push({ id: newId, ...productData });
  }
  productModal.hide();
  renderProducts();
};

function showFormError(msg) {
  productFormError.textContent = msg;
  productFormError.classList.remove("d-none");
  setTimeout(() => productFormError.classList.add("d-none"), 3000);
}

// ---------- DELETE PRODUCT ----------
let deleteProductId = null;
window.deleteProduct = function (id) {
  const p = products.find((x) => x.id === id);
  if (!p) return;
  deleteProductId = id;
  document.getElementById("deleteProductName").textContent = p.name;
  new bootstrap.Modal(document.getElementById("confirmDeleteModal")).show();
};
document
  .getElementById("confirmDeleteBtn")
  .addEventListener("click", function () {
    if (deleteProductId !== null) {
      products = products.filter((p) => p.id !== deleteProductId);
      renderProducts();
      deleteProductId = null;
    }
    bootstrap.Modal.getInstance(
      document.getElementById("confirmDeleteModal")
    ).hide();
  });

// ---------- EDIT PRODUCT ----------
window.editProduct = function (id) {
  const p = products.find((x) => x.id === id);
  if (p) openProductModal(p);
};

// ---------- LOGOUT ----------
document.getElementById("logoutBtn").addEventListener("click", function () {
  localStorage.removeItem("jwt_token");
  window.location.href = "/index.html";
});

// ---------- INIT ----------
renderProducts();
