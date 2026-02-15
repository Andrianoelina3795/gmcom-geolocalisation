<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
     public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary(); // ID unique UUID
            $table->string('type'); // Type de notification (classe)
            $table->morphs('notifiable'); // Clé polymorphique : user_id + user_type
            $table->text('data'); // Contenu JSON de la notification
            $table->timestamp('read_at')->nullable(); // Timestamp de lecture
            $table->timestamps(); // created_at / updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};


