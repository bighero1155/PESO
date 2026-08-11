<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Routing\Controller;

class DashboardController extends Controller
{
    public function getStats()
    {
        $studentsCount = User::where('role', 'applicant')->count();
        $teachersCount = User::where('role', 'employer')->count();

        return response()->json([
            'studentsCount' => $studentsCount,
            'teachersCount' => $teachersCount,
        ]);
    }
}
