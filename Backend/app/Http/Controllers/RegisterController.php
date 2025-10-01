<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Log;
use Exception;

class RegisterController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'nombre'   => 'required|string|max:45',
            'correo'   => ['required','email','max:100', Rule::unique('cliente','correo')],
            'telefono' => 'nullable|string|max:20',
            'password' => 'required|string|min:6'
        ]);

        // Detectar columna de contraseña
        if (Schema::hasColumn('cliente', 'contrasena')) {
            $passwordColumn = 'contrasena';
        } elseif (Schema::hasColumn('cliente', 'contraseña')) {
            $passwordColumn = 'contraseña';
        } elseif (Schema::hasColumn('cliente', 'password')) {
            $passwordColumn = 'password';
        } else {
            Log::error('RegisterController: columna de contraseña no encontrada');
            return response()->json(['message' => 'Columna de contraseña no encontrada en la tabla cliente'], 500);
        }

        // LOG de depuración
        Log::info('RegisterController payload', $data);
        Log::info('RegisterController passwordColumn: '.$passwordColumn);

        try {
            $id = DB::table('cliente')->insertGetId([
                'nombre'     => $data['nombre'],
                'correo'     => $data['correo'],
                'telefono'   => $data['telefono'] ?? null,
                $passwordColumn => Hash::make($data['password']),
            ]);

            return response()->json(['message'=>'Registro creado','cliente_id'=>$id], 201);
        } catch (Exception $e) {
            Log::error('RegisterController::register error: '.$e->getMessage());
            return response()->json(['message'=>'Error interno al crear el registro','error'=>$e->getMessage()], 500);
        }
    }
}