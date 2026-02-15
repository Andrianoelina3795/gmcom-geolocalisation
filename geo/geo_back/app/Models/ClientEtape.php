<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClientEtape extends Model
{
    use HasFactory;
        protected $fillable = ['client_id','visite', 'commande_travaux', 'travaux_debut', 'travaux_fin', 'reception_travaux'];

    public function client() {
        return $this->belongsTo(Client::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
