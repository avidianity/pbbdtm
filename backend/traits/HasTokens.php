<?php

namespace Traits;

use Libraries\Str;
use Models\Token;

/**
 * @property Token[] $tokens
 */
trait HasTokens
{
    public function tokens()
    {
        return $this->hasMany(Token::class);
    }

    public function createToken()
    {
        $hash = Str::random(40);
        $this->tokens()->create(['hash' => $hash]);
        return $hash;
    }
}
