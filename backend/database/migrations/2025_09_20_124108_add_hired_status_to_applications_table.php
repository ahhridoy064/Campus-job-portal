<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First, we need to modify the enum to include 'hired'
        // Since MySQL doesn't support direct enum modification, we'll recreate the column
        DB::statement("ALTER TABLE applications MODIFY COLUMN status ENUM('applied', 'shortlisted', 'rejected', 'accepted', 'hired') DEFAULT 'applied'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert the enum back to original values (remove 'hired')
        DB::statement("ALTER TABLE applications MODIFY COLUMN status ENUM('applied', 'shortlisted', 'rejected', 'accepted') DEFAULT 'applied'");
    }
};
