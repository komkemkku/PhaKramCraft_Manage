console.log("Dashboard JS loaded");
// ================= MOCK DATA ===================
// สามารถดึงจาก backend จริงได้ในอนาคต
const products = [
  { id: 1, name: "ผ้าพันคอคราม", category: "ผ้าพันคอ", cost: 120, price: 200 },
  { id: 2, name: "เสื้อคราม", category: "เสื้อ", cost: 250, price: 390 },
  {
    id: 3,
    name: "กระเป๋าย้อมคราม",
    category: "กระเป๋า",
    cost: 100,
    price: 199,
  },
];
const categories = [
  { id: 1, name: "ผ้าพันคอ" },
  { id: 2, name: "เสื้อ" },
  { id: 3, name: "กระเป๋า" },
];
const users = [
  { id: 1, name: "admin" },
  { id: 2, name: "staff1" },
  { id: 3, name: "viewer" },
];
// order: {id, date, orderNo, buyer, items: [{product, qty, price, cost}], total, status}
const orders = [
  {
    id: 1,
    date: "2024-01-04",
    orderNo: "ORD-0001",
    buyer: "สมศรี",
    items: [
      { product: "ผ้าพันคอคราม", qty: 2, price: 200, cost: 120 },
      { product: "เสื้อคราม", qty: 1, price: 390, cost: 250 },
    ],
    total: 790,
    status: "ชำระเงินแล้ว",
  },
  {
    id: 2,
    date: "2024-01-21",
    orderNo: "ORD-0002",
    buyer: "ป้าพร",
    items: [{ product: "กระเป๋าย้อมคราม", qty: 3, price: 199, cost: 100 }],
    total: 597,
    status: "รอดำเนินการ",
  },
  {
    id: 3,
    date: "2024-02-03",
    orderNo: "ORD-0003",
    buyer: "ธวัช",
    items: [{ product: "เสื้อคราม", qty: 2, price: 390, cost: 250 }],
    total: 780,
    status: "จัดส่งแล้ว",
  },
  {
    id: 4,
    date: "2024-02-20",
    orderNo: "ORD-0004",
    buyer: "ชมพู่",
    items: [{ product: "ผ้าพันคอคราม", qty: 1, price: 200, cost: 120 }],
    total: 200,
    status: "ชำระเงินแล้ว",
  },
  {
    id: 4,
    date: "2025-02-20",
    orderNo: "ORD-0004",
    buyer: "ชมพู่",
    items: [{ product: "ผ้าพันคอคราม", qty: 1, price: 200, cost: 120 }],
    total: 200,
    status: "ชำระเงินแล้ว",
  },
  {
    id: 4,
    date: "2025-11-20",
    orderNo: "ORD-0004",
    buyer: "ชมพู่",
    items: [{ product: "ผ้าพันคอคราม", qty: 1, price: 200, cost: 120 }],
    total: 200,
    status: "ชำระเงินแล้ว",
  },
  {
    id: 4,
    date: "2025-12-20",
    orderNo: "ORD-0004",
    buyer: "ชมพู่",
    items: [{ product: "ผ้าพันคอคราม", qty: 1, price: 200, cost: 120 }],
    total: 200,
    status: "ชำระเงินแล้ว",
  },
  {
    id: 4,
    date: "2023-02-20",
    orderNo: "ORD-0004",
    buyer: "ชมพู่",
    items: [{ product: "ผ้าพันคอคราม", qty: 1, price: 200, cost: 120 }],
    total: 200,
    status: "ชำระเงินแล้ว",
  },
  {
    id: 4,
    date: "2023-02-20",
    orderNo: "ORD-0004",
    buyer: "ชมพู่",
    items: [{ product: "ผ้าพันคอคราม", qty: 1, price: 200, cost: 120 }],
    total: 200,
    status: "ชำระเงินแล้ว",
  },
  {
    id: 4,
    date: "2026-02-20",
    orderNo: "ORD-0004",
    buyer: "ชมพู่",
    items: [{ product: "ผ้าพันคอคราม", qty: 1, price: 200, cost: 120 }],
    total: 200,
    status: "ชำระเงินแล้ว",
  },
  {
    id: 4,
    date: "2026-02-20",
    orderNo: "ORD-0004",
    buyer: "ชมพู่",
    items: [{ product: "ผ้าพันคอคราม", qty: 1, price: 200, cost: 120 }],
    total: 200,
    status: "ชำระเงินแล้ว",
  },
];
// เพิ่ม mock order แบบกระจายตลอดปี
for (let m = 3; m <= 12; m++) {
  for (let d = 1; d <= 2; d++) {
    orders.push({
      id: orders.length + 1,
      date: `2024-${m.toString().padStart(2, "0")}-${(d * 4)
        .toString()
        .padStart(2, "0")}`,
      orderNo: `ORD-${(orders.length + 1).toString().padStart(4, "0")}`,
      buyer: ["สมศรี", "ป้าพร", "ธวัช", "ชมพู่"][Math.floor(Math.random() * 4)],
      items: [
        {
          product: ["ผ้าพันคอคราม", "เสื้อคราม", "กระเป๋าย้อมคราม"][
            Math.floor(Math.random() * 3)
          ],
          qty: 1 + Math.floor(Math.random() * 3),
          price: [200, 390, 199][Math.floor(Math.random() * 3)],
          cost: [120, 250, 100][Math.floor(Math.random() * 3)],
        },
      ],
      total: 180 + Math.floor(Math.random() * 400),
      status: ["ชำระเงินแล้ว", "รอดำเนินการ", "จัดส่งแล้ว"][
        Math.floor(Math.random() * 3)
      ],
    });
  }
}

