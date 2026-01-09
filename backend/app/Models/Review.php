<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Review extends Model
{
    use HasUuids;

    protected $guarded = [];

    protected $casts = [
        'rating' => 'integer',
        'spoilers' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function mediaItem()
    {
        return $this->belongsTo(MediaItem::class);
    }
}
