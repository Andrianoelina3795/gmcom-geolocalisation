<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Coordonnee;
use App\Models\User;
use App\Models\Formation;
use App\Models\Zone;

class DashboardController extends Controller
{
    // Récupérer tous les utilisateurs
    public function getUsers()
    {
        return response()->json(User::all());
    }

    // Récupérer toutes les coordonnées
    public function getCoordonnees()
    {
        return response()->json(Coordonnee::all());
    }

    // Récupérer toutes les zones
    public function getZones()
    {
        return response()->json(Zone::all());
    }

    // Statistiques simples
    public function getStats()
    {
        $usersCount = User::count();
        $coordonneeCount = Coordonnee::count();
        $zoneCount = Zone::count();
        $activityCount = Coordonnee::whereDate('created_at', now()->count);

        return response()->json([
            'users_count' => $usersCount,
            'coordonnee_count' => $coordonneeCount,
            'zone_count' => $zoneCount,
            'activity_count' => $activityCount,
        ]);
    }
}