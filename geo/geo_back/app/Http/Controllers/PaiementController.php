<?php

namespace App\Http\Controllers;

use App\Models\Annonce;
use App\Models\Client;
use App\Models\Paiement;
use App\Models\Visite;
use Illuminate\Http\Request;

class PaiementController extends Controller
{
    
    // Lister TOUS les paiements (avec recherche et pagination)
public function index(Request $request)
{
    $query = Paiement::with(['client']); // Charger la relation client
    
    // Recherche par ID client, nom client ou produit
    if ($request->has('search') && !empty($request->search)) {
        $search = $request->search;
        $query->where(function($q) use ($search) {
            $q->where('client_id', 'LIKE', "%{$search}%")
              ->orWhereHas('client', function($q) use ($search) {
                  $q->where('nom_client', 'LIKE', "%{$search}%")
                    ->orWhere('produit', 'LIKE', "%{$search}%"); // Recherche par produit
              });
        });
    }

    // Pagination
    $paiements = $query->orderBy('created_at', 'desc')
                      ->paginate(6);

    return response()->json($paiements);
}

    // Lister les paiements d'un client spécifique
    public function getByClient($clientId)
    {
        $paiements = Paiement::where('client_id', $clientId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['paiements' => $paiements]);
    }

    // Ajouter un paiement (inchangé)
   public function store(Request $request)
{
    $request->validate([
        'client_id' => 'required|exists:clients,id',
        'montant'   => 'required|numeric|min:0.01',
    ]);

    $client = Client::findOrFail($request->client_id);

    // Vérifier que le montant ne dépasse pas le montant total du client
    $totalPayeActuel = $client->paiements()->sum('montant');
    $totalApresPaiement = $totalPayeActuel + $request->montant;

    if ($totalApresPaiement > $client->montant) {
        $resteAPayer = $client->montant - $totalPayeActuel;
        return response()->json([
            'error' => "Le montant dépasse le montant total du client. Il reste {$resteAPayer} Ar à payer."
        ], 422);
    }

    $paiements = $client->paiements()->orderBy('created_at')->get();

    // Cas 1 : Premier paiement → doit être >= 30 000 Ar
    if ($paiements->count() === 0) {
        if ($request->montant < 30000) {
            return response()->json([
                'error' => 'Le premier paiement doit être au minimum de 30 000 Ar.'
            ], 422);
        }
    } 
    // Cas 2 : Paiements suivants → bloqués si la visite superviseur n'est pas validée
    else {
        if (!$client->visite) {
            return response()->json([
                'error' => 'Impossible d\'ajouter un autre paiement tant que la visite superviseur n\'est pas validée.'
            ], 403);
        }
    }

    // Enregistrement du paiement
    $paiement = Paiement::create([
        'client_id' => $client->id,
        'montant'   => $request->montant,
        'date'      => now()->toDateString(),
    ]);

    // Vérifier si paiement complet
    $totalPaye = $client->paiements()->sum('montant');
    if ($totalPaye >= $client->montant) {
        Annonce::create([
            'titre' => 'Commande travaux à faire',
            'description' => "Le paiement du client {$client->nom_client} est complet. Lancer la commande des travaux.",
        ]);
    }

    return response()->json($paiement, 201);
}
 public function update(Request $request, $id)
{
    $request->validate([
        'montant' => 'required|numeric|min:0.01',
        'date' => 'required|date',
    ]);

    try {
        $paiement = Paiement::findOrFail($id);
        $client = Client::findOrFail($paiement->client_id); // Utiliser le client_id existant

        // Vérifier que le montant ne dépasse pas le montant total du client
        $totalPayeSansCePaiement = $client->paiements()
            ->where('id', '!=', $id)
            ->sum('montant');
        $totalApresModification = $totalPayeSansCePaiement + $request->montant;

        if ($totalApresModification > $client->montant) {
            $resteAPayer = $client->montant - $totalPayeSansCePaiement;
            return response()->json([
                'error' => "Le montant dépasse le montant total du client. Maximum autorisé: {$resteAPayer} Ar"
            ], 422);
        }

        // Vérifications métier pour la modification
        $autresPaiements = $client->paiements()
            ->where('id', '!=', $id)
            ->orderBy('created_at')
            ->get();

        // Si c'est le premier paiement, vérifier le montant minimum
        if ($autresPaiements->count() === 0 && $request->montant < 30000) {
            return response()->json([
                'error' => 'Le premier paiement doit être au minimum de 30 000 Ar.'
            ], 422);
        }

        // Pour les paiements suivants, vérifier la visite superviseur
        if ($autresPaiements->count() > 0 && !$client->visite) {
            return response()->json([
                'error' => 'Impossible de modifier : la visite superviseur n\'est pas validée.'
            ], 403);
        }

        // Mise à jour du paiement (sans changer le client_id)
        $paiement->update([
            'montant' => $request->montant,
            'date' => $request->date,
        ]);

        // Vérifier si le paiement complet a changé
        $totalPaye = $client->paiements()->sum('montant');
        $paiementCompletExistant = Annonce::where('description', 'LIKE', "%{$client->nom_client}%")
            ->where('titre', 'Commande travaux à faire')
            ->exists();

        if ($totalPaye >= $client->montant && !$paiementCompletExistant) {
            Annonce::create([
                'titre' => 'Commande travaux à faire',
                'description' => "Le paiement du client {$client->nom_client} est complet. Lancer la commande des travaux.",
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Paiement modifié avec succès',
            'data' => $paiement
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de la modification du paiement: ' . $e->getMessage()
        ], 500);
    }
}

// Récupérer un paiement spécifique (à ajouter aussi)
public function show($id)
{
    try {
        $paiement = Paiement::with('client')->findOrFail($id);
        return response()->json([
            'success' => true,
            'data' => $paiement
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Paiement non trouvé'
        ], 404);
    }
}

    // Supprimer un paiement
    public function destroy($id)
    {
        try {
            $paiement = Paiement::findOrFail($id);
            $paiement->delete();

            return response()->json([
                'success' => true,
                'message' => 'Paiement supprimé avec succès'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression du paiement'
            ], 500);
        }
    }

        public function getVisite($clientId)
{
    try {
        $visite = Visite::where('client_id', $clientId)->first();
        
        return response()->json([
            'success' => true,
            'visite' => $visite,
            'exists' => !is_null($visite)
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de la récupération de la visite'
        ], 500);
    }
}
    
    /*public function dataChart()
    {
        return response()->json(Paiement::all());
    }

    // Lister les paiements d’un client
    public function index($clientId)
    {
        $paiements = Paiement::where('client_id', $clientId)
            ->orderBy('created_at')
            ->get();

        return response()->json(['paiements' => $paiements]);
    }

    // Ajouter un paiement
    public function store(Request $request)
    {
        $request->validate([
            'client_id' => 'required|exists:clients,id',
            'montant'   => 'required|numeric|min:0.01',
        ]);

        $client = Client::findOrFail($request->client_id);

        // Paiements déjà existants
        $paiements = $client->paiements()->orderBy('created_at')->get();

        // Cas 1 : Premier paiement → doit être >= 30 000 Ar
        if ($paiements->count() === 0) {
            if ($request->montant < 30000) {
                return response()->json([
                    'error' => 'Le premier paiement doit être au minimum de 30 000 Ar.'
                ], 422);
            }
        } 
        // Cas 2 : Paiements suivants → bloqués si la visite superviseur n’est pas validée
        else {
            if (!$client->visite) {
                return response()->json([
                    'error' => 'Impossible d’ajouter un autre paiement tant que la visite superviseur n’est pas validée.'
                ], 403);
            }
        }

        // Enregistrement du paiement
        $paiement = Paiement::create([
            'client_id' => $client->id,
            'montant'   => $request->montant,
            'date'      => now()->toDateString(),
        ]);

        // Vérifier si paiement complet
        $totalPaye = $client->paiements()->sum('montant');
        if ($totalPaye >= $client->montant) {
            Annonce::create([
                'titre' => 'Commande travaux à faire',
                'description' => "Le paiement du client {$client->nom_client} est complet. Lancer la commande des travaux.",
            ]);
        }

        return response()->json($paiement, 201);
    }

    public function getVisite($clientId)
{
    try {
        $visite = Visite::where('client_id', $clientId)->first();
        
        return response()->json([
            'success' => true,
            'visite' => $visite,
            'exists' => !is_null($visite)
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de la récupération de la visite'
        ], 500);
    }
}*/
}
