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

  function maskCard(number) {
    if (!number || number.length < 16) return '**** **** **** ****';
    return number.substring(0,4) + ' **** **** ' + number.substring(12);
  }

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

    container.innerHTML = payments.map((p, i) => `
      <div class="p-4 border rounded mb-2 flex justify-between items-start bg-gray-50">
        <div>
          <p><strong>Montant:</strong> ${p.amount} €</p>
          <p><strong>Date:</strong> ${new Date(p.transactionDate).toLocaleString()}</p>
          <p><strong>Carte:</strong> ${maskCard(p.numberCard || p.cardNumber || '')}</p>
          <p><strong>Message:</strong> ${p.message ? p.message.substring(0, 30) + (p.message.length>30?'...':'') : 'Aucun'}</p>
          <p><strong>Status:</strong> ${p.isRefunded ? 'Remboursé' : 'Non remboursé'}</p>
        </div>
        <div class="flex flex-col gap-2">
          <button class="px-3 py-1 bg-gray-800 text-white rounded btnViewMessage" data-index="${i}">Voir message</button>
          ${!p.isRefunded ? `<button class="px-3 py-1 bg-green-600 text-white rounded btnRefund" data-uuid="${p.uuid}">Rembourser</button>` : ''}
        </div>
      </div>
    `).join('');

    // Setup modal pour voir message complet
    document.querySelectorAll('.btnViewMessage').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = btn.dataset.index;
        const msg = payments[index].message || '<em>Aucun message</em>';
        modalContent.innerHTML = msg;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      });
    });

    // Setup bouton remboursement
    document.querySelectorAll('.btnRefund').forEach(btn => {
      btn.addEventListener('click', async () => {
        const uuid = btn.dataset.uuid;
        if(!confirm('Confirmer le remboursement ?')) return;

        try {
          const res = await fetch(`http://localhost:4000/api/transactions/${uuid}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify({ isRefunded: true })
          });
          if(!res.ok) {
            const errData = await res.json();
            alert(errData.error?.message || 'Erreur lors du remboursement');
            return;
          }
          alert('Remboursement effectué !');
          renderPayments();
        } catch(err) {
          console.error(err);
          alert('Erreur serveur ou réseau');
        }
      });
    });
  }

  renderPayments();
})();
