(function seedTestData() {
  if (!localStorage.getItem("payments")) {
    const sample = [
      {
        id: 1,
        date: "2025-02-01",
        amount: 19.99,
        cardNumber: "1234567812345678",
        exp: "04/27",
        message: "<b>Merci pour votre service</b> 💳",
      },
      {
        id: 2,
        date: "2025-02-10",
        amount: 9.99,
        cardNumber: "4444333322221111",
        exp: "11/26",
        message: "<i>Paiement pour abonnement</i>",
      },
      {
        id: 3,
        date: "2025-03-02",
        amount: 29.99,
        cardNumber: "5555444433332222",
        exp: "08/28",
        message: "",
      }
    ];

    localStorage.setItem("payments", JSON.stringify(sample));
  }
})();
