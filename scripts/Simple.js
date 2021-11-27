const func = async (hre) => {

    const { deployments, getNamedAccounts } = hre
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    console.log('Deploying contracts with the account: ' + deployer.address);
  
    await deploy('DAI', {
      from: deployer,
      args: [28],
      log: true
    })
  }
  
  func.tags = ['DAI']
  module.exports = func