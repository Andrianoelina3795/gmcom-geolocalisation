<?php

use App\Http\Controllers\ActiviteDuJourController;
use App\Http\Controllers\Api\StatistiqueController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\ConversationController;
use App\Http\Controllers\CoordonneeController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\Api\ZoneController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AnnonceController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\ClientEtapeController;
use App\Http\Controllers\GroupMessageController;
use App\Http\Controllers\PaiementController;
use App\Http\Controllers\PlanningController;
use App\Http\Controllers\PlanningsController;
use App\Http\Controllers\ProduitController;
use App\Http\Controllers\SituationAvancementController;
use App\Http\Controllers\SuperviseurController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Carbon\Carbon;

// Routes publiques
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/contact', [ContactController::class, 'send']);

// Routes de test
Route::get('/test', function () {
    return response()->json(['message' => 'Test']);
});

// ==================== ROUTES SPÉCIFIQUES EN PREMIER ====================

// Routes pour les ressources (à protéger selon les besoins)
Route::prefix('users')->group(function () {
    Route::get('/dataChart', [AuthController::class, 'dataChart']);
    Route::get('/', [AuthController::class, 'index']);
    Route::post('/photo', [AuthController::class, 'uploadPhoto']);
    Route::get('/{id}', [AuthController::class, 'show'])->where('id', '[0-9]+'); // ← Contrainte numérique
    Route::put('/{id}', [AuthController::class, 'update'])->where('id', '[0-9]+');
    Route::delete('/{id}', [AuthController::class, 'destroy'])->where('id', '[0-9]+');
});

// Routes situations d'avancement (PUBLIQUES)
Route::get('/agents', [SituationAvancementController::class, 'getAgents']);
Route::get('/situations', [SituationAvancementController::class, 'getSituations']);
Route::get('/situations/{periode}', [SituationAvancementController::class, 'getSituationsByPeriode']);

// ==================== ROUTES PROTÉGÉES ====================

