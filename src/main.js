import './style.css'

document.querySelector('#app').innerHTML = `
<div class="bg-[url('/src/image/FondEcran.jpg')] bg-center bg-no-repeat bg-cover h-screen w-screen relative before:absolute before:inset-0 before:bg-black/40 before:z-0">
  <div class="relative z-10 flex flex-col items-center justify-center h-full text-white">
    <h1 class="text-8xl font-bold mb-2">LOGIN</h1>
    <h2 class="text-4xl font-bold mb-6">Paiement en ligne !</h2>
    <form id="formulaireConnexion" class="flex flex-col gap-3">
      <input id="identifiant" class="input" type="email" placeholder="Adresse mail" required>
      <input id="motdepasse" class="input" type="password" placeholder="Mot de passe" required>
      <button class="btn mt-8" type="submit">Connexion</button>
      <button class="btn">Inscription</button>
    </form>

    <div id="message" class="mt-4 text-red-400"></div>

  </div>
</div>
`;


// --- utilisateurs simulés pour test ---
const users = [
  { email: "admin@example.com", password: "1234", role: "admin" },
  { email: "user@example.com", password: "1234", role: "user" }
];

// --- fonction pour charger le script correspondant au rôle ---
function loadRoleScript(role) {
  const prev = document.getElementById('role-script');
  if (prev) prev.remove();

  const script = document.createElement('script');
  script.id = 'role-script';
  script.src = role === 'admin' ? '/src/pages/admin.js' : '/src/pages/user.js';
  script.defer = true;
  document.body.appendChild(script);
}

// --- récupération des éléments ---
const form = document.getElementById("formulaireConnexion");
const message = document.getElementById("message");



// ------ Gestion de la connexion ------

form.addEventListener("submit", function(e){
  e.preventDefault();
  const email = document.getElementById("identifiant").value.trim();
  const password = document.getElementById("motdepasse").value.trim();

  const found = users.find(u => u.email === email && u.password === password);

  if(found){
    localStorage.setItem("role", found.role);
    localStorage.setItem("email", found.email);

    message.style.color = 'lightgreen';
    message.textContent = `Bienvenue ${found.role} ! Chargement...`;

    setTimeout(() => loadRoleScript(found.role), 250);
  } else {
    message.style.color = 'tomato';
    message.textContent = "Email ou mot de passe incorrect.";
  }
});