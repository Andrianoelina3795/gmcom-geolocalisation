<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;

class PlanningController extends Controller
{
          public function getPlanning()
    {
        $jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi'];
        $resultats = [];

        // Obtenir tous les agents sauf admin
        $agents = User::where('role', 'AC')->get();

        foreach ($agents as $agent) {
            $planning = [
                'id' => $agent->pseudo,
                'P' => array_fill_keys($jours, 0),
                'V' => array_fill_keys($jours, 0),
                'T' => array_fill_keys($jours, 0),
            ];

            // Récupérer tous les clients liés à cet agent
            $clients = Client::where('ac', $agent->name)->get();

            foreach ($clients as $client) {
                $jour = Carbon::parse($client->created_at)->locale('fr_FR')->dayName;

                // Normaliser le jour pour correspondre à nos entêtes
                $jour = ucfirst($jour); // ex: lundi → Lundi

                if (in_array($jour, $jours)) {
                    if ($client->activite) {
                        $planning['P'][$jour]++;
                    }
                    if ($client->vente) {
                        $planning['V'][$jour]++;
                    }
                    if ($client->travaux) {
                        $planning['T'][$jour]++;
                    }
                }
            }

            $resultats[] = $planning;
        }

        return response()->json($resultats);
    }


}
