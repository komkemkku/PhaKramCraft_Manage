// ========== API BASE ==========
const API_BASE = "https://phakramcraftapi-production.up.railway.app/categories"; // เปลี่ยนเป็น endpoint ที่ถูกต้อง

function getAuthHeaders() {
  const token = localStorage.getItem("jwt_token");
  return token ? { Authorization: "Bearer " + token } : {};
}

// ========== GLOBAL STATE ==========
let categories = []; // เก็บ list จาก backend
let searchCategoryKeyword = "";
let editCategoryId = null;
let tempCategoryImage = "";
let deleteCategoryId = null;

// ========== SELECTOR ==========
const categoryTableBody = document.getElementById("categoryTableBody");
const categoryModal = new bootstrap.Modal(
  document.getElementById("categoryModal")
);
const categoryForm = document.getElementById("categoryForm");
const categoryImageInput = document.getElementById("categoryImage");
const categoryImagePreview = document.getElementById("categoryImagePreview");
const categoryFormError = document.getElementById("categoryFormError");

// ========== RENDER ==========
async function renderCategories() {
  const keyword = searchCategoryKeyword.trim().toLowerCase();

  // ดึงข้อมูลจาก API
  const res = await fetch(API_BASE, { headers: getAuthHeaders() });
  if (res.status === 401) {
    // หมด session, redirect login
    window.location.href = "/index.html";
    return;
  }
  categories = await res.json();

  // Filter ด้วย keyword
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(keyword)
  );

  categoryTableBody.innerHTML = "";
  filteredCategories.forEach((category) => {
    categoryTableBody.innerHTML += `
      <tr>
        <td>
          <img src="${category.image || ""}" class="img-category-thumb" alt="">
        </td>
        <td>${category.name}</td>
        <td>${category.count ?? 0} รายการ</td>
        <td class="text-center">
          <button class="btn btn-sm btn-outline-info" onclick="editCategory(${
            category.id
          })">
            <i class="bi bi-pencil"></i>
          </button>
        </td>
        <td class="text-center">
          <button class="btn btn-sm btn-outline-danger" onclick="deleteCategory(${
            category.id
          })">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
  });
}
window.renderCategories = renderCategories;

// ========== SEARCH ==========
document
  .getElementById("searchCategoryInput")
  .addEventListener("input", function (e) {
    searchCategoryKeyword = e.target.value;
    renderCategories();
  });

// ========== ADD/EDIT ==========
document.getElementById("btnAddCategory").addEventListener("click", () => {
  openCategoryModal();
});

function openCategoryModal(category = null) {
  categoryForm.reset();
  categoryFormError.classList.add("d-none");
  categoryImagePreview.innerHTML = "";
  tempCategoryImage = "";
  if (category) {
    document.getElementById("categoryModalTitle").textContent =
      "แก้ไขประเภทสินค้า";
    document.getElementById("categoryId").value = category.id;
    document.getElementById("categoryName").value = category.name;
    if (category.image) {
      tempCategoryImage = category.image;
      renderCategoryImagePreview();
    }
    editCategoryId = category.id;
  } else {
    document.getElementById("categoryModalTitle").textContent =
      "เพิ่มประเภทสินค้า";
    document.getElementById("categoryId").value = "";
    editCategoryId = null;
  }
  categoryModal.show();
}

// ========== IMAGE UPLOAD ==========
categoryImageInput.addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (ev) {
    tempCategoryImage = ev.target.result;
    renderCategoryImagePreview();
  };
  reader.readAsDataURL(file);
  categoryFormError.classList.add("d-none");
});

function renderCategoryImagePreview() {
  categoryImagePreview.innerHTML = "";
  if (tempCategoryImage) {
    categoryImagePreview.innerHTML = `
      <div class="position-relative d-inline-block">
        <img src="${tempCategoryImage}" class="img-category-preview" alt="">
        <button type="button" class="btn btn-sm btn-danger rounded-circle position-absolute top-0 end-0 translate-middle"
          style="width: 20px; height: 20px; font-size: 10px; line-height: 10px;" 
          onclick="removeCategoryImage()">&times;</button>
      </div>
    `;
  }
}
window.removeCategoryImage = function () {
  tempCategoryImage = "";
  renderCategoryImagePreview();
  categoryImageInput.value = "";
};

// ========== SAVE (ADD/EDIT) ==========
categoryForm.onsubmit = async function (e) {
  e.preventDefault();
  const id = document.getElementById("categoryId").value;
  const name = document.getElementById("categoryName").value.trim();
  if (!name || !tempCategoryImage) {
    categoryFormError.textContent = "กรุณากรอกชื่อประเภทและเลือกรูปภาพ";
    categoryFormError.classList.remove("d-none");
    return;
  }
  categoryFormError.classList.add("d-none");

  const data = { name, image: tempCategoryImage };
  let res;
  if (id) {
    // PATCH
    res = await fetch(`${API_BASE}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
  } else {
    // POST
    res = await fetch(API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
  }
  if (res.ok) {
    await renderCategories();
    categoryModal.hide();
  } else if (res.status === 401) {
    window.location.href = "/index.html";
  } else {
    const error = await res.json();
    categoryFormError.textContent = error.error || "เกิดข้อผิดพลาด";
    categoryFormError.classList.remove("d-none");
  }
};

// ========== DELETE ==========
window.deleteCategory = function (id) {
  const category = categories.find((c) => c.id === id);
  if (!category) return;
  deleteCategoryId = id;
  document.getElementById("deleteCategoryName").textContent = category.name;
  new bootstrap.Modal(
    document.getElementById("confirmDeleteCategoryModal")
  ).show();
};
document
  .getElementById("confirmDeleteCategoryBtn")
  .addEventListener("click", async function () {
    if (deleteCategoryId !== null) {
      const res = await fetch(`${API_BASE}/${deleteCategoryId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        await renderCategories();
      } else if (res.status === 401) {
        window.location.href = "/index.html";
      }
      deleteCategoryId = null;
    }
    bootstrap.Modal.getInstance(
      document.getElementById("confirmDeleteCategoryModal")
    ).hide();
  });

// ========== EDIT ==========
window.editCategory = async function (id) {
  // GET /categories/:id เพื่อ preload ใน modal
  const res = await fetch(`${API_BASE}/${id}`, {
    headers: getAuthHeaders(),
  });
  if (res.ok) {
    const category = await res.json();
    openCategoryModal(category);
  } else if (res.status === 401) {
    window.location.href = "/index.html";
  }
};

// ========== LOGOUT ==========
document.getElementById("logoutBtn").addEventListener("click", function () {
  localStorage.removeItem("jwt_token");
  window.location.href = "/index.html";
});

// ========== INIT ==========
renderCategories();
