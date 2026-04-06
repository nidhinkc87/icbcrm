<?php

namespace App\Http\Controllers;

use App\Models\CalendarEvent;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CalendarEventController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $month = (int) $request->query('month', now()->month);
        $year = (int) $request->query('year', now()->year);

        $firstOfMonth = \Carbon\Carbon::create($year, $month, 1);
        $startDate = $firstOfMonth->copy()->startOfWeek(\Carbon\Carbon::SUNDAY);
        $endDate = $firstOfMonth->copy()->endOfMonth()->endOfWeek(\Carbon\Carbon::SATURDAY);

        $events = CalendarEvent::visibleTo($user)
            ->whereBetween('date', [$startDate->toDateString(), $endDate->toDateString()])
            ->with(['creator:id,name', 'participants:id,name'])
            ->orderBy('start_time')
            ->get();

        $eventsByDate = [];
        foreach ($events as $event) {
            $dateKey = $event->date->format('Y-m-d');
            $eventsByDate[$dateKey][] = [
                'id' => $event->id,
                'title' => $event->title,
                'description' => $event->description,
                'reason' => $event->reason,
                'type' => $event->type,
                'meeting_type' => $event->meeting_type,
                'location' => $event->location,
                'date' => $dateKey,
                'start_time' => $event->start_time,
                'end_time' => $event->end_time,
                'all_day' => $event->all_day,
                'created_by' => $event->created_by,
                'creator_name' => $event->creator?->name ?? 'Unknown',
                'participants' => $event->participants->map(fn ($p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                ])->toArray(),
            ];
        }

        return response()->json(['events_by_date' => $eventsByDate]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'reason' => 'required_if:type,onsite|nullable|string|max:1000',
            'type' => 'required|string|in:onsite,meeting,other',
            'meeting_type' => 'required_if:type,meeting|nullable|string|in:internal,external',
            'location' => 'nullable|string|max:255',
            'date' => 'required|date',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i|after:start_time',
            'all_day' => 'boolean',
            'participant_ids' => 'nullable|array',
            'participant_ids.*' => 'integer|exists:users,id',
        ]);

        $event = CalendarEvent::create([
            'created_by' => $request->user()->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'reason' => $validated['type'] === 'onsite' ? ($validated['reason'] ?? null) : null,
            'type' => $validated['type'],
            'meeting_type' => $validated['type'] === 'meeting' ? ($validated['meeting_type'] ?? null) : null,
            'location' => $validated['location'] ?? null,
            'date' => $validated['date'],
            'start_time' => $validated['start_time'] ?? null,
            'end_time' => $validated['end_time'] ?? null,
            'all_day' => $validated['all_day'] ?? false,
        ]);

        // Always add creator as participant
        $participantIds = array_unique(array_merge(
            [$request->user()->id],
            $validated['participant_ids'] ?? []
        ));
        $event->participants()->sync($participantIds);

        return back()->with('success', 'Event created successfully.');
    }

    public function update(Request $request, CalendarEvent $calendarEvent): RedirectResponse
    {
        $user = $request->user();
        abort_unless($calendarEvent->created_by === $user->id || $user->hasRole('admin'), 403);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'type' => 'required|string|in:onsite,meeting,other',
            'meeting_type' => 'required_if:type,meeting|nullable|string|in:internal,external',
            'location' => 'nullable|string|max:255',
            'date' => 'required|date',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i|after:start_time',
            'all_day' => 'boolean',
            'participant_ids' => 'nullable|array',
            'participant_ids.*' => 'integer|exists:users,id',
        ]);

        $calendarEvent->update([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'type' => $validated['type'],
            'meeting_type' => $validated['type'] === 'meeting' ? ($validated['meeting_type'] ?? null) : null,
            'location' => $validated['location'] ?? null,
            'date' => $validated['date'],
            'start_time' => $validated['start_time'] ?? null,
            'end_time' => $validated['end_time'] ?? null,
            'all_day' => $validated['all_day'] ?? false,
        ]);

        $participantIds = array_unique(array_merge(
            [$calendarEvent->created_by],
            $validated['participant_ids'] ?? []
        ));
        $calendarEvent->participants()->sync($participantIds);

        return back()->with('success', 'Event updated successfully.');
    }

    public function destroy(Request $request, CalendarEvent $calendarEvent): RedirectResponse
    {
        $user = $request->user();
        abort_unless($calendarEvent->created_by === $user->id || $user->hasRole('admin'), 403);

        $calendarEvent->delete();

        return back()->with('success', 'Event deleted successfully.');
    }

    public function employees(): JsonResponse
    {
        $employees = User::role(['employee', 'admin'])
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return response()->json($employees);
    }
}
