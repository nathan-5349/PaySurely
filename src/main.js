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

const form = document.getElementById("formulaireConnexion");
const message = document.getElementById("message");
const btnInscription = document.getElementById("btnInscription");

// --- Gestion du login ---
form.addEventListener("submit", async function(e){
  e.preventDefault();
  const email = document.getElementById("identifiant").value.trim();
  const password = document.getElementById("motdepasse").value.trim();

  try {
    const res = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if(!res.ok){
      const errData = await res.json();
      message.style.color = 'tomato';
      message.textContent = errData.error?.message || 'Erreur de connexion';
      return;
    }

    const data = await res.json();
    const token = data.data.token;
    const role = data.data.user.role;
    const emailResp = data.data.user.email;

    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('email', emailResp);

    message.style.color = 'lightgreen';
    message.textContent = `Bienvenue ${role} ! Chargement...`;

    setTimeout(() => loadRolePage(role), 250);

  } catch(err) {
    message.style.color = 'tomato';
    message.textContent = 'Erreur serveur ou réseau';
    console.error(err);
  }
});

// --- Inscription ---
btnInscription.addEventListener('click', () => {
  window.location.href = '/inscription.html';
});

// --- Charger dashboard selon rôle ---
function loadRolePage(role) {
  if(role === 'admin'){
    import('./pages/admin.js');
  } else {
    import('./pages/user.js');
  }
}
y