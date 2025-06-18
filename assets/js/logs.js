const API_BASE = "https://phakramcraftapi-production.up.railway.app/logs";

let logs = [];
let logTotalPages = 1;
let logCurrentPage = 1;
const logPerPage = 20;

// SELECTOR
const logTableBody = document.getElementById("logTableBody");
const searchLogInput = document.getElementById("searchLogInput");
const filterAction = document.getElementById("filterAction");
const filterDate = document.getElementById("filterDate");
const pagination = document.getElementById("logPagination");

// ========== Auth header helper ==========
function getAuthHeaders() {
  const token = localStorage.getItem("jwt_token");
  return token ? { Authorization: "Bearer " + token } : {};
}

// ========== ดึงข้อมูลจาก API ==========
async function fetchLogsFromApi() {
  const keyword = (searchLogInput.value || "").trim();
  const action = filterAction.value;
  const date = filterDate.value;

  let query = `?page=${logCurrentPage}&limit=${logPerPage}`;
  if (keyword) query += `&search=${encodeURIComponent(keyword)}`;
  if (action) query += `&action=${encodeURIComponent(action)}`;
  if (date) query += `&date=${encodeURIComponent(date)}`;

  const res = await fetch(API_BASE + query, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    logs = [];
    logTotalPages = 1;
    renderLogs();
    return;
  }
  const data = await res.json();
  // mapping log ให้ field ชื่อตรงกับที่ใช้ render
  if (Array.isArray(data)) {
    logs = data.map(mapLog);
    logTotalPages = 1;
  } else {
    logs = (data.logs || []).map(mapLog);
    logTotalPages = data.totalPages || 1;
  }
  renderLogs();
}

// ========== MAP LOG FIELD ==========
function mapLog(log) {
  // user: แสดงชื่อ admin หรือ user ที่ทำ action
  return {
    datetime: log.created_at || log.datetime || "",
    user: log.adminname || log.username || "-",
    action: log.action || "",
    detail: log.description || log.detail || "",
  };
}

// ========== RENDER ==========
function renderLogs() {
  logTableBody.innerHTML = "";
  if (!logs.length) {
    logTableBody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">ไม่มีข้อมูล</td></tr>`;
  } else {
    logs.forEach((log) => {
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
  }
  renderPagination(logTotalPages);
}

function renderLogAction(action) {
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
  fetchLogsFromApi();
};

// ========== FILTER/EVENT ==========
searchLogInput.addEventListener("input", () => {
  logCurrentPage = 1;
  fetchLogsFromApi();
});
filterAction.addEventListener("change", () => {
  logCurrentPage = 1;
  fetchLogsFromApi();
});
filterDate.addEventListener("change", () => {
  logCurrentPage = 1;
  fetchLogsFromApi();
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
fetchLogsFromApi();
