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
        let existingUser = await window.dataService.getUserByEmail(email);

        if (existingUser) {
            alert("This email address is already registered. Please sign in instead.");
            if (signupBtn) signupBtn.value = "CREATE ACCOUNT →";
            return;
        }

        let newUser = {
            name: name,
            email: email,
            password: createPassword,
            role: "Reader",
            xp: 100,
            completedStories: [],
            usedFreeRetreatStories: []
        };

        await window.dataService.saveUser(newUser);

        alert(`Welcome, ${name}! Your account was created with +100 starting XP.`);
        localStorage.setItem("user", JSON.stringify(newUser));
        window.location.href = "../reader/stories.html";
    } catch (e) {
        console.error("Registration error:", e);
        alert("Error during registration. Please try again.");
        if (signupBtn) signupBtn.value = "CREATE ACCOUNT →";
    }
}
