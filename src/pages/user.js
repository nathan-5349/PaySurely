(function () {

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

    function formatDate(d) {
      if (!d) return "N/A";
      return new Date(d).toLocaleString("fr-FR", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit"
      });
    }

    function maskCardDisplay(card) {
      if (!card) return "Carte invalide";
      if (card.numberCard && card.numberCard.length === 16) {
        return `${card.numberCard.substring(0, 4)} **** **** ${card.numberCard.substring(12)}`;
      }
      if (card.firstNumbers && card.lastNumbers) {
        return `${card.firstNumbers} **** **** ${card.lastNumbers}`;
      }
      return "Carte invalide";
    }

    function setupLogout() {
      const btnLogout = document.getElementById('btnLogout');
      btnLogout?.addEventListener('click', () => {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = 'index.html';
      });
    }

    function sanitizeHTML(str) {
      return str.replace(/<script.*?>.*?<\/script>/gi, '');
    }

    function renderPayments(payments, cards) {
      const container = document.getElementById('paymentList');
      if (!container) return;

      if (payments.length === 0) {
        container.innerHTML = `<p class="text-gray-600">Aucun paiement enregistré.</p>`;
        return;
      }

      container.innerHTML = payments.map((p, i) => {
        const card = cards.find(c => c.uuid === p.cardId);
        const safeMsg = sanitizeHTML(p.message || '');
        return `
          <div class="p-4 border rounded-lg shadow-sm bg-gray-50 flex justify-between items-start">
            <div>
              <p><strong>Montant :</strong> ${p.amount} €</p>
              <p><strong>Date :</strong> ${formatDate(p.transactionDate)}</p>
              <p><strong>Carte :</strong> ${maskCardDisplay(card)}</p>
              <p><strong>Expiration :</strong> ${card?.expirationDate || 'N/A'}</p>
              <p><strong>Message :</strong> ${safeMsg || 'Aucun'}</p>
              <p><strong>Statut :</strong> ${p.isRefunded ? 'Remboursé' : 'Non remboursé'}</p>
            </div>
            <div class="flex flex-col gap-2">
              <button class="px-3 py-1 bg-gray-800 text-white rounded btnViewMessage" data-index="${i}">
                Voir message
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    function setupModal(payments) {
      const modal = document.getElementById("modalMessage");
      const modalContent = document.getElementById("modalContent");
      const closeBtn = document.getElementById("btnCloseModal");

      closeBtn?.addEventListener('click', () => modal.classList.add("hidden"));

      document.querySelectorAll('.btnViewMessage').forEach(btn => {
        btn.addEventListener('click', () => {
          const index = btn.dataset.index;
          const safeMsg = sanitizeHTML(payments[index].message || '');
          modalContent.innerHTML = safeMsg || "<em>Aucun message</em>";
          modal.classList.remove("hidden");
          modal.classList.add("flex");
        });
      });
    }

    const cards = await loadCards();
    const payments = await loadPayments();
    const app = document.getElementById('app');

    app.innerHTML = `
      <div class="bg-[url('/src/image/FondEcran.jpg')] bg-center bg-no-repeat bg-cover min-h-screen w-screen relative before:absolute before:inset-0 before:bg-black/40 flex items-center justify-center">
        <div id="mainContainer" class="bg-white p-8 rounded-xl shadow-md w-full max-w-5xl relative z-10 mx-auto">

          <h1 class="text-2xl font-bold mb-3 text-center">Espace Utilisateur</h1>
          <p class="mb-6 text-center">Bonjour <strong>${localStorage.getItem('username') || 'Utilisateur'}</strong></p>

          <div class="flex justify-center gap-3 mb-6">
            <button id="btnNewPaymentSidebar" class="px-4 py-2 bg-blue-500 text-white rounded">Nouveau paiement</button>
            <button id="btnNewCardSidebar" class="px-4 py-2 bg-green-500 text-white rounded">Nouvelle carte</button>
            <button id="btnLogout" class="px-4 py-2 bg-red-500 text-white rounded">Se déconnecter</button>
          </div>

          <div id="paymentHistory" class="p-4 border rounded bg-gray-50">
            <h2 class="text-xl font-semibold mb-4">Historique des paiements</h2>
            <div id="paymentList" class="flex flex-col gap-4"></div>
          </div>

          <div id="modalMessage" class="fixed inset-0 bg-black bg-opacity-40 hidden items-center justify-center z-20">
            <div class="bg-white p-6 rounded-lg max-w-lg shadow-xl relative">
              <h3 class="text-xl font-semibold mb-4">Message du paiement</h3>
              <div id="modalContent" class="border p-3 rounded bg-gray-50"></div>
              <div class="text-right mt-4">
                <button id="btnCloseModal" class="px-4 py-2 bg-blue-500 text-white rounded">Fermer</button>
              </div>
            </div>
          </div>

          <!-- Sidebar Paiement -->
          <div id="paymentSidebar" class="fixed top-0 right-0 h-full w-96 bg-white shadow-lg p-6 z-20 transform translate-x-full transition-transform">
            <h2 class="text-xl font-semibold mb-2">Nouveau Paiement</h2>
            <div class="flex gap-1 mb-2">
              <button class="format-btn px-2 py-1 bg-gray-200 rounded" data-tag="strong">Gras</button>
              <button class="format-btn px-2 py-1 bg-gray-200 rounded" data-tag="em">Italique</button>
              <button class="format-btn px-2 py-1 bg-red-500 text-white rounded" data-tag="span" data-style="color:red">Rouge</button>
              <button class="format-btn px-2 py-1 bg-blue-500 text-white rounded" data-tag="span" data-style="color:blue">Bleu</button>
            </div>
            <div id="paymentMessage" contenteditable="true" class="input p-2 border rounded h-24 overflow-y-auto whitespace-pre-wrap break-words mb-3"></div>
            
            <form id="newPaymentForm" class="flex flex-col gap-3">
              <input type="number" placeholder="Montant (€)" id="paymentAmount" required class="input p-2 border rounded"/>
              
              <select id="paymentCard" class="input p-2 border rounded" required>
                <option value="">Sélectionner une carte</option>
                ${cards.map(c => `<option value="${c.uuid}">${maskCardDisplay(c)} - Exp: ${c.expirationDate}</option>`).join('')}
              </select>

              <!-- Champ CVV à part -->
              <div id="cvvContainer" class="mt-3 hidden">
                <input type="text" maxlength="4" placeholder="CVV (3 ou 4 chiffres)" id="cvvInput" class="input p-2 border rounded w-full" required />
                <p class="text-xs text-gray-500 mt-1">Code au dos de votre carte</p>
              </div>

              <div class="flex gap-3 mt-4">
                <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded">Payer</button>
                <button type="button" id="btnClosePayment" class="px-4 py-2 bg-red-500 text-white rounded">Fermer</button>
              </div>
            </form>
          </div>

          <!-- Sidebar Nouvelle Carte -->
          <div id="cardSidebar" class="fixed top-0 right-0 h-full w-96 bg-white shadow-lg p-6 z-20 transform translate-x-full transition-transform">
            <h2 class="text-xl font-semibold mb-4">Nouvelle carte</h2>
            <form id="newCardForm" class="flex flex-col gap-3">
              <input type="text" placeholder="Numéro de carte (16 chiffres)" id="cardNumber" maxlength="16" required class="input p-2 border rounded"/>
              <input type="text" placeholder="Date d'expiration (MM/AA)" id="cardExp" required class="input p-2 border rounded"/>
              <input type="text" maxlength="4" placeholder="CVV (3 ou 4 chiffres)" id="cardCvv" required class="input p-2 border rounded mt-2"/>
              <div class="flex gap-3 mt-4">
                <button type="submit" class="px-4 py-2 bg-green-500 text-white rounded">Créer la carte</button>
                <button type="button" id="btnCloseCard" class="px-4 py-2 bg-red-500 text-white rounded">Fermer</button>
              </div>
            </form>
          </div>

        </div>
      </div>
    `;

    renderPayments(payments, cards);
    setupModal(payments);
    setupLogout();

    const paymentSidebar = document.getElementById('paymentSidebar');
    const cardSidebar = document.getElementById('cardSidebar');

    document.getElementById('btnNewPaymentSidebar')?.addEventListener('click', () => paymentSidebar.classList.remove('translate-x-full'));
    document.getElementById('btnClosePayment')?.addEventListener('click', () => paymentSidebar.classList.add('translate-x-full'));
    document.getElementById('btnNewCardSidebar')?.addEventListener('click', () => cardSidebar.classList.remove('translate-x-full'));
    document.getElementById('btnCloseCard')?.addEventListener('click', () => cardSidebar.classList.add('translate-x-full'));

    // Formatage texte
    document.querySelectorAll('.format-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tag = btn.dataset.tag;
        const style = btn.dataset.style || '';
        if (tag === 'strong') document.execCommand('bold');
        else if (tag === 'em') document.execCommand('italic');
        else if (style.includes('color:')) document.execCommand('foreColor', false, style.split(':')[1]);
      });
    });

    // === CRÉATION DE CARTE + CVV CHIFFRÉ ===
    document.getElementById('newCardForm')?.addEventListener('submit', async e => {
      e.preventDefault();

      const cardNumber = document.getElementById('cardNumber').value.trim();
      const expDate = document.getElementById('cardExp').value.trim();
      const cvv = document.getElementById('cardCvv').value.trim();

      if (!/^\d{16}$/.test(cardNumber)) return alert("Numéro de carte : 16 chiffres requis");
      if (!/^\d{2}\/\d{2}$/.test(expDate)) return alert("Format : MM/AA");
      if (!/^\d{3,4}$/.test(cvv)) return alert("CVV : 3 ou 4 chiffres");

      const firstNumbers = cardNumber.substring(0, 4);
      const lastNumbers = cardNumber.slice(-4);

      try {
        const res = await fetch('http://localhost:4000/api/cards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token') },
          body: JSON.stringify({ numberCard: cardNumber, firstNumbers, lastNumbers, expirationDate: expDate })
        });

        if (!res.ok) {
          const err = await res.json();
          return alert(err.error?.message || "Erreur création carte");
        }

        const data = await res.json();
        const cardUuid = data.data.card.uuid;

        const vault = JSON.parse(localStorage.getItem('cvvVault') || '{}');
        vault[cardUuid] = btoa(cvv);
        localStorage.setItem('cvvVault', JSON.stringify(vault));

        const updatedCards = await loadCards();
        document.getElementById('paymentCard').innerHTML = '<option value="">Sélectionner une carte</option>' +
          updatedCards.map(c => `<option value="${c.uuid}">${maskCardDisplay(c)} - Exp: ${c.expirationDate}</option>`).join('');

        alert("Carte ajoutée ! CVV protégé.");
        cardSidebar.classList.add('translate-x-full');
        e.target.reset();

      } catch (err) {
        alert("Erreur serveur");
      }
    });

    // === PAIEMENT AVEC CHAMP CVV À PART ===
    document.getElementById('newPaymentForm')?.addEventListener('submit', async e => {
      e.preventDefault();

      const amount = parseFloat(document.getElementById('paymentAmount').value);
      const cardId = document.getElementById('paymentCard').value;
      const message = document.getElementById('paymentMessage').innerHTML.trim();
      const cvvInput = document.getElementById('cvvInput').value.trim();

      if (!amount || amount <= 0) return alert("Montant invalide");
      if (!cardId) return alert("Sélectionnez une carte");
      if (!cvvInput || !/^\d{3,4}$/.test(cvvInput)) return alert("CVV invalide (3 ou 4 chiffres)");

      const vault = JSON.parse(localStorage.getItem('cvvVault') || '{}');
      const savedCvv = vault[cardId] ? atob(vault[cardId]) : null;

      if (cvvInput !== savedCvv) {
        alert("CVV incorrect – Paiement refusé !");
        document.getElementById('cvvInput').value = '';
        document.getElementById('cvvInput').focus();
        return;
      }

      try {
        const res = await fetch('http://localhost:4000/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token') },
          body: JSON.stringify({ amount, cardId, message })
        });

        if (res.ok) {
          alert("Paiement accepté !");
          const updatedPayments = await loadPayments();
          renderPayments(updatedPayments, cards);
          setupModal(updatedPayments);
          paymentSidebar.classList.add('translate-x-full');
          document.getElementById('paymentMessage').innerHTML = '';
          document.getElementById('paymentAmount').value = '';
          document.getElementById('cvvContainer').classList.add('hidden');
          document.getElementById('cvvInput').value = '';
        } else {
          const err = await res.json();
          alert(err.error?.message || "Paiement refusé");
        }
      } catch (err) {
        alert("Erreur réseau");
      }
    });

    // Affiche le champ CVV quand une carte est sélectionnée
    document.getElementById('paymentCard')?.addEventListener('change', function () {
      const cvvContainer = document.getElementById('cvvContainer');
      if (this.value) {
        cvvContainer.classList.remove('hidden');
        setTimeout(() => document.getElementById('cvvInput').focus(), 100);
      } else {
        cvvContainer.classList.add('hidden');
      }
    });

  }

  initUserPage();
  // Affiche/masque le champ CVV quand on choisit une carte
  document.getElementById('paymentCard')?.addEventListener('change', function () {
    const cvvContainer = document.getElementById('cvvContainer');
    if (this.value) {
      cvvContainer.classList.remove('hidden');
      setTimeout(() => document.getElementById('cvvInput')?.focus(), 100);
    } else {
      cvvContainer.classList.add('hidden');
      document.getElementById('cvvInput').value = '';
    }
  });

})();