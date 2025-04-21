pub use anchor_lang::prelude::*;


#[account]
//#[derive(InitSpace)]    //if doing manually remove this
pub struct Listing{
  pub maker:Pubkey,
  pub maker_mint:Pubkey,
  pub price:u64,
  pub bump:u8,
 //
}

// the below code is for defining the space manually for the accounts stored in the pda

 impl Space for Listing{
     const INIT_SPACE: usize = 8+32+32+8+1; //ve
 }
 //vector or string already needs 4 bytes