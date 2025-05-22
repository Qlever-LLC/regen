# [Generate Self-Signed p12][p12]

Generate private key and cert

```sh
openssl req -x509 -newkey rsa:4096 -keyout myKey.pem -out cert.pem -days 365 -nodes
```

Create PKCS12 file

```sh
openssl pkcs12 -export -out keyStore.p12 -inkey myKey.pem -in cert.pem
```

# Run tests using generated p12

```sh
P12_CERT_PATH=./keyStore.p12 CERT_PASSWORD= --allow-env --allow-read --allow-net deno test
```

[p12]: https://serverfault.com/questions/831394/how-can-i-create-a-pkcs12-file-using-openssl-self-signed-certs "self-sign p12"
