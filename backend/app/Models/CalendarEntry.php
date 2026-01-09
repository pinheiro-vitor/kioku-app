<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class CalendarEntry extends Model
{
    use HasUuids;

    protected $guarded = [];

    protected $casts = [
        'streaming' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
