console.log("Dashboard JS loaded (API version)");

// ==================== STATE =====================
let selectedYear = new Date().getFullYear();
const selectYear = document.getElementById("selectYear");

// =============== YEAR SELECTOR ================
async function loadYears() {
  const res = await fetch("https://phakramcraftapi-production.up.railway.app/dashboard/years");
  const years = await res.json();
  selectYear.innerHTML = "";
  years.forEach((year) => {
    selectYear.innerHTML += `<option value="${year}" ${
      year == selectedYear ? "selected" : ""
    }>${year}</option>`;
  });
}
selectYear.addEventListener("change", function () {
  selectedYear = +this.value;
  renderDashboard();
});

// ============== RENDER DASHBOARD ===============
async function renderDashboard() {
  // 1. SUMMARY
  const resSummary = await fetch("https://phakramcraftapi-production.up.railway.app/dashboard/summary");
  const summary = await resSummary.json();
  document.getElementById("statProductCount").textContent =
    summary.product_count;
  document.getElementById("statCategoryCount").textContent =
    summary.category_count;
  document.getElementById("statSoldCount").textContent = summary.sold_count;
  document.getElementById("statUserCount").textContent = summary.user_count;

  // 2. CATEGORY SOLD COUNT
  const resCat = await fetch(
    `https://phakramcraftapi-production.up.railway.app/dashboard/sold-by-category/${selectedYear}`
  );
  const soldByCategory = await resCat.json();
  const statByCategoryList = document.getElementById("statByCategoryList");
  statByCategoryList.innerHTML = "";
  soldByCategory.forEach((c) => {
    statByCategoryList.innerHTML += `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <span>${c.category}</span>
        <span class="fw-bold">${c.sold} ชิ้น</span>
      </li>`;
  });

  // 3. SALES BY MONTH (GRAPH)
  const resMonth = await fetch(
    `https://phakramcraftapi-production.up.railway.app/dashboard/sales-by-month/${selectedYear}`
  );
  const monthly = await resMonth.json();
  renderChart(monthly);

  // 4. RECENT ORDERS
  const resRecent = await fetch(
    `https://phakramcraftapi-production.up.railway.app/dashboard/recent-orders/${selectedYear}`
  );
  const orders = await resRecent.json();
  renderOrderTable(orders);
}

// ============== RENDER ORDER TABLE ===============
function renderOrderTable(orders) {
  const orderTableBody = document.getElementById("orderTableBody");
  orderTableBody.innerHTML = "";
  orders.forEach((order) => {
    // รวมสินค้าในแต่ละ order
    const itemHtml = order.items
      .map((i) => `${i.product} <span class="text-muted">(${i.qty})</span>`)
      .join("<br>");
    const totalQty = order.items.reduce((sum, i) => sum + i.qty, 0);
    orderTableBody.innerHTML += `
      <tr>
        <td>${order.date || "-"}</td>
        <td>${order.order_no}</td>
        <td>${order.buyer || "-"}</td>
        <td>${itemHtml}</td>
        <td>${totalQty}</td>
        <td>${Number(order.total_price || 0).toLocaleString()}</td>
        <td>${renderOrderStatus(order.status)}</td>
      </tr>
    `;
  });
}

// ============== RENDER CHART (Chart.js) ===============
function renderChart(monthlyTotals) {
  if (window.salesChartObj) window.salesChartObj.destroy();
  const ctx = document.getElementById("salesChart").getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, "rgba(13,110,253,0.25)");
  gradient.addColorStop(1, "rgba(13,110,253,0.04)");

  window.salesChartObj = new Chart(ctx, {
    type: "line",
    data: {
      labels: [
        "ม.ค.",
        "ก.พ.",
        "มี.ค.",
        "เม.ย.",
        "พ.ค.",
        "มิ.ย.",
        "ก.ค.",
        "ส.ค.",
        "ก.ย.",
        "ต.ค.",
        "พ.ย.",
        "ธ.ค.",
      ],
      datasets: [
        {
          label: "ยอดขาย (บาท)",
          data: monthlyTotals,
          borderColor: "#0d6efd",
          backgroundColor: gradient,
          fill: true,
          tension: 0.4,
          pointRadius: 6,
          pointBackgroundColor: "#fff",
          pointBorderColor: "#0d6efd",
          pointHoverRadius: 9,
          pointHoverBorderWidth: 2,
          pointHoverBackgroundColor: "#0d6efd",
          pointHoverBorderColor: "#fff",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#fff",
          titleColor: "#0d6efd",
          bodyColor: "#212529",
          borderColor: "#dee2e6",
          borderWidth: 1,
          cornerRadius: 8,
          padding: 10,
          displayColors: false,
          callbacks: {
            label: function (context) {
              return "ยอดขาย: ฿" + context.parsed.y.toLocaleString();
            },
          },
        },
      },
      layout: {
        padding: { left: 8, right: 8, top: 0, bottom: 8 },
      },
      scales: {
        x: {
          grid: { color: "rgba(0,0,0,0.06)" },
          ticks: {
            font: { size: 14, family: "Prompt, 'Noto Sans Thai', sans-serif" },
            color: "#666",
          },
        },
        y: {
          grid: { color: "rgba(0,0,0,0.06)" },
          ticks: {
            font: { size: 15, weight: "bold" },
            color: "#222",
            callback: function (value) {
              return "฿" + value.toLocaleString();
            },
          },
          beginAtZero: true,
        },
      },
    },
  });
}

// ============= STATUS BADGE (TH) ==============
function renderOrderStatus(status) {
  if (!status) return `<span class="badge bg-secondary">-</span>`;
  if (status.includes("paid") || status.includes("ชำระ"))
    return `<span class="badge bg-success">${status}</span>`;
  if (status.includes("pending") || status.includes("รอดำเนิน"))
    return `<span class="badge bg-warning text-dark">${status}</span>`;
  if (status.includes("cancel") || status.includes("ยกเลิก"))
    return `<span class="badge bg-danger">${status}</span>`;
  if (status.includes("delivered") || status.includes("จัดส่ง"))
    return `<span class="badge bg-info">${status}</span>`;
  return `<span class="badge bg-secondary">${status}</span>`;
}

// ============ LOGOUT ===============
document.getElementById("logoutBtn").addEventListener("click", function () {
  localStorage.removeItem("jwt_token");
  window.location.href = "/index.html";
});

// =========== INIT ================
(async function () {
  await loadYears();
  await renderDashboard();
})();
