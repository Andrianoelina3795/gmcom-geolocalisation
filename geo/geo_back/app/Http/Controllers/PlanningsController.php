<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Planning;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class PlanningsController extends Controller
{
    // Récupère tous les plannings pour la liste
    public function index()
    {
        // Semaine suivante
        $nextWeek = Carbon::now()->addWeek()->format('Y-W');
        
        // Récupère tous les utilisateurs avec rôle AC
        $acUsers = User::where('role', 'AC')->get();
        
        $plannings = [];
        
        foreach ($acUsers as $user) {
            $planning = Planning::where('user_id', $user->id)
                        ->where('week', $nextWeek)
                        ->first();

            // Structure par défaut si pas de planning
            $defaultSemaine = [
                'Lundi' => ['P' => 0, 'V' => 0, 'T' => 0],
                'Mardi' => ['P' => 0, 'V' => 0, 'T' => 0],
                'Mercredi' => ['P' => 0, 'V' => 0, 'T' => 0],
                'Jeudi' => ['P' => 0, 'V' => 0, 'T' => 0],
                'Vendredi' => ['P' => 0, 'V' => 0, 'T' => 0],
            ];

            if ($planning) {
                $plannings[] = [
                    'pseudo' => $planning->pseudo ?: $user->name,
                    'semaine' => $planning->semaine ?: $defaultSemaine
                ];
            } else {
                $plannings[] = [
                    'pseudo' => $user->name,
                    'semaine' => $defaultSemaine
                ];
            }
        }

        return response()->json($plannings);
    }

    // Récupère le planning d'un user spécifique (pour le formulaire)
    public function show()
    {
        $user = Auth::user();
        $nextWeek = Carbon::now()->addWeek()->format('Y-W');

        $planning = Planning::where('user_id', $user->id)
                    ->where('week', $nextWeek)
                    ->first();

        // Structure par défaut
        $defaultSemaine = [
            'Lundi' => ['P' => 0, 'V' => 0, 'T' => 0],
            'Mardi' => ['P' => 0, 'V' => 0, 'T' => 0],
            'Mercredi' => ['P' => 0, 'V' => 0, 'T' => 0],
            'Jeudi' => ['P' => 0, 'V' => 0, 'T' => 0],
            'Vendredi' => ['P' => 0, 'V' => 0, 'T' => 0],
        ];

        if ($planning) {
            return response()->json([
                'exists' => true,
                'semaine' => $planning->semaine ?: $defaultSemaine
            ]);
        }

        return response()->json([
            'exists' => false,
            'semaine' => $defaultSemaine
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['error' => 'Utilisateur non authentifié'], 401);
        }

        // Semaine suivante
        $week = Carbon::now()->addWeek()->format('Y-W');
        $semaineData = $request->input('semaine', []);

        if (empty($semaineData)) {
            return response()->json(['error' => 'Aucun planning reçu'], 400);
        }

        try {
            $planning = Planning::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'week' => $week
                ],
                [
                    'semaine' => $semaineData,
                    'pseudo' => $user->name,
                    'week' => $week
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Planning enregistré avec succès !',
                'planning' => $planning
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'enregistrement',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
