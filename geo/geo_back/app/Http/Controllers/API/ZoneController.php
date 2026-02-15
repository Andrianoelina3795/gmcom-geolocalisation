<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Zone;

class ZoneController extends Controller
{
    public function dataChart()
    {
        return response()->json(Zone::all());
    }

    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string',
            'coordonnees' => 'required|array'
        ]);

        return Zone::create($request->all());
    }

    public function update(Request $request, $id)
{
    $zone = Zone::findOrFail($id);
    $zone->update($request->validate([
        'nom' => 'required|string',
        'coordonnees' => 'required|array'
    ]));
    return response()->json(['message' => 'Zone mise à jour avec succès']);
}

public function destroy($id)
{
    $zone = Zone::findOrFail($id);
    $zone->delete();
    return response()->json(['message' => 'Zone supprimée']);
}
}
