<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class SetAdminPassword extends Command
{
    protected $signature = 'admin:password {email? : Email address for the administrator account}';

    protected $description = 'Create an administrator account or change its password securely';

    public function handle(): int
    {
        $email = $this->argument('email') ?: $this->ask('Administrator email');

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->error('Enter a valid email address.');

            return self::FAILURE;
        }

        $user = User::firstOrNew(['email' => $email]);
        $name = $this->ask('Administrator name', $user->name ?: 'Administrator');
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

        $user->name = $name;
        $user->password = $password;
        $user->is_admin = true;
        $user->save();
        $user->tokens()->delete();

        $this->info('Administrator account saved. The password was not displayed.');

        return self::SUCCESS;
    }
}
