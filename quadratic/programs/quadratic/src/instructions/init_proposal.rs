use anchor_lang::prelude::*;
pub use crate::state::Dao;

#[derive(Accounts)]
pub struct InitProposal<'info> {

    #[account(mut)]
    pub creator: Signer<'info>,
      
      #[account(
          mut,
          seeds = [b"dao", creator.key().as_ref(), name.as_bytes()],
          bump,
      )]
      pub dao_account: Account<'info, Dao>,

    
    #[account(
        init,
        payer = creator,
        space = 8 + Proposal::INIT_SPACE,
        seeds = [b"proposal", dao_account.key().as_ref(), dao_account.proposal_count.to_le_bytes().as_ref()],
        bump,
    )]
    pub proposal_account: Account<'info, Proposal>,


    pub system_program: Program<'info, System>,
}

impl<'info> InitProposal<'info> {
    pub fn init_proposal(ctx: Context<Self>, metadata: String) -> Result<()> {
        let proposal_account = &mut ctx.accounts.proposal_account;
        let creator = ctx.accounts.creator.key();
        let bump = ctx.bumps.get("proposal_account").unwrap(); //use self .inner
        proposal_account.authority = creator;
        proposal_account.bump = *bump;
        proposal_account.metadata = metadata;
        proposal_account.yes_votes_count = 0;
        proposal_account.no_votes_count = 0;
        proposal_account.create_key = ctx.accounts.dao_account.key();
        dao_account.proposal_count=+1;
        Ok(())
    }
}