import { Commitment, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"
import wallet from "../dev-wallet.json"
import { getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";

// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

// Mint address
const mint = new PublicKey("3G5fyKpQjqN7mvMjd1t8j7ERa9N3sBrddn6cDfZSoCz9");

// Recipient address
let toAddress="52qRER5VyGpF77QHf528zf78xyCkf1yC19ouTLUfH7VA"

const to = new PublicKey("52qRER5VyGpF77QHf528zf78xyCkf1yC19ouTLUfH7VA");
console.log("Recipient Address:", to.toBase58());


(async () => {
    try {
        const ataFrom = await getOrCreateAssociatedTokenAccount(
            connection,
            keypair,
            mint,
            keypair.publicKey
          );
      
          const ataTo = await getOrCreateAssociatedTokenAccount(
            connection,
            keypair,
            mint,
            to
          );
      
          const transferTx = await transfer(
            connection,
            keypair,
            ataFrom.address,
            ataTo.address,
            keypair.publicKey,
            10 * 1_000_000
          );
      
          console.log(`Your Transfer txid: ${transferTx}`);
          console.log(
            `Transaction: https://explorer.solana.com/tx/${transferTx}?cluster=devnet`
          );
    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
})();