<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('cliente') && ! Schema::hasColumn('cliente', 'api_token_hash')) {
            Schema::table('cliente', function (Blueprint $table) {
                $table->string('api_token_hash', 64)->nullable()->unique();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('cliente') && Schema::hasColumn('cliente', 'api_token_hash')) {
            Schema::table('cliente', function (Blueprint $table) {
                $table->dropUnique(['api_token_hash']);
                $table->dropColumn('api_token_hash');
            });
        }
    }
};
