<?php
use App\Http\Controllers\{AuthController, OpportunityController, ReportController, SignupController};
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/opportunities', [OpportunityController::class, 'index']);
Route::get('/opportunities/{opportunity}', [OpportunityController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::post('/opportunities', [OpportunityController::class, 'store']);
    Route::put('/opportunities/{opportunity}', [OpportunityController::class, 'update']);
    Route::delete('/opportunities/{opportunity}', [OpportunityController::class, 'destroy']);
    Route::get('/org/opportunities', [OpportunityController::class, 'mine']);

    Route::post('/opportunities/{opportunity}/signup', [SignupController::class, 'store']);
    Route::get('/me/signups', [SignupController::class, 'mine']);
    Route::post('/signups/{signup}/complete', [SignupController::class, 'complete']);

    Route::get('/reports/summary', [ReportController::class, 'summary']);
});
