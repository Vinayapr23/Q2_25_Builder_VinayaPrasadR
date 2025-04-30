pub use anchor_lang::prelude::*;

#[account]
#[derive(Debug,InitSpace)]
pub struct Dao{
    #[max_len(30)]
    pub name:String,
    pub authority:Pubkey,
    pub bump:u8,
    pub proposal_count:u64,
}

#[account]
#[derive(Debug,InitSpace)]
pub struct Proposal{
   
    pub authority:Pubkey,
    pub bump:u8,
    #[max_len(80)]
    pub metadata:String,
    pub yes_votes_count:u64,
    pub no_votes_count:u64,
    pub create_key:Pubkey,
}   

#[account]
pub struct Vote{
    pub authority:Pubkey,
    //0 yes 
    //1 false
    pub vote_type:u8,
    pub vote_credits:u64,//total tokens used or voting quadratic
    pub bump:u8,
}