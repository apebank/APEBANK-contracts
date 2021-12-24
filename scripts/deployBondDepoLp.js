const { ethers } = require("hardhat");

async function main() {
    const lpBondBCV = '207';

    // Bond vesting length in blocks. 33110 ~ 5 days
    const bondVestingLength = '33110';

    // Min bond price
    const usdcMinBondPrice = '450';

    const bobaMinBondPrice = '222';

    const ape_usdtMinBondPrice = '200';

    // Max bond payout
    const maxBondPayout = '50'

    // DAO fee for bond
    const bondFee = '10000';

    // Max debt bond can take on
    const maxBondDebt = '1000000000000000';

    // Initial Bond debt
    const intialBondDebt = '0'

    const [deployer] = await ethers.getSigners();
    console.log('Deploying contracts with the account: ' + deployer.address);

    const ohm_address = "0xCc297560f6a473aFC552693ae15dfcb9aFC76C02";
    const dao_address =  "0x043736B06551B76ab2669962567eD2316B0Ac289";
    const treasury_address = "0x4c184703DEE3d7e9Dd5188131B52AcDa08f41140";
    const olympusBondingCalculator_address = "0x7c35D61c18D0740067Ece9B47c424d2d5269b040"; 
    
    const zeroAddress = '0x0000000000000000000000000000000000000000';

    const lp_ape_usdc = "0x032E294bd819Fd8Ab144F1e9790A2AE7087525b8";

    const stakingHelper = "0xdA6B24b9b8BCA9c5255880c077D482cF911276B6";

    // Get contract factory for CVX bond
    const Usdc = await ethers.getContractFactory('ApeBondDepository');
    const usdcBond = await Usdc.deploy(ohm_address, lp_ape_usdc, treasury_address, dao_address,olympusBondingCalculator_address);
    console.log("ohmDai Bond: " + usdcBond.address);

    await usdcBond.initializeBondTerms(lpBondBCV, bondVestingLength, ape_usdtMinBondPrice, maxBondPayout, bondFee, maxBondDebt, intialBondDebt);
    
    await usdcBond.setStaking(stakingHelper, true);


    queue(4,APE-USDTBOND)


}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})