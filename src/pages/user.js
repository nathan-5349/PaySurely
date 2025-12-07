(function() {

  async function initUserPage() {

    async function loadCards() {
      try {
        const res = await fetch('http://localhost:4000/api/cards', {
          headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
        });
        if (!res.ok) throw new Error('Impossible de charger les cartes');
        const data = await res.json();
        return data.data.cards || [];
      } catch (err) {
        console.error(err);
        return [];
      }
    }

    async function loadPayments() {
      try {
        const res = await fetch('http://localhost:4000/api/transactions', {
          headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
        });
        if (!res.ok) throw new Error('Impossible de charger les paiements');
        const data = await res.json();
        return data.data.transactions || [];
      } catch (err) {
        console.error(err);
        return [];
      }
    }

    function maskCard(num) {
      if (!num || num.length < 16) return "Carte invalide";
      return num.substring(0,4) + " **** **** " + num.substring(12);
    }

    function setupLogout() {
      const btnLogout = document.getElementById('btnLogout');
      btnLogout.addEventListener('click', () => {
        localStorage.removeItem('role');
        localStorage.removeItem('email');
        window.location.href = 'index.html';
      });
    }

    function renderPayments(payments) {
      const container = document.getElementById('paymentList');
      if (!container) return;
      container.innerHTML = payments.length === 0 
        ? `<p class="text-gray-600">Aucun paiement enregistré.</p>` 
        : payments.map((p, i) => `
            <div class="p-4 border rounded-lg shadow-sm bg-gray-50 flex justify-between items-start">
              <div>
                <p><strong>Montant :</strong> ${p.amount} €</p>
                <p><strong>Date :</strong> ${p.transactionDate}</p>
                <p><strong>Carte :</strong> ${maskCard(p.cardNumber || p.cardId)}</p>
                <p><strong>Expiration :</strong> ${p.expirationDate || 'N/A'}</p>
              </div>
              <div class="flex flex-col gap-2">
                <button class="px-3 py-1 bg-gray-800 text-white rounded btnViewMessage" data-index="${i}">
                  Voir message
                </button>
              </div>
            </div>
          `).join('');
    }

    function setupModal(payments) {
      const modal = document.getElementById("modalMessage");
      const modalContent = document.getElementById("modalContent");
      const closeBtn = document.getElementById("btnCloseModal");
      closeBtn.addEventListener('click', () => modal.classList.add("hidden"));

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

    const payments = await loadPayments();
    const cards = await loadCards();

    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="bg-[url('/src/image/FondEcran.jpg')] bg-center bg-no-repeat bg-cover min-h-screen w-screen relative before:absolute before:inset-0 before:bg-black/40 flex items-center justify-center">
        <div id="mainContainer" class="bg-white p-8 rounded-xl shadow-md w-full max-w-5xl relative z-10 mx-auto">
          
          <h1 class="text-2xl font-bold mb-3 text-center">Espace Utilisateur</h1>
          <p class="mb-6 text-center">Bonjour <strong>${localStorage.getItem('email') || 'Utilisateur'}</strong></p>
          
          <div class="flex justify-center gap-3 mb-6">
            <button id="btnNewPaymentSidebar" class="px-4 py-2 bg-blue-500 text-white rounded">Nouveau paiement</button>
            <button id="btnNewCardSidebar" class="px-4 py-2 bg-green-500 text-white rounded">Nouvelle carte</button>
            <button id="btnLogout" class="px-4 py-2 bg-red-500 text-white rounded">Se déconnecter</button>
          </div>

          <!-- Historique des paiements -->
          <div id="paymentHistory" class="p-4 border rounded bg-gray-50">
            <h2 class="text-xl font-semibold mb-4">Historique des paiements</h2>
            <div id="paymentList" class="flex flex-col gap-4"></div>
          </div>

          <!-- Modal popup -->
          <div id="modalMessage" class="fixed inset-0 bg-black bg-opacity-40 hidden items-center justify-center z-20">
            <div class="bg-white p-6 rounded-lg max-w-lg shadow-xl relative">
              <h3 class="text-xl font-semibold mb-4">Message du paiement</h3>
              <div id="modalContent" class="border p-3 rounded bg-gray-50"></div>
              <div class="text-right mt-4">
                <button id="btnCloseModal" class="px-4 py-2 bg-blue-500 text-white rounded">Fermer</button>
              </div>
            </div>
          </div>

          <!-- Sidebar paiement -->
          <div id="paymentSidebar" class="fixed top-0 right-0 h-full w-96 bg-white shadow-lg p-6 z-20 transform translate-x-full transition-transform">
            <h2 class="text-xl font-semibold mb-4">Paiement</h2>
            <form id="newPaymentForm" class="flex flex-col gap-3">
              <input type="number" placeholder="Montant (€)" id="paymentAmount" required class="input p-2 border rounded"/>
              <select id="paymentCard" class="input p-2 border rounded" required>
                <option value="">Sélectionner une carte</option>
                ${cards.map(c => `<option value="${c.uuid}">${maskCard(c.numberCard)} - Exp: ${c.expirationDate}</option>`).join('')}
              </select>
              <textarea placeholder="Message (HTML autorisé)" id="paymentMessage" class="input p-2 border rounded"></textarea>
              <div class="flex gap-3 mt-2">
                <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded">Ajouter le paiement</button>
                <button type="button" id="btnClosePayment" class="px-4 py-2 bg-red-500 text-white rounded">Fermer</button>
              </div>
            </form>
          </div>

          <!-- Sidebar carte -->
          <div id="cardSidebar" class="fixed top-0 right-0 h-full w-96 bg-white shadow-lg p-6 z-20 transform translate-x-full transition-transform">
            <h2 class="text-xl font-semibold mb-4">Nouvelle carte</h2>
            <form id="newCardForm" class="flex flex-col gap-3">
              <input type="text" placeholder="Numéro de carte (16 chiffres)" id="cardNumber" required class="input p-2 border rounded"/>
              <input type="text" placeholder="Date d'expiration (MM/AA)" id="cardExp" required class="input p-2 border rounded"/>
              <div class="flex gap-3 mt-2">
                <button type="submit" class="px-4 py-2 bg-green-500 text-white rounded">Créer la carte</button>
                <button type="button" id="btnCloseCard" class="px-4 py-2 bg-red-500 text-white rounded">Fermer</button>
              </div>
            </form>
          </div>

        </div>
      </div>
    `;

    renderPayments(payments);
    setupModal(payments);
    setupLogout();

    // --- Gestion ouverture/fermeture sidebar ---
    const paymentSidebar = document.getElementById('paymentSidebar');
    const cardSidebar = document.getElementById('cardSidebar');

    document.getElementById('btnNewPaymentSidebar').addEventListener('click', () => {
      paymentSidebar.classList.remove('translate-x-full');
    });
    document.getElementById('btnClosePayment').addEventListener('click', () => {
      paymentSidebar.classList.add('translate-x-full');
    });

    document.getElementById('btnNewCardSidebar').addEventListener('click', () => {
      cardSidebar.classList.remove('translate-x-full');
    });
    document.getElementById('btnCloseCard').addEventListener('click', () => {
      cardSidebar.classList.add('translate-x-full');
    });

    // --- Formulaire paiement ---
    const formPayment = document.getElementById('newPaymentForm');
    formPayment.addEventListener('submit', async e => {
      e.preventDefault();
      const amount = parseFloat(document.getElementById('paymentAmount').value);
      const cardId = document.getElementById('paymentCard').value;
      const message = document.getElementById('paymentMessage').value;

      try {
        const res = await fetch('http://localhost:4000/api/transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
          },
          body: JSON.stringify({ amount, cardId, message })
        });

        if(!res.ok) {
          const errData = await res.json();
          alert(errData.error?.message || 'Erreur lors du paiement');
          return;
        }

        const updatedPayments = await loadPayments();
        renderPayments(updatedPayments);
        setupModal(updatedPayments);
        paymentSidebar.classList.add('translate-x-full');
        alert('Paiement ajouté avec succès !');

      } catch(err) {
        console.error(err);
        alert('Erreur serveur ou réseau');
      }
    });

// --- Formulaire création carte ---
const formCard = document.getElementById('newCardForm');
formCard.addEventListener('submit', async e => {
  e.preventDefault();

  const cardNumber = document.getElementById('cardNumber').value.trim();
  const expDate = document.getElementById('cardExp').value.trim();

  if(cardNumber.length !== 16 || !/^\d+$/.test(cardNumber)){
    alert("Numéro de carte invalide (16 chiffres requis)");
    return;
  }

  const firstNumbers = parseInt(cardNumber.substring(0,4), 10);
  const lastNumbers = parseInt(cardNumber.slice(-4), 10);

  try {
    const res = await fetch('http://localhost:4000/api/cards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify({ numberCard: cardNumber, firstNumbers, lastNumbers, expirationDate: expDate })
    });

    if(!res.ok){
      const errData = await res.json();
      alert(errData.error?.message || 'Erreur lors de la création de la carte');
      return;
    }

    const updatedCards = await loadCards();
    const select = document.getElementById('paymentCard');
    select.innerHTML = updatedCards.map(c =>
      `<option value="${c.uuid}">${maskCard(c.numberCard)} - Exp: ${c.expirationDate}</option>`
    ).join('');

    alert('Carte créée avec succès !');
    cardSidebar.classList.add('translate-x-full');

  } catch(err){
    console.error(err);
    alert('Erreur serveur ou réseau');
  }
});


  }
 initUserPage();

})();
