<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Paiement extends Model
{
        use HasFactory;

    protected $fillable = ['client_id', 'date', 'montant'];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }
}
