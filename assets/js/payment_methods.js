// ------- MOCK DATA ---------
let paymentMethods = [
  {
    id: 1,
    qr: "https://cdn.pixabay.com/photo/2016/04/01/11/56/qrcode-1295901_1280.png",
    account: "ร้านผ้าคราม วิสาหกิจ",
    bank: "กสิกรไทย",
    number: "123-4-56789-0",
    branch: "สาขาโลตัสพะเยา",
    active: true,
  },
  {
    id: 2,
    qr: "",
    account: "คุณสมพร ใจดี",
    bank: "กรุงไทย",
    number: "987-6-54321-1",
    branch: "สาขาเมืองพะเยา",
    active: false,
  },
];

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
                  pm.active ? "active-account" : ""
                }">
                    <div class="card-body d-flex flex-column align-items-center text-center">
                        <div class="mb-2">
                            ${
                              pm.qr
                                ? `<img src="${pm.qr}" class="qr-thumb">`
                                : `<div class="qr-thumb d-flex align-items-center justify-content-center text-muted"><i class="bi bi-image fs-3"></i></div>`
                            }
                        </div>
                        ${
                          pm.active
                            ? `<div class="account-label mb-1"><i class="bi bi-eye-fill"></i> บัญชีหลักที่ลูกค้าเห็น</div>`
                            : ""
                        }
                        <div class="bank-title mb-1"><i class="bi bi-bank2 me-1"></i> ${
                          pm.bank
                        }</div>
                        <div class="mb-1"><b>ชื่อบัญชี:</b> ${pm.account}</div>
                        <div class="mb-1"><span class="account-number">${
                          pm.number
                        }</span></div>
                        <div class="mb-1"><small class="text-muted">สาขา: ${
                          pm.branch || "-"
                        }</small></div>
                        <div class="form-check form-switch mt-2 mb-2">
                            <input class="form-check-input" type="checkbox" id="toggleActive${
                              pm.id
                            }" ${
      pm.active ? "checked" : ""
    } onchange="togglePaymentActive(${pm.id})">
                            <label class="form-check-label small" for="toggleActive${
                              pm.id
                            }">
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
    document.getElementById("paymentAccount").value = payment.account;
    document.getElementById("paymentBank").value = payment.bank;
    document.getElementById("paymentNumber").value = payment.number;
    document.getElementById("paymentBranch").value = payment.branch;
    qrFileData = payment.qr || "";
    if (qrFileData) {
      qrPreview.innerHTML = `<img src="${qrFileData}" class="qr-thumb mb-2">`;
    }
    paymentActiveInput.checked = !!payment.active;
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
paymentForm.onsubmit = function (e) {
  e.preventDefault();
  const account = document.getElementById("paymentAccount").value.trim();
  const bank = document.getElementById("paymentBank").value.trim();
  const number = document.getElementById("paymentNumber").value.trim();
  const branch = document.getElementById("paymentBranch").value.trim();
  const active = paymentActiveInput.checked;
  if (!account || !bank || !number) {
    showFormError("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
    return;
  }
  // ให้แอคทีฟได้ทีละ 1 บัญชี (ถ้าเช็ค active)
  if (active) {
    paymentMethods.forEach((pm) => (pm.active = false));
  }
  const paymentData = {
    account,
    bank,
    number,
    branch,
    qr: qrFileData,
    active,
  };
  if (editPaymentId) {
    // Edit
    const idx = paymentMethods.findIndex((pm) => pm.id === editPaymentId);
    if (idx > -1) {
      paymentMethods[idx] = { ...paymentMethods[idx], ...paymentData };
    }
  } else {
    // Add
    const newId = paymentMethods.length
      ? Math.max(...paymentMethods.map((pm) => pm.id)) + 1
      : 1;
    paymentMethods.push({ id: newId, ...paymentData });
  }
  paymentModal.hide();
  renderPaymentMethods();
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
    pm.bank + " - " + pm.account;
  new bootstrap.Modal(document.getElementById("confirmDeleteModal")).show();
};
document
  .getElementById("confirmDeleteBtn")
  .addEventListener("click", function () {
    if (deletePaymentId !== null) {
      paymentMethods = paymentMethods.filter((pm) => pm.id !== deletePaymentId);
      renderPaymentMethods();
      deletePaymentId = null;
    }
    bootstrap.Modal.getInstance(
      document.getElementById("confirmDeleteModal")
    ).hide();
  });

// ------- EDIT PAYMENT --------
window.editPayment = function (id) {
  const pm = paymentMethods.find((x) => x.id === id);
  if (pm) openPaymentModal(pm);
};

// ------- TOGGLE ACTIVE ACCOUNT --------
window.togglePaymentActive = function (id) {
  // ให้แอคทีฟได้ทีละ 1 บัญชี
  paymentMethods.forEach((pm) => (pm.active = false));
  const pm = paymentMethods.find((x) => x.id === id);
  if (pm) pm.active = true;
  renderPaymentMethods();
};

// ------- LOGOUT ---------
document.getElementById("logoutBtn").addEventListener("click", function () {
  localStorage.removeItem("jwt_token");
  window.location.href = "login.html";
});

// ------- INIT ---------
renderPaymentMethods();
