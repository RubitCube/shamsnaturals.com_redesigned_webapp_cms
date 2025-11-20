<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ResetProductsAutoIncrement extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'products:reset-auto-increment';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reset the AUTO_INCREMENT counter for the products table back to 1';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        try {
            DB::statement('ALTER TABLE products AUTO_INCREMENT = 1');
            $this->info('The products AUTO_INCREMENT counter has been reset to 1.');

            return Command::SUCCESS;
        } catch (\Throwable $exception) {
            $this->error('Failed to reset products AUTO_INCREMENT counter: ' . $exception->getMessage());

            return Command::FAILURE;
        }
    }
}
