require('@nomiclabs/hardhat-ethers')
require('@nomiclabs/hardhat-waffle')
require('hardhat-deploy')

require('dotenv').config();
const env = process.env;

// module.exports = {
//   solidity: {
//     version: "0.7.5",
//     settings: {
//       optimizer: {
//         enabled: true,
//         runs: 200
//       }
//     }
//   },
//   networks: {
//     ropsten: {
//       url: `https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161`,
//       accounts: [`0x${env.PK1}`],
//       gasPrice: 4000000000,
//       timeout: 300000
//     }
//   }
// };

// module.exports = {
//   solidity: "0.7.5",
//   networks: {
//     boba_rinkeby: {
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
      accounts: [env.PK1]
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
