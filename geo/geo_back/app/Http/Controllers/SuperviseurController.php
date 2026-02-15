<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Client;
use App\Models\Visite;

class SuperviseurController extends Controller
{
    // Liste des clients ayant fait un dépôt mais pas encore visités
    public function clientsAVisiter()
    {
        $clients = Client::whereHas('paiements', function($q){
                $q->where('montant', '>=', 30000);
            })
            ->whereDoesntHave('visite')
            ->get();

        return response()->json(['clients' => $clients]);
    }

    // Valider une visite
    public function validerVisite(Request $request)
    {
        $request->validate([
            'client_id' => 'required|exists:clients,id',
            'superviseur_id' => 'required|exists:users,id',
            'date_visite' => 'required|date',
            'commentaire' => 'nullable|string',
        ]);

        $visite = Visite::create($request->all());

        return response()->json([
            'message' => 'Visite validée avec succès',
            'visite' => $visite
        ]);
    }
}

