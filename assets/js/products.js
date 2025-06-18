const API_BASE = "https://phakramcraftapi-production.up.railway.app/products";
const CATEGORY_API =
  "https://phakramcraftapi-production.up.railway.app/categories";

function getAuthHeaders() {
  const token = localStorage.getItem("jwt_token");
  return token ? { Authorization: "Bearer " + token } : {};
}

let products = [];
let categories = [];
let searchProductKeyword = "";
let editProductId = null;
let tempProductImages = [];
let tempProductImg = "";
let deleteProductId = null;

// SELECTOR
const productTableBody = document.getElementById("productTableBody");
const productModal = new bootstrap.Modal(
  document.getElementById("productModal")
);
const productForm = document.getElementById("productForm");
const productImagesInput = document.getElementById("productImages");
const productImagesPreview = document.getElementById("productImagesPreview");
const formError = document.getElementById("formError");
const productCategorySelect = document.getElementById("productCategory");

// ======= AUTO CALCULATE PRICE / PROFIT PERCENT =======
const productCostInput = document.getElementById("productCost");
const productProfitPercentInput = document.getElementById(
  "productProfitPercent"
);
const productPriceInput = document.getElementById("productPrice");

let autoByPercent = false;
let autoByPrice = false;

productPriceInput.addEventListener("input", function () {
  if (autoByPercent) return;
  const cost = parseFloat(productCostInput.value) || 0;
  const price = parseFloat(productPriceInput.value) || 0;
  if (cost > 0 && price > 0) {
    autoByPrice = true;
    productProfitPercentInput.value = (((price - cost) / cost) * 100).toFixed(
      2
    );
    autoByPrice = false;
  } else if (!autoByPrice) {
    productProfitPercentInput.value = "";
  }
});

productProfitPercentInput.addEventListener("input", function () {
  if (autoByPrice) return;
  const cost = parseFloat(productCostInput.value) || 0;
  const percent = parseFloat(productProfitPercentInput.value);
  if (cost > 0 && !isNaN(percent)) {
    autoByPercent = true;
    productPriceInput.value = (cost * (1 + percent / 100)).toFixed(2);
    autoByPercent = false;
  } else if (!autoByPercent) {
    productPriceInput.value = "";
  }
});

productCostInput.addEventListener("input", function () {
  if (productProfitPercentInput.value) {
    productProfitPercentInput.dispatchEvent(new Event("input"));
  } else if (productPriceInput.value) {
    productPriceInput.dispatchEvent(new Event("input"));
  }
});

