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
    public function up()
    {
        Schema::create('coordonnees', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('user_name');
            $table->double('longitude', 18, 15);  // grande précision
            $table->double('latitude', 18, 15);   // grande précision
            $table->string('ip')->nullable();
            $table->string('status')->nullable();
            $table->string('quartier')->nullable();
            $table->string('commune')->nullable();
            $table->string('district')->nullable();
            $table->string('region')->nullable();
            $table->string('province')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('coordonnees');
    }
};
