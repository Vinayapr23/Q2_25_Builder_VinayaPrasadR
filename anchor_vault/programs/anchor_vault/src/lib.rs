pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;


pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("2e3MVdpHDdaocGLN5dJTxqeD25Kvdumqu1bJm8StbkpQ");

#[program]
pub mod anchor_vault {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.initialize(&ctx.bumps);
        Ok(())
    }

    pub fn deposit(ctx :Context<Payments>,amount:u64)->Result<()>{
        ctx.accounts.deposit(amount);
         Ok(())
    }
   
    pub fn withdraw(ctx: Context<Payments>,amount:u64) -> Result<()> {
        ctx.accounts.withdraw(amount);
         Ok(())
     }


    pub fn close(ctx: Context<CloseVault>) -> Result<()> {

        ctx.accounts.close();

        Ok(())
    }
}
