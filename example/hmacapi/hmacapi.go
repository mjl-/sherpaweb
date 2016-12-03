// An HMAC is a cryptographic hash that uses a key to sign a message. Example API provides a function to create a signature, given a key and message (as a string). And another function to verify a signature is valid.
package hmacapi

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"

	"bitbucket.org/mjl/sherpa"
)

// hmacSign(key string, msg string): string
//
// hmacSign returns the hmac-sha256 of `key` and `msg` in base64-encoded format.
// sherpa: hmacSign
func HmacSign(key, msg string) string {
	mac := hmac.New(sha256.New, []byte(key))
	mac.Write([]byte(msg))
	return base64.StdEncoding.EncodeToString(mac.Sum(nil))
}

// hmacVerify(key string, msg string, sig string): string
//
// hmacVerify verifies the hmac-sha256 signature `sig` (as returned by `hmacSign` for `key` and `msg`).
// The call succeeds if the signature matches. It fails if the signature is invalid.
// sherpa: hmacVerify
func HmacVerify(key, msg, sig string) error {
	if HmacSign(key, msg) != sig {
		return &sherpa.Error{Code: "badSig", Message: "signature mismatch"}
	}
	return nil
}
