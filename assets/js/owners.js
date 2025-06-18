// ========== CONFIG ==========
const API_BASE_URL = "https://phakramcraftapi-production.up.railway.app";

// ========== TOKEN GUARD ==========
if (!localStorage.getItem("jwt_token")) {
  window.location.href = "/login.html";
}

// ========== GLOBAL ==========
let searchOwnerKeyword = "";

// ========== API FUNCTIONS ==========
function getAuthHeaders() {
  const token = localStorage.getItem("jwt_token");
  return token
    ? {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }
    : { "Content-Type": "application/json" };
}

async function fetchOwners() {
  const res = await fetch(`${API_BASE_URL}/owners`, {
    headers: getAuthHeaders(),
  });
  if (res.status === 401) {
    localStorage.removeItem("jwt_token");
    window.location.href = "/login.html";
    return;
  }
  if (!res.ok) throw new Error("โหลดข้อมูลล้มเหลว");
  return await res.json();
}

async function addOwner(name) {
  const res = await fetch(`${API_BASE_URL}/owners`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ name }),
  });
  if (res.status === 401) {
    localStorage.removeItem("jwt_token");
    window.location.href = "/login.html";
    return;
  }
  if (!res.ok) {
    let msg = "เพิ่มข้อมูลล้มเหลว";
    try {
      const err = await res.json();
      msg = err.error || msg;
    } catch (e) {}
    throw new Error(msg);
  }
  return await res.json();
}

async function updateOwner(id, name) {
  const res = await fetch(`${API_BASE_URL}/owners/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ name }),
  });
  if (res.status === 401) {
    localStorage.removeItem("jwt_token");
    window.location.href = "/login.html";
    return;
  }
  if (!res.ok) {
    let msg = "อัปเดตข้อมูลล้มเหลว";
    try {
      const err = await res.json();
      msg = err.error || msg;
    } catch (e) {}
    throw new Error(msg);
  }
  return await res.json();
}

async function deleteOwnerApi(id) {
  const res = await fetch(`${API_BASE_URL}/owners/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (res.status === 401) {
    localStorage.removeItem("jwt_token");
    window.location.href = "/login.html";
    return;
  }
  if (!res.ok) {
    let msg = "ลบข้อมูลล้มเหลว";
    try {
      const err = await res.json();
      msg = err.error || msg;
    } catch (e) {}
    throw new Error(msg);
  }
  return await res.json();
}

// ========== SELECTOR ==========
const ownerTableBody = document.getElementById("ownerTableBody");
const ownerModal = new bootstrap.Modal(document.getElementById("ownerModal"));
const ownerForm = document.getElementById("ownerForm");
const ownerFormError = document.getElementById("ownerFormError");
let editOwnerId = null;

// ========== RENDER ==========
async function renderOwners() {
  try {
    const owners = await fetchOwners();
    const keyword = searchOwnerKeyword.trim().toLowerCase();
    const filteredOwners = owners.filter((owner) =>
      owner.name.toLowerCase().includes(keyword)
    );
    ownerTableBody.innerHTML = "";
    filteredOwners.forEach((owner) => {
      // ถ้ามี amount จาก API เช่น { amount: 3 }
      const productCount = owner.amount !== undefined ? owner.amount : "-";
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
            <button class="btn btn-sm btn-outline-danger" onclick="prepareDeleteOwner(${owner.id}, '${owner.name}')">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      `;
    });
  } catch (e) {
    ownerTableBody.innerHTML = `<tr><td colspan="4" class="text-danger">เกิดข้อผิดพลาด: ${e.message}</td></tr>`;
  }
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
ownerForm.onsubmit = async function (e) {
  e.preventDefault();
  const id = document.getElementById("ownerId").value;
  const name = document.getElementById("ownerName").value.trim();
  if (!name) {
    ownerFormError.textContent = "กรุณากรอกชื่อเจ้าของสินค้า";
    ownerFormError.classList.remove("d-none");
    return;
  }
  ownerFormError.classList.add("d-none");
  try {
    if (id) {
      await updateOwner(id, name);
    } else {
      await addOwner(name);
    }
    await renderOwners();
    ownerModal.hide();
  } catch (e) {
    ownerFormError.textContent = e.message;
    ownerFormError.classList.remove("d-none");
  }
};

// ========== DELETE ==========
let deleteOwnerId = null;
window.prepareDeleteOwner = function (id, name) {
  deleteOwnerId = id;
  document.getElementById("deleteOwnerName").textContent = name;
  new bootstrap.Modal(
    document.getElementById("confirmDeleteOwnerModal")
  ).show();
};
document
  .getElementById("confirmDeleteOwnerBtn")
  .addEventListener("click", async function () {
    if (deleteOwnerId !== null) {
      try {
        await deleteOwnerApi(deleteOwnerId);
        await renderOwners();
        deleteOwnerId = null;
      } catch (e) {
        alert("เกิดข้อผิดพลาดในการลบ: " + e.message);
      }
    }
    bootstrap.Modal.getInstance(
      document.getElementById("confirmDeleteOwnerModal")
    ).hide();
  });

// ========== EDIT ==========
window.editOwner = async function (id) {
  try {
    const owners = await fetchOwners();
    const owner = owners.find((o) => o.id === id);
    if (owner) {
      openOwnerModal(owner);
    }
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
renderOwners();
