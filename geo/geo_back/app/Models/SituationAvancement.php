<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SituationAvancement extends Model
{
    use HasFactory;

    // Champs modifiables en masse
protected $fillable = ['client_id','visite', 'commande_travaux', 'travaux_debut', 'travaux_fin', 'reception_travaux'];

    /**
     * Relation avec l'utilisateur (agent)
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

        public function client() {
        return $this->belongsTo(Client::class);
    }
}