// Routes protégées par Sanctum
Route::middleware('auth:sanctum')->group(function () {

        // Route pour récupérer tous les plannings (liste)
    Route::get('/plannings', [PlanningsController::class, 'index']);
    
    // Route pour récupérer le planning de l'utilisateur connecté (formulaire)
    Route::get('/planning/user', [PlanningsController::class, 'show']);
    
    // Route pour créer/mettre à jour le planning
    Route::post('/plannings', [PlanningsController::class, 'store']);

    // User & Auth routes
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/upload-photo', [AuthController::class, 'uploadPhoto']);
    Route::get('/users/online', [AuthController::class, 'online']);

    // Messages et conversations
    Route::prefix('messages')->group(function () {
        Route::get('/unread-count', [MessageController::class, 'getUnreadCount']);
        Route::post('/', [MessageController::class, 'sendMessage']);
        Route::post('/mark-all-as-read', [MessageController::class, 'markAllAsRead']);
        Route::patch('/{id}/read', [MessageController::class, 'markAsRead']);
        Route::delete('/{id}', [MessageController::class, 'deleteMessage']);
        Route::post('/typing', [MessageController::class, 'typing']);
        Route::get('/typing-status/{userId}', [MessageController::class, 'getTypingStatus']);
        Route::get('/{receiverId}', [MessageController::class, 'getConversation']);
    });

    // Conversations
    Route::prefix('conversations')->group(function () {
        Route::get('/', [ConversationController::class, 'index']);
        Route::get('/{receiverId}', [MessageController::class, 'show']);
        Route::delete('/{partnerId}', [ConversationController::class, 'destroy']);
        Route::delete('/delete-with/{receiverId}', [MessageController::class, 'destroyConversation']);
    });

    // Messages de groupe
    Route::prefix('group-messages')->group(function () {
        Route::get('/', [GroupMessageController::class, 'index']);
        Route::post('/', [GroupMessageController::class, 'store']);
        Route::delete('/{id}', [GroupMessageController::class, 'destroy']);
    });

    // Clients
    /*Route::prefix('clients')->group(function () {
        Route::get('/clients/search', [ClientController::class, 'search']);
        Route::get('/dataChart', [ClientController::class, 'dataChart']);
        Route::get('/stats', [ClientController::class, 'getStats']);
        Route::get('/export', [ClientController::class, 'export']);
        Route::get('/count/{type_travaux}', [ClientController::class, 'countByType']);
        Route::get('/by-user', [ClientController::class, 'getClientsForUser']);

        Route::get('/clients/{id}', [ClientController::class, 'show'])->where('id', '[0-9]+');
         
        Route::post('/', [ClientController::class, 'store']);
        Route::put('/{id}', [ClientController::class, 'update']);
        Route::delete('/{id}', [ClientController::class, 'destroy']);
        Route::get('/', [ClientController::class, 'index']);

        Route::get('/{id}', [ClientController::class, 'show']); 
        Route::get('/{id}/visite', [PaiementController::class, 'getVisite']);
        Route::get('/{client}/paiements', [PaiementController::class, 'index']);
        Route::get('/{client}/etapes', [ClientEtapeController::class, 'show']);
    });*/

    // Clients
Route::prefix('clients')->group(function () {
    // === ROUTES SPÉCIFIQUES EN PREMIER (sans paramètres) ===
    
    // Recherche - CORRECTION: enlever le doublon /clients/
    Route::get('/search', [ClientController::class, 'search']);
    
    // Autres routes spécifiques
    Route::get('/dataChart', [ClientController::class, 'dataChart']);
    Route::get('/stats', [ClientController::class, 'getStats']);
    Route::get('/export', [ClientController::class, 'export']);
    Route::get('/by-user', [ClientController::class, 'getClientsForUser']);
    
    // Route index (liste)
    Route::get('/', [ClientController::class, 'index']);
    
    // === ROUTES AVEC PARAMÈTRES NUMÉRIQUES ENSUITE ===
    
    // Count avec contrainte
    Route::get('/count/{type_travaux}', [ClientController::class, 'countByType']);
    
    // Routes avec ID numérique - AVEC CONTRAINTE
    Route::get('/{id}', [ClientController::class, 'show'])->where('id', '[0-9]+');
    Route::get('/{id}/visite', [PaiementController::class, 'getVisite'])->where('id', '[0-9]+');
    Route::get('/{client}/paiements', [PaiementController::class, 'index'])->where('client', '[0-9]+');
    Route::get('/{client}/etapes', [ClientEtapeController::class, 'show'])->where('client', '[0-9]+');
    
    // Routes CRUD avec ID
    Route::post('/', [ClientController::class, 'store']);
    Route::put('/{id}', [ClientController::class, 'update'])->where('id', '[0-9]+');
    Route::delete('/{id}', [ClientController::class, 'destroy'])->where('id', '[0-9]+');
});

    // Dans routes/api.php
    Route::group(['middleware' => 'auth:sanctum'], function () {
        Route::get('/paiements', [PaiementController::class, 'index']);
        Route::get('/clients/{client}/paiements', [PaiementController::class, 'getByClient']);
        Route::post('/paiements', [PaiementController::class, 'store']);
        Route::delete('/paiements/{id}', [PaiementController::class, 'destroy']);
        Route::get('/paiements/visite/{clientId}', [PaiementController::class, 'getVisite']);
        Route::get('/paiements/{id}', [PaiementController::class, 'show']);
        Route::put('/paiements/{id}', [PaiementController::class, 'update']);

        // Clients (nécessaire pour la liste déroulante)
        Route::get('/clients', [ClientController::class, 'index']);
    });

    // Paiements
    Route::post('/paiements', [PaiementController::class, 'store']);

    // Étapes clients
    Route::post('/clients/etapes', [ClientEtapeController::class, 'storeOrUpdate']);

    // Annonces
    Route::get('/annonces', [AnnonceController::class, 'index']);
    Route::post('/annonces', [AnnonceController::class, 'store']);

    // Plannings
    /*Route::get('/plannings', [PlanningsController::class, 'index']);
    Route::post('/plannings', [PlanningsController::class, 'store']);
    Route::get('/planning', [PlanningController::class, 'getPlanning']);*/

    // Coordonnées
    Route::prefix('coordonnees')->group(function () {
        Route::get('/dataChart', [CoordonneeController::class, 'dataChart']);
        Route::get('/', [CoordonneeController::class, 'index']);
        Route::post('/', [CoordonneeController::class, 'store']);
        Route::get('/{id}', [CoordonneeController::class, 'show']);
        Route::put('/{id}', [CoordonneeController::class, 'update']);
        Route::delete('/{id}', [CoordonneeController::class, 'destroy']);
    });

    // Notifications
    Route::prefix('notifications')->group(function () {
        Route::get('/', function () {
            return auth()->user()->unreadNotifications;
        });
        Route::post('/{id}/mark-as-read', function ($id) {
            $notification = auth()->user()->notifications()->findOrFail($id);
            $notification->markAsRead();
            return response()->json(['status' => 'ok']);
        });
    });

    // Superviseur
    Route::prefix('superviseur')->group(function () {
        Route::get('/clients-a-visiter', [SuperviseurController::class, 'clientsAVisiter']);
        Route::post('/valider-visite', [SuperviseurController::class, 'validerVisite']);
    });

    // Situations d'avancement (version protégée si nécessaire)
    Route::get('/situation-avancement', [SituationAvancementController::class, 'index']);
});

// Routes admin (Sanctum + admin middleware)
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/admin/dashboard', [AdminController::class, 'index']);
});

// Autres routes ressources
Route::prefix('produits')->group(function () {
    Route::get('/dataChart', [ProduitController::class, 'dataChart']);
    Route::post('/', [ProduitController::class, 'store']);
    Route::get('/', [ProduitController::class, 'index']);
    Route::get('/{id}', [ProduitController::class, 'show']);
    Route::put('/{id}', [ProduitController::class, 'update']);
    Route::delete('/{id}', [ProduitController::class, 'destroy']);
});

Route::middleware('auth:sanctum')->get('/statis', [StatistiqueController::class, 'index']);

Route::prefix('zones')->group(function () {
    Route::post('/', [ZoneController::class, 'store']);
    Route::put('/{id}', [ZoneController::class, 'update']);
    Route::delete('/{id}', [ZoneController::class, 'destroy']);
});

// Statistiques et dashboard
Route::get('/getTodayActivities', [ActiviteDuJourController::class, 'getTodayActivities']);
Route::get('/stat', [DashboardController::class, 'index']);
Route::get('/stats/years', function () {
    $years = range(Carbon::now()->year - 4, Carbon::now()->year);
    $data = [];
    foreach ($years as $year) {
        $data[] = [
            'year' => $year,
            'users' => DB::table('users')->whereYear('created_at', $year)->count(),
            'formations' => DB::table('formations')->whereYear('created_at', $year)->count(),
        ];
    }
    return response()->json($data);
});

