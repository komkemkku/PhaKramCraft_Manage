document
  .getElementById("loginForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorMsg = document.getElementById("errorMsg");

    errorMsg.classList.add("d-none");

    if (!username || !password) {
      errorMsg.textContent = "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน";
      errorMsg.classList.remove("d-none");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/admins/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      let data = {};
      try {
        data = await response.json();
      } catch (err) {}

      if (response.ok && data.token) {
        // เก็บ token ไว้ใช้ใน request ต่อไป
        localStorage.setItem("jwt_token", data.token);
        // เก็บข้อมูล user ไว้ใช้ในหน้าอื่น (optional)
        localStorage.setItem("admin_info", JSON.stringify(data.admin));
        // redirect ไปหน้า dashboard
        window.location.href = "/dashboard.html";
      } else if (data.message) {
        errorMsg.textContent = data.message;
        errorMsg.classList.remove("d-none");
      } else if (data.error) {
        errorMsg.textContent = data.error;
        errorMsg.classList.remove("d-none");
      } else {
        errorMsg.textContent = "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
        errorMsg.classList.remove("d-none");
      }
    } catch (error) {
      errorMsg.textContent = "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์";
      errorMsg.classList.remove("d-none");
    }
  });
