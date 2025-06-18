let orders = [];
let orderSearchKeyword = "";
let orderPage = 1;
let orderPageSize = 10;
let orderTotal = 0;

const orderTableBody = document.getElementById("orderTableBody");
const searchOrderInput = document.getElementById("searchOrderInput");
const statusFilter = document.getElementById("statusFilter");
const paginationContainer = document.getElementById("paginationContainer");

// แปลงสถานะ eng -> ไทย
function mapStatusToThai(status) {
  return (
    {
      pending: "รอชำระเงิน",
      paid: "ชำระเงินแล้ว",
      shipping: "รอจัดส่ง",
      delivered: "จัดส่งแล้ว",
      cancelled: "ยกเลิก",
    }[status] || status
  );
}

// ดึงข้อมูลคำสั่งซื้อ (พร้อมค้นหา กรองสถานะ และหน้า)
async function fetchOrders() {
  let url = `https://phakramcraftapi-production.up.railway.app/adminorders?q=${encodeURIComponent(
    orderSearchKeyword
  )}&status=${encodeURIComponent(
    statusFilter.value
  )}&page=${orderPage}&pageSize=${orderPageSize}`;
  const res = await fetch(url);
  const json = await res.json();
  orders = json.data;
  orderTotal = json.total;
  renderOrders();
  renderPagination();
}

function renderOrders() {
  orderTableBody.innerHTML = "";
  orders.forEach((o) => {
    orderTableBody.innerHTML += `
      <tr>
        <td>${o.created_at ? o.created_at.split("T")[0] : "-"}</td>
        <td>${o.id}</td>
        <td>${o.receiver_name || "-"}</td>
        <td>${(o.total_price || 0).toLocaleString()}</td>
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
  const statusText = mapStatusToThai(status);
  if (status === "paid")
    return `<span class="badge bg-success">${statusText}</span>`;
  if (status === "pending")
    return `<span class="badge bg-warning text-dark">${statusText}</span>`;
  if (status === "shipping")
    return `<span class="badge bg-info">${statusText}</span>`;
  if (status === "delivered")
    return `<span class="badge bg-primary">${statusText}</span>`;
  if (status === "cancelled")
    return `<span class="badge bg-danger">${statusText}</span>`;
  return `<span class="badge bg-secondary">${statusText}</span>`;
}

// Pagination
function renderPagination() {
  let totalPage = Math.ceil(orderTotal / orderPageSize);
  if (totalPage <= 1) return (paginationContainer.innerHTML = "");
  let html = `<nav><ul class="pagination justify-content-center mb-0">`;
  for (let i = 1; i <= totalPage; i++) {
    html += `<li class="page-item${i === orderPage ? " active" : ""}">
      <button class="page-link" onclick="gotoOrderPage(${i})">${i}</button>
    </li>`;
  }
  html += `</ul></nav>`;
  paginationContainer.innerHTML = html;
}
window.gotoOrderPage = function (page) {
  orderPage = page;
  fetchOrders();
};

// ฟังก์ชันแปลงวันที่และเวลา (ไทย)
function renderDate(date) {
  if (!date) return "-";
  try {
    const d = new Date(date);
    if (isNaN(d)) return "-";
    return d.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return "-";
  }
}
function renderTime(timeOrDate) {
  if (!timeOrDate) return "-";
  // ถ้าเป็น dateTime ISO string
  if (/T/.test(timeOrDate)) {
    const d = new Date(timeOrDate);
    if (isNaN(d)) return "-";
    return d
      .toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(/:/g, ":");
  }
  // ถ้าเป็น "18:30" หรือ "18:30:00"
  return timeOrDate.slice(0, 5);
}
function renderDateTime(date, time) {
  if (!date) return "-";
  return (
    `<div>วัน: ${renderDate(date)}</div>` +
    `<div>เวลา: ${renderTime(time)}</div>`
  );
}
function renderDateTimeISO(datetime) {
  if (!datetime) return "-";
  const d = new Date(datetime);
  if (isNaN(d)) return "-";
  return (
    `<div>วัน: ${d.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })}</div>` +
    `<div>เวลา: ${d
      .toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(/:/g, ":")}</div>`
  );
}

// helper สำหรับแสดงที่อยู่
function renderFullAddress(order) {
  if (!order) return "-";
  let txt = `${order.fullname || ""}`;
  if (order.tel) txt += ` (${order.tel})`;
  if (order.address) txt += `<br>${order.address}`;
  if (order.province) txt += ` จ.${order.province}`;
  if (order.postcode) txt += ` ${order.postcode}`;
  return txt.trim() || "-";
}

// ดูรายละเอียด
window.viewOrderDetail = async function (id) {
  window.currentOrderId = id;
  const res = await fetch(`https://phakramcraftapi-production.up.railway.app/adminorders/${id}`);
  const order = await res.json();

  // --- แสดงข้อมูลหลักฐานการชำระเงิน (ถ้ามี) ---
  let paymentHtml = "";
  if (order.payment) {
    paymentHtml = `
      <div class="mb-2">
        <b>ข้อมูลการชำระเงิน:</b><br>
        ${
          order.payment.slip_url
            ? `<img src="${order.payment.slip_url}" alt="สลิปโอน" style="max-width:200px;max-height:200px;border-radius:8px;box-shadow:0 0 8px #0002;"><br>`
            : '<span class="text-muted">ไม่มีสลิป</span><br>'
        }
        <span>วัน/เวลาชำระเงิน:</span>
        <div style="margin-left:16px">
          ${
            order.payment.transfer_date
              ? renderDateTime(
                  order.payment.transfer_date,
                  order.payment.transfer_time
                )
              : "-"
          }
        </div>
        <span>วันที่อัปโหลดสลิป:</span>
        <div style="margin-left:16px">
          ${
            order.payment.created_at
              ? renderDateTimeISO(order.payment.created_at)
              : "-"
          }
        </div>
      </div>
    `;
  } else {
    paymentHtml = `
      <div class="mb-2">
        <b>ข้อมูลการชำระเงิน:</b>
        <span class="text-muted">ไม่มีข้อมูลการชำระเงิน</span>
      </div>
    `;
  }

  // --- HTML รายละเอียดคำสั่งซื้อ ---
  let html = `
    <div class="mb-2"><b>เลขที่ออเดอร์:</b> ${order.id}</div>
    <div class="mb-2"><b>วันที่:</b> ${
      order.created_at ? renderDateTimeISO(order.created_at) : "-"
    }</div>
    <div class="mb-2"><b>ผู้ซื้อ:</b> ${order.fullname || "-"}</div>
    <div class="mb-2"><b>ที่อยู่จัดส่ง:</b> <div>${renderFullAddress(
      order
    )}</div></div>
    <div class="mb-2"><b>สถานะ:</b>
      <select class="form-select d-inline-block w-auto" id="orderStatusSelect" ${
        order.status === "delivered" ? "disabled" : ""
      }>
        <option value="pending" ${
          order.status === "pending" ? "selected" : ""
        }>รอชำระเงิน</option>
        <option value="paid" ${
          order.status === "paid" ? "selected" : ""
        }>ชำระเงินแล้ว</option>
        <option value="shipping" ${
          order.status === "shipping" ? "selected" : ""
        }>รอจัดส่ง</option>
        <option value="delivered" ${
          order.status === "delivered" ? "selected" : ""
        }>จัดส่งแล้ว</option>
        <option value="cancelled" ${
          order.status === "cancelled" ? "selected" : ""
        }>ยกเลิก</option>
      </select>
    </div>
    <div class="mb-2"><b>หมายเลขติดตามพัสดุ:</b>
      <input type="text" id="trackingInput" class="form-control tracking-edit mt-1" value="${
        order.tracking_no || ""
      }" placeholder="ใส่เลขพัสดุ (ถ้ามี)" ${
    order.status === "delivered" ? "readonly" : ""
  }>
      <div class="form-text">* ใส่เลขพัสดุเมื่อเปลี่ยนสถานะเป็น "จัดส่งแล้ว"</div>
    </div>
    ${paymentHtml}
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
                    <td>${i.product_name}</td>
                    <td>${i.product_amount}</td>
                    <td>${Number(i.product_price).toLocaleString()}</td>
                    <td>${(
                      Number(i.product_price) * Number(i.product_amount)
                    ).toLocaleString()}</td>
                </tr>
            `
              )
              .join("")}
        </tbody>
    </table>
    <div class="text-end fw-bold fs-5">ยอดรวม: ฿${(
      order.total_price || 0
    ).toLocaleString()}</div>
  `;
  document.getElementById("orderDetailBody").innerHTML = html;
  new bootstrap.Modal(document.getElementById("orderDetailModal")).show();
};

// อัปเดตสถานะ + tracking
document
  .getElementById("saveOrderStatusBtn")
  .addEventListener("click", async function () {
    const select = document.getElementById("orderStatusSelect");
    const trackingInput = document.getElementById("trackingInput");
    if (!window.currentOrderId || !select) return;
    await fetch(`https://phakramcraftapi-production.up.railway.app/adminorders/${window.currentOrderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: select.value,
        tracking_no: trackingInput.value.trim(),
      }),
    });
    fetchOrders();
    bootstrap.Modal.getInstance(
      document.getElementById("orderDetailModal")
    ).hide();
  });

