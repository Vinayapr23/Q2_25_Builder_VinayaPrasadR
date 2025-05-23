import wallet from "../dev-wallet.json"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createGenericFile, createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi"
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys"
import { readFile } from "fs/promises"

// Create a devnet connection
const umi = createUmi('https://api.devnet.solana.com');

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader());
umi.use(signerIdentity(signer));

(async () => {
    try {
    
      const image = await readFile("./cluster1/rug.png"); 
      //const generic = createGenericFile(new Uint8Array(image), "image/png");
      const generic = await createGenericFile(image, "rug.png", {
        contentType: "image/png",
      });
      const [myUri] = await umi.uploader.upload([generic]);
  
      console.log("Your image URI: ", myUri);
    } 
    catch(error) {
        console.log("Oops.. Something went wrong", error);
    }
})();