// ======= RENDER PRODUCTS =======
async function renderProducts() {
  const keyword = searchProductKeyword.trim().toLowerCase();
  const res = await fetch(API_BASE, { headers: getAuthHeaders() });
  if (res.status === 401) {
    window.location.href = "/index.html";
    return;
  }
  products = await res.json();

  // filter ชื่อสินค้า
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(keyword)
  );

  productTableBody.innerHTML = "";
  filteredProducts.forEach((product) => {
    // กำไร %
    let profitPercent = "-";
    if (product.cost && product.price) {
      profitPercent = (
        ((product.price - product.cost) / product.cost) *
        100
      ).toFixed(2);
    }

    let firstImage = product.img
      ? product.img
      : product.images?.length
      ? product.images[0]
      : "";

    const isActive = !!product.is_active;
    productTableBody.innerHTML += `
      <tr>
        <td>
          ${
            firstImage
              ? `<img src="${firstImage}" style="width:64px;height:64px;object-fit:cover">`
              : `<span class="text-secondary">-</span>`
          }
        </td>
        <td>${product.name}</td>
        <td>${getCategoryName(product.category_id)}</td>
        <td>${product.cost ?? "-"}</td>
        <td>${product.price ?? "-"}</td>
        <td>${profitPercent}</td>
        <td>${product.stock ?? "-"}</td>
        <td>${
          product.description ? product.description.substring(0, 40) : "-"
        }</td>
        <td>
          <span class="${isActive ? "text-success" : "text-secondary"} fw-bold">
            ${isActive ? "แสดง" : "ซ่อน"}
          </span>
        </td>
        <td class="text-center">
          <div class="form-check form-switch d-flex justify-content-center">
            <input class="form-check-input" type="checkbox"
              id="switchStatus${product.id}"
              ${isActive ? "checked" : ""}
              onchange="toggleProductStatus(${product.id}, this.checked)">
          </div>
        </td>
        <td class="text-center">
          <button class="btn btn-sm btn-outline-info" onclick="editProduct(${
            product.id
          })">
            <i class="bi bi-pencil"></i>
          </button>
        </td>
        <td class="text-center">
          <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct(${
            product.id
          })">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
  });
}
window.renderProducts = renderProducts;

function getCategoryName(categoryId) {
  const cat = categories.find((c) => c.id === categoryId);
  return cat ? cat.name : "-";
}

// ======= RENDER CATEGORIES (DROPDOWN) =======
async function renderCategoriesDropdown() {
  const res = await fetch(CATEGORY_API, { headers: getAuthHeaders() });
  if (res.status === 401) {
    window.location.href = "/index.html";
    return;
  }
  categories = await res.json();

  productCategorySelect.innerHTML = `<option value="">เลือกประเภทสินค้า</option>`;
  categories.forEach((cat) => {
    productCategorySelect.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
  });
}

// ======= SEARCH =======
document
  .getElementById("searchProductInput")
  .addEventListener("input", function (e) {
    searchProductKeyword = e.target.value;
    renderProducts();
  });

// ======= ADD =======
document.getElementById("btnAddProduct").addEventListener("click", () => {
  openProductModal();
});

function openProductModal(product = null) {
  productForm.reset();
  formError.classList.add("d-none");
  productImagesPreview.innerHTML = "";
  tempProductImages = [];
  tempProductImg = "";
  renderCategoriesDropdown();

  setTimeout(() => {
    productCostInput.value = "";
    productProfitPercentInput.value = "";
    productPriceInput.value = "";
  }, 0);

  if (product) {
    document.getElementById("productModalTitle").textContent = "แก้ไขสินค้า";
    document.getElementById("productId").value = product.id;
    document.getElementById("productName").value = product.name;
    document.getElementById("productCategory").value = product.category_id;
    document.getElementById("productCost").value = product.cost || "";
    document.getElementById("productProfitPercent").value =
      product.cost && product.price
        ? (((product.price - product.cost) / product.cost) * 100).toFixed(2)
        : product.profit_percent || "";
    document.getElementById("productPrice").value = product.price || "";
    document.getElementById("productStock").value = product.stock ?? "";
    document.getElementById("productDescription").value =
      product.description || "";
    document.getElementById("productStatus").value = product.is_active
      ? "แสดง"
      : "ซ่อน";
    tempProductImg = product.img || "";
    tempProductImages = product.images ? [...product.images] : [];
    renderProductImagesPreview();
    document.getElementById("productImageUrl").value = tempProductImg;
    editProductId = product.id;
  } else {
    document.getElementById("productModalTitle").textContent = "เพิ่มสินค้า";
    document.getElementById("productId").value = "";
    editProductId = null;
    document.getElementById("productStock").value = "";
    document.getElementById("productDescription").value = "";
  }
  productModal.show();
}

// ======= IMAGE UPLOAD =======
productImagesInput.addEventListener("change", function (e) {
  const files = Array.from(e.target.files);
  if (files.length + tempProductImages.length > 3) {
    formError.textContent = "เลือกรูปสูงสุด 3 รูป";
    formError.classList.remove("d-none");
    return;
  }
  files.forEach((file) => {
    const reader = new FileReader();
    reader.onload = function (ev) {
      tempProductImages.push(ev.target.result);
      renderProductImagesPreview();
    };
    reader.readAsDataURL(file);
  });
  formError.classList.add("d-none");
});

// ======= IMAGE URL ADD =======
document
  .getElementById("btnAddImageUrl")
  .addEventListener("click", function () {
    const urlInput = document.getElementById("productImageUrl");
    const url = urlInput.value.trim();
    if (!url) return;
    if (!/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(url)) {
      formError.textContent =
        "กรุณากรอก URL รูปภาพที่ถูกต้อง (.jpg, .png, .gif, .webp)";
      formError.classList.remove("d-none");
      return;
    }
    tempProductImg = url;
    renderProductImagesPreview();
    formError.classList.add("d-none");
  });

function renderProductImagesPreview() {
  productImagesPreview.innerHTML = "";
  if (tempProductImg) {
    productImagesPreview.innerHTML += `
      <div class="position-relative d-inline-block me-2 mb-2">
        <img src="${tempProductImg}" style="width: 72px; height: 72px; object-fit:cover; border:1px solid #ccc;">
        <button type="button" class="btn btn-sm btn-danger rounded-circle position-absolute top-0 end-0 translate-middle"
          style="width: 20px; height: 20px; font-size: 10px; line-height: 10px;"
          onclick="removeProductImg()">&times;</button>
      </div>
    `;
  }
  tempProductImages.forEach((img, idx) => {
    productImagesPreview.innerHTML += `
      <div class="position-relative d-inline-block me-2 mb-2">
        <img src="${img}" style="width: 72px; height: 72px; object-fit:cover; border:1px solid #ccc;">
        <button type="button" class="btn btn-sm btn-danger rounded-circle position-absolute top-0 end-0 translate-middle"
          style="width: 20px; height: 20px; font-size: 10px; line-height: 10px;"
          onclick="removeProductImage(${idx})">&times;</button>
      </div>
    `;
  });
}
window.removeProductImg = function () {
  tempProductImg = "";
  document.getElementById("productImageUrl").value = "";
  renderProductImagesPreview();
};
window.removeProductImage = function (idx) {
  tempProductImages.splice(idx, 1);
  renderProductImagesPreview();
};

// ======= SAVE (ADD/EDIT) =======
productForm.onsubmit = async function (e) {
  e.preventDefault();
  const id = document.getElementById("productId").value;
  const name = document.getElementById("productName").value.trim();
  const category_id = document.getElementById("productCategory").value;
  const cost = parseFloat(document.getElementById("productCost").value) || 0;
  const profit_percent =
    parseFloat(document.getElementById("productProfitPercent").value) || null;
  const price =
    parseFloat(document.getElementById("productPrice").value) || null;
  const stock = parseInt(document.getElementById("productStock").value) || 0;
  const description = document.getElementById("productDescription").value || "";
  const is_active = document.getElementById("productStatus").value === "แสดง";
  if (
    !name ||
    !category_id ||
    (!tempProductImg && tempProductImages.length === 0)
  ) {
    formError.textContent = "กรุณากรอกข้อมูลที่จำเป็นและเลือกรูปภาพ";
    formError.classList.remove("d-none");
    return;
  }
  formError.classList.add("d-none");

  let productData = {
    name,
    category_id,
    cost,
    profit_percent,
    price,
    stock,
    description,
    is_active,
  };
  if (tempProductImg) productData.img = tempProductImg;
  if (tempProductImages.length) productData.images = tempProductImages;

  let res;
  if (id) {
    res = await fetch(`${API_BASE}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(productData),
    });
  } else {
    res = await fetch(API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(productData),
    });
  }
  if (res.ok) {
    await renderProducts();
    productModal.hide();
  } else if (res.status === 401) {
    window.location.href = "/index.html";
  } else {
    const error = await res.json();
    formError.textContent = error.error || "เกิดข้อผิดพลาด";
    formError.classList.remove("d-none");
  }
};

