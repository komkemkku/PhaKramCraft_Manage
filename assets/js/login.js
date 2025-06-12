document
  .getElementById("loginForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorMsg = document.getElementById("errorMsg");

    errorMsg.classList.add("d-none"); // clear error

    if (username === "" || password === "") {
      errorMsg.textContent = "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน";
      errorMsg.classList.remove("d-none");
      return;
    }

    // ---- MOCK LOGIN (ใช้งานได้ทันที ถ้ายังไม่เชื่อม API) ----
    // Username: admin / Password: 1234
    if (username === "admin" && password === "1234") {
      // mock JWT เก็บใน localStorage (จำลองการ login)
      localStorage.setItem("jwt_token", "demo.mock.jwt.token");
      window.location.href = "dashboard.html";
      return;
    } else {
      errorMsg.textContent = "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
      errorMsg.classList.remove("d-none");
    }

    // ---- เชื่อม API จริงในอนาคต (เปิดคอมเมนต์ แล้วแก้ url) ----
    /*
    try {
        const response = await fetch("https://your-api-url.com/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok && data.token) {
            localStorage.setItem("jwt_token", data.token);
            window.location.href = "index.html";
        } else {
            errorMsg.textContent = data.message || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
            errorMsg.classList.remove("d-none");
        }
    } catch (error) {
        errorMsg.textContent = "เกิดข้อผิดพลาดในการเชื่อมต่อ";
        errorMsg.classList.remove("d-none");
    }
    */
  });
