<?php

namespace App\Http\Controllers;

use App\Models\Produit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProduitController extends Controller
{
    public function dataChart()
    {
        return response()->json(Produit::all());
    }

    public function index(Request $request)
    {
        $search = $request->query('search'); // Récupère le mot-clé de recherche dans l’URL

        $query = Produit::query();
        if ($search) {
            $query->where('id', 'like', "%$search%")
                ->orWhere('type_produit', 'like', "%$search%")
                ->orWhere('nom_produit', 'like', "%$search%")
                ->orWhere('montant_produit', 'like', "%$search%");
        }

        return response()->json($query->paginate(6)); // Retourne 5 utilisateurs par page

    }

    public function store(Request $request)
    {
        // Validation
        $validator = Validator::make($request->all(), [
            'type_produit' => 'required|string|max:255',
            'nom_produit' => 'required|string|max:255',
            'montant_produit' => 'required|integer',
        ]);

        // En cas d’erreur de validation
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // Création de produit
        $produit = Produit::create([
            'type_produit' => $request->type_produit,
            'nom_produit' => $request->nom_produit,
            'montant_produit' => $request->montant_produit,
        ]);

        // Retourne les infos de l’utilisateur et le token
        return response()->json([
            'message' => 'Produit enrégistrer avec succès',
            'produit' => [
                'id' => $produit->id,
                'type_produit' => $produit->type_produit,
                'nom_produit' => $produit->nom_produit,
                'montant_produit' => $produit->montant_produit,
            ]
        ], 201);
    }

    public function show($id) {
        $produit = Produit::find($id);

        if (!$produit) {
            return response()->json(['message' => 'Produit introuvable'], 404);
        }

        return response()->json($produit);
    }

    public function update(Request $request, $id) {
        $produit = Produit::find($id);

        if (!$produit) {
            return response()->json(['message' => 'Produit introuvable'], 404);
        }

        // Validation des champs mis à jour
        $validated = $request->validate([
            'type_produit' => 'required|string|max:255',
            'nom_produit' => 'required|string|max:255',
            'montant_produit' => 'required|integer',
        ]);

        // Application de la mise à jour
        $produit->update($validated);

        return response()->json(['message' => 'Produit mis à jour avec succès']);
    }

    public function destroy($id) {
        $produit = Produit::find($id);

        if (!$produit) {
            return response()->json(['message' => 'Produit introuvable'], 404);
        }

        $produit->delete();
        return response()->json(['message' => 'Produit supprimé avec succès']);
    }
}
