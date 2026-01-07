<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\MediaItem;

class CustomList extends Model
{
    protected $guarded = [];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function mediaItems()
    {
        return $this->belongsToMany(MediaItem::class, 'custom_list_items');
    }
}
