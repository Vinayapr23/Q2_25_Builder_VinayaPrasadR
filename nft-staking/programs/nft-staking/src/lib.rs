pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("EP9AhkmPPmgeWgxoEkT6nGDX4LMYHNXNFTFoZM85sxaq");

#[program]
pub mod nft_staking {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
      //  initialize::handler(ctx)
      Ok(())
    }
}

//RUSTUP_TOOLCHAIN=nightly-2025-04-01 anchor idl build -o target/idl/nft-staking.json -t target/types/nft-staking.ts
