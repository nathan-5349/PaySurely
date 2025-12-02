(function(){
  const role = localStorage.getItem('role');
  if(role !== 'user'){
    alert('Accès utilisateur requis. Retour au login.');
    window.location.href = 'index.html';
    return;
  }
  
  let payments = JSON.parse(localStorage.getItem("payments") || "[]");

  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="bg-[url('/src/image/FondEcran.jpg')] bg-center bg-no-repeat bg-cover min-h-screen w-screen relative before:absolute before:inset-0 before:bg-black/40 flex items-center justify-center">
      
      <!-- Conteneur principal -->
      <div id="mainContainer" class="bg-white p-8 rounded-xl shadow-md w-full max-w-5xl relative z-10 mx-auto">
        
        <h1 class="text-2xl font-bold mb-3 text-center">Espace Utilisateur</h1>
        <p class="mb-6 text-center">Bonjour <strong>${localStorage.getItem('email') || 'Utilisateur'}</strong></p>
        
        <div class="flex justify-center gap-3 mb-6">
          <button id="btnNewPay" class="px-4 py-2 bg-blue-500 text-white rounded">Nouveau paiement</button>
          <button id="btnLogout" class="px-4 py-2 bg-red-500 text-white rounded">Se déconnecter</button>
        </div>
        
        <!-- Historique des paiements -->
        <div id="paymentHistory" class="p-4 border rounded bg-gray-50">
          <h2 class="text-xl font-semibold mb-4">Historique des paiements</h2>
          <div id="paymentList" class="flex flex-col gap-4">
            ${
              payments.length === 0
                ? `<p class="text-gray-600">Aucun paiement enregistré.</p>`
                : payments.map((p, i) => `
                    <div class="p-4 border rounded-lg shadow-sm bg-gray-50 flex justify-between items-start">
                      <div>
                        <p><strong>Montant :</strong> ${p.amount} €</p>
                        <p><strong>Date :</strong> ${p.date}</p>
                        <p><strong>Carte :</strong> ${maskCard(p.cardNumber)}</p>
                        <p><strong>Expiration :</strong> ${p.exp}</p>
                      </div>
                      <div class="flex flex-col gap-2">
                        <button class="px-3 py-1 bg-gray-800 text-white rounded btnViewMessage" data-index="${i}">
                          Voir message
                        </button>
                      </div>
                    </div>
                  `).join('')
            }
          </div>
        </div>

        <!-- Modal popup -->
        <div id="modalMessage" class="fixed inset-0 bg-black bg-opacity-40 hidden items-center justify-center z-20">
          <div class="bg-white p-6 rounded-lg max-w-lg shadow-xl relative">
            <h3 class="text-xl font-semibold mb-4">Message du paiement</h3>
            <div id="modalContent" class="border p-3 rounded bg-gray-50"></div>
            <div class="text-right mt-4">
              <button id="btnCloseModal" class="px-4 py-2 bg-blue-500 text-white rounded">
                Fermer
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  `;

  function maskCard(num) {
    if(!num || num.length < 16) return "Carte invalide";
    return num.substring(0,4) + " **** **** " + num.substring(12);
  }

  // Logout
  document.getElementById('btnLogout').addEventListener('click', () => {
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    window.location.href = 'index.html';
  });

  // Modal
  const modal = document.getElementById("modalMessage");
  const modalContent = document.getElementById("modalContent");
  const closeBtn = document.getElementById("btnCloseModal");
  closeBtn.addEventListener('click', () => {
    modal.classList.add("hidden");
  });

  function attachViewMessageButtons() {
    document.querySelectorAll('.btnViewMessage').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = btn.dataset.index;
        const msg = payments[index].message || "<em>Aucun message</em>";
        modalContent.innerHTML = msg;
        modal.classList.remove("hidden");
        modal.classList.add("flex");
      });
    });
  }

  attachViewMessageButtons();

  // Gestion du formulaire "Nouveau paiement" dans un sidebar séparé
  const btnNewPay = document.getElementById('btnNewPay');

  const paymentFormHTML = `
    <div id="paymentSidebar" class="fixed top-0 right-0 h-full w-96 bg-white shadow-lg p-6 z-20 transform translate-x-full transition-transform">
      <h2 class="text-xl font-semibold mb-4">Paiement</h2>
      <form id="newPaymentForm" class="flex flex-col gap-3">
        <input type="number" placeholder="Montant (€)" id="paymentAmount" required class="input p-2 border rounded"/>
        <input type="text" placeholder="Numéro de carte" id="cardNumber" required class="input p-2 border rounded"/>
        <input type="text" placeholder="Expiration (MM/AA)" id="cardExp" required class="input p-2 border rounded"/>
        <textarea placeholder="Message" id="paymentMessage" class="input p-2 border rounded"></textarea>
        <div class="flex gap-3 mt-2">
          <button type="submit" class="px-4 py-2 bg-green-500 text-white rounded">Ajouter le paiement</button>
          <button type="button" id="btnCancelPayment" class="px-4 py-2 bg-red-500 text-white rounded">Fermer</button>
        </div>
      </form>
    </div>
  `;

  btnNewPay.addEventListener('click', () => {
    if (!document.getElementById('paymentSidebar')) {
      document.body.insertAdjacentHTML('beforeend', paymentFormHTML);

      // Afficher le sidebar
      const sidebar = document.getElementById('paymentSidebar');
      requestAnimationFrame(() => {
        sidebar.classList.remove('translate-x-full');
      });

      // Fermer le sidebar
      document.getElementById('btnCancelPayment').addEventListener('click', () => {
        sidebar.classList.add('translate-x-full');
        sidebar.addEventListener('transitionend', () => sidebar.remove(), { once: true });
      });

      // Soumettre le formulaire
      document.getElementById('newPaymentForm').addEventListener('submit', e => {
        e.preventDefault();
        const amount = document.getElementById('paymentAmount').value;
        const card = document.getElementById('cardNumber').value;
        const exp = document.getElementById('cardExp').value;
        const message = document.getElementById('paymentMessage').value;

        if (!amount || !card || !exp) {
          alert('Veuillez remplir tous les champs obligatoires.');
          return;
        }

        payments.push({
          id: payments.length + 1,
          amount,
          cardNumber: card,
          exp,
          message,
          date: new Date().toISOString().split('T')[0]
        });
        localStorage.setItem('payments', JSON.stringify(payments));

        updatePaymentList();

        // Fermer le sidebar après ajout
        sidebar.classList.add('translate-x-full');
        sidebar.addEventListener('transitionend', () => sidebar.remove(), { once: true });
      });
    }
  });

  // Rafraîchir l'historique après ajout
  function updatePaymentList() {
    const paymentList = document.getElementById('paymentList');
    paymentList.innerHTML = payments.map((p, i) => `
      <div class="p-4 border rounded-lg shadow-sm bg-gray-50 flex justify-between items-start">
        <div>
          <p><strong>Montant :</strong> ${p.amount} €</p>
          <p><strong>Date :</strong> ${p.date}</p>
          <p><strong>Carte :</strong> ${maskCard(p.cardNumber)}</p>
          <p><strong>Expiration :</strong> ${p.exp}</p>
        </div>
        <div class="flex flex-col gap-2">
          <button class="px-3 py-1 bg-gray-800 text-white rounded btnViewMessage" data-index="${i}">
            Voir message
          </button>
        </div>
      </div>
    `).join('');
    attachViewMessageButtons();
  }

})();