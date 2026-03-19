$networks = @(
    "sepolia", "polygonAmoy", "bscTestnet", "arbitrumSepolia", 
    "baseSepolia", "avalancheFuji", "optimismSepolia", "fantomTestnet", 
    "cronosTestnet", "celoAlfajores", "gnosisChiado", "zksyncSepolia", 
    "scrollSepolia", "lineaSepolia", "mantleTestnet", "blastSepolia"
)

foreach ($net in $networks) {
    Write-Host "`n==== Deploying to $net ===="
    try {
        $output = cmd /c "npx hardhat run scripts/deploy.ts --network $net 2>&1"
        $output | Out-String | Write-Host
    } catch {
        Write-Host "Failed to deploy to $net"
    }
}
