<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    protected $fillable = [
        'id_client',
        'type_travaux',
        'type',
        'date',
        'ac',
        'contact_ac',
        'activite',
        'type_client',
        'nom_client',
        'type_identification',
        'CIN_client',
        'date_CIN',
        'lieu_CIN',
        'duplicata',
        'date_naissance',
        'lieu_naissance',
        'adresse',
        'fokontany',
        'commune',
        'province',
        'statut_logement',
        'statut_logement_autre',
        'nombre_usagers',
        'source_revenus',
        'source_revenus_autre',
        'contact_client',
        'toilette_fosse',
        'toilette_plateforme',
        'toilette_source_eau',
        'toilette_aucune',
        'puit_simple',
        'puit_motorise',
        'puit_autre',
        'puit_aucune',
        'type_decision',
        'produit',
        'montant',
        'raison_refus',
        'paiement_mode',
        'reference_paiement',
        'montant_par_mois',
        'date_paiement',
        'photo',
        'consentement',
        'relance',
        'date_relance'
    ];

    protected $casts = [
        'paiement_mode' => 'array',
        'consentement' => 'boolean',
        'date' => 'date',
        'date_CIN' => 'date',
        'date_naissance' => 'date',
        'date_paiement' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function paiment()
    {
        return $this->belongsTo(Paiement::class);
    }

    public function paiements()
    {
        return $this->hasMany(Paiement::class);
    }

    public function visite()
    {
        return $this->hasOne(Visite::class);
    }

    
}
