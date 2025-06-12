// ========== MOCK DATA ==========
// หมวดหมู่
let categories = [
  {
    id: 1,
    name: "ผ้าพันคอ",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200",
  },
  {
    id: 2,
    name: "เสื้อ",
    image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=200",
  },
  {
    id: 3,
    name: "กระเป๋า",
    image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?w=200",
  },
];
// สินค้า (เพื่อรวมจำนวนสินค้าแต่ละประเภท)
let products = [
  { id: 1, name: "ผ้าครามลายดอกไม้", category: "ผ้าพันคอ" },
  { id: 2, name: "ผ้าครามสีธรรมชาติ", category: "เสื้อ" },
  { id: 3, name: "กระเป๋าครามย้อมมือ", category: "กระเป๋า" },
  { id: 4, name: "ผ้าครามแฟชั่น", category: "ผ้าพันคอ" },
];

let searchCategoryKeyword = "";

// ========== SELECTOR ==========
const categoryTableBody = document.getElementById("categoryTableBody");
const categoryModal = new bootstrap.Modal(
  document.getElementById("categoryModal")
);
const categoryForm = document.getElementById("categoryForm");
const categoryImageInput = document.getElementById("categoryImage");
const categoryImagePreview = document.getElementById("categoryImagePreview");
const categoryFormError = document.getElementById("categoryFormError");
let editCategoryId = null;
let tempCategoryImage = "";

// ========== RENDER ==========
function renderCategories() {
  const keyword = searchCategoryKeyword.trim().toLowerCase();
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(keyword)
  );
  categoryTableBody.innerHTML = "";
  filteredCategories.forEach((category) => {
    // นับจำนวนสินค้าในประเภทนี้
    const productCount = products.filter(
      (p) => p.category === category.name
    ).length;
    categoryTableBody.innerHTML += `
            <tr>
                <td>
                    <img src="${
                      category.image || ""
                    }" class="img-category-thumb" alt="">
                </td>
                <td>${category.name}</td>
                <td>${productCount} รายการ</td>
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

// ========== SAVE ==========
categoryForm.onsubmit = function (e) {
  e.preventDefault();
  const id = document.getElementById("categoryId").value;
  const name = document.getElementById("categoryName").value.trim();
  if (!name || !tempCategoryImage) {
    categoryFormError.textContent = "กรุณากรอกชื่อประเภทและเลือกรูปภาพ";
    categoryFormError.classList.remove("d-none");
    return;
  }
  categoryFormError.classList.add("d-none");
  if (id) {
    // แก้ไข
    const index = categories.findIndex((c) => c.id == id);
    if (index > -1) {
      categories[index] = { id: Number(id), name, image: tempCategoryImage };
    }
  } else {
    // เพิ่ม
    const newId = categories.length
      ? Math.max(...categories.map((c) => c.id)) + 1
      : 1;
    categories.push({ id: newId, name, image: tempCategoryImage });
  }
  renderCategories();
  categoryModal.hide();
};

// ========== DELETE ==========
let deleteCategoryId = null;
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
  .addEventListener("click", function () {
    if (deleteCategoryId !== null) {
      categories = categories.filter((c) => c.id !== deleteCategoryId);
      renderCategories();
      deleteCategoryId = null;
    }
    bootstrap.Modal.getInstance(
      document.getElementById("confirmDeleteCategoryModal")
    ).hide();
  });

// ========== EDIT ==========
window.editCategory = function (id) {
  const category = categories.find((c) => c.id === id);
  if (category) {
    openCategoryModal(category);
  }
};

// ========== LOGOUT ==========
document.getElementById("logoutBtn").addEventListener("click", function () {
  localStorage.removeItem("jwt_token");
  window.location.href = "/index.html";
});

// ========== INIT ==========
renderCategories();
