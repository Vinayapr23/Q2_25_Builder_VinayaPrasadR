pub use anchor_lang::prelude::*;
pub use crate::state::Dao;

#[derive(Accounts)]
#[instruction(name:String)]
pub struct InitDao<'info>{
  
  #[account(mut)]
  pub creator:Signer<'info>,
    
    #[account(
        init,
        payer = creator,
        space = 8+Dao::INIT_SPACE,
        seeds = [b"dao", creator.key().as_ref(),name.as_bytes()],
        bump,
    )]
    pub dao_acount:Account<'info,Dao>,

    pub system_program:Program<'info,System>,


}

impl<'info> InitDao<'info>{
    pub fn init_dao(ctx:Context<Self>,name:String)->Result<()>{
        let dao_acount=&mut ctx.accounts.dao_acount;
        let creator=ctx.accounts.creator.key();
        let bump=ctx.bumps.get("dao_acount").unwrap(); //use self .inner
        dao_acount.name=name;
        dao_acount.authority=creator;
        dao_acount.bump=*bump;

        dao_account.proposal_count=+1;
        Ok(())
    }
}