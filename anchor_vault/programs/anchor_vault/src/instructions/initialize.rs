use anchor_lang::prelude::*;
use crate::state::VaultState;




#[derive(Accounts)]
pub struct Initialize<'info>{  //info defines a life time for the accounts so they are not accessed beyond scope

    #[account(mut)] //mut beacuse this users sol balance might change
    pub user:Signer<'info>,


       //configuring the vault_state with parameters
       #[account( 
        init, //init the user as a new acc
        payer = user, //user pays for acc creation
        seeds = [b"state", user.key().as_ref()], //derives PDA using state and pubkey
        bump, //bump is automatically provided by anchor (try and match se)
        space = VaultState::INIT_SPACE //allocates space based on VaultState struct
    )]
    pub vault_state: Account<'info, VaultState>, 
  
    #[account(
        seeds =[b"vault" , user.key().as_ref()],
        bump, 
    )]
    pub vault:SystemAccount<'info>,
    pub system_program:Program<'info,System>,
}

impl<'info> Initialize<'info> {
    pub fn initialize(&mut self, bumps: &InitializeBumps) -> Result<()> {
        self.vault_state.vault_bump = bumps.vault; //stores the vault's bump seed in the vault_state account
        self.vault_state.state_bump = bumps.vault_state; //stores the vault_state bump seed in the vault_state account.

        Ok(())
    }
}





