<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // ==========================
        // Table users
        // ==========================
        Schema::create('users', function (Blueprint $table) {

            $table->id();

            $table->string('name', 191);

            $table->string('email', 191)->unique();

            $table->string('password', 191);

            $table->enum('role', [
                'manager',
                'lead_developer',
                'developer'
            ]);

            $table->boolean('is_active')->default(true);

            $table->boolean('must_change_password')->default(false);

            $table->rememberToken();

            $table->timestamps();
        });

        // ==========================
        // Password Reset Tokens
        // ==========================
        Schema::create('password_reset_tokens', function (Blueprint $table) {

            $table->string('email', 191)->primary();

            $table->string('token', 191);

            $table->timestamp('created_at')->nullable();

        });

        // ==========================
        // Sessions
        // ==========================
        Schema::create('sessions', function (Blueprint $table) {

            $table->string('id', 191)->primary();

            $table->foreignId('user_id')->nullable()->index();

            $table->string('ip_address', 45)->nullable();

            $table->text('user_agent')->nullable();

            $table->longText('payload');

            $table->integer('last_activity')->index();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};