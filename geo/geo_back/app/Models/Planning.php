<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Planning extends Model
{
    use HasFactory;
    
    protected $fillable = ['user_id', 'pseudo', 'semaine', 'week'];

    protected $casts = [
        'semaine' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
