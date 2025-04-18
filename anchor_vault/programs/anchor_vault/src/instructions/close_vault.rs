use anchor_lang::prelude::*;
use crate::state::VaultState;
use anchor_lang::system_program::{transfer, Transfer};


#[derive(Accounts)]  //tranfer mutates balance so system program needed 
pub struct CloseVault<'info>{

        #[account(mut)]
        pub user:Signer<'info>,

          // main pda account storing vault-related data
    #[account(
        mut, // so it can be closed
        seeds = [b"state", user.key().as_ref()], 
        bump = vault_state.state_bump, // Fixed: should be state_bump, not vault_bump
        close = user //once closed, the remaining rent in this account is sent to user
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




    impl<'info> CloseVault<'info>{

        pub fn close(&mut self)->Result<()>
        {
            let cpi_program=self.system_program.to_account_info();
            let cpi_accounts =Transfer{
                from :self.vault.to_account_info(),
                to:self.user.to_account_info() ,
            };
    
          let seeds  = &[
             b"vault",
             self.user.key.as_ref(),
             &[self.vault_state.vault_bump],
          ];
    
          let signer_seeds= &[&seeds[..]];
        let cpi_ctx=CpiContext::new_with_signer(cpi_program, cpi_accounts,signer_seeds);
        let amount = self.vault.to_account_info().lamports();
        transfer(cpi_ctx, amount)
    
        }
    }
    