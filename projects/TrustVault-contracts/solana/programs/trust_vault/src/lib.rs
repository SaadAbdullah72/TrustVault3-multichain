use anchor_lang::prelude::*;
use anchor_lang::solana_program::clock::Clock;

declare_id!("TrustVau1t111111111111111111111111111111111");

#[program]
pub mod trust_vault {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>, 
        beneficiary: Pubkey, 
        lock_duration: i64
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.owner = ctx.accounts.owner.key();
        vault.beneficiary = beneficiary;
        vault.lock_duration = lock_duration;
        vault.last_heartbeat = Clock::get()?.unix_timestamp;
        vault.released = false;
        Ok(())
    }

    pub fn heartbeat(ctx: Context<Heartbeat>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.last_heartbeat = Clock::get()?.unix_timestamp;
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.owner.key(),
            &ctx.accounts.vault.key(),
            amount,
        );
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.owner.to_account_info(),
                ctx.accounts.vault.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;
        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        require!(!vault.released, TrustError::AlreadyReleased);
        
        let vault_info = vault.to_account_info();
        let owner_info = ctx.accounts.owner.to_account_info();

        // Check if vault has enough lamports
        if **vault_info.lamports.borrow() < amount {
            return err!(TrustError::InsufficientFunds);
        }

        **vault_info.try_borrow_mut_lamports()? -= amount;
        **owner_info.try_borrow_mut_lamports()? += amount;

        Ok(())
    }

    pub fn auto_release(ctx: Context<Release>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        let now = Clock::get()?.unix_timestamp;
        
        require!(
            now >= vault.last_heartbeat + vault.lock_duration, 
            TrustError::NotExpired
        );
        
        vault.released = true;
        
        let vault_info = vault.to_account_info();
        let beneficiary_info = ctx.accounts.beneficiary.to_account_info();

        let amount = **vault_info.lamports.borrow();
        **vault_info.try_borrow_mut_lamports()? -= amount;
        **beneficiary_info.try_borrow_mut_lamports()? += amount;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init, 
        payer = owner, 
        space = 8 + 32 + 32 + 8 + 8 + 1,
        seeds = [b"vault", owner.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, VaultAccount>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Heartbeat<'info> {
    #[account(mut, has_one = owner)]
    pub vault: Account<'info, VaultAccount>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub vault: Account<'info, VaultAccount>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut, has_one = owner)]
    pub vault: Account<'info, VaultAccount>,
    #[account(mut)]
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct Release<'info> {
    #[account(mut, has_one = beneficiary)]
    pub vault: Account<'info, VaultAccount>,
    #[account(mut)]
    pub beneficiary: AccountInfo<'info>,
}

#[account]
pub struct VaultAccount {
    pub owner: Pubkey,
    pub beneficiary: Pubkey,
    pub lock_duration: i64,
    pub last_heartbeat: i64,
    pub released: bool,
}

#[error_code]
pub enum TrustError {
    #[msg("Lock period has not expired yet.")]
    NotExpired,
    #[msg("Vault funds have already been released.")]
    AlreadyReleased,
    #[msg("Insufficient funds in vault.")]
    InsufficientFunds,
}
