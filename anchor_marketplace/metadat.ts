import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { publicKey } from "@metaplex-foundation/umi";
import {
  findMetadataPda,
  findMasterEditionPda,
} from "@metaplex-foundation/mpl-token-metadata";

const umi = createUmi("https://api.devnet.solana.com");

const mint = publicKey("2Az1ceKAStpDK39GxJzZw17PwPFGyjBLVGgxf6v9FwuE");

const metadataPda = findMetadataPda(umi, { mint });
const editionPda = findMasterEditionPda(umi, { mint });

console.log("Metadata PDA:", metadataPda[0].toString());
console.log("Master Edition PDA:", editionPda[0].toString());

//solana account -u devnet 2Az1ceKAStpDK39GxJzZw17PwPFGyjBLVGgxf6v9FwuE --output json-compact --output-file mint_account.json

//solana account -u devnet AqhQzq3doV4cQGp8bFiCdu5eajLsZ9riKFAayKbpiUnM   --output json-compact --output-file metadata_account.json
//solana account -u devnet 2MkCeZ9gv5HEX2mbaADYKSEqR9Hs8UUR9VDUwCHSptVT   --output json-compact --output-file edition_account.json
//solana program dump -u devnet metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s ./metadata_program.so