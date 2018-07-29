package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"

	"bitbucket.org/mjl/sherpa"
)

// An HMAC is a cryptographic hash that uses a key to sign a message. Example API provides a function to create a signature, given a key and message (as a string). And another function to verify a signature is valid.
type Signatures struct {
}

// hmacSign returns the hmac-sha256 of `key` and `msg` in base64-encoded format.
func (Signatures) HmacSign(key, msg string) string {
	mac := hmac.New(sha256.New, []byte(key))
	mac.Write([]byte(msg))
	return base64.StdEncoding.EncodeToString(mac.Sum(nil))
}

// hmacVerify verifies the hmac-sha256 signature `sig` (as returned by `hmacSign` for `key` and `msg`).
// The call succeeds if the signature matches. It fails if the signature is invalid.
func (sigs Signatures) HmacVerify(key, msg, sig string) error {
	if sigs.HmacSign(key, msg) != sig {
		return &sherpa.Error{Code: "badSig", Message: "signature mismatch"}
	}
	return nil
}
