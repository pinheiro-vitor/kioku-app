<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Comment;
use App\Models\CustomList;

class MediaItem extends Model
{
    // Use guarded = [] to allow all fields to be fillable (as we validate in Controller)
    protected $guarded = [];

    protected $casts = [
        'is_favorite' => 'boolean',
        'start_date' => 'date',
        'end_date' => 'date',
        'genres' => 'array',
        'tags' => 'array',
        'custom_lists' => 'array',
        'user_streaming' => 'array',
        'score' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function customLists()
    {
        return $this->belongsToMany(CustomList::class, 'custom_list_items');
    }
}
