<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\MediaItem;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class CustomList extends Model
{
    use HasUuids;
    protected $fillable = ['user_id', 'name', 'description', 'is_public', 'cover_image'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function mediaItems()
    {
        return $this->belongsToMany(MediaItem::class, 'media_list_items');
    }
}
