// ========== MOCK DATA ==========
let admins = [
  { id: 1, name: "SuperAdmin", email: "admin@paakram.com" },
  { id: 2, name: "เจ้าหน้าที่ระบบ", email: "system@paakram.com" },
];

let searchAdminKeyword = "";

// ========== SELECTOR ==========
const adminTableBody = document.getElementById("adminTableBody");
const adminModal = new bootstrap.Modal(document.getElementById("adminModal"));
const adminForm = document.getElementById("adminForm");
const adminFormError = document.getElementById("adminFormError");
let editAdminId = null;

// ========== RENDER ==========
function renderAdmins() {
  const keyword = searchAdminKeyword.trim().toLowerCase();
  const filteredAdmins = admins.filter(
    (admin) =>
      admin.name.toLowerCase().includes(keyword) ||
      admin.email.toLowerCase().includes(keyword)
  );
  adminTableBody.innerHTML = "";
  filteredAdmins.forEach((admin) => {
    adminTableBody.innerHTML += `
            <tr>
                <td>${admin.name}</td>
                <td>${admin.email}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-info" onclick="editAdmin(${admin.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                </td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteAdmin(${admin.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
  });
}
window.renderAdmins = renderAdmins;

// ========== SEARCH ==========
document
  .getElementById("searchAdminInput")
  .addEventListener("input", function (e) {
    searchAdminKeyword = e.target.value;
    renderAdmins();
  });

// ========== ADD/EDIT ==========
document.getElementById("btnAddAdmin").addEventListener("click", () => {
  openAdminModal();
});

function openAdminModal(admin = null) {
  adminForm.reset();
  adminFormError.classList.add("d-none");
  if (admin) {
    document.getElementById("adminModalTitle").textContent = "แก้ไขผู้ดูแลระบบ";
    document.getElementById("adminId").value = admin.id;
    document.getElementById("adminName").value = admin.name;
    document.getElementById("adminEmail").value = admin.email;
    editAdminId = admin.id;
  } else {
    document.getElementById("adminModalTitle").textContent = "เพิ่มผู้ดูแลระบบ";
    document.getElementById("adminId").value = "";
    editAdminId = null;
  }
  adminModal.show();
}

// ========== SAVE ==========
adminForm.onsubmit = function (e) {
  e.preventDefault();
  const id = document.getElementById("adminId").value;
  const name = document.getElementById("adminName").value.trim();
  const email = document.getElementById("adminEmail").value.trim();
  if (!name || !email) {
    adminFormError.textContent = "กรุณากรอกชื่อและอีเมล";
    adminFormError.classList.remove("d-none");
    return;
  }
  adminFormError.classList.add("d-none");
  if (id) {
    // แก้ไข
    const index = admins.findIndex((a) => a.id == id);
    if (index > -1) {
      admins[index] = { id: Number(id), name, email };
    }
  } else {
    // เพิ่ม
    const newId = admins.length ? Math.max(...admins.map((a) => a.id)) + 1 : 1;
    admins.push({ id: newId, name, email });
  }
  renderAdmins();
  adminModal.hide();
};

// ========== DELETE ==========
let deleteAdminId = null;
window.deleteAdmin = function (id) {
  const admin = admins.find((a) => a.id === id);
  if (!admin) return;
  deleteAdminId = id;
  document.getElementById("deleteAdminName").textContent = admin.name;
  new bootstrap.Modal(
    document.getElementById("confirmDeleteAdminModal")
  ).show();
};
document
  .getElementById("confirmDeleteAdminBtn")
  .addEventListener("click", function () {
    if (deleteAdminId !== null) {
      admins = admins.filter((a) => a.id !== deleteAdminId);
      renderAdmins();
      deleteAdminId = null;
    }
    bootstrap.Modal.getInstance(
      document.getElementById("confirmDeleteAdminModal")
    ).hide();
  });

// ========== EDIT ==========
window.editAdmin = function (id) {
  const admin = admins.find((a) => a.id === id);
  if (admin) {
    openAdminModal(admin);
  }
};

// ========== LOGOUT ==========
document.getElementById("logoutBtn").addEventListener("click", function () {
  localStorage.removeItem("jwt_token");
  window.location.href = "/index.html";
});

// ========== INIT ==========
renderAdmins();
