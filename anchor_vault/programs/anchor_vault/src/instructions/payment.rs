use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};
use crate::state::VaultState;


#[derive(Accounts)]
pub struct Payments<'info>{

    #[account(mut)]
    pub user:Signer<'info>,
    
    #[account(
        seeds = [b"state", user.key().as_ref()],
        bump = vault_state.state_bump
    )]
    pub vault_state: Account<'info, VaultState>,

    #[account(
        mut,
        seeds =[b"vault" , user.key().as_ref()],
        bump=vault_state.vault_bump,  //already derving so can be used always
    )]
    pub vault:SystemAccount<'info>,

    pub system_program:Program<'info,System>



}


impl <'info>Payments<'info>{


pub fn deposit(&mut self,amount:u64)->Result<()>{

    let cpi_program = self.system_program.to_account_info();
    let cpi_accounts=Transfer{
        from:self.user.to_account_info(),
        to:self.vault.to_account_info(),
    };

    let cpi_ctx=CpiContext::new(cpi_program,cpi_accounts);
     transfer(cpi_ctx,amount)

     
   
}


pub fn withdraw(&mut self,amount:u64)->Result<()>{

    let cpi_program = self.system_program.to_account_info();
    let cpi_accounts=Transfer{
        from:self.vault.to_account_info(),
        to:self.user.to_account_info(),
    };
   
   let user_key =self.user.key();
   let seeds =&[
    b"vault",
   user_key.as_ref(),
   &[self.vault_state.vault_bump],
   ];

   let signer_seeds=&[&seeds[..]];

let cpi_ctx =CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
   

transfer(cpi_ctx,amount)

} 
    
}