import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorVault } from "../target/types/anchor_vault";

describe("vault", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env(); 
  anchor.setProvider(provider);

  const program = anchor.workspace.anchorVault as Program<AnchorVault>;

  // Generate the PDA for the vault state and vault account
  const [vaultState, vaultStateBump] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("state"), provider.wallet.publicKey.toBuffer()],
    program.programId
  );
  
  const [vault, vaultBump] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), provider.wallet.publicKey.toBuffer()],
    program.programId
  );
  console.log("Wallet pubkey:", provider.wallet.publicKey.toBase58());
  console.log("Vault state:", vaultState.toBase58());
  console.log("Vault state bump:", vaultStateBump);
  console.log("Vault:", vault.toBase58());
  console.log("Vault bump:", vaultBump);
  console.log("Program ID:", program.programId.toBase58());

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods
    .initialize()
    .accountsPartial({
      user: provider.wallet.publicKey,
      vaultState,
      vault,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();

    console.log("\nYour transaction signature", tx);
    console.log(
      "Your vault info",
      await provider.connection.getAccountInfo(vault)
    );
  });

  

  it("Deposit 2 SOL", async () => {
    const tx = await program.methods
      .deposit(new anchor.BN(2 * anchor.web3.LAMPORTS_PER_SOL))
      .accountsPartial({
        user: provider.wallet.publicKey,
        vaultState,
        vault,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc();

      console.log("\nYour transaction signature", tx);
      console.log(
        "Your vault info",
        await provider.connection.getAccountInfo(vault)
      );
      console.log(
        "Your vault balance",
        (await provider.connection.getBalance(vault)).toString()
      );
  });

  it("Withdraw 1 SOL", async () => {
    const tx = await program.methods
      .withdraw(new anchor.BN(1 * anchor.web3.LAMPORTS_PER_SOL))
      .accountsPartial({
        user: provider.wallet.publicKey,
        vaultState,
        vault,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc();

    console.log("\nYour transaction signature", tx);
    console.log(
      "Your cault balance",
      (await provider.connection.getBalance(vault)).toString()
    );
  });

  it("Close vault", async () => {
    const tx = await program.methods
      .close()
      .accountsPartial({
        user: provider.wallet.publicKey,
        vaultState,
        vault,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc();

      console.log("\nYour transaction signature", tx);
      console.log(
        "Your vault info",
        await provider.connection.getAccountInfo(vault)
      );
  });

});