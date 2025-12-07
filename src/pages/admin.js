(function(){
  // protection : vérifier le rôle stocké
  const role = localStorage.getItem('role');
  if(role !== 'admin'){
    alert('Accès admin requis. Retour au login.');
    // recharge index.html (ou tu peux re-générer le login via JS)
    window.location.href = 'index.html';
    return;
  }

  // rendu admin
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="bg-white p-8 rounded-xl shadow-lg w-11/12 max-w-3xl text-center">
        <h1 class="text-3xl font-bold mb-4">Espace Admin</h1>
        <p class="mb-6">Bienvenue <strong>${localStorage.getItem('email') || 'Admin'}</strong></p>
        <div class="flex gap-4 justify-center">
          <button id="btnLogout" class="px-4 py-2 bg-red-500 text-white rounded">Se déconnecter</button>
          <button id="btnUsers" class="px-4 py-2 bg-blue-600 text-white rounded">Voir utilisateurs (simulé)</button>
        </div>
        <div id="adminContent" class="mt-6 text-left"></div>
      </div>
    </div>
  `;

  document.getElementById('btnLogout').addEventListener('click', () => {
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    window.location.href = 'index.html';
  });

async function loadAllPayments() {
  try {
    const res = await fetch('http://localhost:4000/api/transactions', {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    });
    if(!res.ok) throw new Error('Impossible de charger les paiements');
    const data = await res.json();
    return data.data.transactions;
  } catch(err) {
    console.error(err);
    return [];
  }
}

async function refundTransaction(txId, amount) {
  const confirmed = confirm(`Confirmer le remboursement de ${amount} € ?`);
  if (!confirmed) return;

  try {
    const res = await fetch(`http://localhost:4000/api/transactions/${txId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify({ isRefunded: true })
    });

    if(!res.ok) throw new Error('Erreur remboursement');
    alert('Remboursement effectué !');
    loadAllPayments(); // rafraîchir
  } catch(err) {
    console.error(err);
    alert('Erreur lors du remboursement');
  }
}


})();