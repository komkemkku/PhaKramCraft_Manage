const API_BASE = "https://phakramcraftapi-production.up.railway.app/paymentsystems";

let paymentMethods = [];

const paymentMethodsContainer = document.getElementById(
  "paymentMethodsContainer"
);
const btnAddPayment = document.getElementById("btnAddPayment");
const paymentModal = new bootstrap.Modal(
  document.getElementById("paymentModal")
);
const paymentForm = document.getElementById("paymentForm");
const paymentFormError = document.getElementById("formError");
const qrInput = document.getElementById("paymentQR");
const qrPreview = document.getElementById("qrPreview");
const paymentActiveInput = document.getElementById("paymentActive");

let editPaymentId = null;
let qrFileData = "";

// ------- RENDER FUNCTION ---------
async function fetchPaymentMethods() {
  const res = await fetch(API_BASE, { headers: getAuthHeaders() });
  paymentMethods = await res.json();
  renderPaymentMethods();
}
function renderPaymentMethods() {
  paymentMethodsContainer.innerHTML = "";
  if (paymentMethods.length === 0) {
    paymentMethodsContainer.innerHTML = `<div class="col-12 text-center text-muted py-5">ยังไม่มีช่องทางการชำระเงิน</div>`;
    return;
  }
  paymentMethods.forEach((pm) => {
    paymentMethodsContainer.innerHTML += `
      <div class="col-md-6 col-lg-4 mb-4">
        <div class="card payment-card h-100 shadow-sm ${
          pm.is_active ? "active-account" : ""
        }">
          <div class="card-body d-flex flex-column align-items-center text-center">
            <div class="mb-2">
              ${
                pm.qrCode
                  ? `<img src="${pm.qrCode}" class="qr-thumb">`
                  : `<div class="qr-thumb d-flex align-items-center justify-content-center text-muted"><i class="bi bi-image fs-3"></i></div>`
              }
            </div>
            ${
              pm.is_active
                ? `<div class="account-label mb-1"><i class="bi bi-eye-fill"></i> บัญชีหลักที่ลูกค้าเห็น</div>`
                : ""
            }
            <div class="bank-title mb-1"><i class="bi bi-bank2 me-1"></i> ${
              pm.name_bank
            }</div>
            <div class="mb-1"><b>ชื่อบัญชี:</b> ${pm.name_account}</div>
            <div class="mb-1"><span class="account-number">${
              pm.number_account
            }</span></div>
            <div class="mb-1"><small class="text-muted">สาขา: ${
              pm.name_branch || "-"
            }</small></div>
            <div class="form-check form-switch mt-2 mb-2">
              <input class="form-check-input" type="checkbox" id="toggleActive${
                pm.id
              }"
                ${pm.is_active ? "checked" : ""}
                onchange="togglePaymentActive(${pm.id}, this.checked)">
              <label class="form-check-label small" for="toggleActive${pm.id}">
                แสดงบัญชีนี้ให้ลูกค้า
              </label>
            </div>
            <div class="d-flex gap-2 mt-2">
              <button class="btn btn-sm btn-outline-info" onclick="editPayment(${
                pm.id
              })"><i class="bi bi-pencil"></i> แก้ไข</button>
              <button class="btn btn-sm btn-outline-danger" onclick="deletePayment(${
                pm.id
              })"><i class="bi bi-trash"></i> ลบ</button>
            </div>
          </div>
        </div>
      </div>
    `;
  });
}
window.renderPaymentMethods = renderPaymentMethods;

