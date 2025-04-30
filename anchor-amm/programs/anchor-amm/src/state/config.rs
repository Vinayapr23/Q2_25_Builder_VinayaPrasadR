use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Config{
    pub authority : Option<Pubkey>, //32 +1
    pub seed :u64, //8
    pub fees : u16,//2
    pub mint_x: Pubkey,//32
    pub mint_y : Pubkey,//32
    pub locked: bool,//1
    pub config_bump: u8,//1
    pub lp_bump:u8, //1   
}