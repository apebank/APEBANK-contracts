// @dev. This script will deploy this V1.1 of Olympus. It will deploy the whole ecosystem except for the LP tokens and their bonds. 
// This should be enough of a test environment to learn about and test implementations with the Olympus as of V1.1.
// Not that the every instance of the Treasury's function 'valueOf' has been changed to 'valueOfToken'... 
// This solidity function was conflicting w js object property name

const { ethers } = require("hardhat");

async function main() {

    const [deployer] = await ethers.getSigners();
    console.log('Deploying contracts with the account: ' + deployer.address);
    
    // Initial staking index
    const initialIndex = '7675210820';

    // First block epoch occurs
    const firstEpochBlock = '8961000';

    // What epoch will be first epoch
    const firstEpochNumber = '338';

    // How many blocks are in each epoch
    const epochLengthInBlocks = '2200';

    // Initial reward rate for epoch
    const initialRewardRate = '3000';

    // Ethereum 0 address, used when toggling changes in treasury
    const zeroAddress = '0x0000000000000000000000000000000000000000';

    // Large number for approval for Frax and DAI
    const largeApproval = '100000000000000000000000000000000';

    // Initial mint for Frax and DAI (10,000,000)
    const initialMint = '10000000000000000000000000';
    
    // DAI bond BCV
    //控制价格和产能
    const daiBondBCV = '369';

    // Bond vesting length in blocks. 33110 ~ 5 days
    const bondVestingLength = '33110';

    // Min bond price
    const minBondPrice = '50000';

    // Max bond payout
    const maxBondPayout = '50'

    // DAO fee for bond
    const bondFee = '10000';

    // Max debt bond can take on
    const maxBondDebt = '1000000000000000';

    // Initial Bond debt
    const intialBondDebt = '0'

    // Deploy OHM
    const APE = await ethers.getContractFactory('ApeERC20Token');
    const ape = await APE.deploy();

    console.log('APE address: ',ape.address);

    // Deploy DAI
    const BOBA = await ethers.getContractFactory('BOBA');
    const boba = await BOBA.deploy( 0 );

    console.log( "boba: " + boba.address );

    // Deploy 10,000,000 mock DAI and mock Frax
    await boba.mint( deployer.address, initialMint );
    //await frax.mint( deployer.address, initialMint );

    //const lp_ohm_dai = "0x86e0D7323FCD3B377fCF9a99787D5A6973B865Dd";
    const DAO = await ethers.getContractFactory('ApeDAO');
    const dao = await DAO.deploy();

    console.log( "dao: " + dao.address );

    // Deploy treasury
    //@dev changed function in treaury from 'valueOf' to 'valueOfToken'... solidity function was coflicting w js object property name
    const Treasury = await ethers.getContractFactory('ApeTreasury'); 
    const treasury = await Treasury.deploy( ape.address, boba.address,zeroAddress,zeroAddress,0 );

    console.log( "Treasury: " + treasury.address );

    // Deploy bonding calc
    const OlympusBondingCalculator = await ethers.getContractFactory('OlympusBondingCalculator');
    const olympusBondingCalculator = await OlympusBondingCalculator.deploy( ape.address );

    console.log( "Calc: " + olympusBondingCalculator.address );

    // Deploy staking distributor
    const Distributor = await ethers.getContractFactory('Distributor');
    const distributor = await Distributor.deploy(treasury.address, ape.address, epochLengthInBlocks, firstEpochBlock);

    console.log( "Distributor " + distributor.address);

    // Deploy sOHM
    const SAPE = await ethers.getContractFactory('sApe');
    const sApe = await SAPE.deploy();

    console.log( "sAPE: " + sApe.address );

    // Deploy Staking
    const Staking = await ethers.getContractFactory('OlympusStaking');
    const staking = await Staking.deploy( ape.address, sApe.address, epochLengthInBlocks, firstEpochNumber, firstEpochBlock );
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
    // const FraxBond = await ethers.getContractFactory('OlympusBondDepository');
    // const fraxBond = await FraxBond.deploy(ohm.address, frax.address, treasury.address, dao.address, zeroAddress);
    // console.log("Frax Bond: " + fraxBond.address);

    //lp: 
    // const OhmDai = await ethers.getContractFactory('OlympusBondDepository');
    // const ohmDai = await OhmDai.deploy(ohm.address, lp_ohm_dai, treasury.address, dao.address, olympusBondingCalculator.address);
    // console.log("ohmDai Bond: " + ohmDai.address);

    const RedeemHelper = await ethers.getContractFactory('RedeemHelper');
    const redeemHelper = await RedeemHelper.deploy();
    console.log("redeemHelper Bond: " + redeemHelper.address);

    await redeemHelper.addBondContract(bobaBond.address);
    // await redeemHelper.addBondContract(fraxBond.address);
    // await redeemHelper.addBondContract(ohmDai.address);
   
    // queue and toggle DAI and Frax bond reserve depositor
    await treasury.queue('0', bobaBond.address);
    // await treasury.queue('0', fraxBond.address);
    // await treasury.queue('0', ohmDai.address);
    await treasury.toggle('0', bobaBond.address, zeroAddress);
    // await treasury.toggle('0', fraxBond.address, zeroAddress);
    // await treasury.toggle('0', ohmDai.address, olympusBondingCalculator.address);

    console.log('toggle .....');

    // Set DAI and Frax bond terms
    await bobaBond.initializeBondTerms(daiBondBCV, bondVestingLength, minBondPrice, maxBondPayout, bondFee, maxBondDebt, intialBondDebt);
    // await fraxBond.initializeBondTerms(fraxBondBCV, bondVestingLength, minBondPrice, maxBondPayout, bondFee, maxBondDebt, intialBondDebt);
    // await ohmDai.initializeBondTerms(lpBondBCV, bondVestingLength, minBondPrice, maxBondPayout, bondFee, maxBondDebt, intialBondDebt);

    console.log('initializeBondTerms .....');
    // Set staking for DAI and Frax bond
    await bobaBond.setStaking(stakingHelper.address, stakingHelper.address);
    // await fraxBond.setStaking(stakingHelper.address, stakingHelper.address);
    // await ohmDai.setStaking(stakingHelper.address, stakingHelper.address);
    console.log('setStaking .....');

    // Initialize sOHM and set the index
    await sApe.initialize(staking.address);
    await sApe.setIndex(initialIndex);

    console.log('sApe setIndex.....');

    // set distributor contract and warmup contract
    await staking.setContract('0', distributor.address);
    await staking.setContract('1', stakingWarmup.address);

    // Set treasury for OHM token
    await ape.setVault(treasury.address);

    // Add staking contract as distributor recipient
    await distributor.addRecipient(staking.address, initialRewardRate);

    // queue and toggle reward manager
    await treasury.queue('8', distributor.address);
    await treasury.toggle('8', distributor.address, zeroAddress);

    // queue and toggle deployer reserve depositor
    await treasury.queue('0', deployer.address);
    await treasury.toggle('0', deployer.address, zeroAddress);

    // queue and toggle liquidity depositor
    await treasury.queue('4', deployer.address, );
    await treasury.toggle('4', deployer.address, zeroAddress);

    // // Approve the treasury to spend DAI and Frax
    // await dai.approve(treasury.address, largeApproval );
   // await frax.approve(treasury.address, largeApproval );

    // // Approve dai and frax bonds to spend deployer's DAI and Frax
    // await dai.approve(daiBond.address, largeApproval );
    // await frax.approve(fraxBond.address, largeApproval );

    // // Approve staking and staking helper contact to spend deployer's OHM
    // await ohm.approve(staking.address, largeApproval);
    // await ohm.approve(stakingHelper.address, largeApproval);

    // // Deposit 9,000,000 DAI to treasury, 600,000 OHM gets minted to deployer and 8,400,000 are in treasury as excesss reserves
    // await treasury.deposit('9000000000000000000000000', dai.address, '8400000000000000');

    // // Deposit 5,000,000 Frax to treasury, all is profit and goes as excess reserves
    // await treasury.deposit('5000000000000000000000000', frax.address, '5000000000000000');

    // // Stake OHM through helper
    // await stakingHelper.stake('100000000000');

    // // Bond 1,000 OHM and Frax in each of their bonds
    // await daiBond.deposit('1000000000000000000000', '60000', deployer.address );
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