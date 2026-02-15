<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class CoordonneeUpdated implements ShouldBroadcast
{
    use InteractsWithSockets, SerializesModels;

    public $coordonnee;

    public function __construct($coordonnee)
    {
        $this->coordonnee = $coordonnee;
    }

    public function broadcastOn()
    {
        return new Channel('coordonnees');
    }

    public function broadcastWith()
    {
        return [
            'user_id' => $this->coordonnee->user_id,
            'user_name' => $this->coordonnee->user_name,
            'latitude' => $this->coordonnee->latitude,
            'longitude' => $this->coordonnee->longitude,
            'ip' => $this->coordonnee->ip,
            'statut' => $this->coordonnee->statut,
            'quartier' => $this->coordonnee->quartier,
            'commune' => $this->coordonnee->commune,
            'district' => $this->coordonnee->district,
            'region' => $this->coordonnee->region,
            'province' => $this->coordonnee->longitude,
        ];
        
    }
    
    public function broadcastAs() {
        return 'CoordonneeUpdated';
    }
}
