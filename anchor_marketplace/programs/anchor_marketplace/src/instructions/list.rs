use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    metadata::{MasterEditionAccount, Metadata, MetadataAccount},
    token_interface::{transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked},
};

use crate::state::{Listing, Marketplace};

#[derive(Accounts)]
pub struct List<'info> {
    #[account(mut)]
    pub maker: Signer<'info>,

    #[account(
     seeds = [b"marketplace",marketplace.name.as_str().as_bytes()],
     bump = marketplace.bump,
  )]
    pub marketplace: Account<'info, Marketplace>,
    pub maker_mint: InterfaceAccount<'info, Mint>,

    #[account(
    mut,
    associated_token::mint = maker_mint,
    associated_token::authority = maker,
  )]
    pub maker_mint_ata: InterfaceAccount<'info, TokenAccount>,

    #[account(
    init,
    payer = maker,
    associated_token::mint = maker_mint,
    associated_token::authority = listing,
  )]
    pub vault: InterfaceAccount<'info, TokenAccount>,

    #[account(
    init,
    payer=maker,
    seeds =[marketplace.key().as_ref(),maker_mint.key().as_ref()],
    bump,
    space = Listing::INIT_SPACE
  )]
    pub listing: Account<'info, Listing>,
    pub collection_mint: InterfaceAccount<'info, Mint>,

    #[account(
    seeds =[b"metadata",metadata_program.key().as_ref(),maker_mint.key().as_ref()],
    seeds::program = metadata_program.key(), //specifyin which program it belongs to from metadata program
    bump,
   // constraint = metadata.collection.as_ref().unwrap().key.as_ref() == collection_mint.key().as_ref(),  //metadats collection same as collection mint
   //constraint = metadata.collection.as_ref().unwrap().verified == true,  //can create any nft we want but need to be verified some collection to belong to that collection
  )]
    pub metadata: Account<'info, MetadataAccount>,
 
   
    #[account(
    seeds =[
      b"metadata",
      metadata_program.key().as_ref(),
      maker_mint.key().as_ref(),
      b"edition"
    ],
    seeds::program = metadata_program.key(),
    bump,
  )]
 
pub master_edition: Account<'info, MasterEditionAccount>,

    pub metadata_program: Program<'info, Metadata>,//metaplex program
    pub associated_token_program: Program<'info, AssociatedToken>,// fro creating ata
    pub token_program: Interface<'info, TokenInterface>, // for token operations
    pub system_program: Program<'info, System>, // for creating accounts
}

impl<'info> List<'info> {
    pub fn create_listing(&mut self, price: u64, bump: &ListBumps) -> Result<()> {
        self.listing.set_inner(Listing {
            maker: self.maker.key(),
            maker_mint: self.maker_mint.key(),
            bump: bump.listing,
            price,
        });

        Ok(())
    }

    pub fn deposit_nft(&mut self) -> Result<()> {
        let cpi_program = self.token_program.to_account_info();

        let cpi_accounts = TransferChecked {
            from: self.maker_mint_ata.to_account_info(),
            to: self.vault.to_account_info(),
            mint: self.maker_mint.to_account_info(),
            authority: self.maker.to_account_info(),
        };

        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        transfer_checked(cpi_ctx, self.maker_mint_ata.amount, self.maker_mint.decimals)?;

        Ok(())
    }
}