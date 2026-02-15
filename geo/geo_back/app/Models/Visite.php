<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Visite extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id', 
        'superviseur_id', 
        'date_visite', 
        'commentaire'
    ];

    // Relation avec le client
    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    // Relation avec le superviseur
    public function superviseur()
    {
        return $this->belongsTo(User::class, 'superviseur_id');
    }
}