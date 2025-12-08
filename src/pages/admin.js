(async function () {
  if (localStorage.getItem('role') !== 'admin') {
    alert('Accès admin requis. Redirection...');
    window.location.href = 'index.html';
    return;
  }

function safeHTML(str) {
  if (!str || str.trim() === '') return 'Aucun message';
  return str;
}

  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="bg-[url('/src/image/FondEcran.jpg')] bg-cover bg-center min-h-screen relative before:absolute before:inset-0 before:bg-black/40 flex items-center justify-center">
      <div class="bg-white p-8 rounded-xl shadow-lg w-11/12 max-w-4xl relative z-10 text-center">
        <h1 class="text-3xl font-bold mb-4">Espace Admin</h1>
        <p class="mb-6">Bienvenue <strong>${localStorage.getItem('username') || 'Admin'}</strong></p>
        <div class="flex gap-4 justify-center mb-6">
          <button id="btnLogout" class="px-4 py-2 bg-red-500 text-white rounded">Se déconnecter</button>
        </div>
        <div id="adminContent" class="text-left space-y-4 max-h-screen overflow-y-auto"></div>
      </div>

      <!-- Modal message complet -->
      <div id="modalMessage" class="fixed inset-0 bg-black bg-opacity-40 hidden items-center justify-center z-50">
        <div class="bg-white p-6 rounded-lg max-w-2xl w-full shadow-2xl relative max-h-screen overflow-y-auto">
          <h3 class="text-xl font-semibold mb-4">Message du paiement</h3>
          <div id="modalContent" class="border p-4 rounded bg-gray-50 min-h-48 whitespace-pre-wrap"></div>
          <div class="text-right mt-6">
            <button id="btnCloseModal" class="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Fermer</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btnLogout').addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'index.html';
  });

  document.getElementById('btnCloseModal').addEventListener('click', () => {
    document.getElementById('modalMessage').classList.add('hidden');
  });

  async function loadAllPayments() {
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

  async function renderPayments() {
    const payments = await loadAllPayments();
    const container = document.getElementById('adminContent');

    if (payments.length === 0) {
      container.innerHTML = '<p class="text-center text-gray-600 py-8">Aucun paiement enregistré.</p>';
      return;
    }

    container.innerHTML = '';

    for (const p of payments) {
      let last4 = '****';
      let exp = '??/??';

      if (p.cardId) {
        try {
          const res = await fetch(`http://localhost:4000/api/cards/${p.cardId}`, {
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
          });
          if (res.ok) {
            const data = await res.json();
            const card = data.data.card;
            last4 = String(card.lastNumbers || card.firstNumbers || '****').padStart(4, '0');
            exp = card.expirationDate || '??/??';
          }
        } catch (e) {
          console.log('Carte introuvable pour le paiement', p.uuid);
        }
      }

      const div = document.createElement('div');
      div.className = 'p-5 border rounded-lg bg-gray-50 shadow-sm flex justify-between items-start hover:shadow-md transition-shadow';

      // MESSAGE COMPLET AVEC MISE EN FORME
      const fullMessage = p.message ? safeHTML(p.message) : 'Aucun message';

      div.innerHTML = `
        <div class="flex-1">
          <p><strong>Montant :</strong> ${Number(p.amount).toFixed(2)} €</p>
          <p><strong>Date :</strong> ${new Date(p.transactionDate).toLocaleString('fr-FR')}</p>
          <p><strong>Carte :</strong> **** **** **** ${last4}</p>
          <p><strong>Exp :</strong> ${exp}</p>
          <p><strong>Message :</strong> <span class="text-sm">${fullMessage}</span></p>
          <p><strong>Statut :</strong> 
            <span class="${p.isRefunded ? 'text-green-600 font-semibold' : 'text-red-600'}">
              ${p.isRefunded ? 'Remboursé' : 'Non remboursé'}
            </span>
          </p>
        </div>
        <div class="flex flex-col gap-2 ml-4">
          <button class="px-4 py-2 bg-gray-800 text-white text-sm rounded hover:bg-gray-900 btnViewMessage">
            Voir message
          </button>
          ${!p.isRefunded
            ? `<button class="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 btnRefund" data-uuid="${p.uuid}">
                 Rembourser
               </button>`
            : ''
          }
        </div>
      `;

      div.querySelector('.btnViewMessage').addEventListener('click', () => {
        document.getElementById('modalContent').innerHTML = p.message ? safeHTML(p.message) : '<em class="text-gray-500">Aucun message</em>';
        document.getElementById('modalMessage').classList.remove('hidden');
      });

      const refundBtn = div.querySelector('.btnRefund');
      if (refundBtn) {
        refundBtn.addEventListener('click', async () => {
          if (!confirm('Confirmer le remboursement de ce paiement ?')) return;
          try {
            const res = await fetch(`http://localhost:4000/api/transactions/${p.uuid}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
              },
              body: JSON.stringify({ isRefunded: true })
            });
            if (res.ok) {
              alert('Paiement remboursé avec succès !');
              renderPayments();
            } else {
              alert('Erreur lors du remboursement');
            }
          } catch (err) {
            alert('Erreur réseau');
          }
        });
      }

      container.appendChild(div);
    }
  }

  renderPayments();
})();