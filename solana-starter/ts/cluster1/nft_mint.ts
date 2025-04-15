import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createSignerFromKeypair, signerIdentity, generateSigner, percentAmount } from "@metaplex-foundation/umi"
import { createNft, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";

import wallet from "../dev-wallet.json"
import base58 from "bs58";

const RPC_ENDPOINT = "https://api.devnet.solana.com";
const umi = createUmi(RPC_ENDPOINT);

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const myKeypairSigner = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(myKeypairSigner));
umi.use(mplTokenMetadata())

const mint = generateSigner(umi);

//const ImageURI =
  //"https://devnet.irys.xyz/E3QezEpb9XGLD2ZgPZ9NvtSqnU1XJ6fwQ55dQijN2dZw";

const ImageURI = 
"https://devnet.irys.xyz/Fg4C5xbbiTqCD3LNqNMseLpatc37ZB69aGzzm65PNTfy";

(async () => {
   
    let tx = createNft(umi, {
        name: "SENSEI JEFF",
        symbol:"SENJEF",
        mint,
        authority: myKeypairSigner,
        sellerFeeBasisPoints: percentAmount(5),
        isCollection: false,
        uri: "https://devnet.irys.xyz/7ZimE2H6V3yRXzccNwD1z8CWcPz5pEC6Y2bVpeS2ptzM",
      });
  
      let result = await tx.sendAndConfirm(umi);
  
      const signature = base58.encode(result.signature);
  
      console.log(
        `Succesfully Minted! Check out your TX here:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`,
      );
  

    console.log("Mint Address: ", mint.publicKey);
})();