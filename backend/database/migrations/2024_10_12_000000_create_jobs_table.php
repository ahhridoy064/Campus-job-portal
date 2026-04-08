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
        Schema::create('jobs', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('company');
            $table->string('location');
            $table->decimal('salary', 10, 2);
            $table->enum('type', ['Part-time', 'Permanent', 'Internship']);
            $table->text('description')->nullable();
            // Removed company_logo column as it is not used in the database
            // $table->string('company_logo')->nullable();
            $table->foreignId('employer_id')->constrained('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jobs');
    }
};
