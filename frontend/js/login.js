/**
 * Dynamic Story Engine - Authentication Controller
 */

function toggleEye() {
    let passwordInput = document.getElementById("password");
    let eyeSymbol = document.getElementById("eyeSymbol");
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        eyeSymbol.textContent = "🙈";
    } else {
        passwordInput.type = "password";
        eyeSymbol.textContent = "👁️";
    }
}

async function handleLogin(event) {
    if (event) event.preventDefault();

    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value;

    let submitBtn = document.getElementById("submitBtn");
    if (submitBtn) submitBtn.value = "Authenticating...";

    try {
        let res = await window.dataService.login(email, password);

        if (!res.success) {
            alert(res.message || "Account not found or password incorrect. Please check credentials or register.");
            if (submitBtn) submitBtn.value = "SIGN IN →";
            return;
        }

        loginUserSession(res.user);
    } catch (err) {
        console.error("Login error:", err);
        alert("Authentication error: " + (err.message || "Please check backend connection."));
        if (submitBtn) submitBtn.value = "SIGN IN →";
    }
}

async function quickLogin(preset) {
    if (preset === "admin") {
        let res = await window.dataService.login("admin@gmail.com", "admin123");
        if (res && res.success) {
            loginUserSession(res.user);
            return;
        }
        loginUserSession({
            id: "usr_admin_1",
            name: "System Admin",
            email: "admin@gmail.com",
            role: "Admin",
            xp: 999,
            completedStories: ["story_lost_kingdom", "story_neon_nexus"]
        });
    } else {
        let res = await window.dataService.login("testreader@example.com", "password123");
        if (res && res.success) {
            loginUserSession(res.user);
            return;
        }
        loginUserSession({
            id: "usr_reader_demo",
            name: "Alex Vance",
            email: "demo@explorer.ai",
            role: "Reader",
            xp: 150,
            completedStories: ["story_lost_kingdom"],
            usedFreeRetreatStories: []
        });
    }
}

function loginUserSession(user) {
    if (user.xp === undefined) user.xp = 100;
    if (!user.completedStories) user.completedStories = [];
    if (!user.usedFreeRetreatStories) user.usedFreeRetreatStories = [];

    localStorage.setItem("user", JSON.stringify(user));

    if (user.role === "Admin") {
        window.location.href = "../admin/admin.html";
    } else {
        window.location.href = "../reader/stories.html";
    }
}
