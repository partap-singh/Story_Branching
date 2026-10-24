/**
 * Dynamic Story Engine - Registration Controller
 */
function togglePassword(inputId, eyeSymbolId) {
    let passwordInput = document.getElementById(inputId);
    let eyeSymbol = document.getElementById(eyeSymbolId);
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        eyeSymbol.textContent = "🙈";
    } else {
        passwordInput.type = "password";
        eyeSymbol.textContent = "👁️";
    }
}

async function handleRegister(event) {
    if (event) event.preventDefault();

    let name = document.getElementById("name").value.trim();
    let email = document.getElementById("email").value.trim();
    let createPassword = document.getElementById("password").value;
    let confirmPassword = document.getElementById("cpassword").value;

    if (createPassword !== confirmPassword) {
        alert("Passwords do not match. Please re-enter.");
        return;
    }

    let signupBtn = document.getElementById("signupBtn");
    if (signupBtn) signupBtn.value = "Registering...";

    try {
        let res = await window.dataService.register(name, email, createPassword, "Reader");

        if (!res.success) {
            alert(res.message || "Registration failed. Please try a different email.");
            if (signupBtn) signupBtn.value = "CREATE ACCOUNT →";
            return;
        }

        alert(`Welcome, ${name}! Your account was created with +100 starting XP.`);
        window.location.href = "../reader/stories.html";
    } catch (e) {
        console.error("Registration error:", e);
        alert("Error during registration: " + (e.message || "Please try again."));
        if (signupBtn) signupBtn.value = "CREATE ACCOUNT →";
    }
}
