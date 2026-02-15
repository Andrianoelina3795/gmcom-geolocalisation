<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    /**
     * Retourne tous les utilisateurs (utile pour les statistiques ou graphiques)
     */
    public function dataChart(Request $request)
    {
        return response()->json(User::all());
    }

    /**
     * Retourne une liste paginée d’utilisateurs avec possibilité de recherche
     */
    public function index(Request $request)
    {
        $search = $request->query('search'); // Récupère le mot-clé de recherche dans l’URL

        $query = User::query();
        if ($search) {
            $query->where('name', 'like', "%$search%")
                ->orWhere('pseudo', 'like', "%$search%")
                ->orWhere('email', 'like', "%$search%")
                ->orWhere('contact_ac', 'like', "%$search%")
                ->orWhere('role', 'like', "%$search%");
        }

        return response()->json($query->paginate(5)); // Retourne 5 utilisateurs par page
    }

    /**
     * Enregistre un nouvel utilisateur (agent commercial)
     */
    public function register(Request $request)
    {
        // Validation des champs du formulaire
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'pseudo' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'contact_ac' => 'required|digits_between:1,10',
            'role' => 'required|in:AC,superviseur',
            'password' => 'required|string|min:8|confirmed',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
        ]);

        // En cas d’erreur de validation
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // Sauvegarde de la photo si fournie
        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('photos', 'public');
        }

        // Création de l'utilisateur avec rôle par défaut : AC
        $user = User::create([
            'name' => $request->name,
            'pseudo' => $request->pseudo,
            'email' => $request->email,
            'contact_ac' => $request->contact_ac,
            'role' => $request->role,
            'password' => Hash::make($request->password),
            'photo' => $photoPath,
        ]);

        // Création du token API pour connexion automatique après inscription
        $token = $user->createToken('api_token')->plainTextToken;

        // Retourne les infos de l’utilisateur et le token
        return response()->json([
            'message' => 'Utilisateur enregistré avec succès',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'pseudo' => $user->pseudo,
                'email' => $user->email,
                'contact_ac' => $user->contact_ac,
                'role' => $user->role,
                'photo' => $user->photo,
                'photo_url' => $photoPath ? asset('storage/' . $photoPath) : null
            ]
        ], 201);
    }

    /**
     * Connexion d’un utilisateur, retourne token + infos
     */
    public function login(Request $request)
    {
        try {
            // Validation des identifiants
            $credentials = $request->validate([
                'email' => 'required|email',
                'password' => 'required'
            ]);

            // Si les identifiants sont invalides
            if (!Auth::attempt($credentials)) {
                return response()->json([
                    'message' => 'Email ou mot de passe incorrect'
                ], 401);
            }

            // Utilisateur connecté
            $user = Auth::user();
            $token = $user->createToken('auth_token')->plainTextToken;

            // Renvoie les infos et le token
            return response()->json([
                'message' => 'Connexion réussie',
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'pseudo' => $user->pseudo,
                    'email' => $user->email,
                    'contact_ac' => $user->contact_ac,
                    'role' => $user->role,
                    'photo' => $user->photo,
                    'photo_url' => $user->photo ? asset('storage/' . $user->photo) : null
                ]
            ]);
        } catch (\Exception $e) {
            // En cas d'erreur serveur
            return response()->json([
                'error' => 'Erreur serveur : ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload de la photo d’un utilisateur connecté
     */
    public function uploadPhoto(Request $request)
    {
        $user = auth()->user(); // Récupère l’utilisateur connecté

        // Vérifie si une photo est envoyée
        if ($request->hasFile('photo')) {
            $file = $request->file('photo');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('uploads/users'), $filename);

            // Mise à jour du champ photo
            $user->photo = 'uploads/users/' . $filename;
            $user->save();

            return response()->json([
                'photo' => $user->photo,
                'photo_url' => asset($user->photo)
            ], 200);
        }

        return response()->json(['error' => 'Aucune image reçue'], 400);
    }

    /**
     * Liste des utilisateurs appartenant à une catégorie donnée
     */
    public function getByCategorie($id)
    {
        $user = User::where('categorie_id', $id)->get();
        return response()->json($user);
    }

    /**
     * Détail d’un utilisateur par son ID
     */
    public function show($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'Utilisateur introuvable'], 404);
        }

        return response()->json($user);
    }

    /**
     * Mise à jour des informations d’un utilisateur
     */
    public function update(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'Utilisateur introuvable'], 404);
        }

        // Validation des champs mis à jour
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'pseudo' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id,
            'contact_ac' => 'required|digits_between:1,10',
        ]);

        // Application de la mise à jour
        $user->update($validated);

        return response()->json(['message' => 'Utilisateur mis à jour avec succès']);
    }

    /**
     * Suppression d’un utilisateur par ID
     */
    public function destroy($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'Utilisateur introuvable'], 404);
        }

        $user->delete();
        return response()->json(['message' => 'Utilisateur supprimé avec succès']);
    }

    /**
     * Liste des utilisateurs connectés sauf l’utilisateur courant
     */
    public function online()
    {
        $users = User::where('is_online', true)
            ->where('id', '!=', auth()->id())
            ->select('id', 'name', 'photo')
            ->get();

        // Ajoute le lien complet vers la photo
        $users->map(function ($u) {
            $u->photo_url = $u->photo ? asset('storage/' . $u->photo) : null;
            return $u;
        });

        return response()->json([
            'status' => 'success',
            'data' => $users,
        ]);
    }
}
