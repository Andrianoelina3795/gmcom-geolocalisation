<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Produit;
use App\Models\User;
use App\Models\Coordonnee;
use App\Models\Client;
use Carbon\Carbon;

class ActiviteDuJourController extends Controller
{
    public function getTodayActivities()
    {
        $today = Carbon::today();

        $produits = Produit::whereDate('created_at', $today)->get();
        $agents = User::where('role', 'agent')->whereDate('created_at', $today)->get();
        $coordonnees = Coordonnee::whereDate('created_at', $today)->get();
        $clients = Client::whereDate('created_at', $today)->get();

        return response()->json([
            'produits' => $produits,
            'agents' => $agents,
            'coordonnees' => $coordonnees,
            'clients' => $clients,
        ]);
    }
}
