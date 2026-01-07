<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MediaItemController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\CustomListController;

use App\Http\Controllers\AuthController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExternalMediaController;

Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request . user();
    });
    Route::put('/user', [AuthController::class, 'update']);
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/media/search-external', [ExternalMediaController::class, 'search']);

    Route::apiResource('media-items', MediaItemController::class);
    Route::apiResource('comments', CommentController::class)->only(['store', 'destroy']);
    Route::apiResource('custom-lists', CustomListController::class);
});
