import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorMarketplace } from "../target/types/anchor_marketplace";
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import {
  createNft,
  findMasterEditionPda,
  findMetadataPda,
  mplTokenMetadata,
  verifySizedCollectionItem,
} from "@metaplex-foundation/mpl-token-metadata";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  KeypairSigner,
  PublicKey,
  createSignerFromKeypair,
  generateSigner,
  keypairIdentity,
  percentAmount,
} from "@metaplex-foundation/umi";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";

describe("marketplace", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.AnchorMarketplace as Program<AnchorMarketplace>;

  const umi = createUmi(provider.connection);

  const payer = provider.wallet as NodeWallet;

  let nftMint: KeypairSigner = generateSigner(umi);
  let collectionMint: KeypairSigner = generateSigner(umi);

  const creatorWallet = umi.eddsa.createKeypairFromSecretKey(
    new Uint8Array(payer.payer.secretKey)
  );
  const creator = createSignerFromKeypair(umi, creatorWallet);
  umi.use(keypairIdentity(creator));
  umi.use(mplTokenMetadata());

  const collection: anchor.web3.PublicKey = new anchor.web3.PublicKey(
    collectionMint.publicKey.toString()
  );

  it("Mint Collection NFT", async () => {
    await createNft(umi, {
      mint: collectionMint,
      name: "NEO",
      symbol: "NEO",
      uri: "https://arweave.net/123",
      sellerFeeBasisPoints: percentAmount(5.5),
      creators: null,
      collectionDetails: {
        __kind: "V1",
        size: 10,
      },
    }).sendAndConfirm(umi);
    console.log(
      `Created Collection NFT: ${collectionMint.publicKey.toString()}`
    );
  });

  it("Mint NFT", async () => {
    await createNft(umi, {
      mint: nftMint,
      name: "NEO",
      symbol: "NEO",
      uri: "https://arweave.net/123",
      sellerFeeBasisPoints: percentAmount(5.5),
      creators: null,
      collection: {
        verified: false,
        key: collectionMint.publicKey,
      },
    }).sendAndConfirm(umi);
    console.log(`Created NFT: ${nftMint.publicKey.toString()}`);
  });

  it("verify collection", async () => {
    const collectionMetadata = findMetadataPda(umi, {
      mint: collectionMint.publicKey,
    });
    const collectionMasterEdition = findMasterEditionPda(umi, {
      mint: collectionMint.publicKey,
    });

    const nftMetadata = findMetadataPda(umi, { mint: nftMint.publicKey });
    await verifySizedCollectionItem(umi, {
      metadata: nftMetadata,
      collectionAuthority: creator,
      collectionMint: collectionMint.publicKey,
      collection: collectionMetadata,
      collectionMasterEditionAccount: collectionMasterEdition,
    }).sendAndConfirm(umi);
    console.log("Collection NFT Verified!");
  });
  const marketPlaceName = "Matrix1";
  const marketFee = 16;
  const [marketPdaAccount, marketPdaAccountBump] =
    anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("marketplace"), Buffer.from(marketPlaceName)],
      program.programId
    );
  const [treasuryPda, treasuryBump] =
    anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("treasury"), marketPdaAccount.toBuffer()],
      program.programId
    );

  it("Initialize market", async () => {
    try {
      // Pre-fund treasury with some SOL
      await provider.sendAndConfirm(
        new anchor.web3.Transaction().add(
          anchor.web3.SystemProgram.transfer({
            fromPubkey: provider.wallet.publicKey,
            toPubkey: treasuryPda,
            lamports: anchor.web3.LAMPORTS_PER_SOL / 10, // 0.1 SOL
          })
        )
      );
      console.log("Funded treasury with 0.1 SOL");

      const tx = await program.methods
        .initialize( marketPlaceName,marketFee,)
        .accountsPartial({
          admin: provider.wallet.publicKey,
          marketplace: marketPdaAccount,
          treasury: treasuryPda,
          tokenProgram: TOKEN_PROGRAM_ID, // Add this line
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      console.log("Market initialized with tx:", tx);
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  });

  it("List NFT", async () => {
    // Compute listing PDA and vault ATA
    const [listingPda, listingBump] = anchor.web3.PublicKey.findProgramAddressSync(
      [marketPdaAccount.toBuffer(), new anchor.web3.PublicKey(nftMint.publicKey).toBuffer()],
      program.programId
    );
    const vault = getAssociatedTokenAddressSync(
      new anchor.web3.PublicKey(nftMint.publicKey),
      listingPda,
      true // allowOwnerOffCurve
    );

    const price = new anchor.BN(1000000);
    const [metadataPda] = findMetadataPda(umi, { mint: nftMint.publicKey });
    const [masterEditionPda] = findMasterEditionPda(umi, {
      mint: nftMint.publicKey,
    });

    const tx = await program.methods
      .list(price)
      .accountsPartial({
        maker: provider.wallet.publicKey,
        marketplace: marketPdaAccount,
        makerMint: nftMint.publicKey,
        makerMintAta: getAssociatedTokenAddressSync(
          new anchor.web3.PublicKey(nftMint.publicKey),
          provider.wallet.publicKey
        ),
        vault: vault,
        listing: listingPda,
        collectionMint: collectionMint.publicKey,
        metadata: metadataPda,
        masterEdition: masterEditionPda,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        metadataProgram: new anchor.web3.PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"),
      })
      .rpc();
    console.log("NFT listed", tx);
  });

  it("Purchase NFT", async () => {
    // For simplicity use the same PDA addresses from listing test.
    const [listingPda, _] = anchor.web3.PublicKey.findProgramAddressSync(
      [marketPdaAccount.toBuffer(),new anchor.web3.PublicKey(nftMint.publicKey).toBuffer()],
      program.programId
    );
    const vault = getAssociatedTokenAddressSync(
      new anchor.web3.PublicKey(nftMint.publicKey),
      listingPda,
      true
    );
    const tx = await program.methods
      .purchase()
      .accountsPartial({
        taker: provider.wallet.publicKey,
        maker: provider.wallet.publicKey,
        marketplace: marketPdaAccount,
        makerMint: new anchor.web3.PublicKey(nftMint.publicKey),
        takerAta: getAssociatedTokenAddressSync(
          new anchor.web3.PublicKey(nftMint.publicKey),
          provider.wallet.publicKey
        ),
        vault: vault,
        listing: listingPda,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
    console.log("NFT purchased", tx);
  });

  let secondNftMint;

  it("Mint and List a second NFT for delist test", async () => {
    // Generate a new mint for our second NFT
     secondNftMint = generateSigner(umi);
    
    console.log("Minting second NFT...");
    await createNft(umi, {
      mint: secondNftMint,
      name: "NEO-2",
      symbol: "NEO",
      uri: "https://arweave.net/123",
      sellerFeeBasisPoints: percentAmount(5.5),
      creators: null,
      collection: {
        verified: false,
        key: collectionMint.publicKey,
      },
    }).sendAndConfirm(umi);
    console.log(`Created second NFT: ${secondNftMint.publicKey.toString()}`);
    
    // Verify the collection for second NFT
    const collectionMetadata = findMetadataPda(umi, {
      mint: collectionMint.publicKey,
    });
    const collectionMasterEdition = findMasterEditionPda(umi, {
      mint: collectionMint.publicKey,
    });
  
    const nftMetadata = findMetadataPda(umi, { mint: secondNftMint.publicKey });
    await verifySizedCollectionItem(umi, {
      metadata: nftMetadata,
      collectionAuthority: creator,
      collectionMint: collectionMint.publicKey,
      collection: collectionMetadata,
      collectionMasterEditionAccount: collectionMasterEdition,
    }).sendAndConfirm(umi);
  
    
    // List the second NFT
    const [listingPda, listingBump] = anchor.web3.PublicKey.findProgramAddressSync(
      [marketPdaAccount.toBuffer(), new anchor.web3.PublicKey(secondNftMint.publicKey).toBuffer()],
      program.programId
    );
    
    const vault = getAssociatedTokenAddressSync(
      new anchor.web3.PublicKey(secondNftMint.publicKey),
      listingPda,
      true // allowOwnerOffCurve
    );
  
    const price = new anchor.BN(1000000);
    const [metadataPda] = findMetadataPda(umi, { mint: secondNftMint.publicKey });
    const [masterEditionPda] = findMasterEditionPda(umi, {
      mint: secondNftMint.publicKey,
    });
  
    const tx = await program.methods
      .list(price)
      .accountsPartial({
        maker: provider.wallet.publicKey,
        marketplace: marketPdaAccount,
        makerMint: secondNftMint.publicKey,
        makerMintAta: getAssociatedTokenAddressSync(
          new anchor.web3.PublicKey(secondNftMint.publicKey),
          provider.wallet.publicKey
        ),
        vault: vault,
        listing: listingPda,
        collectionMint: collectionMint.publicKey,
        metadata: metadataPda,
        masterEdition: masterEditionPda,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        metadataProgram: new anchor.web3.PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"),
      })
      .rpc();
    console.log("Second NFT listed with tx:", tx);
    
    // Save the second NFT mint for later tests
    global.secondNftMint = secondNftMint;
  });

















  it("Delist NFT", async () => {
    // Use the same PDA addresses computed earlier.

  

    const [listingPda, _] = anchor.web3.PublicKey.findProgramAddressSync(
      [marketPdaAccount.toBuffer(), new anchor.web3.PublicKey(secondNftMint.publicKey).toBuffer()],
      program.programId
    );
    console.log("Listing PDA for delistng:", listingPda.toString());
    
    // Verify the listing account exists
    const listingAccount = await provider.connection.getAccountInfo(listingPda);
    console.log("Listing account exists:", !!listingAccount);
    
    const vault = getAssociatedTokenAddressSync(
      new anchor.web3.PublicKey(secondNftMint.publicKey),
      listingPda,
      true
    );
    
    const tx = await program.methods
      .delist()
      .accountsPartial({
        maker: provider.wallet.publicKey,
        marketplace: marketPdaAccount,
        makerMint: new anchor.web3.PublicKey(secondNftMint.publicKey),
        makerMintAta: getAssociatedTokenAddressSync(
          new anchor.web3.PublicKey(secondNftMint.publicKey),
          provider.wallet.publicKey
        ),
        vault: vault,
        listing: listingPda,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
    console.log("Second NFT delisted with tx:", tx);
  });
});