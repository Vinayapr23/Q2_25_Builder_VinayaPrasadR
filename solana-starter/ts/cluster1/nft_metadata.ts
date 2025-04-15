import wallet from "../dev-wallet.json"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createGenericFile, createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi"
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys"

// Create a devnet connection
const umi = createUmi('https://api.devnet.solana.com');

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader());
umi.use(signerIdentity(signer));

(async () => {
    try {
        // Follow this JSON structure
        // https://docs.metaplex.com/programs/token-metadata/changelog/v1.0#json-structure

       // const image =
        //"https://devnet.irys.xyz/E3QezEpb9XGLD2ZgPZ9NvtSqnU1XJ6fwQ55dQijN2dZw";

      const image = "https://devnet.irys.xyz/CeFaE8QG4uN8W2rAdSo3zGbzEuEDysQVkAfkgNaySB3g"
      const metadata = {
        name: "SENSEI JEFF",
        symbol: "SENJEF",
        description: "The OG of TURBIN3",
        image: image,
        attributes: [
          { trait_type: "beauty", value: "10/10" },
        ],
        properties: {
          files: [
            {
              type: "image/png",
              uri: "?",
            },
          ],
        },
        creators: [],
      };
  
      const myUri = await umi.uploader.uploadJson(metadata);
      console.log("Your meta data URI: ", myUri);
    }
    catch(error) {
        console.log("Oops.. Something went wrong", error);
    }
})();
