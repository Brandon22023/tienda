<?php

namespace App\Http\Controllers;

use App\Support\CustomerToken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class LoginController extends Controller
{
    public function login(Request $request)
    {
        $data = $request->validate([
            'correo' => 'required|email',
            'password' => 'required|string',
        ]);

        $key = Str::lower($data['correo']).'|'.$request->ip();
        if (RateLimiter::tooManyAttempts($key, 5)) {
            return response()->json([
                'message' => 'Demasiados intentos. Intenta de nuevo más tarde.',
            ], 429, ['Retry-After' => RateLimiter::availableIn($key)]);
        }

        $user = DB::table('cliente')->where('correo', $data['correo'])->first();
        $hash = $user->contrasena ?? $user->contraseña ?? $user->password ?? null;

        if (! $user || ! $hash || ! Hash::check($data['password'], $hash)) {
            RateLimiter::hit($key, 60);
            return response()->json(['message' => 'Credenciales inválidas'], 401);
        }

        RateLimiter::clear($key);
        $token = CustomerToken::issue((int) $user->cliente_id);

        return response()->json([
            'message' => 'Autenticado',
            'token' => $token,
            'cliente_id' => $user->cliente_id,
            'nombre' => $user->nombre,
            'correo' => $user->correo,
            'telefono' => $user->telefono ?? '',
        ]);
    }

    public function logout(Request $request)
    {
        CustomerToken::revoke($request);
        return response()->json(['message' => 'Sesión cerrada']);
    }
}
