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
        Schema::create('users', function (Blueprint $table) {
            $table->id();  //clé primaire
            $table->string('name'); //nom de l'AC
            $table->string('pseudo'); //pseudo de l'AC
            $table->string('email')->unique(); // email unique de l'AC
            $table->string('contact_ac'); //contact de l'AC
            $table->string('password'); //mot de passe(hashé)
            $table->string('role')->default('AC'); //rôle par defaut AC(changer admin dans la base si admin)
            $table->string('photo')->nullable(); //photo AC(chemin)
            $table->timestamp('email_verified_at')->nullable(); //verification email
            $table->rememberToken(); //token pour "remember me"
            $table->timestamps(); //date(created_at & updated_at)
        });
    }


    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('users');
    }
};
