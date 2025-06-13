// Mock data ออเดอร์
let orders = [
  {
    id: 1,
    date: "2024-06-10",
    orderNo: "ORD-0001",
    buyer: "สมศรี",
    address: "99 หมู่ 1 ต.ทุ่งกล้วย อ.ภูซาง จ.พะเยา 56110",
    paymentProof: "https://img2.pic.in.th/pic/20230819-194420.jpg",
    items: [
      { product: "ผ้าพันคอคราม", qty: 2, price: 200 },
      { product: "เสื้อคราม", qty: 1, price: 390 },
    ],
    total: 790,
    status: "ชำระเงินแล้ว",
    tracking: "TH123456789TH",
  },
  {
    id: 2,
    date: "2024-06-11",
    orderNo: "ORD-0002",
    buyer: "ป้าพร",
    address: "88 ถ.ใหญ่ อ.เมือง จ.ลำปาง 52000",
    paymentProof: "",
    items: [{ product: "กระเป๋าย้อมคราม", qty: 1, price: 199 }],
    total: 199,
    status: "รอดำเนินการ",
    tracking: "",
  },
];

const orderTableBody = document.getElementById("orderTableBody");
const searchOrderInput = document.getElementById("searchOrderInput");
const statusFilter = document.getElementById("statusFilter");

let orderSearchKeyword = "";

// ----- RENDER TABLE -----
function renderOrders() {
  let keyword = orderSearchKeyword.trim().toLowerCase();
  let filtered = orders.filter(
    (o) =>
      o.orderNo.toLowerCase().includes(keyword) ||
      o.buyer.toLowerCase().includes(keyword)
  );
  if (statusFilter.value) {
    filtered = filtered.filter((o) => o.status === statusFilter.value);
  }
  orderTableBody.innerHTML = "";
  filtered.forEach((o) => {
    orderTableBody.innerHTML += `
            <tr>
                <td>${o.date}</td>
                <td>${o.orderNo}</td>
                <td>${o.buyer}</td>
                <td>${o.total.toLocaleString()}</td>
                <td>${renderOrderStatus(o.status)}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-info" onclick="viewOrderDetail(${
                      o.id
                    })"><i class="bi bi-eye"></i></button>
                </td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteOrder(${
                      o.id
                    })"><i class="bi bi-trash"></i></button>
                </td>
            </tr>
        `;
  });
}
function renderOrderStatus(status) {
  if (status === "ชำระเงินแล้ว")
    return `<span class="badge bg-success">${status}</span>`;
  if (status === "รอดำเนินการ")
    return `<span class="badge bg-warning text-dark">${status}</span>`;
  if (status === "จัดส่งแล้ว")
    return `<span class="badge bg-info">${status}</span>`;
  return `<span class="badge bg-secondary">${status}</span>`;
}

// ----- SEARCH / FILTER -----
searchOrderInput.addEventListener("input", function (e) {
  orderSearchKeyword = e.target.value;
  renderOrders();
});
statusFilter.addEventListener("change", function () {
  renderOrders();
});

