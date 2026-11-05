module.exports = {
  openapi: "3.0.3",
  info: {
    title: "Concert Ticket API",
    version: "1.0.0",
    description: "API de gestion des concerts, utilisateurs et réservations.",
  },
  servers: [{ url: "http://localhost:5000", description: "Serveur local" }],
  tags: [
    { name: "Système" },
    { name: "Authentification" },
    { name: "Concerts" },
    { name: "Catégories" },
    { name: "Réservations" },
    { name: "Administration" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      RegisterRequest: {
        type: "object",
        required: ["nom", "prenom", "email", "motDePasse"],
        properties: {
          nom: { type: "string", example: "Dupont" },
          prenom: { type: "string", example: "Jean" },
          email: { type: "string", format: "email", example: "jean@example.com" },
          telephone: { type: "string", example: "20123456" },
          motDePasse: { type: "string", format: "password", minLength: 6, example: "Secret123!" },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "motDePasse"],
        properties: {
          email: { type: "string", format: "email", example: "admin@concert.com" },
          motDePasse: { type: "string", format: "password", example: "Admin123!" },
        },
      },
      ConcertRequest: {
        type: "object",
        required: ["titre", "date", "lieu"],
        properties: {
          titre: { type: "string", example: "Mon concert" },
          description: { type: "string", example: "Description du concert" },
          date: { type: "string", format: "date-time", example: "2026-12-20T20:30:00.000Z" },
          heure: { type: "string", example: "20:30" },
          lieu: { type: "string", example: "Tunis" },
          affiche: { type: "string", example: "https://example.com/affiche.jpg" },
          photos: { type: "array", items: { type: "string" }, example: ["https://example.com/photo-1.jpg", "https://example.com/photo-2.jpg"] },
          programme: { type: "array", items: { type: "string" }, example: ["Artiste 1", "Artiste 2"] },
        },
      },
      ConcertUpdateRequest: {
        type: "object",
        properties: {
          titre: { type: "string", example: "Mon concert mis à jour" },
          description: { type: "string", example: "Nouvelle description" },
          date: { type: "string", format: "date-time", example: "2026-12-20T20:30:00.000Z" },
          heure: { type: "string", example: "21:00" },
          lieu: { type: "string", example: "Tunis Arena" },
          affiche: { type: "string", example: "https://example.com/nouvelle-affiche.jpg" },
          photos: { type: "array", items: { type: "string" }, example: ["https://example.com/photo-1.jpg", "https://example.com/photo-2.jpg"] },
          programme: { type: "array", items: { type: "string" }, example: ["Artiste 1", "Artiste 2", "Artiste 3"] },
        },
      },
      CategoryRequest: {
        type: "object",
        required: ["concert", "nom", "prix", "quantiteTotale"],
        properties: {
          concert: { type: "string", description: "Identifiant du concert", example: "65f123456789abcdef012345" },
          nom: { type: "string", example: "VIP" },
          prix: { type: "number", minimum: 0, example: 100 },
          quantiteTotale: { type: "integer", minimum: 0, example: 50 },
        },
      },
      CategoryUpdateRequest: {
        type: "object",
        properties: {
          nom: { type: "string", example: "VIP Premium" },
          prix: { type: "number", minimum: 0, example: 120 },
          quantiteTotale: { type: "integer", minimum: 0, example: 75 },
        },
      },
      ReservationRequest: {
        type: "object",
        required: ["categorie", "quantite", "places"],
        properties: {
          categorie: { type: "string", description: "Identifiant de la catégorie", example: "65f123456789abcdef012346" },
          quantite: { type: "integer", minimum: 1, maximum: 6, example: 2 },
          places: {
            type: "array",
            minItems: 1,
            maxItems: 6,
            description: "Identifiants des sièges sélectionnés dans le plan",
            items: { type: "string" },
            example: ["65f123456789abcdef012347", "65f123456789abcdef012348"],
          },
        },
      },
      ReservationUpdateRequest: {
        type: "object",
        properties: {
          statut: { type: "string", enum: ["confirmee", "annulee"], example: "confirmee" },
          quantite: { type: "integer", minimum: 1, maximum: 6, example: 2 },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "string", example: "65f123456789abcdef012345" },
          nom: { type: "string", example: "Dupont" },
          prenom: { type: "string", example: "Jean" },
          email: { type: "string", format: "email", example: "jean@example.com" },
          telephone: { type: "string", example: "20123456" },
          role: { type: "string", enum: ["user", "admin"], example: "user" },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
          user: { $ref: "#/components/schemas/User" },
        },
      },
      Concert: {
        allOf: [
          { $ref: "#/components/schemas/ConcertRequest" },
          {
            type: "object",
            properties: {
              _id: { type: "string", example: "65f123456789abcdef012345" },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
            },
          },
        ],
      },
      Category: {
        allOf: [
          { $ref: "#/components/schemas/CategoryRequest" },
          {
            type: "object",
            properties: {
              _id: { type: "string", example: "65f123456789abcdef012346" },
              quantiteRestante: { type: "integer", example: 48 },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
            },
          },
        ],
      },
      Reservation: {
        type: "object",
        properties: {
          _id: { type: "string", example: "65f123456789abcdef012347" },
          utilisateur: { oneOf: [{ type: "string" }, { $ref: "#/components/schemas/User" }] },
          categorie: { oneOf: [{ type: "string" }, { $ref: "#/components/schemas/Category" }] },
          quantite: { type: "integer", example: 2 },
          places: { type: "array", items: { $ref: "#/components/schemas/Seat" } },
          codeTicket: { type: "string", example: "A1B2C3D4E5" },
          statut: { type: "string", enum: ["confirmee", "annulee"], example: "confirmee" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      ConcertWithCategories: {
        type: "object",
        properties: {
          concert: { $ref: "#/components/schemas/Concert" },
          categories: { type: "array", items: { $ref: "#/components/schemas/Category" } },
        },
      },
      HealthResponse: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["ok", "degraded"] },
          mongodb: { type: "string", enum: ["connected", "disconnected"] },
        },
        Seat: {
          type: "object",
          properties: {
            id: { type: "string", example: "65f123456789abcdef012347" },
            code: { type: "string", example: "V-A1" },
            rangee: { type: "string", example: "A" },
            numero: { type: "integer", example: 1 },
            statut: { type: "string", enum: ["disponible", "occupee"], example: "disponible" },
            categorie: { $ref: "#/components/schemas/Category" },
          },
        },
        SeatPlanResponse: {
          type: "object",
          properties: {
            scene: { type: "string", example: "Scène" },
            places: { type: "array", items: { $ref: "#/components/schemas/Seat" } },
          },
        },
      },
      StatsResponse: {
        type: "object",
        properties: {
          reservationsConfirmees: { type: "integer", example: 12 },
          ticketsVendus: { type: "integer", example: 25 },
          placesRestantes: { type: "integer", example: 225 },
          utilisateurs: { type: "integer", example: 10 },
          parCategorie: {
            type: "array",
            items: {
              type: "object",
              properties: {
                nom: { type: "string", example: "VIP" },
                vendus: { type: "integer", example: 5 },
                restantes: { type: "integer", example: 45 },
              },
            },
          },
        },
      },
    },
  },
  paths: {
    "/": {
      get: {
        tags: ["Système"],
        summary: "Vérifier que l'API répond",
        responses: { 200: { description: "Redirection vers Swagger" } },
      },
    },
    "/health": {
      get: {
        tags: ["Système"],
        summary: "Vérifier l'état de la connexion MongoDB",
        responses: {
          200: { description: "API et MongoDB disponibles", content: { "application/json": { schema: { $ref: "#/components/schemas/HealthResponse" } } } },
          503: { description: "MongoDB indisponible", content: { "application/json": { schema: { $ref: "#/components/schemas/HealthResponse" } } } },
        },
      },
    },
    "/api/auth/register": {
      post: {
        tags: ["Authentification"],
        summary: "Créer un compte",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/RegisterRequest" } } } },
        responses: { 201: { description: "Compte créé", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } } }, 400: { description: "Données invalides" } },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Authentification"],
        summary: "Se connecter et obtenir un JWT",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/LoginRequest" } } } },
        responses: { 200: { description: "JWT retourné", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } } }, 401: { description: "Identifiants invalides" } },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Authentification"],
        summary: "Obtenir l'utilisateur connecté",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Utilisateur courant", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } }, 401: { description: "Non authentifié" } },
      },
    },
    "/api/concert": {
      get: {
        tags: ["Concerts"],
        summary: "Lister le concert",
        responses: { 200: { description: "Concert retourné", content: { "application/json": { schema: { $ref: "#/components/schemas/ConcertWithCategories" } } } }, 404: { description: "Aucun concert" } },
      },
      post: {
        tags: ["Concerts"],
        summary: "Créer un concert (admin)",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/ConcertRequest" } } } },
        responses: { 201: { description: "Concert créé", content: { "application/json": { schema: { $ref: "#/components/schemas/Concert" } } } }, 403: { description: "Accès refusé" } },
      },
    },
    "/api/concert/all": {
      get: {
        tags: ["Administration"],
        summary: "Lister les concerts (admin)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Concerts retournés",
            content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Concert" } } } },
          },
        },
      },
    },
    "/api/concert/{id}": {
      put: {
        tags: ["Concerts"],
        summary: "Modifier un concert (admin)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/ConcertUpdateRequest" } } } },
        responses: { 200: { description: "Concert modifié", content: { "application/json": { schema: { $ref: "#/components/schemas/Concert" } } } }, 404: { description: "Concert introuvable" } },
      },
    },
    "/api/categories": {
      get: { tags: ["Catégories"], summary: "Lister les catégories", parameters: [{ name: "concert", in: "query", required: false, description: "Filtrer par identifiant du concert", schema: { type: "string" } }], responses: { 200: { description: "Catégories retournées", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Category" } } } } } } },
      post: { tags: ["Catégories"], summary: "Créer une catégorie (admin)", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CategoryRequest" } } } }, responses: { 201: { description: "Catégorie créée", content: { "application/json": { schema: { $ref: "#/components/schemas/Category" } } } } } },
    },
    "/api/categories/{id}": {
      put: {
        tags: ["Catégories"],
        summary: "Modifier une catégorie (admin)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CategoryUpdateRequest" } } } },
        responses: { 200: { description: "Catégorie modifiée", content: { "application/json": { schema: { $ref: "#/components/schemas/Category" } } } }, 404: { description: "Catégorie introuvable" } },
      },
      delete: {
        tags: ["Catégories"],
        summary: "Supprimer une catégorie (admin)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Catégorie supprimée", content: { "application/json": { schema: { type: "object", properties: { message: { type: "string", example: "Catégorie supprimée" } } } } } } },
      },
    },
    "/api/reservations": {
      post: { tags: ["Réservations"], summary: "Créer une réservation", security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/ReservationRequest" } } } }, responses: { 201: { description: "Réservation créée", content: { "application/json": { schema: { $ref: "#/components/schemas/Reservation" } } } } } },
    },
    "/api/reservations/plan/{concertId}": {
      get: {
        tags: ["Réservations"],
        summary: "Obtenir le plan et la disponibilité des places",
        parameters: [{ name: "concertId", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: {
            description: "Plan de salle retourné",
            content: { "application/json": { schema: { $ref: "#/components/schemas/SeatPlanResponse" } } },
          },
        },
      },
    },
    "/api/reservations/mine": {
      get: { tags: ["Réservations"], summary: "Lister mes réservations", security: [{ bearerAuth: [] }], responses: { 200: { description: "Réservations retournées", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Reservation" } } } } } },
      },
    },
    "/api/admin/stats": {
      get: { tags: ["Administration"], summary: "Voir les statistiques (admin)", security: [{ bearerAuth: [] }], responses: { 200: { description: "Statistiques retournées", content: { "application/json": { schema: { $ref: "#/components/schemas/StatsResponse" } } } } } },
    },
    "/api/reservations/{id}/cancel": {
      put: {
        tags: ["Réservations"],
        summary: "Annuler une réservation",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Réservation annulée", content: { "application/json": { schema: { $ref: "#/components/schemas/Reservation" } } } }, 404: { description: "Réservation introuvable ou déjà annulée" } },
      },
    },
    "/api/admin/users": {
      get: {
        tags: ["Administration"],
        summary: "Lister les utilisateurs (admin)",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Utilisateurs retournés", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/User" } } } } } },
      },
    },
    "/api/admin/reservations": {
      get: {
        tags: ["Administration"],
        summary: "Lister les réservations (admin)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "statut", in: "query", required: false, schema: { type: "string", enum: ["confirmee", "annulee"] } },
          { name: "categorie", in: "query", required: false, description: "Identifiant de la catégorie", schema: { type: "string" } },
          { name: "q", in: "query", required: false, description: "Nom, prénom, e-mail ou code ticket", schema: { type: "string" } },
        ],
        responses: { 200: { description: "Réservations retournées", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Reservation" } } } } } },
      },
    },
    "/api/admin/reservations/{id}": {
      get: {
        tags: ["Administration"],
        summary: "Obtenir une réservation (admin)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Réservation retournée", content: { "application/json": { schema: { $ref: "#/components/schemas/Reservation" } } } }, 404: { description: "Réservation introuvable" } },
      },
      put: {
        tags: ["Administration"],
        summary: "Modifier une réservation (admin)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/ReservationUpdateRequest" } } } },
        responses: { 200: { description: "Réservation modifiée", content: { "application/json": { schema: { $ref: "#/components/schemas/Reservation" } } } }, 404: { description: "Réservation introuvable" } },
      },
      delete: {
        tags: ["Administration"],
        summary: "Supprimer une réservation (admin)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Réservation supprimée", content: { "application/json": { schema: { type: "object", properties: { message: { type: "string", example: "Réservation supprimée" } } } } } } },
      },
    },
  },
};
