Generate the private key:

```
openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2048
```

Extract the public key:

```
openssl pkey -in private_key.pem -pubout -out public_key.pem
```

Run the test:

```
PUBKEY=./public_key.pem PRIVKEY=./private_key.pem --allow-env --allow-read --allow-net deno test ./test/certification.ts
```
