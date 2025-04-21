pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("D2B33hSGnCFoaQMadKR17MxaKjJ8KeNaBDqjQDFQLCKR");

#[program]
pub mod anchor_marketplace {
    use super::*;
    pub fn initialize(
        ctx: Context<Initialize>,
        name: String,
        fee: u16,
    ) -> Result<()> {
        ctx.accounts.initialize(name, fee, &ctx.bumps)
    }

    pub fn list(
        ctx: Context<List>,
        price: u64,
    ) -> Result<()> {
        ctx.accounts.deposit_nft()?;
        ctx.accounts.create_listing(price, &ctx.bumps)
       
    }

    pub fn delist(ctx: Context<Delist>) -> Result<()> {
        ctx.accounts.delist_nft()
    }

    pub fn purchase(ctx: Context<Purchase>) -> Result<()> {
        ctx.accounts.send_sol()?;
        ctx.accounts.send_nft()?;
        ctx.accounts.close_mint_vault()
    }

   
}