// ======= DELETE =======
window.deleteProduct = function (id) {
  const product = products.find((p) => p.id === id);
  if (!product) return;
  deleteProductId = id;
  document.getElementById("deleteProductName").textContent = product.name;
  new bootstrap.Modal(document.getElementById("confirmDeleteModal")).show();
};
document
  .getElementById("confirmDeleteBtn")
  .addEventListener("click", async function () {
    if (deleteProductId !== null) {
      const res = await fetch(`${API_BASE}/${deleteProductId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        await renderProducts();
      } else if (res.status === 401) {
        window.location.href = "/index.html";
      }
      deleteProductId = null;
    }
    bootstrap.Modal.getInstance(
      document.getElementById("confirmDeleteModal")
    ).hide();
  });

// ======= EDIT =======
window.editProduct = async function (id) {
  const res = await fetch(`${API_BASE}/${id}`, {
    headers: getAuthHeaders(),
  });
  if (res.ok) {
    const product = await res.json();
    openProductModal(product);
  } else if (res.status === 401) {
    window.location.href = "/index.html";
  }
};

// ======= STATUS TOGGLE =======
window.toggleProductStatus = async function (id, checked) {
  await fetch(`${API_BASE}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ is_active: checked }),
  });
  await renderProducts();
};

// ======= LOGOUT =======
document.getElementById("logoutBtn").addEventListener("click", function () {
  localStorage.removeItem("jwt_token");
  window.location.href = "/index.html";
});

// ======= INIT =======
(async function () {
  await renderCategoriesDropdown();
  await renderProducts();
})();
