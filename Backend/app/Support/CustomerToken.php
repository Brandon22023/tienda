<?php

namespace App\Support;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

final class CustomerToken
{
    public static function issue(int $customerId): string
    {
        $token = Str::random(64);
        DB::table('cliente')->where('cliente_id', $customerId)
            ->update(['api_token_hash' => hash('sha256', $token)]);
        return $token;
    }

    public static function customerId(Request $request): ?int
    {
        $token = $request->bearerToken();
        if (! $token) {
            return null;
        }
        $customerId = DB::table('cliente')
            ->where('api_token_hash', hash('sha256', $token))
            ->value('cliente_id');
        return $customerId === null ? null : (int) $customerId;
    }

    public static function revoke(Request $request): void
    {
        $customerId = self::customerId($request);
        if ($customerId !== null) {
            DB::table('cliente')->where('cliente_id', $customerId)->update(['api_token_hash' => null]);
        }
    }
}
