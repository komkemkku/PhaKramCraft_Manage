// ========== MOCK DATA ==========
let logs = [
  {
    id: 1,
    datetime: "2024-06-12 09:01:20",
    user: "admin",
    action: "login",
    detail: "เข้าสู่ระบบสำเร็จ",
  },
  {
    id: 2,
    datetime: "2024-06-12 09:10:35",
    user: "admin",
    action: "add",
    detail: "เพิ่มสินค้า: ผ้าพันคอคราม",
  },
  {
    id: 3,
    datetime: "2024-06-12 09:12:10",
    user: "staff1",
    action: "edit",
    detail: "แก้ไขราคา: ผ้าพันคอคราม",
  },
  {
    id: 4,
    datetime: "2024-06-12 09:13:41",
    user: "admin",
    action: "delete",
    detail: "ลบผู้ใช้งาน: viewer",
  },
  {
    id: 5,
    datetime: "2024-06-12 09:30:20",
    user: "admin",
    action: "logout",
    detail: "ออกจากระบบ",
  },
  {
    id: 6,
    datetime: "2024-06-13 10:00:00",
    user: "viewer",
    action: "login",
    detail: "เข้าสู่ระบบสำเร็จ",
  },
  {
    id: 7,
    datetime: "2024-06-13 10:01:00",
    user: "viewer",
    action: "logout",
    detail: "ออกจากระบบ",
  },
  {
    id: 8,
    datetime: "2024-06-13 10:30:40",
    user: "admin",
    action: "add",
    detail: "เพิ่มประเภท: เสื้อ",
  },
  {
    id: 9,
    datetime: "2024-06-13 11:00:20",
    user: "staff1",
    action: "edit",
    detail: "แก้ไขอีเมล: staff1@example.com",
  },
];
// เพิ่ม mock ให้ดูมีหลายรายการ
for (let i = 10; i <= 55; i++) {
  logs.push({
    id: i,
    datetime: `2024-06-14 1${Math.floor(i / 5)}:${(i % 60)
      .toString()
      .padStart(2, "0")}:00`,
    user: i % 3 === 0 ? "admin" : i % 3 === 1 ? "staff1" : "viewer",
    action: ["add", "edit", "delete", "login", "logout"][i % 5],
    detail: `Mock log #${i}`,
  });
}

const logTableBody = document.getElementById("logTableBody");
const searchLogInput = document.getElementById("searchLogInput");
const filterAction = document.getElementById("filterAction");
const filterDate = document.getElementById("filterDate");
const pagination = document.getElementById("logPagination");

let logCurrentPage = 1;
const logPerPage = 10;

// ========== RENDER ==========
function renderLogs() {
  // Filter logs
  let filtered = logs.filter((log) => {
    // search keyword
    const keyword = (searchLogInput.value || "").trim().toLowerCase();
    let matchKeyword = true;
    if (keyword) {
      matchKeyword =
        (log.user && log.user.toLowerCase().includes(keyword)) ||
        (log.detail && log.detail.toLowerCase().includes(keyword));
    }
    // filter action
    let matchAction = !filterAction.value || log.action === filterAction.value;
    // filter date
    let matchDate =
      !filterDate.value || log.datetime.startsWith(filterDate.value);
    return matchKeyword && matchAction && matchDate;
  });

  // pagination
  const totalPages = Math.ceil(filtered.length / logPerPage);
  if (logCurrentPage > totalPages) logCurrentPage = 1;
  const start = (logCurrentPage - 1) * logPerPage;
  const pageLogs = filtered.slice(start, start + logPerPage);

  logTableBody.innerHTML = "";
  pageLogs.forEach((log) => {
    logTableBody.innerHTML += `
            <tr>
                <td>${log.datetime}</td>
                <td>${log.user}</td>
                <td>
                    ${renderLogAction(log.action)}
                </td>
                <td>${log.detail}</td>
            </tr>
        `;
  });

  renderPagination(totalPages);
}
function renderLogAction(action) {
  // ไอคอนและสีแต่ละ type
  const map = {
    login: {
      icon: "bi-box-arrow-in-right",
      color: "text-success",
      text: "เข้าสู่ระบบ",
    },
    logout: {
      icon: "bi-box-arrow-right",
      color: "text-secondary",
      text: "ออกจากระบบ",
    },
    add: { icon: "bi-plus-lg", color: "text-primary", text: "เพิ่มข้อมูล" },
    edit: { icon: "bi-pencil", color: "text-warning", text: "แก้ไขข้อมูล" },
    delete: { icon: "bi-trash", color: "text-danger", text: "ลบข้อมูล" },
  };
  if (map[action]) {
    return `<i class="bi ${map[action].icon} ${map[action].color}" title="${map[action].text}"></i> ${map[action].text}`;
  }
  return action;
}

// ========== PAGINATION ==========
function renderPagination(totalPages) {
  pagination.innerHTML = "";
  if (totalPages <= 1) return;
  for (let i = 1; i <= totalPages; i++) {
    pagination.innerHTML += `
        <li class="page-item ${logCurrentPage === i ? "active" : ""}">
            <button class="page-link" onclick="gotoLogPage(${i})">${i}</button>
        </li>`;
  }
}
window.gotoLogPage = function (page) {
  logCurrentPage = page;
  renderLogs();
};

// ========== FILTERS ==========
searchLogInput.addEventListener("input", () => {
  logCurrentPage = 1;
  renderLogs();
});
filterAction.addEventListener("change", () => {
  logCurrentPage = 1;
  renderLogs();
});
filterDate.addEventListener("change", () => {
  logCurrentPage = 1;
  renderLogs();
});

// ========== EXPORT ==========
document.getElementById("btnExport").addEventListener("click", function () {
  let data = logs
    .map(
      (log) =>
        `${log.datetime},${log.user},${log.action},${log.detail.replace(
          /,/g,
          ";"
        )}`
    )
    .join("\n");
  let blob = new Blob([`วันที่,ผู้ใช้,กิจกรรม,รายละเอียด\n${data}`], {
    type: "text/csv",
  });
  let a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `logs_export_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
});

// ========== LOGOUT ==========
document.getElementById("logoutBtn").addEventListener("click", function () {
  localStorage.removeItem("jwt_token");
  window.location.href = "/index.html";
});

// ========== INIT ==========
renderLogs();
