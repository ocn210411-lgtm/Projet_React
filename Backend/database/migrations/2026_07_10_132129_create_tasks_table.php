<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;


return new class extends Migration
{

    public function up(): void
    {

        Schema::create('tasks', function (Blueprint $table) {


            $table->id();


            // Projet lié
            $table->foreignId('project_id')
                ->constrained()
                ->cascadeOnDelete();



            // Informations tâche
            $table->string('title');

            $table->text('description')
                ->nullable();



            // Statut
            $table->enum('status',[

                'pending',
                'assigned',
                'in_progress',
                'completed',
                'expired'

            ])
            ->default('pending');



            // Créateur (Lead Developer)
            $table->foreignId('created_by')
                ->constrained('users')
                ->cascadeOnDelete();



            // Développeur assigné
            $table->foreignId('assigned_to')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();



            // Date prévue
            $table->date('start_date')
                ->nullable();



            // Date assignation
            $table->timestamp('assigned_at')
                ->nullable();



            $table->timestamps();

        });

    }



    public function down(): void
    {

        Schema::dropIfExists('tasks');

    }

};