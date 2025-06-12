// ========== MOCK DATA ==========
let owners = [
  { id: 1, name: "คุณสมศรี" },
  { id: 2, name: "ป้าพร" },
  { id: 3, name: "กลุ่มแม่บ้านผ้าคราม" },
];
// สินค้า (เชื่อมโยงเจ้าของ)
let products = [
  { id: 1, name: "ผ้าครามลายดอกไม้", owner: "คุณสมศรี" },
  { id: 2, name: "ผ้าครามสีธรรมชาติ", owner: "ป้าพร" },
  { id: 3, name: "ผ้าครามย้อมมือ", owner: "กลุ่มแม่บ้านผ้าคราม" },
  { id: 4, name: "ผ้าครามแฟชั่น", owner: "ป้าพร" },
];

let searchOwnerKeyword = "";

// ========== SELECTOR ==========
const ownerTableBody = document.getElementById("ownerTableBody");
const ownerModal = new bootstrap.Modal(document.getElementById("ownerModal"));
const ownerForm = document.getElementById("ownerForm");
const ownerFormError = document.getElementById("ownerFormError");
let editOwnerId = null;

// ========== RENDER ==========
function renderOwners() {
  const keyword = searchOwnerKeyword.trim().toLowerCase();
  const filteredOwners = owners.filter((owner) =>
    owner.name.toLowerCase().includes(keyword)
  );
  ownerTableBody.innerHTML = "";
  filteredOwners.forEach((owner) => {
    // นับจำนวนสินค้าเจ้าของนี้
    const productCount = products.filter((p) => p.owner === owner.name).length;
    ownerTableBody.innerHTML += `
            <tr>
                <td>${owner.name}</td>
                <td>${productCount} รายการ</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-info" onclick="editOwner(${owner.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                </td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteOwner(${owner.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
  });
}
window.renderOwners = renderOwners;

// ========== SEARCH ==========
document
  .getElementById("searchOwnerInput")
  .addEventListener("input", function (e) {
    searchOwnerKeyword = e.target.value;
    renderOwners();
  });

// ========== ADD/EDIT ==========
document.getElementById("btnAddOwner").addEventListener("click", () => {
  openOwnerModal();
});

function openOwnerModal(owner = null) {
  ownerForm.reset();
  ownerFormError.classList.add("d-none");
  if (owner) {
    document.getElementById("ownerModalTitle").textContent =
      "แก้ไขเจ้าของสินค้า";
    document.getElementById("ownerId").value = owner.id;
    document.getElementById("ownerName").value = owner.name;
    editOwnerId = owner.id;
  } else {
    document.getElementById("ownerModalTitle").textContent =
      "เพิ่มเจ้าของสินค้า";
    document.getElementById("ownerId").value = "";
    editOwnerId = null;
  }
  ownerModal.show();
}

// ========== SAVE ==========
ownerForm.onsubmit = function (e) {
  e.preventDefault();
  const id = document.getElementById("ownerId").value;
  const name = document.getElementById("ownerName").value.trim();
  if (!name) {
    ownerFormError.textContent = "กรุณากรอกชื่อเจ้าของสินค้า";
    ownerFormError.classList.remove("d-none");
    return;
  }
  ownerFormError.classList.add("d-none");
  if (id) {
    // แก้ไข
    const index = owners.findIndex((o) => o.id == id);
    if (index > -1) {
      // ถ้าเปลี่ยนชื่อ ต้องแก้ใน products ด้วย
      const oldName = owners[index].name;
      owners[index].name = name;
      products.forEach((p) => {
        if (p.owner === oldName) p.owner = name;
      });
    }
  } else {
    // เพิ่ม
    const newId = owners.length ? Math.max(...owners.map((o) => o.id)) + 1 : 1;
    owners.push({ id: newId, name });
  }
  renderOwners();
  ownerModal.hide();
};

// ========== DELETE ==========
let deleteOwnerId = null;
window.deleteOwner = function (id) {
  const owner = owners.find((o) => o.id === id);
  if (!owner) return;
  deleteOwnerId = id;
  document.getElementById("deleteOwnerName").textContent = owner.name;
  new bootstrap.Modal(
    document.getElementById("confirmDeleteOwnerModal")
  ).show();
};
document
  .getElementById("confirmDeleteOwnerBtn")
  .addEventListener("click", function () {
    if (deleteOwnerId !== null) {
      const deletedOwner = owners.find((o) => o.id === deleteOwnerId);
      // ลบสินค้าเจ้าของนี้ด้วย (ถ้าต้องการ)
      // products = products.filter(p => p.owner !== deletedOwner.name);
      owners = owners.filter((o) => o.id !== deleteOwnerId);
      renderOwners();
      deleteOwnerId = null;
    }
    bootstrap.Modal.getInstance(
      document.getElementById("confirmDeleteOwnerModal")
    ).hide();
  });

// ========== EDIT ==========
window.editOwner = function (id) {
  const owner = owners.find((o) => o.id === id);
  if (owner) {
    openOwnerModal(owner);
  }
};

// ========== LOGOUT ==========
document.getElementById("logoutBtn").addEventListener("click", function () {
  localStorage.removeItem("jwt_token");
  window.location.href = "/index.html";
});

// ========== INIT ==========
renderOwners();
