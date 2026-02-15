<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum'); // verifie l'authentification
        $this->middleware('admin'); // middleware pour restreindre aux admins
    }

    public function index() {
        return response()->json([
            'message' => 'Bienvenue sur le Tableau de bord Admin', 'user' => Auth::user(),
        ]);
    }
}
