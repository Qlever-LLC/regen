export type UnpackedSadiePAC<T> = ({
  sadie: Sadie,
}) & T

export type PAC<T> = {
	sadie: string;
} & T;

export type Sadie = {
  type?: string;
  pdfHash?: string;
  pacHash?: string;
  quote?: string;
  dataOwner: {
    name: string;
  },
  escrowProvider: {
    name: string;
    runAdditionalPACsLink: string,
  },
}