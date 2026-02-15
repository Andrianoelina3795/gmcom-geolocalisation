<?php

namespace App\Http\Controllers;

use App\Models\ClientEtape;
use Illuminate\Http\Request;

class ClientEtapeController extends Controller
{
    // Récupérer étape d'un client
    public function show($client_id)
    {
        $etape = ClientEtape::where('client_id', $client_id)->first();
        return response()->json($etape);
    }

    // Créer ou mettre à jour une étape
    public function storeOrUpdate(Request $request)
    {
        $data = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'visite' => 'nullable|date',
            'commande_travaux' => 'nullable|date',
            'travaux_debut' => 'nullable|date',
            'travaux_fin' => 'nullable|date',
            'reception_travaux' => 'nullable|date',
        ]);

        $etape = ClientEtape::updateOrCreate(
            ['client_id' => $data['client_id']],
            $data
        );

        return response()->json($etape);
    }
}
