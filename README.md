Making a .p12: 
```
openssl genrsa -out test.key 2048
openssl req -new -x509 -key test.key -out test.crt -days 365 -subj "/CN=Test Cert"
openssl pkcs12 -export -out test.p12 -inkey test.key -in test.crt -passout pass:password123
```

Extract DER:
```
openssl pkcs12 -in test.p12 -clcerts -nokeys -out cert.pem -passin pass:password123
openssl x509 -outform der -in cert.pem -out cert.der
openssl x509 -in cert.pem -pubkey -noout | openssl pkey -pubin -outform DER > pubkey.der
```

```
CERT_PASS=password123 P12_CERT_PATH=./test.p12 CERT_DER=./pubkey.der deno task dev
```


