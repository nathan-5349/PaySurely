(async function() {
  const role = localStorage.getItem('role');
  if (role !== 'admin') {
    alert('Accès admin requis. Retour au login.');
    window.location.href = 'index.html';
    return;
  }

  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="bg-white p-8 rounded-xl shadow-lg w-11/12 max-w-4xl text-center">
        <h1 class="text-3xl font-bold mb-4">Espace Admin</h1>
        <p class="mb-6">Bienvenue <strong>${localStorage.getItem('email') || 'Admin'}</strong></p>
        <div class="flex gap-4 justify-center mb-6">
          <button id="btnLogout" class="px-4 py-2 bg-red-500 text-white rounded">Se déconnecter</button>
        </div>
        <div id="adminContent" class="text-left"></div>
      </div>

      <!-- Modal message -->
      <div id="modalMessage" class="fixed inset-0 bg-black bg-opacity-40 hidden items-center justify-center z-20">
        <div class="bg-white p-6 rounded-lg max-w-lg shadow-xl relative">
          <h3 class="text-xl font-semibold mb-4">Message du paiement</h3>
          <div id="modalContent" class="border p-3 rounded bg-gray-50"></div>
          <div class="text-right mt-4">
            <button id="btnCloseModal" class="px-4 py-2 bg-blue-500 text-white rounded">Fermer</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btnLogout').addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'index.html';
  });

  const modal = document.getElementById('modalMessage');
  const modalContent = document.getElementById('modalContent');
  document.getElementById('btnCloseModal').addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  async function loadAllPayments() {
    try {
      const res = await fetch('http://localhost:4000/api/transactions', {
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
      });
      if(!res.ok) throw new Error('Impossible de charger les paiements');
      const data = await res.json();
      return data.data.transactions || [];
    } catch(err) {
      console.error(err);
      return [];
    }
  }

  async function renderPayments() {
    const payments = await loadAllPayments();
    const container = document.getElementById('adminContent');

    if(payments.length === 0){
      container.innerHTML = '<p>Aucun paiement.</p>';
      return;
    }

    container.innerHTML = '';

    for (const p of payments) {
      let last4 = '••••';
      let exp = '??/??';

      if (p.cardId) {
        try {
          const res = await fetch(`http://localhost:4000/api/cards/${p.cardId}`, {
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
          });
          if (res.ok) {
            const data = await res.json();
            const card = data.data.card;
            last4 = card.lastNumbers || card.firstNumbers || '••••';
            exp = card.expirationDate || '??/??';
          }
        } catch (e) {
          console.log('Carte non trouvée pour ce paiement');
        }
      }

      const div = document.createElement('div');
      div.className = 'p-4 border rounded mb-2 flex justify-between items-start bg-gray-50';
      div.innerHTML = `
        <div>
          <p><strong>Montant:</strong> ${p.amount} €</p>
          <p><strong>Date:</strong> ${new Date(p.transactionDate).toLocaleString()}</p>
          <p><strong>Carte:</strong> **** **** **** ${last4}</p>
          <p><strong>Expiration:</strong> ${exp}</p>
          <p><strong>Message:</strong> ${p.message ? p.message.substring(0, 30) + (p.message.length>30?'...':'') : 'Aucun'}</p>
          <p><strong>Status:</strong> ${p.isRefunded ? 'Remboursé' : 'Non remboursé'}</p>
        </div>
        <div class="flex flex-col gap-2">
          <button class="px-3 py-1 bg-gray-800 text-white rounded btnViewMessage">Voir message</button>
          ${!p.isRefunded ? `<button class="px-3 py-1 bg-green-600 text-white rounded btnRefund" data-uuid="${p.uuid}">Rembourser</button>` : ''}
        </div>
      `;

      div.querySelector('.btnViewMessage').addEventListener('click', () => {
        modalContent.innerHTML = (p.message || '<em>Aucun message</em>').replace(/\n/g, '<br>');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      });

      const refundBtn = div.querySelector('.btnRefund');
      if (refundBtn) {
        refundBtn.addEventListener('click', async () => {
          if(!confirm('Confirmer le remboursement ?')) return;
          try {
            const res = await fetch(`http://localhost:4000/api/transactions/${p.uuid}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
              },
              body: JSON.stringify({ isRefunded: true })
            });
            if(res.ok) {
              alert('Remboursement effectué !');
              renderPayments();
            } else {
              alert('Erreur lors du remboursement');
            }
          } catch(err) {
            alert('Erreur serveur ou réseau');
          }
        });
      }

      container.appendChild(div);
    }
  }

  renderPayments();
})();