// ลบ
let deleteOrderId = null;
window.deleteOrder = function (id) {
  deleteOrderId = id;
  document.getElementById("deleteOrderNo").textContent = id;
  new bootstrap.Modal(
    document.getElementById("confirmDeleteOrderModal")
  ).show();
};
document
  .getElementById("confirmDeleteOrderBtn")
  .addEventListener("click", async function () {
    if (deleteOrderId !== null) {
      await fetch(`https://phakramcraftapi-production.up.railway.app/adminorders/${deleteOrderId}`, {
        method: "DELETE",
      });
      fetchOrders();
      deleteOrderId = null;
    }
    bootstrap.Modal.getInstance(
      document.getElementById("confirmDeleteOrderModal")
    ).hide();
  });

// SEARCH/FILTER
searchOrderInput.addEventListener("input", function (e) {
  orderSearchKeyword = e.target.value;
  orderPage = 1;
  fetchOrders();
});
statusFilter.addEventListener("change", function () {
  orderPage = 1;
  fetchOrders();
});

// PRINT ORDER
document.getElementById("printOrderBtn").addEventListener("click", function () {
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

// LOGOUT
document.getElementById("logoutBtn").addEventListener("click", function () {
  localStorage.removeItem("jwt_token");
  window.location.href = "login.html";
});

// INIT
fetchOrders();
