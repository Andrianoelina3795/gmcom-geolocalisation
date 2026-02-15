<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\ClientEtape;
use App\Models\Paiement;
use App\Models\SituationAvancement;
use App\Models\User;
use App\Models\Visite;
use Carbon\Carbon;

class SituationAvancementController extends Controller
{
    public function getAgents()
    {
        $agents = User::where('role','AC')->get();
        return response()->json($agents);
    }

    public function index()
    {
        $situations = SituationAvancement::with('user')->get();
        return response()->json($situations);
    }

    public function getSituations()
    {
        // Début de la semaine (lundi)
        $startOfWeek = Carbon::now()->startOfWeek(Carbon::MONDAY);
        $today = Carbon::now();

        // Récupérer tous les agents
        $agents = User::where('role','AC')->get();

        $result = $agents->map(function ($agent) use ($startOfWeek, $today) {
            // Présentation = activités de la semaine
            $presentation = Client::where('ac', $agent->name)
                ->whereDate('created_at', '>=', $startOfWeek)
                ->whereDate('created_at', '<=', $today)
                ->count();

            // Vente = compter le premier paiement >= 30 000 Ar par client
            $clients = Client::where('ac', $agent->name)
                ->pluck('id');

            $vente = 0;
            foreach ($clients as $clientId) {
                $premierPaiement = Paiement::where('client_id', $clientId)
                    ->orderBy('created_at', 'asc')
                    ->first();

                if ($premierPaiement && $premierPaiement->montant >= 30000
                    && $premierPaiement->created_at->between($startOfWeek, $today)) {
                    $vente++;
                }
            }

            // Relance - Compter les relances sur PROSPECT et FOLLOW UP
            $relance = Client::where('ac', $agent->name)
                ->whereIn('type', ['Prospect', 'Follow_up'])
                ->where('relance', true)
                ->whereDate('date_relance', '>=', $startOfWeek)
                ->whereDate('date_relance', '<=', $today)
                ->count();

            // Visite - Compter les visites validées pour les clients de cet agent
            $visite = Visite::whereHas('client', function($query) use ($agent) {
                    $query->where('ac', $agent->name);
                })
                ->whereBetween('created_at', [$startOfWeek, $today])
                ->count();

            // Commande Travaux - Compter les commandes travaux de la semaine
            $commandeTravaux = ClientEtape::whereHas('client', function($query) use ($agent) {
                    $query->where('ac', $agent->name);
                })
                ->whereNotNull('commande_travaux')
                ->whereDate('commande_travaux', '>=', $startOfWeek)
                ->whereDate('commande_travaux', '<=', $today)
                ->count();

            // Travaux - Compter les débuts de travaux de la semaine
            $travaux = ClientEtape::whereHas('client', function($query) use ($agent) {
                    $query->where('ac', $agent->name);
                })
                ->whereNotNull('travaux_debut')
                ->whereDate('travaux_debut', '>=', $startOfWeek)
                ->whereDate('travaux_debut', '<=', $today)
                ->count();

            return [
                'id' => $agent->id,
                'pseudo' => $agent->pseudo,
                'presentation' => $presentation,
                'vente' => $vente,
                'visite' => $visite,
                'commande_travaux' => $commandeTravaux, // Changé pour correspondre au frontend
                'travaux_debut' => $travaux, // Changé pour correspondre au frontend
                'relance' => $relance,
            ];
        });

        return response()->json($result);
    }

    // Nouvelle méthode pour gérer différentes périodes
    public function getSituationsByPeriode($periode = 'semaine')
    {
        $today = Carbon::now();
        
        switch ($periode) {
            case 'mois':
                $startDate = Carbon::now()->startOfMonth();
                break;
            case 'semaine':
            default:
                $startDate = Carbon::now()->startOfWeek(Carbon::MONDAY);
                break;
        }

        // Récupérer tous les agents
        $agents = User::where('role','AC')->get();

        $result = $agents->map(function ($agent) use ($startDate, $today) {
            // Présentation = activités de la période
            $presentation = Client::where('ac', $agent->name)
                ->whereDate('created_at', '>=', $startDate)
                ->whereDate('created_at', '<=', $today)
                ->count();

            // Vente = compter le premier paiement >= 30 000 Ar par client
            $clients = Client::where('ac', $agent->name)
                ->pluck('id');

            $vente = 0;
            foreach ($clients as $clientId) {
                $premierPaiement = Paiement::where('client_id', $clientId)
                    ->orderBy('created_at', 'asc')
                    ->first();

                if ($premierPaiement && $premierPaiement->montant >= 30000
                    && $premierPaiement->created_at->between($startDate, $today)) {
                    $vente++;
                }
            }

            // Relance - Compter les relances sur PROSPECT et FOLLOW UP
            $relance = Client::where('ac', $agent->name)
                ->whereIn('type', ['Prospect', 'Follow_up'])
                ->where('relance', true)
                ->whereDate('date_relance', '>=', $startDate)
                ->whereDate('date_relance', '<=', $today)
                ->count();

            // Visite - Compter les visites validées pour les clients de cet agent
            $visite = Visite::whereHas('client', function($query) use ($agent) {
                    $query->where('ac', $agent->name);
                })
                ->whereBetween('created_at', [$startDate, $today])
                ->count();

            // Commande Travaux - Compter les commandes travaux de la période
            $commandeTravaux = ClientEtape::whereHas('client', function($query) use ($agent) {
                    $query->where('ac', $agent->name);
                })
                ->whereNotNull('commande_travaux')
                ->whereDate('commande_travaux', '>=', $startDate)
                ->whereDate('commande_travaux', '<=', $today)
                ->count();

            // Travaux - Compter les débuts de travaux de la période
            $travaux = ClientEtape::whereHas('client', function($query) use ($agent) {
                    $query->where('ac', $agent->name);
                })
                ->whereNotNull('travaux_debut')
                ->whereDate('travaux_debut', '>=', $startDate)
                ->whereDate('travaux_debut', '<=', $today)
                ->count();

            return [
                'id' => $agent->id,
                'pseudo' => $agent->pseudo,
                'presentation' => $presentation,
                'vente' => $vente,
                'visite' => $visite,
                'commande_travaux' => $commandeTravaux,
                'travaux_debut' => $travaux,
                'relance' => $relance,
            ];
        });

        return response()->json($result);
    }
}