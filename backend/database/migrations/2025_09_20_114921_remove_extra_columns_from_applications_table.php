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
        Schema::table('applications', function (Blueprint $table) {
            // Only drop columns if they exist
            $columnsToCheck = [
                'experience_level',
                'resume_url',
                'availability',
                'salary_expectation',
                'portfolio_url',
                'linkedin_url',
                'phone_number'
            ];
            
            $existingColumns = \Illuminate\Support\Facades\DB::connection()
                ->getSchemaBuilder()
                ->getColumnListing('applications');
            
            $columnsToDrop = array_intersect($columnsToCheck, $existingColumns);
            
            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            // Add back the columns if needed
            $table->string('experience_level')->nullable();
            $table->string('resume_url')->nullable();
            $table->string('availability')->nullable();
            $table->decimal('salary_expectation', 10, 2)->nullable();
            $table->string('portfolio_url')->nullable();
            $table->string('linkedin_url')->nullable();
            $table->string('phone_number')->nullable();
        });
    }
};
