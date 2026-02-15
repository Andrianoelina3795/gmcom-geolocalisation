<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Client;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ClientController extends Controller
{
    public function dataChart()
    {
        return response()->json(Client::all());
    }

    // Liste paginée + recherche COMPLÈTE avec filtres CORRIGÉS
    public function index(Request $request)
    {
        $search = $request->query('search');
        $agent = $request->query('ac');
        $typeTravaux = $request->query('type_travaux'); // CORRECTION: type_travaux au lieu de type_client
        $type = $request->query('type');
        $perPage = $request->query('per_page', 5);
        $page = $request->query('page', 1);

        $query = Client::query();

        // Recherche globale
        if ($search) {
            $query->where(function ($q) use ($search) {
                // Informations de base
                $q->where('nom_client', 'like', "%{$search}%")
                  ->orWhere('id_client', 'like', "%{$search}%")
                  ->orWhere('type_client', 'like', "%{$search}%")
                  ->orWhere('type', 'like', "%{$search}%")
                
                // Contacts
                ->orWhere('contact_client', 'like', "%{$search}%")
                  ->orWhere('ac', 'like', "%{$search}%")
                  ->orWhere('contact_ac', 'like', "%{$search}%")
                
                // Localisation
                ->orWhere('adresse', 'like', "%{$search}%")
                  ->orWhere('fokontany', 'like', "%{$search}%")
                  ->orWhere('commune', 'like', "%{$search}%")
                  ->orWhere('province', 'like', "%{$search}%")
                  ->orWhere('lieu_naissance', 'like', "%{$search}%")
                
                // Activité et travail
                ->orWhere('activite', 'like', "%{$search}%")
                  ->orWhere('type_travaux', 'like', "%{$search}%")
                  ->orWhere('source_revenus', 'like', "%{$search}%")
                  ->orWhere('source_revenus_autre', 'like', "%{$search}%")
                
                // Produits et décisions
                ->orWhere('produit', 'like', "%{$search}%")
                  ->orWhere('type_decision', 'like', "%{$search}%")
                  ->orWhere('raison_refus', 'like', "%{$search}%")
                
                // Informations CIN
                ->orWhere('CIN_client', 'like', "%{$search}%")
                  ->orWhere('type_identification', 'like', "%{$search}%")
                  ->orWhere('lieu_CIN', 'like', "%{$search}%");
            });
        }

        // Filtres supplémentaires CORRIGÉS
        if ($agent && $agent !== "") {
            $query->where('ac', 'like', "%{$agent}%");
        }

        // CORRECTION: Filtre par type_travaux
        if ($typeTravaux && $typeTravaux !== "") {
            $query->where('type_travaux', $typeTravaux);
        }

        if ($type && $type !== "") {
            $query->where('type', $type);
        }

        // Tri par date de création décroissante
        $query->orderBy('created_at', 'desc');

        $clie = $query->paginate($perPage, ['*'], 'page', $page);
        return response()->json($clie);
    }

    // Récupérer les statistiques des clients - CORRIGÉ
    public function getStats()
    {
        try {
            $stats = [
                'total' => Client::count(),
                'clients' => Client::where('type', 'Client')->count(),
                'prospects' => Client::where('type', 'Prospect')->count(),
                'follow_ups' => Client::where('type', 'Follow_up')->count(),
                'by_type_travaux' => Client::select('type_travaux', DB::raw('count(*) as count'))
                    ->whereNotNull('type_travaux')
                    ->where('type_travaux', '!=', '')
                    ->groupBy('type_travaux')
                    ->get(),
                'by_agent' => Client::select('ac', DB::raw('count(*) as count'))
                    ->whereNotNull('ac')
                    ->where('ac', '!=', '')
                    ->groupBy('ac')
                    ->get()
            ];
            
            return response()->json($stats);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors du calcul des statistiques',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)  
    {  
        $data = $request->validate([  
            'id_client' => 'required|string|unique:clients',  
            'type_travaux' => 'nullable|string',  
            'type' => 'required|string',  
            'date' => 'required|date',  
            'ac' => 'nullable|string',  
            'contact_ac' => 'nullable|string',  
            'activite' => 'nullable|string',  
            'type_client' => 'nullable|string',  
            'nom_client' => 'required|string',  
            'type_identification' => 'nullable|string',  
            'CIN_client' => 'nullable|string',  
            'date_CIN' => 'nullable|date',  
            'lieu_CIN' => 'nullable|string',  
            'duplicata' => 'nullable|string',  
            'date_naissance' => 'nullable|date',  
            'lieu_naissance' => 'nullable|string',  
            'adresse' => 'nullable|string',  
            'fokontany' => 'nullable|string',  
            'commune' => 'nullable|string',  
            'province' => 'nullable|string',  
            'statut_logement' => 'nullable|string',  
            'statut_logement_autre' => 'nullable|string',  
            'nombre_usagers' => 'nullable|integer',  
            'source_revenus' => 'nullable|string',  
            'source_revenus_autre' => 'nullable|string',  
            'contact_client' => 'required|string',  
            'toilette_fosse' => 'nullable|string',  
            'toilette_plateforme' => 'nullable|string',  
            'toilette_source_eau' => 'nullable|string',  
            'toilette_aucune' => 'nullable|boolean',  
            'puit_simple' => 'nullable|boolean',  
            'puit_motorise' => 'nullable|boolean',  
            'puit_autre' => 'nullable|boolean',  
            'puit_aucune' => 'nullable|boolean',  
            'type_decision' => 'nullable|string',  
            'produit' => 'nullable|string',  
            'montant' => 'nullable|integer',  
            'raison_refus' => 'nullable|string',  
            'paiement_mode' => 'nullable|array',  
            'reference_paiement' => 'nullable|string',  
            'montant_par_mois' => 'nullable|integer',  
            'date_paiment' => 'nullable|date',  
            'consentement' => 'nullable|boolean',  
            'photo' => 'nullable|string',
            'relance' => 'nullable|boolean',  
            'date_relance' => 'nullable|date',  
        ]);  
    
        // Enregistrement de l'image à partir de base64
        if ($request->filled('photo')) {  
            $base64Image = $request->input('photo');  

            if (preg_match('/^data:image\/(\w+);base64,/', $base64Image, $type)) {  
                $base64Image = substr($base64Image, strpos($base64Image, ',') + 1);  
                $type = strtolower($type[1]);
    
                $imageName = 'photo_' . time() . '.' . $type;  
                $path = 'photos/' . $imageName;  
    
                Storage::disk('public')->put($path, base64_decode($base64Image));  
                $data['photo'] = $path;  
            } else {  
                return response()->json(['error' => 'Format d\'image invalide.'], 422);  
            }  
        } else {  
            $data['photo'] = null;
        }  
    
        $client = Client::create($data);  
    
        return response()->json([  
            'message' => 'Client enregistré avec succès.',  
            'client' => $client  
        ], 201);  
    }

    // Détail client (show)
    public function show($id)
    {
        $client = Client::find($id);

        if (!$client) {
            return response()->json(['message' => 'Client non trouvé'], 404);
        }

        return response()->json($client);
    }

    // Mise à jour client (update)
    public function update(Request $request, $id)
    {
        $client = Client::find($id);

        if (!$client) {
            return response()->json(['message' => 'Client non trouvé'], 404);
        }

        $data = $request->validate([
            'id_client' => 'sometimes|string|unique:clients,id_client,' . $id,
            'type_travaux' => 'nullable|string',
            'type' => 'nullable|string',
            'date' => 'nullable|date',
            'ac' => 'nullable|string',
            'contact_ac' => 'nullable|string',
            'activite' => 'nullable|string',
            'type_client' => 'nullable|string',
            'nom_client' => 'nullable|string',
            'type_identification' => 'nullable|string',
            'CIN_client' => 'nullable|string',
            'date_CIN' => 'nullable|date',
            'lieu_CIN' => 'nullable|string',
            'duplicata' => 'nullable|string',
            'date_naissance' => 'nullable|date',
            'lieu_naissance' => 'nullable|string',
            'adresse' => 'nullable|string',
            'fokontany' => 'nullable|string',
            'commune' => 'nullable|string',
            'province' => 'nullable|string',
            'statut_logement' => 'nullable|string',
            'statut_logement_autre' => 'nullable|string',
            'nombre_usagers' => 'nullable|integer',
            'source_revenus' => 'nullable|string',
            'source_revenus_autre' => 'nullable|string',
            'contact_client' => 'nullable|string',
            'toilette_fosse' => 'nullable|string',
            'toilette_plateforme' => 'nullable|string',
            'toilette_source_eau' => 'nullable|string',
            'toilette_aucune' => 'nullable|boolean',
            'puit_simple' => 'nullable|boolean',
            'puit_motorise' => 'nullable|boolean',
            'puit_autre' => 'nullable|boolean',
            'puit_aucune' => 'nullable|boolean',
            'type_decision' => 'nullable|string',
            'produit' => 'nullable|string',
            'montant' => 'nullable|integer',
            'raison_refus' => 'nullable|string',
            'paiement_mode' => 'nullable|array',
            'reference_paiement' => 'nullable|string',
            'montant_par_mois' => 'nullable|integer',
            'date_paiment' => 'nullable|date',
            'consentement' => 'nullable|boolean',
            'photo' => 'nullable|string',
            'relance' => 'nullable|boolean',
            'date_relance' => 'nullable|date',
        ]);

        // Gestion de l'image à partir de base64
        if ($request->filled('photo')) {
            $base64Image = $request->input('photo');

            if (preg_match('/^data:image\/(\w+);base64,/', $base64Image, $type)) {
                $base64Image = substr($base64Image, strpos($base64Image, ',') + 1);
                $type = strtolower($type[1]);

                $imageName = 'photo_' . time() . '.' . $type;
                $path = 'photos/' . $imageName;

                // Supprimer l'ancienne photo si elle existe
                if ($client->photo && Storage::disk('public')->exists($client->photo)) {
                    Storage::disk('public')->delete($client->photo);
                }

                Storage::disk('public')->put($path, base64_decode($base64Image));
                $data['photo'] = $path;
            } else {
                return response()->json(['error' => 'Format d\'image invalide.'], 422);
            }
        } elseif ($request->has('photo') && $request->input('photo') === null) {
            // Supprimer la photo si explicitement envoyée comme null
            if ($client->photo && Storage::disk('public')->exists($client->photo)) {
                Storage::disk('public')->delete($client->photo);
            }
            $data['photo'] = null;
        }

        $client->update($data);

        return response()->json([
            'message' => 'Client mis à jour avec succès.',
            'client' => $client
        ]);
    }

    // Suppression client (destroy)
    public function destroy($id)
    {
        $client = Client::find($id);

        if (!$client) {
            return response()->json(['message' => 'Client non trouvé'], 404);
        }

        // Supprimer la photo associée si elle existe
        if ($client->photo && Storage::disk('public')->exists($client->photo)) {
            Storage::disk('public')->delete($client->photo);
        }

        $client->delete();

        return response()->json(['message' => 'Client supprimé avec succès']);
    }

    // Count par type travaux
    public function countByType($type)
    {
        $count = Client::where('type_travaux', $type)->count();
        return response()->json(['count' => $count]);
    }

    public function getClientsForUser(Request $request)
    {
        $user = $request->user();
        if ($user->role === 'admin') {
            $clients = Client::all();
        } else {
            $clients = Client::where('ac', $user->name)->get();
        }

        return response()->json([
            'clients' => $clients
        ]);
    }

    // Export des clients
public function export(Request $request)
{
    try {
        // Récupérer tous les clients avec les colonnes nécessaires
        $clients = Client::select([
            'id_client', 'nom_client', 'type', 'type_travaux', 'ac', 
            'contact_client', 'adresse', 'commune', 'province', 
            'activite', 'created_at'
        ])->get();

        // Nom du fichier avec date
        $fileName = 'clients_' . date('Y-m-d') . '.csv';

        // Headers pour le téléchargement
        $headers = [
            'Content-Type' => 'text/csv; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
        ];

        // Création du fichier CSV
        $callback = function() use ($clients) {
            $file = fopen('php://output', 'w');
            
            // Ajouter BOM pour Excel UTF-8 (correction)
            fwrite($file, "\xEF\xBB\xBF");
            
            // En-têtes en français
            fputcsv($file, [
                'ID Client', 'Nom du Client', 'Type', 'Type Travaux', 
                'Agent Commercial', 'Contact Client', 'Adresse', 
                'Commune', 'Province', 'Activité', 'Date Création'
            ], ';');

            // Données
            foreach ($clients as $client) {
                // FORMAT DE DATE CORRIGÉ - Plusieurs options à tester :
                
                // Option 1: Format ISO (recommandé)
                $dateFormatted = $client->created_at 
                    ? $client->created_at->format('Y-m-d H:i:s')
                    : '';
                
                // Option 2: Format français avec guillemets
                // $dateFormatted = $client->created_at 
                //     ? '"' . $client->created_at->format('d/m/Y H:i') . '"'
                //     : '';
                
                // Option 3: Format timestamp Excel
                // $dateFormatted = $client->created_at 
                //     ? $client->created_at->format('Y-m-d\TH:i:s\Z')
                //     : '';

                fputcsv($file, [
                    $client->id_client ?? '',
                    $this->escapeCsvValue($client->nom_client ?? ''),
                    $client->type ?? '',
                    $client->type_travaux ?? '',
                    $client->ac ?? '',
                    $client->contact_client ?? '',
                    $this->escapeCsvValue($client->adresse ?? ''),
                    $client->commune ?? '',
                    $client->province ?? '',
                    $client->activite ?? '',
                    $dateFormatted // Utiliser la variable formatée
                ], ';');
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);

    } catch (\Exception $e) {
        Log::error('Erreur export clients: ' . $e->getMessage());
        return response()->json([
            'error' => 'Erreur lors de l\'export',
            'message' => $e->getMessage()
        ], 500);
    }
}

// Fonction helper pour échapper les valeurs CSV
private function escapeCsvValue($value)
{
    // Si la valeur contient un point-virgule, des guillemets ou un saut de ligne, l'entourer de guillemets
    if (strpos($value, ';') !== false || strpos($value, '"') !== false || strpos($value, "\n") !== false) {
        $value = '"' . str_replace('"', '""', $value) . '"';
    }
    return $value;
}

public function search(Request $request)
{
    try {
        $query = $request->get('q');
        $ac = $request->get('ac');

        if (!$query) {
            return response()->json([], 200);
        }

        $clients = Client::where(function ($q) use ($query) {
                $q->where('nom_client', 'LIKE', "%{$query}%")
                  ->orWhere('contact_client', 'LIKE', "%{$query}%")
                  ->orWhere('CIN_client', 'LIKE', "%{$query}%")
                  ->orWhere('id_client', 'LIKE', "%{$query}%");
            })
            ->where('type', '!=', 'Client') // Exclure les clients déjà transformés
            ->when($ac, function ($q) use ($ac) {
                $q->where('ac', $ac);
            })
            ->limit(10)
            ->get();

        return response()->json($clients);

    } catch (\Exception $e) {
        Log::error('Erreur recherche clients: ' . $e->getMessage());
        return response()->json(['error' => 'Erreur lors de la recherche'], 500);
    }
}

}