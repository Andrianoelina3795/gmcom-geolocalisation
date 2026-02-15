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
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->string('id_client')->unique();
            $table->string('type_travaux');
            $table->string('type');
            $table->date('date');
            $table->string('ac')->nullable();
            $table->string('contact_ac')->nullable();
            $table->string('activite')->nullable();
            $table->text('photo')->nullable(); // atao string rh tiana affichena n nom nle fichier
            $table->string('type_client')->nullable();
            $table->string('nom_client');
            $table->string('type_identification')->nullable();
            $table->string('CIN_client')->nullable();
            $table->date('date_CIN')->nullable();
            $table->string('lieu_CIN')->nullable();
            $table->string('duplicata')->nullable();
            $table->date('date_naissance')->nullable();
            $table->string('lieu_naissance')->nullable();
            $table->string('adresse')->nullable();
            $table->string('fokontany')->nullable();
            $table->string('commune')->nullable();
            $table->string('province')->nullable();
            $table->string('statut_logement')->nullable();
            $table->string('statut_logement_autre')->nullable();
            $table->integer('nombre_usagers')->nullable();
            $table->string('source_revenus')->nullable();
            $table->string('source_revenus_autre')->nullable();
            $table->string('contact_client');
            $table->string('toilette_fosse')->nullable();
            $table->string('toilette_plateforme')->nullable();
            $table->string('toilette_source_eau')->nullable();
            $table->boolean('toilette_aucune')->nullable();
            $table->boolean('puit_simple')->nullable();
            $table->boolean('puit_motorise')->nullable();
            $table->boolean('puit_autre')->nullable();
            $table->boolean('puit_aucune')->nullable();
            $table->string('type_decision')->nullable();
            $table->string('produit')->nullable();
            $table->integer('montant')->nullable();
            $table->string('raison_refus')->nullable();
            $table->json('paiement_mode')->nullable();
            $table->string('reference_paiement')->nullable();
            $table->integer('montant_par_mois')->nullable();
            $table->date('date_paiment')->nullable();
            $table->boolean('consentement')->default(false);
            $table->boolean('relance')->default(false);
            $table->date('date_relance')->nullable();
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
        Schema::dropIfExists('clients');
    }
};
