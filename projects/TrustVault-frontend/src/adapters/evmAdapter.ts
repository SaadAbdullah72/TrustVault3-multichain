/**
 * EVM chain adapter — works for ALL 16 EVM chains.
 * Uses ethers.js + MetaMask (injected provider).
 */
import { ChainAdapter, VaultState, ClaimableVault } from './types'
import { ChainConfig } from '../config/chains'

// TrustVaultV2 ABI (from Solidity contract)
const VAULT_ABI = [
    'function owner() view returns (address)',
    'function beneficiary() view returns (address)',
    'function lockDuration() view returns (uint256)',
    'function lastHeartbeat() view returns (uint256)',
    'function released() view returns (bool)',
    'function initialized() view returns (bool)',
    'function getVaultState() view returns (address, address, uint256, uint256, bool, bool, uint256)',
    'function heartbeat()',
    'function withdraw(uint256)',
    'function autoRelease()',
    'function deposit() payable',
    'event Deposited(address indexed sender, uint256 amount)',
    'event HeartbeatSent(address indexed owner, uint256 timestamp)',
    'event Withdrawn(address indexed owner, uint256 amount)',
    'event AutoReleased(address indexed beneficiary, uint256 amount)',
]

const FACTORY_ABI = [
    'function createVault2(address _beneficiary, uint256 _lockDuration) payable returns (address)',
    'function getVaultsByOwner(address _owner) view returns (address[])',
    'function getVaultsByBeneficiary(address _beneficiary) view returns (address[])',
    'function getVaultCount() view returns (uint256)',
    'event VaultCreated(address indexed vault, address indexed owner, address indexed beneficiary, uint256 lockDuration)',
]

export class EVMAdapter implements ChainAdapter {
    readonly chainType = 'evm'
    private chain: ChainConfig
    private provider: any = null
    private signer: any = null
    private _address: string | null = null

    constructor(chain: ChainConfig) {
        this.chain = chain
    }

    private async getEthers() {
        const ethers = await import('ethers')
        return ethers
    }

    private async ensureProvider() {
        if (!this.provider) {
            const ethers = await this.getEthers()
            if (typeof window !== 'undefined' && (window as any).ethereum) {
                this.provider = new ethers.BrowserProvider((window as any).ethereum)
            } else {
                // Fallback to read-only RPC
                this.provider = new ethers.JsonRpcProvider(this.chain.testnet.rpcUrl)
            }
        }
        return this.provider
    }

    private async ensureSigner() {
        if (!this.signer) {
            const provider = await this.ensureProvider()
            this.signer = await provider.getSigner()
        }
        return this.signer
    }

