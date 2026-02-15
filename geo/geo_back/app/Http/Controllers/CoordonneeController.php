<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\Coordonnee;

class CoordonneeController extends Controller
{
    public function dataChart()
    {
        return response()->json(Coordonnee::all());
    }

    public function index(Request $request)
    {
        $search = $request->query('search');
        $query = Coordonnee::query();
        
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('user_name', 'like', "%$search%")
                  ->orWhere('quartier', 'like', "%$search%")
                  ->orWhere('commune', 'like', "%$search%")
                  ->orWhere('district', 'like', "%$search%")
                  ->orWhere('region', 'like', "%$search%")
                  ->orWhere('province', 'like', "%$search%");
            });
        }

        $query->orderBy('created_at', 'desc');

        return response()->json($query->paginate(9));
    }

    public function destroy($id)
    {
        $coordonnee = Coordonnee::find($id);

        if (!$coordonnee) {
            return response()->json(['message' => 'Coordonnée non trouvée.'], 404);
        }

        $coordonnee->delete();

        return response()->json(['message' => 'Coordonnée supprimée avec succès.']);
    }

    public function store(Request $request)
    {
        try {

            $user = auth()->user();
            if (!$user) {
                return response()->json(['error' => 'Utilisateur non authentifié'], 401);
            }

            $data = $request->validate([
                'longitude'  => 'required|numeric|between:-180,180',
                'latitude'   => 'required|numeric|between:-90,90',
            ]);

            $data['user_id'] = $user->id;
            $data['user_name'] = $user->name;
            $data['ip'] = $request->ip();

            $lng = $data['longitude'];
            $lat = $data['latitude'];

            //  Calcul spatial PostGIS
            $zone = DB::table('faritra')
                ->select(
                    'LIB_FKT',
                    'LIB_COM',
                    'LIB_DIST',
                    'LIB_REG',
                    'LIB_PROV'
                )
                ->whereRaw(
                    "ST_Intersects(geom, ST_SetSRID(ST_MakePoint(?, ?), 4326))",
                    [$lng, $lat]
                )
                ->first();

            if ($zone) {
                $data['status'] = 'Dans le zone';
                $data['quartier'] = $zone->LIB_FKT;
                $data['commune'] = $zone->LIB_COM;
                $data['district'] = $zone->LIB_DIST;
                $data['region'] = $zone->LIB_REG;
                $data['province'] = $zone->LIB_PROV;
            } else {
                $data['status'] = 'Hors zone';
                $data['quartier'] = null;
                $data['commune'] = null;
                $data['district'] = null;
                $data['region'] = null;
                $data['province'] = null;
            }

            $coordonnees = Coordonnee::create($data);

            return response()->json([
                'message' => 'Coordonnées enregistrées avec succès',
                'status' => $data['status'],
                'quartier' => $data['quartier'],
                'commune' => $data['commune'],
                'district' => $data['district'],
                'region' => $data['region'],
                'province' => $data['province'],
                'coordonnees_id' => $coordonnees->id,
            ], 201);

        } catch (\Exception $e) {

            Log::error('Erreur store(): ' . $e->getMessage());

            return response()->json([
                'error' => 'Erreur serveur',
                'details' => $e->getMessage(),
            ], 500);
        }
    }

    public function indexPosition()
    {
        return response()->json(
            Coordonnee::orderByDesc('created_at')->limit(100)->get()
        );
    }
}