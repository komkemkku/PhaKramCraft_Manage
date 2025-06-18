const API_BASE_URL = "https://phakramcraftapi-production.up.railway.app";
if (!localStorage.getItem("jwt_token")) window.location.href = "/login.html";

// ========== GLOBAL ==========
let searchUserKeyword = "";

// ========== API ==========
function getAuthHeaders() {
  const token = localStorage.getItem("jwt_token");
  return token
    ? {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }
    : { "Content-Type": "application/json" };
}

// ----- เพิ่ม password สำหรับการ add -----
async function addUser({
  username,
  firstname,
  lastname,
  email,
  phone,
  role_id,
  password,
}) {
  const res = await fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      username,
      firstname,
      lastname,
      email,
      phone,
      role_id,
      password, // สำคัญ!
    }),
  });
  if (res.status === 401) {
    localStorage.removeItem("jwt_token");
    window.location.href = "/login.html";
    return;
  }
  if (!res.ok) {
    let msg = "เพิ่มข้อมูลผู้ใช้งานล้มเหลว";
    try {
      msg = (await res.json()).error || msg;
    } catch (e) {}
    throw new Error(msg);
  }
  return await res.json();
}

// ----- updateUser: ส่ง password ถ้ามีการกรอกใหม่เท่านั้น -----
async function updateUser(
  id,
  { username, firstname, lastname, email, phone, role_id, password }
) {
  const body = {
    username,
    firstname,
    lastname,
    email,
    phone,
    role_id,
  };
  // ถ้ามีการกรอกรหัสผ่านใหม่ ให้ส่ง password ด้วย
  if (password) body.password = password;

  const res = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });

  if (res.status === 401) {
    localStorage.removeItem("jwt_token");
    window.location.href = "/login.html";
    return;
  }
  if (!res.ok) {
    let msg = "อัปเดตข้อมูลผู้ใช้งานล้มเหลว";
    try {
      msg = (await res.json()).error || msg;
    } catch (e) {}
    throw new Error(msg);
  }
  return await res.json();
}

async function fetchUsers() {
  const res = await fetch(`${API_BASE_URL}/users`, {
    headers: getAuthHeaders(),
  });
  if (res.status === 401) {
    localStorage.removeItem("jwt_token");
    window.location.href = "/login.html";
    return [];
  }
  if (!res.ok) throw new Error("โหลดข้อมูลผู้ใช้งานล้มเหลว");
  return await res.json();
}

async function deleteUserApi(id) {
  const res = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (res.status === 401) {
    localStorage.removeItem("jwt_token");
    window.location.href = "/login.html";
    return;
  }
  if (!res.ok) {
    let msg = "ลบข้อมูลผู้ใช้งานล้มเหลว";
    try {
      msg = (await res.json()).error || msg;
    } catch (e) {}
    throw new Error(msg);
  }
  return await res.json();
}

// ========== ROLE MAP ==========
const ROLE_MAP = { 1: "User", 2: "Admin", 3: "Super Admin" };

// ========== SELECTOR ==========
const userTableBody = document.getElementById("userTableBody");
const userModal = new bootstrap.Modal(document.getElementById("userModal"));
const userForm = document.getElementById("userForm");
const userFormError = document.getElementById("userFormError");
let editUserId = null;