    private async switchToChain() {
        if (typeof window === 'undefined' || !(window as any).ethereum) return
        const ethers = await this.getEthers()
        const chainIdHex = '0x' + this.chain.testnet.chainId!.toString(16)

        try {
            await (window as any).ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: chainIdHex }],
            })
        } catch (switchError: any) {
            // Chain not added, try to add it
            if (switchError.code === 4902) {
                await (window as any).ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: chainIdHex,
                        chainName: `${this.chain.name} Testnet`,
                        rpcUrls: [this.chain.testnet.rpcUrl],
                        blockExplorerUrls: [this.chain.testnet.explorerUrl],
                        nativeCurrency: this.chain.nativeCurrency,
                    }],
                })
            } else {
                throw switchError
            }
        }
    }

    async connect(): Promise<string> {
        if (typeof window === 'undefined' || !(window as any).ethereum) {
            throw new Error('MetaMask or compatible wallet extension not found. Please install MetaMask.')
        }

        const ethers = await this.getEthers()
        this.provider = new ethers.BrowserProvider((window as any).ethereum)

        // Request accounts
        await (window as any).ethereum.request({ method: 'eth_requestAccounts' })

        // Switch to the correct chain
        await this.switchToChain()

        // Re-create provider after chain switch
        this.provider = new ethers.BrowserProvider((window as any).ethereum)
        this.signer = await this.provider.getSigner()
        this._address = await this.signer.getAddress()

        return this._address!
    }

    async disconnect(): Promise<void> {
        this.provider = null
        this.signer = null
        this._address = null
    }

    getActiveAddress(): string | null {
        return this._address
    }

    isConnected(): boolean {
        return !!this._address
    }

    async createVault(
        beneficiary: string,
        lockDuration: number,
        depositAmount: number,
        onStatus?: (msg: string) => void
    ): Promise<string> {
        const signer = await this.ensureSigner()
        const ethers = await this.getEthers()

        const factoryAddress = this.chain.testnet.factoryAddress
        if (!factoryAddress) {
            throw new Error(`Factory contract not deployed on ${this.chain.name} yet. Deploy the TrustVaultFactory first.`)
        }

        onStatus?.('Creating vault on ' + this.chain.name + '...')

        const factory = new ethers.Contract(factoryAddress, FACTORY_ABI, signer)
        const depositWei = ethers.parseEther(depositAmount.toString())

        const tx = await factory.createVault2(beneficiary, lockDuration, { value: depositWei })
        onStatus?.('Transaction sent! Waiting for confirmation...')

        const receipt = await tx.wait()

        // Extract vault address from VaultCreated event
        const event = receipt.logs.find((log: any) => {
            try {
                const parsed = factory.interface.parseLog(log)
                return parsed?.name === 'VaultCreated'
            } catch { return false }
        })

        if (!event) {
            throw new Error('Vault creation event not found in transaction receipt')
        }

        const parsed = factory.interface.parseLog(event)
        const vaultAddress = parsed!.args[0]

        // Save to localStorage
        this.saveVaultLocally(vaultAddress)

        return vaultAddress
    }
    async heartbeat(vaultId: string): Promise<string> {
        console.log('[EVMAdapter] >>> Heartbeat Debug Start <<<');
        const signer = await this.ensureSigner()
        const signerAddress = await signer.getAddress()
        console.log('[EVMAdapter] Signer:', signerAddress);
        console.log('[EVMAdapter] Target Vault:', vaultId);

        const ethers = await this.getEthers()
        
        // Log the ABI we are using
        console.log('[EVMAdapter] Using VAULT_ABI:', VAULT_ABI);
        
        try {
            const iface = new ethers.Interface(VAULT_ABI);
            const data = iface.encodeFunctionData('heartbeat');
            console.log('[EVMAdapter] Manual Encoded Data (0xf3095690?):', data);
            
            const txReq = {
                to: vaultId,
                data: data,
                from: signerAddress
            }
            
            console.log('[EVMAdapter] Full txReq:', JSON.stringify(txReq));
            
            const tx = await signer.sendTransaction(txReq)
            console.log('[EVMAdapter] Transaction Sent! Hash:', tx.hash)
            
            const receipt = await tx.wait()
            if (receipt && receipt.status === 0) {
                console.error('[EVMAdapter] Transaction REVERTED in receipt!');
                throw new Error('Transaction execution reverted');
            }
            
            console.log('[EVMAdapter] Heartbeat Success! Hash:', receipt?.hash)
            return receipt?.hash || tx.hash
        } catch (e: any) {
            console.error('[EVMAdapter] Heartbeat FATAL Error:', e)
            throw e
        }
    }

    async withdraw(vaultId: string, amount: number): Promise<string> {
        const signer = await this.ensureSigner()
        const signerAddress = await signer.getAddress()
        console.log('[EVMAdapter] Withdraw call:', { vaultId, signerAddress, amount })

        const ethers = await this.getEthers()
        const vault = new ethers.Contract(vaultId, VAULT_ABI, signer)
        const amountWei = ethers.parseEther(amount.toString())

        try {
            const data = vault.interface.encodeFunctionData('withdraw', [amountWei])
            console.log('[EVMAdapter] Encoded Withdraw data:', data)

            const txReq = {
                to: vaultId,
                data: data,
                from: signerAddress
            }

            const tx = await signer.sendTransaction(txReq)
            console.log('[EVMAdapter] Withdraw tx sent:', tx.hash)
            const receipt = await tx.wait()
            console.log('[EVMAdapter] Withdraw tx confirmed:', receipt.hash)
            return receipt.hash
        } catch (e: any) {
            console.error('[EVMAdapter] Withdraw failed:', e)
            throw e
        }
    }

    async autoRelease(vaultId: string): Promise<string> {
        const signer = await this.ensureSigner()
        const ethers = await this.getEthers()
        const vault = new ethers.Contract(vaultId, VAULT_ABI, signer)
        const tx = await vault.autoRelease()
        const receipt = await tx.wait()
        return receipt.hash
    }

    async deposit(vaultId: string, amount: number): Promise<string> {
        const signer = await this.ensureSigner()
        const ethers = await this.getEthers()
        const vault = new ethers.Contract(vaultId, VAULT_ABI, signer)
        const amountWei = ethers.parseEther(amount.toString())
        const tx = await vault.deposit({ value: amountWei })
        const receipt = await tx.wait()
        return receipt.hash
    }

    async fetchVaultState(vaultId: string): Promise<VaultState | null> {
        try {
            const provider = await this.ensureProvider()
            const ethers = await this.getEthers()
            const vault = new ethers.Contract(vaultId, VAULT_ABI, provider)
            const state = await vault.getVaultState()
            const [owner, beneficiary, lockDuration, lastHeartbeat, released] = state

            console.log('[EVMAdapter] fetchVaultState result:', {
                owner,
                beneficiary,
                lockDuration: Number(lockDuration),
                lastHeartbeat: Number(lastHeartbeat),
                released
            })

            return {
                owner: owner as string,
                beneficiary: beneficiary as string,
                lockDuration: Number(lockDuration),
                lastHeartbeat: Number(lastHeartbeat),
                released: released as boolean,
            }
        } catch (e) {
            console.error('[EVMAdapter] Failed to fetch EVM vault state:', e)
            return null
        }
    }

    async getVaultBalance(vaultId: string): Promise<number> {
        try {
            const provider = await this.ensureProvider()
            const ethers = await this.getEthers()
            const balance = await provider.getBalance(vaultId)
            return parseFloat(ethers.formatEther(balance))
        } catch {
            return 0
        }
    }

    getVaultAddress(vaultId: string): string {
        // For EVM, vaultId IS the vault address
        return vaultId
    }

    async discoverVaults(address: string): Promise<string[]> {
        const vaults = new Set<string>()

        // 1. From factory contract
        try {
            const provider = await this.ensureProvider()
            const ethers = await this.getEthers()
            const factoryAddress = this.chain.testnet.factoryAddress
            if (factoryAddress) {
                const factory = new ethers.Contract(factoryAddress, FACTORY_ABI, provider)
                const ownerVaults = await factory.getVaultsByOwner(address)
                const benVaults = await factory.getVaultsByBeneficiary(address)
                ownerVaults.forEach((v: string) => vaults.add(v))
                benVaults.forEach((v: string) => vaults.add(v))
            }
        } catch (e) {
            console.warn('Factory discovery failed:', e)
        }

        // 2. From localStorage
        const cached = this.getLocalVaults()
        cached.forEach(v => vaults.add(v))

        return Array.from(vaults)
    }

    async discoverClaimableVaults(address: string): Promise<ClaimableVault[]> {
        const allVaults = await this.discoverVaults(address)
        const results: ClaimableVault[] = []
        const now = Math.floor(Date.now() / 1000)

        for (const vaultId of allVaults) {
            const state = await this.fetchVaultState(vaultId)
            if (
                state &&
                state.beneficiary.toLowerCase() === address.toLowerCase() &&
                !state.released &&
                now >= state.lastHeartbeat + state.lockDuration
            ) {
                results.push({ vaultId, state })
            }
        }

        return results
    }

    // --- Local storage helpers ---
    private getStorageKey(): string {
        return `trustvault_evm_${this.chain.id}_${this._address}`
    }

    private saveVaultLocally(vaultAddress: string) {
        if (typeof window === 'undefined') return
        const key = this.getStorageKey()
        const existing = this.getLocalVaults()
        if (!existing.includes(vaultAddress)) {
            existing.push(vaultAddress)
            localStorage.setItem(key, JSON.stringify(existing))
        }
    }

    private getLocalVaults(): string[] {
        if (typeof window === 'undefined') return []
        try {
            const key = this.getStorageKey()
            return JSON.parse(localStorage.getItem(key) || '[]')
        } catch {
            return []
        }
    }
}
