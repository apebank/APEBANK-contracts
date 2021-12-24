const func = async (hre) => {

    const { deployments, getNamedAccounts } = hre
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    console.log('Deploying contracts with the account: ' + deployer);
  
    await deploy('ApeERC20Token', {
      from: deployer,
      args: [],
      log: true
    })
  }
  
  func.tags = ['ApeERC20Token']
  module.exports = func