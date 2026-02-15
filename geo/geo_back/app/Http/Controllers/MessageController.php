<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class MessageController extends Controller
{
    // Récupérer la conversation entre deux utilisateurs
    public function getConversation($receiverId)
    {
        try {
            $user = auth()->user();
            
            // Vérifier que l'utilisateur est authentifié
            if (!$user) {
                return response()->json([
                    'error' => 'Utilisateur non authentifié'
                ], 401);
            }

            // Vérifier que le destinataire existe
            $receiver = User::find($receiverId);
            if (!$receiver) {
                return response()->json([
                    'error' => 'Destinataire non trouvé'
                ], 404);
            }

            // Récupérer les messages entre les deux utilisateurs
            $messages = Message::where(function($query) use ($user, $receiverId) {
                $query->where('sender_id', $user->id)
                      ->where('receiver_id', $receiverId);
            })->orWhere(function($query) use ($user, $receiverId) {
                $query->where('sender_id', $receiverId)
                      ->where('receiver_id', $user->id);
            })
            ->with(['sender', 'receiver'])
            ->orderBy('created_at', 'asc')
            ->get();

            return response()->json($messages);
            
        } catch (\Exception $e) {
            Log::error('Erreur getConversation: ' . $e->getMessage());
            return response()->json([
                'error' => 'Erreur serveur lors du chargement des messages',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Envoyer un message
    public function sendMessage(Request $request)
    {
        try {
            $user = auth()->user();
            
            if (!$user) {
                return response()->json([
                    'error' => 'Utilisateur non authentifié'
                ], 401);
            }

            $validator = Validator::make($request->all(), [
                'sender_id' => 'required|exists:users,id',
                'receiver_id' => 'required|exists:users,id',
                'content' => 'required|string|max:1000'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'error' => 'Données invalides',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Vérifier que l'expéditeur est bien l'utilisateur connecté
            if ($request->sender_id != $user->id) {
                return response()->json([
                    'error' => 'Non autorisé à envoyer un message en tant qu\'un autre utilisateur'
                ], 403);
            }

            $message = Message::create([
                'sender_id' => $request->sender_id,
                'receiver_id' => $request->receiver_id,
                'content' => $request->content,
                'type' => 'private'
            ]);

            // Charger les relations
            $message->load(['sender', 'receiver']);

            return response()->json($message, 201);
            
        } catch (\Exception $e) {
            Log::error('Erreur sendMessage: ' . $e->getMessage());
            return response()->json([
                'error' => 'Erreur lors de l\'envoi du message',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Supprimer un message
    public function deleteMessage($id)
    {
        try {
            $user = auth()->user();
            $message = Message::find($id);

            if (!$message) {
                return response()->json([
                    'error' => 'Message non trouvé'
                ], 404);
            }

            // Vérifier que l'utilisateur peut supprimer (soi-même ou admin)
            if ($message->sender_id != $user->id && $user->role !== 'admin') {
                return response()->json([
                    'error' => 'Non autorisé à supprimer ce message'
                ], 403);
            }

            $message->delete();

            return response()->json([
                'message' => 'Message supprimé avec succès'
            ]);
            
        } catch (\Exception $e) {
            Log::error('Erreur deleteMessage: ' . $e->getMessage());
            return response()->json([
                'error' => 'Erreur lors de la suppression',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Récupérer les discussions de l'utilisateur (liste des conversations)
    public function getConversations()
    {
        try {
            $user = auth()->user();
            
            if (!$user) {
                return response()->json([
                    'error' => 'Utilisateur non authentifié'
                ], 401);
            }

            // Récupérer les dernières conversations
            $conversations = Message::select('sender_id', 'receiver_id')
                ->where('sender_id', $user->id)
                ->orWhere('receiver_id', $user->id)
                ->with(['sender', 'receiver'])
                ->groupBy('sender_id', 'receiver_id')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function($message) use ($user) {
                    // Déterminer l'autre utilisateur de la conversation
                    $otherUser = $message->sender_id == $user->id ? $message->receiver : $message->sender;
                    
                    // Récupérer le dernier message
                    $lastMessage = Message::where(function($query) use ($user, $otherUser) {
                        $query->where('sender_id', $user->id)
                              ->where('receiver_id', $otherUser->id);
                    })->orWhere(function($query) use ($user, $otherUser) {
                        $query->where('sender_id', $otherUser->id)
                              ->where('receiver_id', $user->id);
                    })
                    ->orderBy('created_at', 'desc')
                    ->first();

                    return [
                        'user' => $otherUser,
                        'last_message' => $lastMessage,
                        'unread_count' => 0 // À implémenter si besoin
                    ];
                });

            return response()->json($conversations);
            
        } catch (\Exception $e) {
            Log::error('Erreur getConversations: ' . $e->getMessage());
            return response()->json([
                'error' => 'Erreur lors du chargement des conversations',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}