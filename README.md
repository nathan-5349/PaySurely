# PaySurely


    Chaque paiement doit être authentifié : un compte est obligatoire, le mot de passe utilisé doit être fort.
    Chaque paiement est enregistré avec son montant, la date, et la carte de crédit utilisée, pour un utilisateur
    Chaque utilisateur peut retrouver sa liste de paiement, avec le montant et les 4 premiers numéros de la carte ainsi que les 4 derniers, et la date d'expiration.
    Un administrateur peut retrouver la liste de tous les paiements, avec le montant et les 4 derniers numéros de la carte utilisée, la date d'expiration.
    Un administrateur peut réaliser, à partir d'une carte, un remboursement. Le remboursement est limité au montant total bien sûr.
    Les informations de la carte sont très sensibles.
    A noter qu'on a besoin de tous les numéros de la carte, de la date d'expiration et du CVV pour effectuer concrètement un paiement. En revanche, un numéro d'identification du paiement est suffisant pour générer un remboursement sur la transaction.
    Un utilisateur peut envoyer un message avec son paiement. Ce message doit laisser à l'utilisateur la possibilité de mettre en forme : gras, italique, couleurs, etc.
    Les messages pourront être consultés par un administrateur