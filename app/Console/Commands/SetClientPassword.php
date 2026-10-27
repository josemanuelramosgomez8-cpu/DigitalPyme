<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class SetClientPassword extends Command
{
    protected $signature = 'client:password {email : Email address for the client account}';

    protected $description = 'Set or change a client account password securely';

    public function handle(): int
    {
        $email = $this->argument('email');

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->error('Enter a valid email address.');

            return self::FAILURE;
        }

        $user = User::where('email', $email)->where('is_client', true)->first();

        if (!$user || !$user->client()->exists()) {
            $this->error('No client account was found for that email.');

            return self::FAILURE;
        }

        $password = $this->secret('New password (at least 12 characters)');
        $confirmation = $this->secret('Confirm new password');

        if (strlen($password) < 12) {
            $this->error('The password must be at least 12 characters long.');

            return self::FAILURE;
        }

        if ($password !== $confirmation) {
            $this->error('The passwords do not match.');

            return self::FAILURE;
        }

        $user->password = $password;
        $user->save();
        $user->tokens()->delete();

        $this->info('Client password updated. The password was not displayed.');

        return self::SUCCESS;
    }
}
