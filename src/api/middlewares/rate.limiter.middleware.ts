import rateLimit from 'express-rate-limit';

// Ce limiteur est destiné aux sections sensibles comme la connexion et l'inscription.
export const authLimiter = rateLimit({
windowMs: 15 * 60 * 1000, // Durée de limitation : 15 minutes
max: 20, // Chaque adresse IP peut envoyer un maximum de 20 requêtes en 15 minutes
message: {
success: false,

message: "Trop de tentatives. Veuillez réessayer après 15 minutes." // Message en français pour le jury
},
standardHeaders: true, // Renvoie les informations de limite dans l'en-tête de réponse
legacyHeaders: false, // Désactive les en-têtes anciens et obsolètes
});