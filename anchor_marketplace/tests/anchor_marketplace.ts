import * as anchor from "@coral-xyz/anchor";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import { PublicKey, Transaction } from "@solana/web3.js";
import { AnchorMarketplace } from "../target/types/anchor_marketplace";

describe("anchor_marketplace using real NFT", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.anchorMarketplace as anchor.Program<AnchorMarketplace>;

  const maker = provider.wallet;
  console.log(maker.publicKey.toBase58()); // This will print the maker's Solana address
  const taker = anchor.web3.Keypair.generate(); // Taker for purchases
  const name = "m7"; // Unique name for the marketplace
  const price = new anchor.BN(1_000_000); // 1 SOL price for listing

  // 🧩 Real NFT from Devnet
  const mint = new PublicKey("2Az1ceKAStpDK39GxJzZw17PwPFGyjBLVGgxf6v9FwuE");
  const metadata = new PublicKey("AqhQzq3doV4cQGp8bFiCdu5eajLsZ9riKFAayKbpiUnM");
  const masterEdition = new PublicKey("2MkCeZ9gv5HEX2mbaADYKSEqR9Hs8UUR9VDUwCHSptVT");
  const metadataProgram = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

  // 💾 State PDAs
  let marketplace: PublicKey;
  let treasury: PublicKey;
  let rewards: PublicKey;
  let listing: PublicKey;
  let vault: PublicKey;
  let makerAta: PublicKey;
  let takerAta: PublicKey;

  before("Setup & Ensure ATAs", async () => {
    // Airdrop SOL to the maker for account creation (2 SOL)
    const airdropSignature = await provider.connection.requestAirdrop(maker.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    await provider.connection.confirmTransaction(airdropSignature);
    console.log("✅ Airdropped SOL to maker:", maker.publicKey.toBase58());

    // Airdrop SOL to the taker for purchasing the NFT (2 SOL)
    const takerAirdrop = await provider.connection.requestAirdrop(taker.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    await provider.connection.confirmTransaction(takerAirdrop);
    console.log("✅ Airdropped SOL to taker:", taker.publicKey.toBase58());

    [marketplace] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("marketplace"), Buffer.from(name)],
      program.programId
    );
    [treasury] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("treasury"), marketplace.toBuffer()],
      program.programId
    );
    [rewards] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("rewards"), marketplace.toBuffer()],
      program.programId
    );
    [listing] = anchor.web3.PublicKey.findProgramAddressSync(
      [marketplace.toBuffer(), mint.toBuffer()],
      program.programId
    );

    // Get ATA addresses
    vault = await getAssociatedTokenAddress(mint, listing, true);
    makerAta = await getAssociatedTokenAddress(mint, maker.publicKey);

    // ✅ Ensure maker ATA exists
    const ataInfo = await provider.connection.getAccountInfo(makerAta);
    if (!ataInfo) {
      const createAtaIx = createAssociatedTokenAccountInstruction(
        maker.publicKey, // payer
        makerAta,        // ata address
        maker.publicKey, // owner
        mint             // NFT mint
      );
      const tx = new Transaction().add(createAtaIx);
      await provider.sendAndConfirm(tx);
      console.log("✅ Created maker ATA:", makerAta.toBase58());
    }

    // Ensure taker's ATA exists for purchasing
    takerAta = await getAssociatedTokenAddress(mint, taker.publicKey);
    const takerAtaInfo = await provider.connection.getAccountInfo(takerAta);
    if (!takerAtaInfo) {
      const createTakerAtaIx = createAssociatedTokenAccountInstruction(
        taker.publicKey,
        takerAta,
        taker.publicKey,
        mint
      );
      const tx = new Transaction().add(createTakerAtaIx);
      await provider.sendAndConfirm(tx, [taker]);
      console.log("✅ Created taker ATA:", takerAta.toBase58());
    }
  });

  it("Initializes the marketplace", async () => {
    const tx = await program.methods
      .initialize(name, 100) // 1% fee
      .accountsPartial({
        admin: maker.publicKey,
        marketplace,
        treasury,
        rewards,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
    console.log("✅ Marketplace initialized:", tx);
  });

  it("Lists the NFT", async () => {
    const tx = await program.methods
      .list(price) // This single call should handle both initialization and listing
      .accountsPartial({
        maker: maker.publicKey,
        marketplace,
        makerMint: mint,
        makerMintAta: makerAta,
        vault,
        listing, // Pass the `listing` account to be initialized
        collectionMint: mint,
        metadata,
        masterEdition,
        metadataProgram,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      .rpc();
  
    console.log("✅ NFT listed successfully:", tx);
  });

  it("Purchases the NFT", async () => {
    // Ensure taker can purchase
    const takerRewardsAta = await getAssociatedTokenAddress(
      rewards,
      taker.publicKey
    );

    const tx = await program.methods
      .purchase()
      .accountsPartial({
        taker: taker.publicKey,
        maker: maker.publicKey,
        makerMint: mint,
        marketplace,
        takerAta,
        takerRewardsAta,
        listing,
        vault,
        treasury,
        rewardsMint: rewards,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([taker])
      .rpc();

    console.log("✅ NFT purchased successfully:", tx);
  });

 /* it("Delists the NFT", async () => {
    const tx = await program.methods
      .delist()
      .accountsPartial({
        maker: maker.publicKey,
        marketplace,
        makerMint: mint,
        makerMintAta: makerAta,
        listing,
        vault,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("✅ NFT delisted successfully:", tx);
  });*/
});