// ----- VIEW ORDER DETAIL -----
let currentOrderId = null;
window.viewOrderDetail = function (id) {
  const order = orders.find((o) => o.id === id);
  if (!order) return;
  currentOrderId = id;
  let html = `
        <div class="mb-2"><b>เลขที่ออเดอร์:</b> ${order.orderNo}</div>
        <div class="mb-2"><b>วันที่:</b> ${order.date}</div>
        <div class="mb-2"><b>ผู้ซื้อ:</b> ${order.buyer}</div>
        <div class="mb-2"><b>ที่อยู่จัดส่ง:</b> <span>${
          order.address || '<span class="text-muted">-</span>'
        }</span></div>
        <div class="mb-2"><b>สถานะ:</b>
            <select class="form-select d-inline-block w-auto" id="orderStatusSelect">
                <option value="รอดำเนินการ" ${
                  order.status === "รอดำเนินการ" ? "selected" : ""
                }>รอดำเนินการ</option>
                <option value="ชำระเงินแล้ว" ${
                  order.status === "ชำระเงินแล้ว" ? "selected" : ""
                }>ชำระเงินแล้ว</option>
                <option value="จัดส่งแล้ว" ${
                  order.status === "จัดส่งแล้ว" ? "selected" : ""
                }>จัดส่งแล้ว</option>
            </select>
        </div>
        <div class="mb-2"><b>หมายเลขติดตามพัสดุ:</b>
            <input type="text" id="trackingInput" class="form-control tracking-edit mt-1" value="${
              order.tracking || ""
            }" placeholder="ใส่เลขพัสดุ (ถ้ามี)">
            <div class="form-text">* ใส่เลขพัสดุเมื่อเปลี่ยนสถานะเป็น "จัดส่งแล้ว"</div>
        </div>
        <div class="mb-2">
            <b>หลักฐานการชำระเงิน:</b>
            ${
              order.paymentProof
                ? `<br><img src="${order.paymentProof}" alt="หลักฐานโอน" style="max-width:220px;max-height:220px;border-radius:8px;box-shadow:0 0 8px #0002;">`
                : '<span class="text-muted">ไม่มีหลักฐาน</span>'
            }
        </div>
        <hr>
        <h6 class="fw-bold mb-2">รายการสินค้า</h6>
        <table class="table table-bordered table-sm mb-2">
            <thead>
                <tr>
                    <th>สินค้า</th>
                    <th>จำนวน</th>
                    <th>ราคาต่อหน่วย</th>
                    <th>รวม</th>
                </tr>
            </thead>
            <tbody>
                ${order.items
                  .map(
                    (i) => `
                    <tr>
                        <td>${i.product}</td>
                        <td>${i.qty}</td>
                        <td>${i.price.toLocaleString()}</td>
                        <td>${(i.price * i.qty).toLocaleString()}</td>
                    </tr>
                `
                  )
                  .join("")}
            </tbody>
        </table>
        <div class="text-end fw-bold fs-5">ยอดรวม: ฿${order.total.toLocaleString()}</div>
    `;
  document.getElementById("orderDetailBody").innerHTML = html;
  new bootstrap.Modal(document.getElementById("orderDetailModal")).show();
};

// ----- SAVE STATUS & TRACKING -----
document
  .getElementById("saveOrderStatusBtn")
  .addEventListener("click", function () {
    const select = document.getElementById("orderStatusSelect");
    const trackingInput = document.getElementById("trackingInput");
    if (currentOrderId && select) {
      const order = orders.find((o) => o.id === currentOrderId);
      if (order) {
        order.status = select.value;
        order.tracking = trackingInput.value.trim();
        renderOrders();
        // แจ้งเตือน (option)
        const m = document.createElement("div");
        m.className =
          "alert alert-success position-fixed top-0 start-50 translate-middle-x mt-4 shadow";
        m.style.zIndex = 1056;
        m.textContent = "อัปเดตข้อมูลสำเร็จ";
        document.body.appendChild(m);
        setTimeout(() => m.remove(), 2000);
      }
    }
    bootstrap.Modal.getInstance(
      document.getElementById("orderDetailModal")
    ).hide();
  });

// ----- PRINT ORDER -----
document.getElementById("printOrderBtn").addEventListener("click", function () {
  // ใช้ window.print() เฉพาะรายละเอียดใน modal
  const printArea = document.getElementById("orderDetailBody").innerHTML;
  const win = window.open("", "", "width=800,height=600");
  win.document.write(`
        <html>
        <head>
            <title>พิมพ์ใบคำสั่งซื้อ</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>body{font-size:1rem;padding:2rem;}</style>
        </head>
        <body class="p-3">${printArea}</body>
        </html>
    `);
  win.document.close();
  setTimeout(() => win.print(), 500);
});

// ----- DELETE ORDER -----
let deleteOrderId = null;
window.deleteOrder = function (id) {
  const o = orders.find((x) => x.id === id);
  if (!o) return;
  deleteOrderId = id;
  document.getElementById("deleteOrderNo").textContent = o.orderNo;
  new bootstrap.Modal(
    document.getElementById("confirmDeleteOrderModal")
  ).show();
};
document
  .getElementById("confirmDeleteOrderBtn")
  .addEventListener("click", function () {
    if (deleteOrderId !== null) {
      orders = orders.filter((o) => o.id !== deleteOrderId);
      renderOrders();
      deleteOrderId = null;
    }
    bootstrap.Modal.getInstance(
      document.getElementById("confirmDeleteOrderModal")
    ).hide();
  });

// ----- LOGOUT -----
document.getElementById("logoutBtn").addEventListener("click", function () {
  localStorage.removeItem("jwt_token");
  window.location.href = "login.html";
});

// ----- INIT -----
renderOrders();
