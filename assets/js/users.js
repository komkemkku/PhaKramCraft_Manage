// ========== MOCK DATA ==========
let users = [
  { id: 1, name: "admin", email: "admin@example.com", role: "Admin" },
  { id: 2, name: "staff1", email: "staff1@example.com", role: "พนักงาน" },
  { id: 3, name: "viewer", email: "viewer@example.com", role: "ผู้ชม" },
];

let searchUserKeyword = "";

// ========== SELECTOR ==========
const userTableBody = document.getElementById("userTableBody");
const userModal = new bootstrap.Modal(document.getElementById("userModal"));
const userForm = document.getElementById("userForm");
const userFormError = document.getElementById("userFormError");
let editUserId = null;

// ========== RENDER ==========
function renderUsers() {
  const keyword = searchUserKeyword.trim().toLowerCase();
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(keyword) ||
      user.email.toLowerCase().includes(keyword)
  );
  userTableBody.innerHTML = "";
  filteredUsers.forEach((user) => {
    userTableBody.innerHTML += `
            <tr>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-info" onclick="editUser(${user.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                </td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${user.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
  });
}
window.renderUsers = renderUsers;

// ========== SEARCH ==========
document
  .getElementById("searchUserInput")
  .addEventListener("input", function (e) {
    searchUserKeyword = e.target.value;
    renderUsers();
  });

// ========== ADD/EDIT ==========
document.getElementById("btnAddUser").addEventListener("click", () => {
  openUserModal();
});

function openUserModal(user = null) {
  userForm.reset();
  userFormError.classList.add("d-none");
  if (user) {
    document.getElementById("userModalTitle").textContent = "แก้ไขผู้ใช้งาน";
    document.getElementById("userId").value = user.id;
    document.getElementById("userName").value = user.name;
    document.getElementById("userEmail").value = user.email;
    document.getElementById("userRole").value = user.role;
    editUserId = user.id;
  } else {
    document.getElementById("userModalTitle").textContent = "เพิ่มผู้ใช้งาน";
    document.getElementById("userId").value = "";
    editUserId = null;
  }
  userModal.show();
}

// ========== SAVE ==========
userForm.onsubmit = function (e) {
  e.preventDefault();
  const id = document.getElementById("userId").value;
  const name = document.getElementById("userName").value.trim();
  const email = document.getElementById("userEmail").value.trim();
  const role = document.getElementById("userRole").value;
  if (!name || !email) {
    userFormError.textContent = "กรุณากรอกชื่อและอีเมล";
    userFormError.classList.remove("d-none");
    return;
  }
  userFormError.classList.add("d-none");
  if (id) {
    // แก้ไข
    const index = users.findIndex((u) => u.id == id);
    if (index > -1) {
      users[index] = { id: Number(id), name, email, role };
    }
  } else {
    // เพิ่ม
    const newId = users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1;
    users.push({ id: newId, name, email, role });
  }
  renderUsers();
  userModal.hide();
};

// ========== DELETE ==========
let deleteUserId = null;
window.deleteUser = function (id) {
  const user = users.find((u) => u.id === id);
  if (!user) return;
  deleteUserId = id;
  document.getElementById("deleteUserName").textContent = user.name;
  new bootstrap.Modal(document.getElementById("confirmDeleteUserModal")).show();
};
document
  .getElementById("confirmDeleteUserBtn")
  .addEventListener("click", function () {
    if (deleteUserId !== null) {
      users = users.filter((u) => u.id !== deleteUserId);
      renderUsers();
      deleteUserId = null;
    }
    bootstrap.Modal.getInstance(
      document.getElementById("confirmDeleteUserModal")
    ).hide();
  });

// ========== EDIT ==========
window.editUser = function (id) {
  const user = users.find((u) => u.id === id);
  if (user) {
    openUserModal(user);
  }
};

// ========== LOGOUT ==========
document.getElementById("logoutBtn").addEventListener("click", function () {
  localStorage.removeItem("jwt_token");
  window.location.href = "/index.html";
});

// ========== INIT ==========
renderUsers();
