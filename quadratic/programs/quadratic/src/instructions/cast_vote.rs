use anchor_lang::prelude::*;
use crate::state::{Dao, Proposal, Vote};

#[derive(Accounts)]
pub struct CastVote<'info> {
    #[account(mut)]
    pub voter: Signer<'info>,
    #[account(
        mut,
        seeds = [b"dao", dao.key().as_ref()],
        bump = dao.bump,
    )]
    pub dao: Account<'info, Dao>,
    #[account(
        mut,
        seeds = [b"proposal", proposal.key().as_ref(), dao.key().as_ref()],
        bump = proposal.bump,
    )]
    pub proposal: Account<'info, Proposal>,
    #[account(
        mut,
        seeds = [b"vote", voter.key().as_ref(), proposal.key().as_ref()],
        bump,
    )]
    pub vote_account: Account<'info, Vote>,
    #[account(
       token::authority = voter,
    )]
    pub creator_token_account: Account<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
}


impl<'info> CastVote<'info> {
    pub fn cast_vote(ctx: Context<Self>, vote_type: u8, vote_credits: u64) -> Result<()> {
        let vote_account = &mut ctx.accounts.vote_account;
        let voter = ctx.accounts.voter.key();
        
        
        let voting_credits = (ctx.accounts.creator_token_account.amount as f64).sqrt() as u64;
        //floating point can be indeterministic due to trucnation
        //fixed point arithemtics fixed precision arithmetics
        
        let bump = ctx.bumps.get("vote_account").unwrap(); //use self .inner
        vote_account.authority = voter;
        vote_account.vote_type = vote_type;
        vote_account.vote_credits = vote_credits;
        vote_account.bump = *bump;
        Ok(())
    }
}