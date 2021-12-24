// @dev. This script will deploy this V1.1 of Olympus. It will deploy the whole ecosystem except for the LP tokens and their bonds. 
// This should be enough of a test environment to learn about and test implementations with the Olympus as of V1.1.
// Not that the every instance of the Treasury's function 'valueOf' has been changed to 'valueOfToken'... 
// This solidity function was conflicting w js object property name

const { ethers } = require("hardhat");

async function main() {

    const [deployer] = await ethers.getSigners();
    console.log('Deploying contracts with the account: ' + deployer.address);
    
   const initialIndex = '1000000000';

    // First block epoch occurs
    const firstEpochBlock = '1639499488';

    // What epoch will be first epoch
    const firstEpochNumber = '0';

    // How many blocks are in each epoch
    const epochLengthInBlocks = '28800';

    // Initial reward rate for epoch
    const initialRewardRate = '3050';

    // Ethereum 0 address, used when toggling changes in treasury
    const zeroAddress = '0x0000000000000000000000000000000000000000';

    // Large number for approval for Frax and DAI
    const largeApproval = '100000000000000000000000000000000';

    // Initial mint for Frax and DAI (10,000,000)
    const initialMint = '10000000000000000000000000';
    
    // usdc
    const usdcBondBCV = '50';

    const bobaBondBCV = '210';

    // Bond vesting length in blocks. 33110 ~ 5 days
    //                         
    const bondVestingLength = '432000';

    // Min bond price
    const minBondPrice = '50000';//500, 12.5 

    // Max bond payout
    const maxBondPayout = '150'

    // DAO fee for bond
    const bondFee = '10000';

    // Max debt bond can take on
    const maxBondDebt = '1000000000000000';

    // Initial Bond debt
    const intialBondDebt = '0'

    const usdt_addr = "0x9d0364c866A73e34649869525CD7576080259A42";

    // Deploy OHM
    const APE = await ethers.getContractFactory('ApeERC20Token');
    const ape = await APE.deploy({gas:});

    console.log('APE address: ',ape.address);

    const BOBA = await ethers.getContractFactory('BOBA');
    const boba = await BOBA.deploy(28);

    console.log('boba address: ',boba.address);


    
    // Deploy 10,000,000 mock DAI and mock Frax

    //const lp_ohm_dai = "0x86e0D7323FCD3B377fCF9a99787D5A6973B865Dd";
    const DAO = await ethers.getContractFactory('ApeDAO');
    const dao = await DAO.deploy();

    console.log( "dao: " + dao.address );

    // Deploy treasury
    //@dev changed function in treaury from 'valueOf' to 'valueOfToken'... solidity function was coflicting w js object property name
    const Treasury = await ethers.getContractFactory('ApeTreasury'); 
    const treasury = await Treasury.deploy( ape.address,usdt_addr,0 );

    console.log( "Treasury: " + treasury.address );

    // Deploy bonding calc
    const OlympusBondingCalculator = await ethers.getContractFactory('OlympusBondingCalculator');
    const olympusBondingCalculator = await OlympusBondingCalculator.deploy( ape_address );

    console.log( "Calc: " + olympusBondingCalculator.address );

    // Deploy staking distributor
    const Distributor = await ethers.getContractFactory('Distributor');
    const distributor = await Distributor.deploy(treasury.address, ape_address, epochLengthInBlocks, firstEpochBlock);

    console.log( "Distributor " + distributor.address);

    // Deploy sOHM
    const SAPE = await ethers.getContractFactory('sApe');
    const sApe = await SAPE.deploy();

    console.log( "sAPE: " + sApe.address );

    // Deploy Staking
    const Staking = await ethers.getContractFactory('OlympusStaking');
    const staking = await Staking.deploy(ape.address, sApe.address, epochLengthInBlocks, firstEpochNumber, firstEpochBlock );
    console.log( "Staking: " + staking.address );

    //Deploy staking warmpup
    const StakingWarmpup = await ethers.getContractFactory('StakingWarmup');
    const stakingWarmup = await StakingWarmpup.deploy(staking.address, sApe.address);

    console.log( "Staking Wawrmup " + stakingWarmup.address);

    // Deploy staking helper
    const StakingHelper = await ethers.getContractFactory('StakingHelper');
    const stakingHelper = await StakingHelper.deploy(staking.address, ape.address);

    console.log( "Staking Helper " + stakingHelper.address);

    // Deploy DAI bond
    //@dev changed function call to Treasury of 'valueOf' to 'valueOfToken' in BondDepository due to change in Treausry contract
    const BOBABond = await ethers.getContractFactory('ApeBondDepository');
    const bobaBond = await BOBABond.deploy(ape.address, boba.address, treasury.address, dao.address, zeroAddress);

    console.log("BOBA Bond: " + bobaBond.address);

    // Deploy Frax bond
    //@dev changed function call to Treasury of 'valueOf' to 'valueOfToken' in BondDepository due to change in Treausry contract
    const UsdtBond = await ethers.getContractFactory('ApeBondDepository');
    const usdtBond = await UsdtBond.deploy(ape.address, usdt_addr, treasury.address, dao.address, zeroAddress);
    console.log("usdtBond Bond: " + usdtBond.address);

    const RedeemHelper = await ethers.getContractFactory('RedeemHelper');
    const redeemHelper = await RedeemHelper.deploy();
    console.log("redeemHelper Bond: " + redeemHelper.address);

    var tx = await redeemHelper.addBondContract(bobaBond.address);
    await tx.wait();

    tx = await redeemHelper.addBondContract(usdtBond.address);
    await tx.wait();

    tx = await redeemHelper.addBondContract(apeUSDT.address);
    await tx.wait();

    // queue and toggle DAI and Frax bond reserve depositor
    // 0x0000000000000000000000000000000000000000
    tx = await treasury.queue('0', bobaBond.address);
    await tx.wait();

    tx = await treasury.queue('0', usdtBond.address);
    await tx.wait();

    tx = await treasury.toggle('0', bobaBond.address, zeroAddress);
    await tx.wait();

    tx = await treasury.toggle('0', usdtBond.address, zeroAddress);
    await tx.wait();

    tx = await treasury.toggle('0', apeUSDT.address, olympusBondingCalculator.address);
    await tx.wait();

    tx = await treasury.queue('2', bobaBond.address);
    await tx.wait();

    tx = await treasury.toggle('2', bobaBond.address, zeroAddress);
    await tx.wait();

    console.log('toggle .....');

    // Set DAI and Frax bond terms
    tx = await bobaBond.initializeBondTerms(bobaBondBCV, bondVestingLength, minBondPrice, maxBondPayout, bondFee, maxBondDebt, intialBondDebt);
    await tx.wait();

    tx = await usdtBond.initializeBondTerms(usdcBondBCV, bondVestingLength, minBondPrice, maxBondPayout, bondFee, maxBondDebt, intialBondDebt);
    await tx.wait();

    console.log('initializeBondTerms .....');
    // Set staking for DAI and Frax bond
    tx = await bobaBond.setStaking(stakingHelper.address, stakingHelper.address);
    await tx.wait();

    tx = await usdtBond.setStaking(stakingHelper.address, stakingHelper.address);
    await tx.wait();
    console.log('setStaking .....');

    // Initialize sOHM and set the index
    tx = await sApe.initialize(staking.address);
    await tx.wait();

    tx = await sApe.setIndex(initialIndex);
    await tx.wait();

    console.log('sApe setIndex.....');

    // set distributor contract and warmup contract
    tx = await staking.setContract('0', distributor.address);
    await tx.wait();

    tx = await staking.setContract('1', stakingWarmup.address);
    await tx.wait();

    // Set treasury for OHM token
    tx = await ape.setVault(treasury.address);
    await tx.wait();

    // Add staking contract as distributor recipient
    tx = await distributor.addRecipient(staking.address, initialRewardRate);
    await tx.wait();

    // queue and toggle reward manager
    tx = await treasury.queue('8', distributor.address);
    await tx.wait();

    tx = await treasury.toggle('8', distributor.address, zeroAddress);

    // queue and toggle deployer reserve depositor
    tx = await treasury.queue('0', deployer.address);
    await tx.wait();

    tx = await treasury.toggle('0', deployer.address, zeroAddress);
    await tx.wait();

    // queue and toggle liquidity depositor
    tx = await treasury.queue('4', deployer.address, );
    await tx.wait();

    tx = await treasury.toggle('4', deployer.address, zeroAddress);
    await tx.wait();

    // // Approve the treasury to spend DAI and Frax
    tx = await boba.approve(treasury.address, largeApproval );
    await tx.wait();
   // await usdt.approve(treasury.address, largeApproval );

    // // Approve dai and frax bonds to spend deployer's DAI and Frax
    tx = await boba.approve(bobaBond.address, largeApproval );
    await tx.wait();
    //await frax.approve(usdtBond.address, largeApproval );

    // // Approve staking and staking helper contact to spend deployer's OHM
    tx = await ape.approve(staking.address, largeApproval);
    await tx.wait();
    // await ohm.approve(stakingHelper.address, largeApproval);

    // // Deposit 9,000,000 DAI to treasury, 600,000 OHM gets minted to deployer and 8,400,000 are in treasury as excesss reserves
    tx = await treasury.deposit('9000000000000000000000000', boba.address, '8400000000000000');
    await tx.wait();
    // // Deposit 5,000,000 Frax to treasury, all is profit and goes as excess reserves
    // await treasury.deposit('5000000000000000000000000', frax.address, '5000000000000000');

    // // Stake OHM through helper
    tx = await stakingHelper.stake('100000000000');
    await tx.wait();
    // // Bond 1,000 OHM and Frax in each of their bonds
    
    tx = await bobaBond.deposit('1000000000000000000000', '60000', deployer.address );
    await tx.wait();
    // await fraxBond.deposit('1000000000000000000000', '60000', deployer.address );

    console.log( "APE: " + ape.address );
    console.log( "BOBA: " + boba.address );
    //console.log( "Frax: " + frax.address );
    console.log( "Treasury: " + treasury.address );
    console.log( "Calc: " + olympusBondingCalculator.address );
    console.log( "Staking: " + staking.address );
    console.log( "sApe: " + sApe.address );
    console.log( "Distributor " + distributor.address);
    console.log( "Staking Wawrmup " + stakingWarmup.address);
    console.log( "Staking Helper " + stakingHelper.address);
    console.log("BOBA Bond: " + bobaBond.address);
   // console.log("Frax Bond: " + fraxBond.address);
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})