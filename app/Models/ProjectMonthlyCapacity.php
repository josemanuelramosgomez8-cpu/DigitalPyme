<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectMonthlyCapacity extends Model
{
    protected $fillable = [
        'month',
        'capacity',
        'reserved',
    ];

    protected function casts(): array
    {
        return [
            'month' => 'date:Y-m',
            'capacity' => 'integer',
            'reserved' => 'integer',
        ];
    }

    public function getAvailableAttribute(): int
    {
        return max(0, $this->capacity - $this->reserved);
    }

    public function getLowAttribute(): bool
    {
        return $this->available <= 2;
    }
}
