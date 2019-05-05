package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"

	"github.com/mjl-/sherpa"
)

// Signatures provides functions to sign a message message with a cryptographic hash, and verify a signature is valid.
type Signatures struct {
}

// HmacSign returns the hmac-sha256 of `key` and `msg` in base64-encoded format.
func (Signatures) HmacSign(key, msg string) string {
	mac := hmac.New(sha256.New, []byte(key))
	mac.Write([]byte(msg))
	return base64.StdEncoding.EncodeToString(mac.Sum(nil))
}

// HmacVerify verifies the hmac-sha256 signature `sig` (as returned by `hmacSign` for `key` and `msg`).
// The call succeeds if the signature matches. It fails if the signature is invalid.
func (sigs Signatures) HmacVerify(key, msg, sig string) error {
	if sigs.HmacSign(key, msg) != sig {
		return &sherpa.Error{Code: "badSig", Message: "signature mismatch"}
	}
	return nil
}