// ================= SETUP FILTER YEAR ================
function getYearList() {
  const years = Array.from(
    new Set(orders.map((o) => new Date(o.date).getFullYear()))
  );
  return years.sort((a, b) => b - a);
}
const selectYear = document.getElementById("selectYear");
let selectedYear = new Date().getFullYear();
function renderYearOptions() {
  selectYear.innerHTML = "";
  const years = getYearList();
  years.forEach((year) => {
    selectYear.innerHTML += `<option value="${year}" ${
      year === selectedYear ? "selected" : ""
    }>${year}</option>`;
  });
}
selectYear.addEventListener("change", function () {
  selectedYear = +this.value;
  renderDashboard();
});

// ================== RENDER STATS ====================
function renderDashboard() {
  // Filter order by year
  const filteredOrders = orders.filter(
    (o) => new Date(o.date).getFullYear() === selectedYear
  );

  // จำนวนสินค้าทั้งหมด
  document.getElementById("statProductCount").textContent = products.length;
  // จำนวนประเภทสินค้า
  document.getElementById("statCategoryCount").textContent = categories.length;
  // จำนวนสินค้าขายได้ทั้งหมด (รวม qty ใน orders)
  let soldCount = 0;
  filteredOrders.forEach((o) => o.items.forEach((i) => (soldCount += i.qty)));
  document.getElementById("statSoldCount").textContent = soldCount;
  // จำนวนผู้ใช้งาน
  document.getElementById("statUserCount").textContent = users.length;

  // จำนวนขายได้ในแต่ละประเภท
  let soldByCategory = {};
  categories.forEach((c) => (soldByCategory[c.name] = 0));
  filteredOrders.forEach((order) => {
    order.items.forEach((item) => {
      const product = products.find((p) => p.name === item.product);
      if (product) soldByCategory[product.category] += item.qty;
    });
  });
  const statByCategoryList = document.getElementById("statByCategoryList");
  statByCategoryList.innerHTML = "";
  Object.keys(soldByCategory).forEach((cat) => {
    statByCategoryList.innerHTML += `
        <li class="list-group-item d-flex justify-content-between align-items-center">
            <span>${cat}</span>
            <span class="fw-bold">${soldByCategory[cat]} ชิ้น</span>
        </li>`;
  });

  // ยอดขาย/ต้นทุน/กำไร
  let totalSales = 0,
    totalCost = 0;
  filteredOrders.forEach((order) => {
    order.items.forEach((item) => {
      totalSales += item.price * item.qty;
      totalCost += item.cost * item.qty;
    });
  });
  document.getElementById("statTotalSales").textContent =
    "฿" + totalSales.toLocaleString();
  document.getElementById("statTotalCost").textContent =
    "฿" + totalCost.toLocaleString();
  document.getElementById("statTotalProfit").textContent =
    "฿" + (totalSales - totalCost).toLocaleString();

  // ตารางออเดอร์ล่าสุด
  const orderTableBody = document.getElementById("orderTableBody");
  let latestOrders = filteredOrders
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8);
  orderTableBody.innerHTML = "";
  latestOrders.forEach((order) => {
    orderTableBody.innerHTML += `
        <tr>
            <td>${order.date}</td>
            <td>${order.orderNo}</td>
            <td>${order.buyer}</td>
            <td>
                ${order.items
                  .map(
                    (i) =>
                      `${i.product} <span class="text-muted">(${i.qty})</span>`
                  )
                  .join("<br>")}
            </td>
            <td>${order.items.reduce((s, i) => s + i.qty, 0)}</td>
            <td>${order.total.toLocaleString()}</td>
            <td>${renderOrderStatus(order.status)}</td>
        </tr>`;
  });

  // กราฟยอดขายรายเดือน
  renderChart(filteredOrders);
}

function renderOrderStatus(status) {
  if (status.includes("ชำระ"))
    return `<span class="badge bg-success">${status}</span>`;
  if (status.includes("รอดำเนิน"))
    return `<span class="badge bg-warning text-dark">${status}</span>`;
  return `<span class="badge bg-info">${status}</span>`;
}

// ==================== RENDER CHART (Recharts) ===================
function renderChart(filteredOrders) {
  // 1. เตรียม monthly data
  let monthlyTotals = [];
  for (let m = 1; m <= 12; m++) {
    let total = filteredOrders
      .filter((o) => new Date(o.date).getMonth() + 1 === m)
      .reduce((sum, o) => sum + o.total, 0);
    monthlyTotals.push(total);
  }

  // 2. ลบกราฟเก่าถ้ามี
  if (window.salesChartObj) {
    window.salesChartObj.destroy();
  }

  const ctx = document.getElementById("salesChart").getContext("2d");

  // 3. สร้าง gradient ไล่สีฟ้า
  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, "rgba(13,110,253,0.25)");
  gradient.addColorStop(1, "rgba(13,110,253,0.04)");

  // 4. Render chart
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

// ===================== LOGOUT ========================
document.getElementById("logoutBtn").addEventListener("click", function () {
  localStorage.removeItem("jwt_token");
  window.location.href = "/index.html";
});

// ===================== INIT ==========================
renderYearOptions();
renderDashboard();