// ------- ADD / EDIT PAYMENT ---------
btnAddPayment.addEventListener("click", () => openPaymentModal());
function openPaymentModal(payment = null) {
  paymentForm.reset();
  paymentFormError.classList.add("d-none");
  qrFileData = "";
  qrPreview.innerHTML = "";
  paymentActiveInput.checked = false;
  if (payment) {
    document.getElementById("paymentModalTitle").textContent = "แก้ไขช่องทาง";
    document.getElementById("paymentId").value = payment.id;
    document.getElementById("paymentAccount").value = payment.name_account;
    document.getElementById("paymentBank").value = payment.name_bank;
    document.getElementById("paymentNumber").value = payment.number_account;
    document.getElementById("paymentBranch").value = payment.name_branch;
    qrFileData = payment.qrCode || "";
    if (qrFileData) {
      qrPreview.innerHTML = `<img src="${qrFileData}" class="qr-thumb mb-2">`;
    }
    paymentActiveInput.checked = !!payment.is_active;
    editPaymentId = payment.id;
  } else {
    document.getElementById("paymentModalTitle").textContent = "เพิ่มช่องทาง";
    document.getElementById("paymentId").value = "";
    editPaymentId = null;
  }
  paymentModal.show();
}

// ------- QR PREVIEW -------
qrInput.addEventListener("change", function (e) {
  if (!e.target.files.length) return;
  const file = e.target.files[0];
  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = function (evt) {
      qrFileData = evt.target.result;
      qrPreview.innerHTML = `<img src="${qrFileData}" class="qr-thumb mb-2">`;
    };
    reader.readAsDataURL(file);
  }
});

// ------- SUBMIT FORM -------
paymentForm.onsubmit = async function (e) {
  e.preventDefault();
  const name_account = document.getElementById("paymentAccount").value.trim();
  const name_bank = document.getElementById("paymentBank").value.trim();
  const number_account = document.getElementById("paymentNumber").value.trim();
  const name_branch = document.getElementById("paymentBranch").value.trim();
  const is_active = paymentActiveInput.checked;
  if (!name_account || !name_bank || !number_account) {
    showFormError("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
    return;
  }

  // ส่ง is_active ออกไปให้ backend
  const paymentData = {
    name_account,
    name_bank,
    number_account,
    name_branch,
    qrCode: qrFileData,
    is_active,
  };

  const id = document.getElementById("paymentId").value;
  let res;
  if (id) {
    // Edit
    res = await fetch(`${API_BASE}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(paymentData),
    });
  } else {
    // Add
    res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(paymentData),
    });
  }
  if (res.ok) {
    await fetchPaymentMethods();
    paymentModal.hide();
  } else {
    const error = await res.json();
    showFormError(error.error || "เกิดข้อผิดพลาด");
  }
};

function showFormError(msg) {
  paymentFormError.textContent = msg;
  paymentFormError.classList.remove("d-none");
  setTimeout(() => paymentFormError.classList.add("d-none"), 3000);
}

// ------- DELETE PAYMENT --------
let deletePaymentId = null;
window.deletePayment = function (id) {
  const pm = paymentMethods.find((x) => x.id === id);
  if (!pm) return;
  deletePaymentId = id;
  document.getElementById("deletePaymentName").textContent =
    pm.name_bank + " - " + pm.name_account;
  new bootstrap.Modal(document.getElementById("confirmDeleteModal")).show();
};
document
  .getElementById("confirmDeleteBtn")
  .addEventListener("click", async function () {
    if (deletePaymentId !== null) {
      await fetch(`${API_BASE}/${deletePaymentId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      await fetchPaymentMethods();
      deletePaymentId = null;
    }
    bootstrap.Modal.getInstance(
      document.getElementById("confirmDeleteModal")
    ).hide();
  });

// ------- EDIT PAYMENT --------
window.editPayment = async function (id) {
  const pm = paymentMethods.find((x) => x.id === id);
  if (pm) openPaymentModal(pm);
};

// ------- TOGGLE ACTIVE ACCOUNT --------
window.togglePaymentActive = async function (id, checked) {
  // ส่ง PATCH ไปหา API (active ได้ทีละ 1 อัน)
  await fetch(`${API_BASE}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ is_active: checked }),
  });
  await fetchPaymentMethods();
};

// ------- LOGOUT ---------
document.getElementById("logoutBtn").addEventListener("click", function () {
  localStorage.removeItem("jwt_token");
  window.location.href = "login.html";
});

// ------- INIT ---------
fetchPaymentMethods();

function getAuthHeaders() {
  const token = localStorage.getItem("jwt_token");
  return token ? { Authorization: "Bearer " + token } : {};
}
