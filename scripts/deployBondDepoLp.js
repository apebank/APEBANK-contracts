const { ethers } = require("hardhat");

async function main() {

    const [deployer] = await ethers.getSigners();
    console.log('Deploying contracts with the account: ' + deployer.address);

    const ohm_address = "0x20AAE80d75744c6eE12d73a5942ce7324db3Bfb4";
    const dai_address = "0xF47CD8d2F4A8F7e259A0613678b252Ae41b6B88d";
    const frax_address = "0x742aE74d98F47baE5d19Ab783A5FbfC8495A4e07";
    const dao_address =  "0xb00f08D02D0d84242ac768db42c0234a6f7E04e9";
    const treasury_address = "0x8B27d28A90fd09D59d4A9fd61ba01Dd79569b7FD";
    const olympusBondingCalculator_address = "0x43096C86939b1Be1Ee558da87D13478208fDC62B"; 
    const distributor_address = "0xD21D4399B0421Efc115665Ca7f52d505061D8222";
    const sOHM_address = "0xDe2bbDEFB0E77342aEC23700bC4e2B5F3eD96944";
    const staking_address = "0xC81B21F693f3afc958b3949001b47A802aB8CC24";
    const stakingWarmup_address = "0x510ff2E1A3a296C78bCD799Aba9519Cba0663f22";
    const takingHelper_address = "0xBbD51D73C5DdEcBbAF2fd11510Fcb23FF7064A73";
    const DAI_Bond = "0xD79A53315bb75bc30Ce75C35A1C00B690dc8741f";
    const Frax_Bond = "0x2bbf72A9257280183CC7945c5220ac542293b6eB";
    const ohmDai_Bond = "0xAe83292BFDE0E071513C8A0fa05D6cb2e3f09aDE";
    const redeemHelper = "0xad5AadB85223f54e7F418364744a90a565231E68";
    const WSOHM_ADDRESS = "0xA1C9528bA0d2E3A7ec7D233f33FD62c750071f02";

    const lp_ohm_dai = "0x86e0D7323FCD3B377fCF9a99787D5A6973B865Dd";

    // Get contract factory for CVX bond
    const OhmDai = await ethers.getContractFactory('OlympusBondDepository');
    const ohmDai = await OhmDai.deploy(ohm_address, lp_ohm_dai, treasury_address, dao_address, olympusBondingCalculator_address);
    console.log("ohmDai Bond: " + ohmDai.address);
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})