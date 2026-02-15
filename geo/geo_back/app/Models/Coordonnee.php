<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coordonnee extends Model
{
    use HasFactory;
    // Spécifie les attributs pouvant être assignés en masse
    protected $fillable = [
        'user_id',
        'user_name',
        'longitude',
        'latitude',
        'ip',
        'status', //inside/outside
        'quartier',
        'commune',
        'district',
        'region',
        'province',

        
    ];

    //paramettre du date
    /*protected $appends = ['date_formated'];
    public function detDateFormattedAttribute(){
        return Carbon::parse($this->created_at)->format('d/m/Y H:i');
    }*/
}
