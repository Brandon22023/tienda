<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class LoginController extends Controller
{
    public function login(Request $request)
    {
        $data = $request->validate([
            'correo'   => 'required|email',
            'password' => 'required|string'
        ]);

        $user = DB::table('cliente')->where('correo', $data['correo'])->first();
        if (! $user) {
            return response()->json(['message' => 'Credenciales inválidas'], 401);
        }

        // Ajusta el nombre de la columna si es diferente
        $hash = $user->contrasena ?? $user->contraseña ?? $user->password ?? null;

        if (! $hash || ! Hash::check($data['password'], $hash)) {
            return response()->json(['message' => 'Credenciales inválidas'], 401);
        }

        // Login correcto — devuelve lo mínimo necesario
        return response()->json([
            'message' => 'Autenticado',
            'cliente_id' => $user->cliente_id,
            'nombre' => $user->nombre
        ]);
    }
}