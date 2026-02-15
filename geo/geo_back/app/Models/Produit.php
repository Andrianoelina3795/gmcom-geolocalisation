<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Produit extends Model
{
    use HasFactory;
     protected $fillable = [
        'type_produit',
        'nom_produit',
        'montant_produit',
    ];
}
