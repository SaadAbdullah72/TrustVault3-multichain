import { ChainAdapter, VaultState, ClaimableVault } from './types'
import { ChainConfig } from '../config/chains'
import { 
    Connection, 
    PublicKey, 
    SystemProgram, 
    Transaction, 
    LAMPORTS_PER_SOL
} from '@solana/web3.js'
import * as anchor from '@coral-xyz/anchor'
const idl = {
  "address": "9CHePjTYinAK5hZ8xHyN3RcT1TavQg1oVsYto4C3PKQg",
  "metadata": {
    "name": "trust_vault",
    "version": "0.1.0",
    "spec": "0.1.0"
  },
  "instructions": [
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "vault",
          "writable": true,
          "signer": false
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "writable": false,
          "signer": false
        }
      ],
      "args": [
        {
          "name": "beneficiary",
          "type": "pubkey"
        },
        {
          "name": "lockDuration",
          "type": "i64"
        }
      ]
    },
    {
      "name": "heartbeat",
      "discriminator": [
        202,
        104,
        56,
        6,
        240,
        170,
        63,
        134
      ],
      "accounts": [
        {
          "name": "vault",
          "writable": true,
          "signer": false
        },
        {
          "name": "owner",
          "writable": false,
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "deposit",
      "discriminator": [
        242,
        35,
        198,
        137,
        82,
        225,
        242,
        182
      ],
      "accounts": [
        {
          "name": "vault",
          "writable": true,
          "signer": false
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "writable": false,
          "signer": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdraw",
      "discriminator": [
        183,
        18,
        70,
        156,
        148,
        109,
        161,
        34
      ],
      "accounts": [
        {
          "name": "vault",
          "writable": true,
          "signer": false
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "autoRelease",
      "discriminator": [
        212,
        34,
        30,
        246,
        192,
        13,
        97,
        31
      ],
      "accounts": [
        {
          "name": "vault",
          "writable": true,
          "signer": false
        },
        {
          "name": "beneficiary",
          "writable": true,
          "signer": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "VaultAccount",
      "discriminator": [
        230,
        251,
        241,
        83,
        139,
        202,
        93,
        28
      ]
    }
  ],
  "types": [
    {
      "name": "VaultAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "beneficiary",
            "type": "pubkey"
          },
          {
            "name": "lockDuration",
            "type": "i64"
          },
          {
            "name": "lastHeartbeat",
            "type": "i64"
          },
          {
            "name": "released",
            "type": "bool"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "NotExpired",
      "msg": "Lock period has not expired yet."
    },
    {
      "code": 6001,
      "name": "AlreadyReleased",
      "msg": "Vault funds have already been released."
    },
    {
      "code": 6002,
      "name": "InsufficientFunds",
      "msg": "Insufficient funds in vault."
    }
  ]
}

export class SolanaAdapter implements ChainAdapter {
    readonly chainType = 'solana'
    private chain: ChainConfig
    private connection: Connection
    private _address: string | null = null
    private wallet: any = null 

    constructor(chain: ChainConfig) {
        this.chain = chain
        this.connection = new Connection(chain.testnet.rpcUrl, 'confirmed')
    }

    setExternalWallet(wallet: any) {
        this.wallet = wallet
        if (wallet && wallet.publicKey) {
            this._address = wallet.publicKey.toString()
        }
    }

    async connect(): Promise<string> {
        if (!this.wallet?.publicKey) {
            throw new Error('Please connect your Solana wallet first.')
        }
        this._address = this.wallet.publicKey.toString()
        return this._address ?? ''
    }

    async disconnect(): Promise<void> {
        this._address = null
    }

    getActiveAddress(): string | null { return this._address }
    isConnected(): boolean { return !!this._address }

    async createVault(
        beneficiary: string,
        lockDuration: number,
        depositAmount: number,
        onStatus?: (msg: string) => void
    ): Promise<string> {
        console.log('[SolanaAdapter] createVault start:', { beneficiary, lockDuration, depositAmount })
        
        if (!beneficiary || beneficiary.trim() === '') {
            throw new Error('Beneficiary address is required')
        }

        if (isNaN(lockDuration) || lockDuration <= 0) {
            console.error('[SolanaAdapter] Invalid lockDuration:', lockDuration)
            throw new Error('Invalid lock duration')
        }

        if (!this.wallet || !this.wallet.publicKey) {
            console.error('[SolanaAdapter] Fatal: Wallet not connected or missing publicKey');
            throw new Error('Please connect your Solana wallet first.');
        }

        console.log('[SolanaAdapter] Initializing Anchor provider...');
        const provider = new anchor.AnchorProvider(this.connection, this.wallet, {});
        
        const factoryAddr = this.chain.testnet.factoryAddress;
        if (!factoryAddr) throw new Error('Solana factory address (Program ID) is missing in chains.ts');
        
        const programId = new PublicKey(factoryAddr);
        console.log('[SolanaAdapter] Creating Program instance with ID:', programId.toString());
        const program = new anchor.Program({ ...idl, address: programId.toBase58() } as any, provider);
        
        console.log('[SolanaAdapter] Deriving vault PDA...');
        const [vaultPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from('vault'), this.wallet.publicKey.toBuffer()],
            program.programId
        )

        onStatus?.('Sending Solana transaction...')
        console.log('[SolanaAdapter] Executing initialize method...')
        
        const beneficiaryPubKey = new PublicKey(beneficiary.trim());
        const lockBN = new anchor.BN(Math.floor(lockDuration));
        console.log('[SolanaAdapter] Arguments prepared:', { 
            beneficiary: beneficiaryPubKey.toString(), 
            lockDuration: lockBN.toString() 
        });

        try {
            const depositBN = new anchor.BN(depositAmount * LAMPORTS_PER_SOL);
            
            // Check if PDA already exists (user already initialized it but didn't deposit)
            const existingInfo = await this.connection.getAccountInfo(vaultPDA);
            let tx;
            
            if (existingInfo !== null) {
                console.log('[SolanaAdapter] Vault already exists! Skipping initialize, executing Deposit only...');
                tx = await program.methods
                    .deposit(depositBN)
                    .accounts({
                        vault: vaultPDA,
                        owner: this.wallet.publicKey,
                        systemProgram: SystemProgram.programId,
                    })
                    .rpc();
            } else {
                console.log('[SolanaAdapter] Vault is new. Executing Initialize + Deposit directly...');
                const depositIx = await program.methods
                    .deposit(depositBN)
                    .accounts({
                        vault: vaultPDA,
                        owner: this.wallet.publicKey,
                        systemProgram: SystemProgram.programId,
                    })
                    .instruction();

                tx = await program.methods
                    .initialize(beneficiaryPubKey, lockBN)
                    .accounts({
                        vault: vaultPDA,
                        owner: this.wallet.publicKey,
                        systemProgram: SystemProgram.programId,
                    })
                    .postInstructions([depositIx])
                    .rpc();
            }

            await this.connection.confirmTransaction(tx)
            return vaultPDA.toString()
        } catch (e: any) {
            console.error('[SolanaAdapter] createVault failed:', e);
            throw e;
        }
    }

    async heartbeat(vaultId: string): Promise<string> {
        const provider = new anchor.AnchorProvider(this.connection, this.wallet, {})
        const programId = new PublicKey(this.chain.testnet.factoryAddress!)
        const program = new anchor.Program({ ...idl, address: programId.toBase58() } as any, provider)
        try {
            return await program.methods.heartbeat().accounts({ vault: new PublicKey(vaultId), owner: this.wallet.publicKey }).rpc()
        } catch (e: any) {
            console.error('[SolanaAdapter] heartbeat failed:', e);
            throw e;
        }
    }

    async withdraw(vaultId: string, amount: number): Promise<string> {
        const provider = new anchor.AnchorProvider(this.connection, this.wallet, {})
        const programId = new PublicKey(this.chain.testnet.factoryAddress!)
        const program = new anchor.Program({ ...idl, address: programId.toBase58() } as any, provider)
        try {
            return await program.methods.withdraw(new anchor.BN(amount * LAMPORTS_PER_SOL)).accounts({ vault: new PublicKey(vaultId), owner: this.wallet.publicKey }).rpc()
        } catch (e: any) {
            console.error('[SolanaAdapter] withdraw failed:', e);
            throw e;
        }
    }

    async autoRelease(vaultId: string): Promise<string> {
        const provider = new anchor.AnchorProvider(this.connection, this.wallet, {})
        const programId = new PublicKey(this.chain.testnet.factoryAddress!)
        const program = new anchor.Program({ ...idl, address: programId.toBase58() } as any, provider)
        try {
            return await program.methods.autoRelease().accounts({ vault: new PublicKey(vaultId), beneficiary: this.wallet.publicKey }).rpc()
        } catch (e: any) {
            console.error('[SolanaAdapter] autoRelease failed:', e);
            throw e;
        }
    }

    async deposit(vaultId: string, amount: number): Promise<string> {
        const provider = new anchor.AnchorProvider(this.connection, this.wallet, {})
        const programId = new PublicKey(this.chain.testnet.factoryAddress!)
        const program = new anchor.Program({ ...idl, address: programId.toBase58() } as any, provider)
        try {
            return await program.methods.deposit(new anchor.BN(amount * LAMPORTS_PER_SOL)).accounts({ vault: new PublicKey(vaultId), owner: this.wallet.publicKey, systemProgram: SystemProgram.programId }).rpc()
        } catch (e: any) {
            console.error('[SolanaAdapter] deposit failed:', e);
            throw e;
        }
    }

    async fetchVaultState(vaultId: string): Promise<VaultState | null> {
        try {
            if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(vaultId)) {
                console.warn('[SolanaAdapter] Invalid Solana address format, skipping fetch:', vaultId)
                return null
            }

            const pKey = new PublicKey(vaultId);
            const factoryAddr = this.chain.testnet.factoryAddress;
            if (!factoryAddr) throw new Error('factoryAddress missing in chains.ts');
            const programId = new PublicKey(factoryAddr);

            const provider = new anchor.AnchorProvider(this.connection, this.wallet, {})
            const program = new anchor.Program({ ...idl, address: programId.toBase58() } as any, provider)
            // @ts-ignore - Handle potential naming difference in IDL types
            const account = await (program.account as any).vaultAccount.fetch(pKey)
            return {
                owner: account.owner.toString(),
                beneficiary: account.beneficiary.toString(),
                lockDuration: account.lockDuration.toNumber(),
                lastHeartbeat: account.lastHeartbeat.toNumber(),
                released: account.released
            }
        } catch (e) { 
            console.error('[SolanaAdapter] fetchVaultState failed for ID:', vaultId, e)
            return null 
        }
    }

    async getVaultBalance(vaultId: string): Promise<number> {
        // Validate if vaultId is a valid base58 string first
        if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(vaultId)) {
            console.warn('[SolanaAdapter] Invalid Solana address for balance, returning 0:', vaultId)
            return 0
        }

        const balance = await this.connection.getBalance(new PublicKey(vaultId))
        return balance / LAMPORTS_PER_SOL
    }

    getVaultAddress(vaultId: string): string { return vaultId }

    async discoverVaults(address: string): Promise<string[]> {
        try {
            const factoryAddr = this.chain.testnet.factoryAddress;
            if (!factoryAddr) return [];
            
            const programId = new PublicKey(factoryAddr);
            const ownerKey = new PublicKey(address);
            
            const [vaultPDA] = PublicKey.findProgramAddressSync(
                [Buffer.from('vault'), ownerKey.toBuffer()], 
                programId
            )
            const info = await this.connection.getAccountInfo(vaultPDA)
            return info ? [vaultPDA.toString()] : []
        } catch (e) {
            console.error('[SolanaAdapter] discoverVaults failed for address:', address, e);
            return [];
        }
    }

    async discoverClaimableVaults(address: string): Promise<ClaimableVault[]> {
        console.log('[SolanaAdapter] discoverClaimableVaults for:', address)
        try {
            const factoryAddr = this.chain.testnet.factoryAddress;
            if (!factoryAddr) return [];
            const programId = new PublicKey(factoryAddr);
            
            // Search for all vaults where beneficiary (offset 40) matches address
            // Layout: 8 (disc) + 32 (owner) + 32 (beneficiary) = 40 offset
            const accounts = await this.connection.getProgramAccounts(programId, {
                filters: [
                    { dataSize: 89 },
                    { memcmp: { offset: 40, bytes: address } }
                ]
            });

            const results: ClaimableVault[] = []
            for (const { pubkey, account } of accounts) {
                // We use our existing fetch logic/decoder indirectly or just parse the whole thing
                const state = await this.fetchVaultState(pubkey.toString())
                if (state) {
                    results.push({ vaultId: pubkey.toString(), state })
                }
            }
            console.log(`[SolanaAdapter] Found ${results.length} claimable vaults`);
            return results
        } catch (e) {
            console.error('[SolanaAdapter] discoverClaimableVaults failed:', e);
            return [];
        }
    }
}
