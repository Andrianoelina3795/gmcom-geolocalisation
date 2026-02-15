<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ConversationController extends Controller
{
    // Lister les conversations visibles par l'utilisateur connecté
    public function index()
    {
        $userId = Auth::id();

        $conversations = Conversation::where('user_id', $userId)
            ->where('is_deleted', false)
            ->with('partner:id,name') // Charger le nom du partenaire
            ->get();

        return response()->json($conversations);
    }

    // Supprimer une conversation uniquement pour l'utilisateur connecté
    public function destroy($partnerId)
    {
        $conversation = Conversation::where('user_id', Auth::id())
            ->where('partner_id', $partnerId)
            ->first();

        if (!$conversation) {
            return response()->json(['message' => 'Conversation not found'], 404);
        }

        $conversation->update(['is_deleted' => true]);

        return response()->json(['message' => 'Conversation deleted for current user only.']);
    }

    // Créer ou réactiver une conversation lors de l'envoi d'un message
    public static function createOrRestore($userId, $partnerId)
    {
        Conversation::updateOrCreate(
            ['user_id' => $userId, 'partner_id' => $partnerId],
            ['is_deleted' => false]
        );
    }
}