// ========== RENDER ==========
async function renderUsers() {
  try {
    const users = await fetchUsers();
    const keyword = searchUserKeyword.trim().toLowerCase();
    const filteredUsers = users.filter(
      (user) =>
        (user.username && user.username.toLowerCase().includes(keyword)) ||
        (user.email && user.email.toLowerCase().includes(keyword)) ||
        (user.firstname && user.firstname.toLowerCase().includes(keyword)) ||
        (user.lastname && user.lastname.toLowerCase().includes(keyword)) ||
        (user.phone && user.phone.includes(keyword)) ||
        (ROLE_MAP[user.role_id] &&
          ROLE_MAP[user.role_id].toLowerCase().includes(keyword))
    );
    userTableBody.innerHTML = "";
    filteredUsers.forEach((user) => {
      userTableBody.innerHTML += `
        <tr>
          <td>${user.firstname || "-"}</td>
          <td>${user.lastname || "-"}</td>
          <td>${user.username || "-"}</td>
          <td>${user.email || "-"}</td>
          <td>${user.phone || "-"}</td>
          <td>${ROLE_MAP[user.role_id] || "-"}</td>
          <td class="text-center">
            <button class="btn btn-sm btn-outline-info" onclick="editUser(${
              user.id
            })" title="แก้ไข">
              <i class="bi bi-pencil"></i>
            </button>
          </td>
          <td class="text-center">
            <button class="btn btn-sm btn-outline-danger" onclick="prepareDeleteUser(${
              user.id
            }, '${user.username}')" title="ลบ">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      `;
    });
  } catch (e) {
    userTableBody.innerHTML = `<tr><td colspan="8" class="text-danger">เกิดข้อผิดพลาด: ${e.message}</td></tr>`;
  }
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
document
  .getElementById("btnAddUser")
  .addEventListener("click", () => openUserModal());

function openUserModal(user = null) {
  userForm.reset();
  userFormError.classList.add("d-none");
  document.getElementById("userPassword").value = "";
  document.getElementById("userPassword").placeholder = user
    ? "กรอกรหัสผ่านทุกครั้งที่มีการแก้ไขหรือเพิ่มผู้ใช้งาน"
    : "";
  if (user) {
    // แก้ไข
    document.getElementById("userModalTitle").textContent = "แก้ไขผู้ใช้งาน";
    document.getElementById("userId").value = user.id;
    document.getElementById("userFirstname").value = user.firstname || "";
    document.getElementById("userLastname").value = user.lastname || "";
    document.getElementById("userName").value = user.username || "";
    document.getElementById("userEmail").value = user.email || "";
    document.getElementById("userPhone").value = user.phone || "";
    document.getElementById("userRole").value = user.role_id || 1;
    editUserId = user.id;
  } else {
    // เพิ่มใหม่
    document.getElementById("userModalTitle").textContent = "เพิ่มผู้ใช้งาน";
    document.getElementById("userId").value = "";
    document.getElementById("userRole").value = 1;
    editUserId = null;
  }
  userModal.show();
}

// ========== SAVE ==========
userForm.onsubmit = async function (e) {
  e.preventDefault();
  const id = document.getElementById("userId").value;
  const firstname = document.getElementById("userFirstname").value.trim();
  const lastname = document.getElementById("userLastname").value.trim();
  const username = document.getElementById("userName").value.trim();
  const email = document.getElementById("userEmail").value.trim();
  const phone = document.getElementById("userPhone").value.trim();
  const role_id = document.getElementById("userRole").value;
  const password = document.getElementById("userPassword").value;

  // validate
  if (
    !username ||
    !firstname ||
    !lastname ||
    !email ||
    !role_id ||
    !phone ||
    (!id && !password) // เพิ่ม: ถ้าเพิ่มใหม่ ต้องกรอกรหัสผ่าน
  ) {
    userFormError.textContent = "กรุณากรอกข้อมูลให้ครบทุกช่อง";
    userFormError.classList.remove("d-none");
    return;
  }
  if (!/^0[689]\d{8}$/.test(phone.replace(/-/g, ""))) {
    userFormError.textContent =
      "เบอร์โทรศัพท์ไม่ถูกต้อง (รูปแบบ 08x-xxx-xxxx หรือ 09xxxxxxxx)";
    userFormError.classList.remove("d-none");
    return;
  }
  if (!id && password.length < 6) {
    userFormError.textContent = "รหัสผ่านควรมีอย่างน้อย 6 ตัวอักษร";
    userFormError.classList.remove("d-none");
    return;
  }
  if (id && password && password.length < 6) {
    userFormError.textContent = "หากเปลี่ยนรหัสผ่านต้องอย่างน้อย 6 ตัวอักษร";
    userFormError.classList.remove("d-none");
    return;
  }

  userFormError.classList.add("d-none");
  try {
    if (id) {
      await updateUser(id, {
        username,
        firstname,
        lastname,
        email,
        phone,
        role_id: parseInt(role_id),
        password: password ? password : undefined,
      });
    } else {
      await addUser({
        username,
        firstname,
        lastname,
        email,
        phone,
        role_id: parseInt(role_id),
        password,
      });
    }
    await renderUsers();
    userModal.hide();
    userForm.reset();
  } catch (e) {
    userFormError.textContent = e.message;
    userFormError.classList.remove("d-none");
  }
};

// ========== DELETE ==========
let deleteUserId = null;
window.prepareDeleteUser = function (id, username) {
  deleteUserId = id;
  document.getElementById("deleteUserName").textContent = username;
  new bootstrap.Modal(document.getElementById("confirmDeleteUserModal")).show();
};
document
  .getElementById("confirmDeleteUserBtn")
  .addEventListener("click", async function () {
    if (deleteUserId !== null) {
      try {
        await deleteUserApi(deleteUserId);
        await renderUsers();
        deleteUserId = null;
      } catch (e) {
        alert("เกิดข้อผิดพลาดในการลบ: " + e.message);
      }
    }
    bootstrap.Modal.getInstance(
      document.getElementById("confirmDeleteUserModal")
    ).hide();
  });

// ========== EDIT ==========
window.editUser = async function (id) {
  try {
    const users = await fetchUsers();
    const user = users.find((u) => u.id === id);
    if (user) openUserModal(user);
  } catch (e) {
    alert("เกิดข้อผิดพลาด: " + e.message);
  }
};

// ========== LOGOUT ==========
document.getElementById("logoutBtn").addEventListener("click", function () {
  localStorage.removeItem("jwt_token");
  window.location.href = "/index.html";
});

// ========== INIT ==========
renderUsers();
