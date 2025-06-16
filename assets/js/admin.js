let admins = [];
let searchAdminKeyword = "";

// ========== SELECTOR ==========
const adminTableBody = document.getElementById("adminTableBody");
const adminModal = new bootstrap.Modal(document.getElementById("adminModal"));
const adminForm = document.getElementById("adminForm");
const adminFormError = document.getElementById("adminFormError");
let editAdminId = null;

// ========== API HELPERS ==========
const API_BASE = "http://localhost:3000/admins";

function getToken() {
  return localStorage.getItem("jwt_token");
}

// GET all admins
async function fetchAdmins() {
  const res = await fetch(API_BASE, {
    headers: { Authorization: "Bearer " + getToken() },
  });
  if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ");
  return await res.json();
}

// CREATE admin
async function createAdmin({ name, username, password }) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + getToken(),
    },
    body: JSON.stringify({ name, username, password }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "เพิ่มผู้ดูแลระบบไม่สำเร็จ");
  }
  return await res.json();
}

// UPDATE admin
async function updateAdmin(id, { name, username, password }) {
  const data = { name, username };
  if (password) data.password = password;
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + getToken(),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const resp = await res.json();
    throw new Error(resp.error || "แก้ไขผู้ดูแลระบบไม่สำเร็จ");
  }
  return await res.json();
}

// DELETE admin
async function deleteAdminAPI(id) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
    headers: { Authorization: "Bearer " + getToken() },
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "ลบผู้ดูแลระบบไม่สำเร็จ");
  }
  return await res.json();
}

// ========== RENDER ==========
function renderAdmins() {
  const keyword = searchAdminKeyword.trim().toLowerCase();
  const filteredAdmins = admins.filter(
    (admin) =>
      (admin.name || "").toLowerCase().includes(keyword) ||
      (admin.username || "").toLowerCase().includes(keyword)
  );
  adminTableBody.innerHTML = "";
  filteredAdmins.forEach((admin) => {
    adminTableBody.innerHTML += `
      <tr>
        <td class="fw-semibold">${admin.name || ""}</td>
        <td>${admin.username || ""}</td>
        <td class="text-center">
          <button class="btn btn-sm btn-outline-info" onclick="editAdmin(${
            admin.id
          })">
            <i class="bi bi-pencil"></i>
          </button>
        </td>
        <td class="text-center">
          <button class="btn btn-sm btn-outline-danger" onclick="deleteAdmin(${
            admin.id
          })">
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
    document.getElementById("adminName").value = admin.name || "";
    document.getElementById("adminUsername").value = admin.username || "";
    document.getElementById("adminPassword").value = "";
    editAdminId = admin.id;
  } else {
    document.getElementById("adminModalTitle").textContent = "เพิ่มผู้ดูแลระบบ";
    document.getElementById("adminId").value = "";
    document.getElementById("adminName").value = "";
    document.getElementById("adminUsername").value = "";
    document.getElementById("adminPassword").value = "";
    editAdminId = null;
  }
  adminModal.show();
}

// ========== SAVE ==========
adminForm.onsubmit = async function (e) {
  e.preventDefault();
  const id = document.getElementById("adminId").value;
  const name = document.getElementById("adminName").value.trim();
  const username = document.getElementById("adminUsername").value.trim();
  const password = document.getElementById("adminPassword").value;
  if (!name || !username || (!id && !password)) {
    adminFormError.textContent = "กรุณากรอกชื่อ, username และรหัสผ่าน";
    adminFormError.classList.remove("d-none");
    return;
  }
  adminFormError.classList.add("d-none");

  try {
    if (id) {
      await updateAdmin(id, { name, username, password });
    } else {
      await createAdmin({ name, username, password });
    }
    await loadAndRenderAdmins();
    adminModal.hide();
  } catch (err) {
    adminFormError.textContent = err.message;
    adminFormError.classList.remove("d-none");
  }
};

// ========== DELETE ==========
let deleteAdminId = null;
window.deleteAdmin = function (id) {
  const admin = admins.find((a) => a.id === id);
  if (!admin) return;
  deleteAdminId = id;
  document.getElementById("deleteAdminName").textContent = admin.name || "";
  new bootstrap.Modal(
    document.getElementById("confirmDeleteAdminModal")
  ).show();
};
document
  .getElementById("confirmDeleteAdminBtn")
  .addEventListener("click", async function () {
    if (deleteAdminId !== null) {
      try {
        await deleteAdminAPI(deleteAdminId);
        await loadAndRenderAdmins();
        deleteAdminId = null;
      } catch (err) {
        alert(err.message);
      }
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

// ========== LOAD DATA INIT ==========
async function loadAndRenderAdmins() {
  try {
    admins = await fetchAdmins();
    renderAdmins();
  } catch (err) {
    adminTableBody.innerHTML = `<tr><td colspan="4" class="text-danger text-center">${err.message}</td></tr>`;
  }
}
loadAndRenderAdmins();
