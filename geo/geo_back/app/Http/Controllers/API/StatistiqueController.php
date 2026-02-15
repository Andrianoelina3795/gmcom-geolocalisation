<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Coordonnee;
use App\Models\Message;
use Illuminate\Support\Facades\Log;

class StatistiqueController extends Controller
{
    /**
     * Récupère les statistiques personnelles de l'utilisateur connecté :
     * - Nombre de positions GPS envoyées
     * - Nombre de messages non lus
     * - Dernière zone géographique détectée
     */
    public function index(Request $request)
    {
        try {
            Log::debug('Debut du methode index');

            $user = auth()->user(); //recupèrena heky aloha ny utilisateur
            if (!$user) {
                Log::error("Aucun utilisateur connecté");
                return response()->json(['error' => 'Utilisateur non authentifié'], 401);
            }

            Log::debug('utlilisateur connecté', ['user_id' => $user->id, 'user_name' =>$user->name]);

            //  Compte le nombre de positions GPS envoyées par cet utilisateur
            $positions = Coordonnee::where('user_id', $user->id)->count();
            Log::info("Nombre de positions GPS envoyées : $positions");

            //  Compte les messages non lus reçus par cet utilisateur
            $unreadMessages = Message::where('receiver_id', $user->id)
                ->where('is_read', false)
                ->count();
            Log::info("Nombre de messages non lus : $unreadMessages");

            //  Récupère la dernière position envoyée pour extraire les informations géographiques
            $lastCoord = Coordonnee::where('user_id', $user->id)->latest()->first();

            //  Construit la zone complète à partir des champs disponibles
            $lastZone = $lastCoord
                ? implode(', ', array_filter([
                    $lastCoord->quartier,
                    $lastCoord->commune,
                    $lastCoord->district,
                    $lastCoord->region,
                    $lastCoord->province
                ]))
                : 'Inconnue';

            Log::info("Dernière zone détectée : $lastZone");

            // Retourne les statistiques au format JSON
            return response()->json([
                'positions' => $positions,
                'unreadMessages' => $unreadMessages,
                'lastZone' => $lastZone,
                'userName' => $user->name,
                'userId' => $user->id, 
            ]);
        } catch (\Throwable $e) {
            //  En cas d'erreur serveur, enregistre le message dans les logs
            Log::error('Erreur StatistiqueController@index : ' . $e->getMessage());
            return response()->json([
                'error' => 'Erreur serveur',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
