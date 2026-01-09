<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MediaItemController;
use App\Http\Controllers\CustomListController;
use App\Http\Controllers\ProfileController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user()->load('profile');
    });
    Route::put('/user', [AuthController::class, 'update']);

    // Media Items
    Route::apiResource('media', MediaItemController::class);
    Route::post('/media/{id}/reviews', [App\Http\Controllers\ReviewController::class, 'store']);
    Route::delete('/reviews/{id}', [App\Http\Controllers\ReviewController::class, 'destroy']);

    // Custom Lists
    Route::apiResource('lists', CustomListController::class);
    Route::post('/lists/{id}/items', [CustomListController::class, 'addMedia']);
    Route::delete('/lists/{id}/items/{mediaId}', [CustomListController::class, 'removeMedia']);

    // Calendar
    Route::apiResource('calendar', \App\Http\Controllers\CalendarEntryController::class);

    // Profile
    Route::post('/profile/avatar', [ProfileController::class, 'uploadAvatar']);
});
