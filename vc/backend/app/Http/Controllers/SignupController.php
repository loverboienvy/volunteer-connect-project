<?php
namespace App\Http\Controllers;

use App\Models\Opportunity;
use App\Models\Signup;
use Illuminate\Http\Request;

class SignupController extends Controller
{
    // Volunteer joins an opportunity
    public function store(Request $request, Opportunity $opportunity)
    {
        $user = $request->user();
        abort_unless($user->role === 'volunteer', 403, 'Only volunteers can sign up.');
        abort_unless($opportunity->status === 'active', 404);
        abort_if(Signup::where('user_id', $user->id)->where('opportunity_id', $opportunity->id)->exists(), 409, 'You already signed up for this opportunity.');
        abort_if($opportunity->signups()->count() >= $opportunity->slots, 409, 'No slots left.');
        return response()->json(Signup::create(['user_id' => $user->id, 'opportunity_id' => $opportunity->id]), 201);
    }

    // Volunteer's activities and totals
    public function mine(Request $request)
    {
        abort_unless($request->user()->role === 'volunteer', 403);
        $list = Signup::where('user_id', $request->user()->id)->with('opportunity.organization:id,name')->latest()->get();
        return [
            'data' => $list,
            'totals' => [
                'hours' => $list->sum('hours'),
                'completed' => $list->where('status', 'completed')->count(),
                'upcoming' => $list->where('status', 'joined')->count(),
            ],
        ];
    }

    // Organization confirms attendance, which credits the volunteer hours
    public function complete(Request $request, Signup $signup)
    {
        $opp = $signup->opportunity;
        abort_unless($request->user()->isOrganization() && $opp->user_id === $request->user()->id, 404);
        $signup->update(['status' => 'completed', 'hours' => $opp->hours]);
        return $signup;
    }
}
