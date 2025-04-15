import wallet from "../dev-wallet.json"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { 
    createMetadataAccountV3, 
    CreateMetadataAccountV3InstructionAccounts, 
    CreateMetadataAccountV3InstructionArgs,
    DataV2Args
} from "@metaplex-foundation/mpl-token-metadata";
import { createSignerFromKeypair, signerIdentity, publicKey } from "@metaplex-foundation/umi";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";

// Define our Mint address
const mint = publicKey("3G5fyKpQjqN7mvMjd1t8j7ERa9N3sBrddn6cDfZSoCz9")

// Create a UMI connection
const umi = createUmi('https://api.devnet.solana.com');
const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(createSignerFromKeypair(umi, keypair)));

(async () => {
    try {
        // Start here
         
  let accounts: CreateMetadataAccountV3InstructionAccounts = {
    mint: mint,
    mintAuthority: signer
}

let data: DataV2Args = {
    name: "NEO",
    symbol: "NEO",
    uri: "https://arweave.net/123456",
    sellerFeeBasisPoints: 500,
    creators: [{ address: keypair.publicKey, verified: true, share: 100 }],
collection: null,
uses: null,
}

let args: CreateMetadataAccountV3InstructionArgs = {
   data: data,
   isMutable: true,
   collectionDetails: null,
 };

let tx = createMetadataAccountV3(
    umi,
    {
        ...accounts,
        ...args
    }
)

let result = await tx.sendAndConfirm(umi);
console.log(bs58.encode(result.signature));
    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
})();
