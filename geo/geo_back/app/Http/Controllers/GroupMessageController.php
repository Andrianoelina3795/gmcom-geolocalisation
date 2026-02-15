<?php

namespace App\Http\Controllers;

use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class GroupMessageController extends Controller
{
    // Récupérer tous les messages de groupe
    public function index()
    {
        try {
            $user = auth()->user();
            
            if (!$user) {
                return response()->json([
                    'error' => 'Utilisateur non authentifié'
                ], 401);
            }

            $messages = Message::where('type', 'group')
                ->with('sender')
                ->orderBy('created_at', 'asc')
                ->get();

            return response()->json($messages);
            
        } catch (\Exception $e) {
            Log::error('Erreur GroupMessage index: ' . $e->getMessage());
            return response()->json([
                'error' => 'Erreur lors du chargement des messages de groupe',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Envoyer un message de groupe
    public function store(Request $request)
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
                'receiver_id' => $request->sender_id, // Pour les messages groupe, on met le même ID
                'content' => $request->content,
                'type' => 'group'
            ]);

            // Charger les relations
            $message->load('sender');

            return response()->json($message, 201);
            
        } catch (\Exception $e) {
        Log::error('Erreur GroupMessage store: ' . $e->getMessage());
            return response()->json([
                'error' => 'Erreur lors de l\'envoi du message de groupe',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Supprimer un message de groupe
    public function destroy($id)
    {
        try {
            $user = auth()->user();
            $message = Message::where('id', $id)->where('type', 'group')->first();

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
            Log::error('Erreur GroupMessage destroy: ' . $e->getMessage());
            return response()->json([
                'error' => 'Erreur lors de la suppression',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}