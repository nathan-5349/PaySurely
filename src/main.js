import './style.css';

// --- Structure HTML du login ---
document.querySelector('#app').innerHTML = `
<div class="bg-[url('/src/image/FondEcran.jpg')] bg-center bg-no-repeat bg-cover h-screen w-screen relative before:absolute before:inset-0 before:bg-black/40 before:z-0">
  <div class="relative z-10 flex flex-col items-center justify-center h-full text-white">
    <h1 class="text-8xl font-bold mb-2">LOGIN</h1>
    <h2 class="text-4xl font-bold mb-6">Paiement en ligne !</h2>

    <form id="formulaireConnexion" class="flex flex-col gap-3">
      <input id="identifiant" class="input" type="email" placeholder="Adresse mail" required>
      <input id="motdepasse" class="input" type="password" placeholder="Mot de passe" required>

      <button class="btn mt-8" type="submit">Connexion</button>
      <button class="btn" type="button" id="btnInscription">Inscription</button>
    </form>

    <div id="message" class="mt-4 text-red-400"></div>
  </div>
</div>
`;

const message = document.getElementById("message");
const form = document.getElementById("formulaireConnexion");
let isRegisterMode = false;

// --- Fonction LOGIN ---
async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById("identifiant")?.value.trim();
  const password = document.getElementById("motdepasse")?.value.trim();

  try {
    const res = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      message.style.color = 'tomato';
      message.textContent = data.error?.message || 'Erreur de connexion';
      return;
    }

    localStorage.setItem('token', data.data.token);
    localStorage.setItem('role', data.data.user.role);
    localStorage.setItem('username', data.data.user.username);

    message.style.color = 'lightgreen';
    message.textContent = `Bienvenue ${data.data.user.role} !`;

    setTimeout(() => loadRolePage(data.data.user.role), 300);

  } catch (err) {
    message.style.color = 'tomato';
    message.textContent = 'Erreur serveur';
    console.error(err);
  }
}

// --- Fonction REGISTER ---
async function handleRegister(e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const res = await fetch("http://localhost:4000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      message.style.color = "tomato";
      message.textContent = data.error?.message || "Erreur lors de l'inscription";
      return;
    }

    message.style.color = "lightgreen";
    message.textContent = "Compte créé ! Vous pouvez vous connecter.";

    setTimeout(restoreLoginForm, 1200);

  } catch (err) {
    message.style.color = "tomato";
    message.textContent = "Erreur serveur";
  }
}

// --- Fonction RESTAURER le formulaire LOGIN ---
function restoreLoginForm() {
  isRegisterMode = false;

  form.innerHTML = `
    <input id="identifiant" class="input" type="email" placeholder="Adresse mail" required>
    <input id="motdepasse" class="input" type="password" placeholder="Mot de passe" required>

    <button class="btn mt-8" type="submit">Connexion</button>
    <button class="btn" type="button" id="btnInscription">Inscription</button>
  `;

  document.getElementById("btnInscription").addEventListener("click", switchToRegister);
  form.addEventListener("submit", handleLogin, { once: true });
  message.textContent = "";
}

// --- Basculer vers INSCRIPTION ---
function switchToRegister() {
  isRegisterMode = true;

  form.innerHTML = `
    <input id="username" class="input" type="text" placeholder="Nom d'utilisateur" required>
    <input id="email" class="input" type="email" placeholder="Adresse mail" required>
    <input id="password" class="input" type="password" placeholder="Mot de passe" required>

    <button class="btn mt-8" type="submit">Créer un compte</button>
    <button class="btn bg-gray-600" type="button" id="btnRetourLogin">Retour</button>
  `;

  document.getElementById("btnRetourLogin").addEventListener("click", restoreLoginForm);
  form.addEventListener("submit", handleRegister, { once: true });

  message.textContent = "";
}

// --- Attacher les handlers initiaux ---
document.getElementById("btnInscription").addEventListener("click", switchToRegister);
form.addEventListener("submit", handleLogin, { once: true });

// --- Charger la bonne page ---
function loadRolePage(role) {
  if (role === 'admin') {
    import('./pages/admin.js');
  } else {
    import('./pages/user.js');
  }
}
