<?php

namespace App\Http\Controllers;

use App\Models\Annonce;
use Illuminate\Http\Request;

class AnnonceController extends Controller
{
     public function index()
    {
        return Annonce::orderBy('created_at', 'desc')->get();
    }

    // Créer une annonce manuellement
    public function store(Request $request)
    {
        $request->validate([
            'titre' => 'required|string',
            'description' => 'nullable|string',
        ]);

        $annonce = Annonce::create($request->all());
        return response()->json($annonce, 201);
    }
}
