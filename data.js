(function () {
  const SECTORS = [
    "Conditionnement",
    "Maintenance",
    "Logistique",
    "Qualite",
    "Production"
  ];

  const APP_CONFIG = {
    fiscalStartMonth: 4,
    sitePlanImage: "img/site-plan-reel.svg",
    dashboardSectorPositions: {
      Conditionnement: { left: "10%", top: "12%" },
      Maintenance: { left: "27%", top: "50%" },
      Logistique: { left: "47%", top: "24%" },
      Qualite: { left: "66%", top: "52%" },
      Production: { left: "82%", top: "14%" }
    }
  };

  const RAW_ITEMS = [
    {
      id: "JDI-2025-018",
      numero: "JDI-2025-018",
      libelle: "Pre-reglage guidage sur filmeuse ligne 2",
      secteur: "Conditionnement",
      statut: "Complété",
      dateOuverture: "2025-10-06",
      dateCloture: "2025-10-27",
      descriptionAvant: "Le reglage guidage film etait repris a chaque changement de format.",
      descriptionApres: "Ajout de reperes fixes et check-list de pre-reglage.",
      conditionsReussite: "Validation sur 20 changements sans reprise.",
      contributeurs: "M. Laurent, H. Bamba",
      responsable: "M. Laurent",
      typeGain: "Temps",
      gainMode: "manuel",
      gainEuro: 6200,
      gainTempsHeures: 42,
      gainCommentaire: "Calcul sur volume moyen trimestriel.",
      presenceImagesAvant: true,
      presenceImagesApres: true,
      imageAvant: "img/avant1.svg",
      imageApres: "img/apres1.svg"
    },
    {
      id: "JDI-2025-024",
      numero: "JDI-2025-024",
      libelle: "Support mobile outillage depannage convoyeur",
      secteur: "Maintenance",
      statut: "Complété",
      dateOuverture: "2025-11-12",
      dateCloture: "2025-12-05",
      descriptionAvant: "Recherche outillage disperse en atelier.",
      descriptionApres: "Chariot standard avec marquage emplacement outil.",
      conditionsReussite: "Prise en charge panne mineure < 5 min.",
      contributeurs: "P. Renaud, K. Niam",
      responsable: "P. Renaud",
      typeGain: "Coûts",
      gainMode: "auto",
      gainCommentaire: "Base incidents maintenance hebdomadaire.",
      tempsGagne: 9,
      uniteTemps: "minute",
      frequence: 3,
      uniteFrequence: "semaine",
      joursParAn: 240,
      coutHoraire: 34,
      nombreOperateurs: 1,
      nombreOccurrences: 144,
      presenceImagesAvant: true,
      presenceImagesApres: true,
      imageAvant: "img/avant2.svg",
      imageApres: "img/apres2.svg"
    },
    {
      id: "JDI-2025-029",
      numero: "JDI-2025-029",
      libelle: "Etiquetage visuel zone quarantaine",
      secteur: "Qualite",
      statut: "Annulé",
      dateOuverture: "2025-12-03",
      dateCloture: "2025-12-14",
      descriptionAvant: "Risque de confusion produit bloque / libere.",
      descriptionApres: "Action annulee, reprise dans projet global MES.",
      conditionsReussite: "A re-evaluer lors du deploiement MES.",
      contributeurs: "I. Martins",
      responsable: "I. Martins",
      typeGain: "Qualité",
      gainMode: "aucun",
      gainEuro: 0,
      gainTempsHeures: 0,
      gainCommentaire: "N/A",
      presenceImagesAvant: true,
      presenceImagesApres: true,
      imageAvant: "img/avant3.svg",
      imageApres: "img/apres3.svg"
    },
    {
      id: "JDI-2026-001",
      numero: "JDI-2026-001",
      libelle: "Reduction du temps de changement de format ensacheuse 3",
      secteur: "Conditionnement",
      statut: "Complété",
      dateOuverture: "2026-01-12",
      dateCloture: "2026-02-08",
      descriptionAvant: "Changement de format en 42 min avec deplacements multiples.",
      descriptionApres: "Preparation outillage sur chariot standard, sequence visuelle.",
      conditionsReussite: "Validation operateur ligne + chef d'equipe sur 10 changements.",
      contributeurs: "M. Laurent, A. Cisse, E. Romani",
      responsable: "A. Cisse",
      typeGain: "Temps",
      gainMode: "manuel",
      gainEuro: 8300,
      gainTempsHeures: 58,
      gainCommentaire: "Estimation sur cadence nominale.",
      presenceImagesAvant: true,
      presenceImagesApres: true,
      imageAvant: "img/avant1.svg",
      imageApres: "img/apres1.svg"
    },
    {
      id: "JDI-2026-002",
      numero: "JDI-2026-002",
      libelle: "Repere visuel de niveau mini cuve NEP",
      secteur: "Production",
      statut: "En cours",
      dateOuverture: "2026-02-03",
      dateCloture: "",
      descriptionAvant: "Risque d'arret de cycle par niveau insuffisant detecte tardivement.",
      descriptionApres: "En cours de test: pose d'un repere visuel + rappel en ronde.",
      conditionsReussite: "Absence d'arret non planifie lie au niveau sur 30 jours.",
      contributeurs: "S. Dupont, R. Henry",
      responsable: "S. Dupont",
      typeGain: "Sécurité",
      gainMode: "manuel",
      gainEuro: 1200,
      gainTempsHeures: 12,
      gainCommentaire: "Estimation preliminaire securite/disponibilite.",
      presenceImagesAvant: true,
      presenceImagesApres: true,
      imageAvant: "img/avant2.svg",
      imageApres: "img/apres2.svg"
    },
    {
      id: "JDI-2026-003",
      numero: "JDI-2026-003",
      libelle: "Standardisation des bacs de prelevement QC",
      secteur: "Qualite",
      statut: "Complété",
      dateOuverture: "2026-01-25",
      dateCloture: "2026-02-15",
      descriptionAvant: "Multiples references de bacs, confusions ponctuelles.",
      descriptionApres: "Deux references uniques avec etiquette couleur.",
      conditionsReussite: "Aucune erreur de bac pendant 6 semaines.",
      contributeurs: "I. Martins, C. Samba",
      responsable: "C. Samba",
      typeGain: "Qualité",
      gainMode: "auto",
      tempsGagne: 6,
      uniteTemps: "minute",
      frequence: 8,
      uniteFrequence: "jour",
      joursParAn: 220,
      coutHoraire: 29,
      nombreOperateurs: 2,
      nombreOccurrences: 1400,
      gainCommentaire: "Base prelevements moyens journaliers.",
      presenceImagesAvant: true,
      presenceImagesApres: true,
      imageAvant: "img/avant3.svg",
      imageApres: "img/apres3.svg"
    },
    {
      id: "JDI-2026-004",
      numero: "JDI-2026-004",
      libelle: "Chemin pieton zone expedition",
      secteur: "Logistique",
      statut: "Annulé",
      dateOuverture: "2026-01-09",
      dateCloture: "2026-01-20",
      descriptionAvant: "Croisement frequent transpalettes / pietons en zone de chargement.",
      descriptionApres: "Projet annule, integre dans un chantier securite plus large.",
      conditionsReussite: "Reprise dans chantier global Q3.",
      contributeurs: "N. Fadel",
      responsable: "N. Fadel",
      typeGain: "Sécurité",
      gainMode: "aucun",
      gainEuro: 0,
      gainTempsHeures: 0,
      gainCommentaire: "Projet annule.",
      presenceImagesAvant: true,
      presenceImagesApres: true,
      imageAvant: "img/avant4.svg",
      imageApres: "img/apres4.svg"
    },
    {
      id: "JDI-2026-005",
      numero: "JDI-2026-005",
      libelle: "Kit intervention rapide depannage convoyeur",
      secteur: "Maintenance",
      statut: "En cours",
      dateOuverture: "2026-02-18",
      dateCloture: "",
      descriptionAvant: "Temps de recherche outils > 10 min sur pannes mineures.",
      descriptionApres: "Definition d'un kit standard par ligne en deploiement.",
      conditionsReussite: "Temps d'intervention initial < 4 min sur 80% des pannes.",
      contributeurs: "P. Renaud, J. Leon",
      responsable: "J. Leon",
      typeGain: "Ergonomie",
      gainMode: "aucun",
      gainEuro: 0,
      gainTempsHeures: 0,
      gainCommentaire: "Gain non chiffre a ce stade.",
      presenceImagesAvant: true,
      presenceImagesApres: true,
      imageAvant: "img/avant5.svg",
      imageApres: "img/apres5.svg"
    },
    {
      id: "JDI-2026-006",
      numero: "JDI-2026-006",
      libelle: "Support etiquette palette zone 4",
      secteur: "Logistique",
      statut: "Complété",
      dateOuverture: "2026-01-28",
      dateCloture: "2026-02-11",
      descriptionAvant: "Etiquettes dechirees pendant filmage manuel.",
      descriptionApres: "Support plastique fixe et position standardisee.",
      conditionsReussite: "Zero etiquette refaite sur 3 semaines.",
      contributeurs: "D. Boka, M. Ines",
      responsable: "M. Ines",
      typeGain: "Coûts",
      gainMode: "manuel",
      gainEuro: 3400,
      gainTempsHeures: 20,
      gainCommentaire: "Economies consommables + retouches.",
      presenceImagesAvant: true,
      presenceImagesApres: true,
      imageAvant: "img/avant6.svg",
      imageApres: "img/apres6.svg"
    },
    {
      id: "JDI-2026-007",
      numero: "JDI-2026-007",
      libelle: "Aide visuelle reglage peseuse ligne 5",
      secteur: "Conditionnement",
      statut: "En cours",
      dateOuverture: "2026-01-05",
      dateCloture: "",
      descriptionAvant: "Mauvais reglages ponctuels en debut de poste.",
      descriptionApres: "",
      conditionsReussite: "Trois semaines sans reprise de reglages.",
      contributeurs: "",
      responsable: "",
      typeGain: "Qualité",
      gainMode: "aucun",
      gainEuro: 0,
      gainTempsHeures: 0,
      gainCommentaire: "",
      presenceImagesAvant: false,
      presenceImagesApres: false,
      imageAvant: "",
      imageApres: ""
    },
    {
      id: "JDI-2026-008",
      numero: "JDI-2026-008",
      libelle: "Reimplantation stock joints atelier maintenance",
      secteur: "Maintenance",
      statut: "Complété",
      dateOuverture: "2026-02-01",
      dateCloture: "2026-02-24",
      descriptionAvant: "Temps perdu en recherche de references joints.",
      descriptionApres: "Classement ABC et etiquetage rack atelier.",
      conditionsReussite: "Inventaire hebdo sans rupture non anticipee.",
      contributeurs: "L. Ouedraogo",
      responsable: "L. Ouedraogo",
      typeGain: "Temps",
      gainMode: "auto",
      tempsGagne: 14,
      uniteTemps: "minute",
      frequence: 4,
      uniteFrequence: "jour",
      joursParAn: 230,
      coutHoraire: 31,
      nombreOperateurs: 1,
      nombreOccurrences: 920,
      gainCommentaire: "Base interventions atelier.",
      presenceImagesAvant: true,
      presenceImagesApres: true,
      imageAvant: "img/avant4.svg",
      imageApres: "img/apres4.svg"
    },
    {
      id: "JDI-2026-009",
      numero: "JDI-2026-009",
      libelle: "Point de controle nettoyage quai logistique",
      secteur: "Logistique",
      statut: "En cours",
      dateOuverture: "2025-12-22",
      dateCloture: "",
      descriptionAvant: "Ecarts recurrent de nettoyage avant expedition.",
      descriptionApres: "Checklist testee sur equipe de nuit.",
      conditionsReussite: "Conformite > 98% sur 1 mois.",
      contributeurs: "T. Deme",
      responsable: "T. Deme",
      typeGain: "Qualité",
      gainMode: "manuel",
      gainEuro: 850,
      gainTempsHeures: 9,
      gainCommentaire: "Estimation partielle a confirmer.",
      presenceImagesAvant: true,
      presenceImagesApres: false,
      imageAvant: "img/avant5.svg",
      imageApres: ""
    },
    {
      id: "JDI-2026-010",
      numero: "JDI-2026-010",
      libelle: "Template unique compte-rendu anomalie QC",
      secteur: "Qualite",
      statut: "Complété",
      dateOuverture: "2026-03-02",
      dateCloture: "",
      descriptionAvant: "Formats de compte-rendu variables selon equipe.",
      descriptionApres: "Modele unique diffuse et disponible sur poste qualite.",
      conditionsReussite: "Adoption sur 100% des releves.",
      contributeurs: "C. Samba",
      responsable: "C. Samba",
      typeGain: "Qualité",
      gainMode: "manuel",
      gainEuro: 2200,
      gainTempsHeures: 26,
      gainCommentaire: "Calcul sur consolidation hebdo.",
      presenceImagesAvant: true,
      presenceImagesApres: true,
      imageAvant: "img/avant6.svg",
      imageApres: "img/apres6.svg"
    },
    {
      id: "JDI-2026-011",
      numero: "JDI-2026-011",
      libelle: "Signalisation zone attente palettes production",
      secteur: "Production",
      statut: "Complété",
      dateOuverture: "2026-02-10",
      dateCloture: "2026-03-05",
      descriptionAvant: "Empilage non uniforme avant evacuation chariot.",
      descriptionApres: "Marquage au sol et limite visuelle par lot.",
      conditionsReussite: "Zero blocage flux sur 4 semaines.",
      contributeurs: "R. Henry, V. Kone",
      responsable: "R. Henry",
      typeGain: "Sécurité",
      gainMode: "manuel",
      gainEuro: 1700,
      gainTempsHeures: 14,
      gainCommentaire: "Estimation incidents evites.",
      presenceImagesAvant: true,
      presenceImagesApres: true,
      imageAvant: "img/avant2.svg",
      imageApres: "img/apres2.svg"
    },
    {
      id: "JDI-2026-012",
      numero: "JDI-2026-012",
      libelle: "Reperage rapide vanne utilites utilite U3",
      secteur: "Production",
      statut: "En cours",
      dateOuverture: "2025-09-15",
      dateCloture: "",
      descriptionAvant: "Temps perdu pour identifier la bonne vanne en intervention.",
      descriptionApres: "Plaques de reperage en phase pilote.",
      conditionsReussite: "Temps d'isolement < 3 min sur 90% interventions.",
      contributeurs: "A. Keita",
      responsable: "A. Keita",
      typeGain: "Sécurité",
      gainMode: "auto",
      tempsGagne: 5,
      uniteTemps: "minute",
      frequence: 2,
      uniteFrequence: "semaine",
      joursParAn: 240,
      coutHoraire: 36,
      nombreOperateurs: 2,
      nombreOccurrences: 96,
      gainCommentaire: "Mode auto en configuration, non valide.",
      presenceImagesAvant: false,
      presenceImagesApres: false,
      imageAvant: "",
      imageApres: ""
    }
  ];

  function round(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  function computeAutoGain(item) {
    if (item.gainMode !== "auto") {
      return {
        gainTempsHeures: Number(item.gainTempsHeures || 0),
        gainEuro: Number(item.gainEuro || 0)
      };
    }

    const tempsGagne = Number(item.tempsGagne || 0);
    const occurrences = Number(item.nombreOccurrences || 0);
    const nombreOperateurs = Number(item.nombreOperateurs || 1);
    const minutesTotal = tempsGagne * occurrences * nombreOperateurs;
    const hours = round(minutesTotal / 60);
    const coutHoraire = Number(item.coutHoraire || 0);

    return {
      gainTempsHeures: hours,
      gainEuro: round(hours * coutHoraire)
    };
  }

  const JDI_ITEMS = RAW_ITEMS.map((raw) => {
    const computed = computeAutoGain(raw);
    const finalItem = {
      ...raw,
      gainEuro: raw.gainMode === "auto" ? computed.gainEuro : Number(raw.gainEuro || 0),
      gainTempsHeures: raw.gainMode === "auto" ? computed.gainTempsHeures : Number(raw.gainTempsHeures || 0)
    };

    return {
      ...finalItem,
      titre: finalItem.libelle,
      avant: finalItem.descriptionAvant,
      apres: finalItem.descriptionApres,
      conditions: finalItem.conditionsReussite,
      typeGains: finalItem.typeGain,
      gainQuantifie: finalItem.gainMode === "aucun"
        ? "N/A"
        : `${Math.round(finalItem.gainTempsHeures)} h / ${Math.round(finalItem.gainEuro)} EUR`,
      imageAvant: finalItem.presenceImagesAvant ? (finalItem.imageAvant || "img/avant1.svg") : "",
      imageApres: finalItem.presenceImagesApres ? (finalItem.imageApres || "img/apres1.svg") : ""
    };
  });

  const VOTE_DATA = {
    password: "JDI2026",
    months: [
      {
        key: "2026-01",
        label: "Janvier 2026",
        statutScrutin: "cloture",
        nominations: ["JDI-2025-024", "JDI-2026-001", "JDI-2026-006"],
        votes: [
          { utilisateur: "fabien.genet", jdiId: "JDI-2026-001", justification: "Impact fort sur le changement de format." },
          { utilisateur: "m.chef", jdiId: "JDI-2026-001", justification: "Benefice concret sur la performance ligne." },
          { utilisateur: "q.manager", jdiId: "JDI-2025-024", justification: "Mise en place robuste cote maintenance." }
        ],
        debutScrutin: "2026-01-03",
        finScrutin: "2026-01-28"
      },
      {
        key: "2026-02",
        label: "Fevrier 2026",
        statutScrutin: "cloture",
        nominations: ["JDI-2025-024", "JDI-2026-003", "JDI-2026-008"],
        votes: [
          { utilisateur: "fabien.genet", jdiId: "JDI-2026-008", justification: "Gain quotidien visible en atelier." },
          { utilisateur: "m.chef", jdiId: "JDI-2026-003", justification: "Effet direct sur la qualite des prelevements." },
          { utilisateur: "q.manager", jdiId: "JDI-2026-008", justification: "Standardisation simple et durable." }
        ],
        debutScrutin: "2026-02-02",
        finScrutin: "2026-02-25"
      },
      {
        key: "2026-03",
        label: "Mars 2026",
        statutScrutin: "ouvert",
        nominations: ["JDI-2026-003", "JDI-2026-011"],
        votes: [
          { utilisateur: "fabien.genet", jdiId: "JDI-2026-011", justification: "Amelioration claire du flux palettes." }
        ],
        debutScrutin: "2026-03-01",
        finScrutin: "2026-03-27"
      }
    ]
  };

  function computeVoteSummary(monthEntry) {
    const tally = {};
    monthEntry.nominations.forEach((id) => {
      tally[id] = 0;
    });
    monthEntry.votes.forEach((vote) => {
      if (tally[vote.jdiId] === undefined) {
        tally[vote.jdiId] = 0;
      }
      tally[vote.jdiId] += 1;
    });

    let winnerId = "";
    let maxVotes = -1;
    Object.keys(tally).forEach((id) => {
      if (tally[id] > maxVotes) {
        maxVotes = tally[id];
        winnerId = id;
      }
    });

    return { tally, winnerId: maxVotes > 0 ? winnerId : "" };
  }

  const electedByMonth = {};
  VOTE_DATA.months.forEach((month) => {
    const summary = computeVoteSummary(month);
    month.resultats = summary.tally;
    month.winnerId = month.statutScrutin === "cloture" ? summary.winnerId : "";
    if (month.winnerId) {
      electedByMonth[month.key] = month.winnerId;
    }
  });

  const electedIds = new Set(Object.values(electedByMonth));
  const nominationIndex = {};
  VOTE_DATA.months.forEach((month) => {
    month.nominations.forEach((id) => {
      if (!nominationIndex[id]) nominationIndex[id] = [];
      nominationIndex[id].push(month.key);
    });
  });

  const ENRICHED_ITEMS = JDI_ITEMS.map((item) => {
    const electionMonth = Object.keys(electedByMonth).find((month) => electedByMonth[month] === item.id) || "";
    return {
      ...item,
      historiqueNominations: nominationIndex[item.id] || [],
      estJdiDuMois: Boolean(electionMonth),
      moisElection: electionMonth,
      anneeElection: electionMonth ? Number(electionMonth.split("-")[0]) : null,
      estCandidatJdiAnnee: Boolean(electionMonth)
    };
  });

  window.JDI_DATA = {
    appConfig: APP_CONFIG,
    sectors: SECTORS,
    items: ENRICHED_ITEMS,
    vote: VOTE_DATA,
    users: ["fabien.genet", "m.chef", "q.manager", "prod.superviseur"],
    gainTypes: ["Temps", "Qualité", "Sécurité", "Ergonomie", "Coûts", "Energie", "Autre"],
    faq: [
      {
        q: "Qui peut soumettre un JDI ?",
        a: "Tout collaborateur habilite dans le service peut soumettre une idee d'amelioration JDI."
      },
      {
        q: "Comment est calcule le statut 'Complété' ?",
        a: "Le statut passe a 'Complété' quand l'action est mise en place et validee par le responsable de secteur."
      },
      {
        q: "Peut-on modifier un JDI apres creation ?",
        a: "Oui, la fiche peut etre rouverte en mode edition pour ajuster les informations et les gains."
      },
      {
        q: "A quoi sert la fiche de visualisation ?",
        a: "Elle sert a la communication interne, au partage terrain et a l'impression de la valorisation JDI."
      }
    ]
  };
})();
