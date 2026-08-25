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
        let user = await window.dataService.getUserByEmail(email);

        if (!user) {
            alert("Account not found with this email. Please check credentials or register.");
            if (submitBtn) submitBtn.value = "SIGN IN →";
            return;
        }

        if (user.password !== password) {
            alert("Incorrect password. Please try again.");
            if (submitBtn) submitBtn.value = "SIGN IN →";
            return;
        }

        loginUserSession(user);
    } catch (err) {
        console.error("Login error:", err);
        alert("Authentication failed. Please retry.");
        if (submitBtn) submitBtn.value = "SIGN IN →";
    }
}

function quickLogin(preset) {
    if (preset === "admin") {
        loginUserSession({
            id: "usr_admin_1",
            name: "System Admin",
            email: "admin@gmail.com",
            role: "Admin",
            xp: 999,
            completedStories: ["story_lost_kingdom", "story_neon_nexus"]
        });
    } else {
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
