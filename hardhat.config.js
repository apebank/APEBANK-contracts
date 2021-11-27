require('@nomiclabs/hardhat-ethers')
require('@nomiclabs/hardhat-waffle')
require('hardhat-deploy')

require('dotenv').config();
const env = process.env;

// module.exports = {
//   solidity: "0.7.5",
//   networks: {
//     bsc: {
//       url: `https://rinkeby.boba.network/`,
//       accounts: [`0x${env.PK1}`]
//     }
//   }
// };

module.exports = {
  mocha: {
    timeout: 300000,
  },
  networks: {
    boba_rinkeby: {
      url: 'https://rinkeby.boba.network',
      accounts: [env.PK1],
    },
  },
  solidity: {
    compilers: [
      {
        version: '0.7.5',
        settings: {
          optimizer: { enabled: true, runs: 10_000 },
          metadata: {
            bytecodeHash: 'none',
          },
          outputSelection: {
            '*': {
              '*': ['storageLayout'],
            },
          },
        },
      },      
    ],
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
}
