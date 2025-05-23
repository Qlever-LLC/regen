/// <reference lib="deno.ns" />

import { Buffer } from "node:buffer";

import forge from "node-forge";

const CERT_PATH = Deno.env.get("P12_CERT_PATH");

const PASSWORD = Deno.env.get("CERT_PASSWORD");

const asn1 = CERT_PATH
  ? forge.asn1.fromDer(
    // TODO: Probably a better way to do this
    Buffer.from(await Deno.readFile(CERT_PATH)).toString("binary"),
  )
  : createSelfSignedCert({ password: PASSWORD });

/**
 * Entire pkcs12 cert
 */
export const CERT = forge.asn1.toDer(asn1).getBytes();

const p12 = forge.pkcs12.pkcs12FromAsn1(asn1, false, PASSWORD);

const keyBags = p12.getBags({ bagType: forge.pki.oids.keyBag })[
  forge.pki.oids.keyBag
];
const shroudedKeyBags = p12.getBags({
  bagType: forge.pki.oids.pkcs8ShroudedKeyBag,
})[forge.pki.oids.pkcs8ShroudedKeyBag];
const certBags = p12.getBags({ bagType: forge.pki.oids.certBag })[
  forge.pki.oids.certBag
];

/**
 * Private key
 */
export const PRIVKEY = shroudedKeyBags?.[0]?.key ?? keyBags![0].key!; // forge.pki.privateKeyFromAsn1(keys.asn1);

/**
 * Public key
 */
export const PUBKEY = certBags![0].cert!.publicKey; // forge.pki.publicKeyFromAsn1(asn1);

interface CertInfo {
  subjectAttrs?: forge.pki.CertificateField[];
  issuerAttrs?: forge.pki.CertificateField[];
  serialNumber?: string;
  password?: string;
  notBefore?: Date;
  notAfter?: Date;
}

/**
 * Generate a self-signed certificate chain
 */
function createSelfSignedCert({
  subjectAttrs,
  issuerAttrs,
  serialNumber,
  password,
  notBefore = new Date(),
  notAfter,
}: CertInfo) {
  console.warn("Generating self-signed certificate");

  const keys = forge.pki.rsa.generateKeyPair(2048);
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  if (serialNumber) {
    cert.serialNumber = serialNumber;
  }
  cert.validity.notBefore = notBefore;
  if (notAfter) {
    cert.validity.notAfter = notAfter;
  }
  if (subjectAttrs) {
    cert.setSubject(subjectAttrs);
  }
  if (issuerAttrs) {
    cert.setIssuer(issuerAttrs);
  }
  const signingKey = keys.privateKey;
  cert.privateKey = keys.privateKey;
  cert.sign(signingKey);
  const pkcs12Asn1 = forge.pkcs12.toPkcs12Asn1(
    keys.privateKey,
    [cert],
    password ?? null,
    {
      algorithm: "3des",
      generateLocalKeyId: true,
      friendlyName: "self-signed",
    },
  );
  return pkcs12Asn1;
  /*
	return {
		pkcs12Cert: forge.asn1.toDer(pkcs12Asn1).getBytes(),
		publicKey: keys.publicKey,
		privateKey: keys.privateKey,
		pemCertificate: forge.pki.certificateToPem(cert),
	};
    */
}
