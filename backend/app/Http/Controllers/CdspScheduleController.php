<?php

namespace App\Http\Controllers;

use App\Models\CdspSchedule;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Validator;

class CdspScheduleController extends Controller
{
    /**
     * GET /cdsp-schedules
     * Public — anyone can view schedules.
     * Accepts optional ?month=2026-06 or ?start=2026-06-01&end=2026-06-30
     */
    public function index(Request $request)
    {
        $query = CdspSchedule::whereNull('deleted_at')
            ->orderBy('start_datetime');

        // Optional month filter: ?month=2026-06
        if ($request->has('month')) {
            $month = $request->query('month');
            $query->whereYear('start_datetime', substr($month, 0, 4))
                  ->whereMonth('start_datetime', substr($month, 5, 2));
        }

        // Optional range filter: ?start=2026-06-01&end=2026-06-30
        if ($request->has('start') && $request->has('end')) {
            $query->whereBetween('start_datetime', [
                $request->query('start') . ' 00:00:00',
                $request->query('end')   . ' 23:59:59',
            ]);
        }

        // Cast each result explicitly to CdspSchedule to satisfy static analysis
        $schedules = $query->get()->map(function (CdspSchedule $s) {
            return $this->format($s);
        });

        return response()->json($schedules);
    }

    /**
     * GET /cdsp-schedules/{id}
     * Public — view a single schedule.
     */
    public function show(int|string $id)
    {
        $schedule = CdspSchedule::whereNull('deleted_at')->find($id);

        if (!$schedule) {
            return response()->json(['message' => 'Schedule not found'], 404);
        }

        return response()->json($this->format($schedule));
    }

    /**
     * POST /cdsp-schedules
     * Admin only.
     */
    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'title'          => 'required|string|max:255',
            'description'    => 'nullable|string',
            'location'       => 'nullable|string|max:255',
            'start_datetime' => 'required|date',
            'end_datetime'   => 'required|date|after_or_equal:start_datetime',
            'status'         => 'nullable|in:upcoming,ongoing,completed,cancelled',
            'color'          => 'nullable|string|max:7|regex:/^#[0-9A-Fa-f]{6}$/',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $schedule = CdspSchedule::create([
            'title'          => $request->title,
            'description'    => $request->description,
            'location'       => $request->location,
            'start_datetime' => $request->start_datetime,
            'end_datetime'   => $request->end_datetime,
            'status'         => $request->status ?? 'upcoming',
            'color'          => $request->color ?? '#1a1d5e',
            'created_by'     => $request->user()->user_id,
        ]);

        return response()->json([
            'message'  => 'Schedule created successfully',
            'schedule' => $this->format($schedule),
        ], 201);
    }

    /**
     * PUT /cdsp-schedules/{id}
     * Admin only.
     */
    public function update(Request $request, int|string $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $schedule = CdspSchedule::whereNull('deleted_at')->find($id);

        if (!$schedule) {
            return response()->json(['message' => 'Schedule not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'title'          => 'sometimes|required|string|max:255',
            'description'    => 'nullable|string',
            'location'       => 'nullable|string|max:255',
            'start_datetime' => 'sometimes|required|date',
            'end_datetime'   => 'sometimes|required|date|after_or_equal:start_datetime',
            'status'         => 'nullable|in:upcoming,ongoing,completed,cancelled',
            'color'          => 'nullable|string|max:7|regex:/^#[0-9A-Fa-f]{6}$/',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $schedule->update($request->only([
            'title',
            'description',
            'location',
            'start_datetime',
            'end_datetime',
            'status',
            'color',
        ]));

        return response()->json([
            'message'  => 'Schedule updated successfully',
            'schedule' => $this->format($schedule->fresh()),
        ]);
    }

    /**
     * DELETE /cdsp-schedules/{id}
     * Admin only — soft delete.
     */
    public function destroy(Request $request, int|string $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $schedule = CdspSchedule::whereNull('deleted_at')->find($id);

        if (!$schedule) {
            return response()->json(['message' => 'Schedule not found'], 404);
        }

        $schedule->delete();

        return response()->json(['message' => 'Schedule deleted successfully']);
    }

    /**
     * Shared response shape.
     * start/end keys match what FullCalendar expects on the frontend.
     */
    private function format(CdspSchedule $s): array
    {
        return [
            'id'          => $s->id,
            'title'       => $s->title,
            'description' => $s->description,
            'location'    => $s->location,
            'start'       => $s->start_datetime->toIso8601String(),
            'end'         => $s->end_datetime->toIso8601String(),
            'status'      => $s->status,
            'color'       => $s->color,
            'created_by'  => $s->created_by,
            'created_at'  => $s->created_at?->toIso8601String(),
        ];
    }
}