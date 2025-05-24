export interface CuratedPoolFarmPair {
  pool: {
    objectId: string;
    name: string;
    lpCoinType: string;
    coins: Array<{
      coinType: string;
      weight: number;
      symbol: string;
    }>;
  };
  farm?: {
    objectId: string;
    stakeCoinType: string;
    rewardCoins: Array<{
      coinType: string;
      symbol: string;
    }>;
  };
}

export const CURATED_POOLS_AND_FARMS: CuratedPoolFarmPair[] = [
  {
    pool: {
      objectId: "0x97aae7a80abb29c9feabbe7075028550230401ffe7fb745757d3c28a30437408",
      name: "afSUI/SUI",
      lpCoinType: "0x42d0b3476bc10d18732141a471d7ad3aa588a6fb4ba8e1a6608a4a7b78e171bf::af_lp::AF_LP",
      coins: [
        {
          coinType: "0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc::afsui::AFSUI",
          weight: 50,
          symbol: "afSUI"
        },
        {
          coinType: "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
          weight: 50,
          symbol: "SUI"
        }
      ]
    },
    farm: {
      objectId: "0xa983514eece6ae7a0de118e0acbc16b32e8954aa15095288db3019c5c637d13d",
      stakeCoinType: "0x42d0b3476bc10d18732141a471d7ad3aa588a6fb4ba8e1a6608a4a7b78e171bf::af_lp::AF_LP",
      rewardCoins: [
        {
          coinType: "0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc::afsui::AFSUI",
          symbol: "afSUI"
        }
      ]
    }
  },
  {
    pool: {
      objectId: "0xee7a281296e0a316eff84e7ea0d5f3eb19d1860c2d4ed598c086ceaa9bf78c75",
      name: "SUI/NS",
      lpCoinType: "0xf847c541b3076eea83cbaddcc244d25415b7c6828c1542cae4ab152d809896b6::af_lp::AF_LP",
      coins: [
        {
          coinType: "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
          weight: 50,
          symbol: "SUI"
        },
        {
          coinType: "0x5145494a5f5100e645e4b0aa950fa6b68f614e8c59e17bc5ded3495123a79178::ns::NS",
          weight: 50,
          symbol: "NS"
        }
      ]
    },
    farm: {
      objectId: "0x20672ed3b848ad0e8613d027ee579cfad9db4a551b82115dc0a8d1f8dcd78c65",
      stakeCoinType: "0xf847c541b3076eea83cbaddcc244d25415b7c6828c1542cae4ab152d809896b6::af_lp::AF_LP",
      rewardCoins: [
        {
          coinType: "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
          symbol: "SUI"
        },
        {
          coinType: "0x5145494a5f5100e645e4b0aa950fa6b68f614e8c59e17bc5ded3495123a79178::ns::NS",
          symbol: "NS"
        }
      ]
    }
  },
  {
    pool: {
      objectId: "0x98327d7d07581bf78dfe277d8a88de39b4766962e8859b2050a1ca03e9fa2a16",
      name: "SUI/mUSD",
      lpCoinType: "0x84c853d28dac001038015d8580bf6b078c670817434f06c5ecad44fd181d7252::af_lp::AF_LP",
      coins: [
        {
          coinType: "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
          weight: 20,
          symbol: "SUI"
        },
        {
          coinType: "0xe44df51c0b21a27ab915fa1fe2ca610cd3eaa6d9666fe5e62b988bf7f0bd8722::musd::MUSD",
          weight: 80,
          symbol: "mUSD"
        }
      ]
    },
    farm: {
      objectId: "0xea5c68f2aa0d52b30b99042ceb018fdffda064fb228437804468ec5856c67ffd",
      stakeCoinType: "0x84c853d28dac001038015d8580bf6b078c670817434f06c5ecad44fd181d7252::af_lp::AF_LP",
      rewardCoins: [
        {
          coinType: "0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc::afsui::AFSUI",
          symbol: "afSUI"
        },
        {
          coinType: "0x7bae0b3b7b6c3da899fe3f4af95b7110633499c02b8c6945110d799d99deaa68::mpoints::MPOINTS",
          symbol: "MPOINTS"
        }
      ]
    }
  },
  {
    pool: {
      objectId: "0x0878a407034629dd96b71b8eb73216b78501aea2c5d4b062fceb92a4b1a2ecb9",
      name: "LBTC/suiWBTC",
      lpCoinType: "0x604f2e82f5923c22373d048149c4b7861585cebe231b4e9e93ed8fb9c3c33bb5::af_lp::AF_LP",
      coins: [
        {
          coinType: "0x3e8e9423d80e1774a7ca128fccd8bf5f1f7753be658c5e645929037f7c819040::lbtc::LBTC",
          weight: 40,
          symbol: "LBTC"
        },
        {
          coinType: "0xaafb102dd0902f5055cadecd687fb5b71ca82ef0e0285d90afde828ec58ca96b::btc::BTC",
          weight: 60,
          symbol: "suiWBTC"
        }
      ]
    },
    farm: {
      objectId: "0x05a662d9e9673d2407f8b996fa581b8194ac44b632b7c5785694030346e5e214",
      stakeCoinType: "0x604f2e82f5923c22373d048149c4b7861585cebe231b4e9e93ed8fb9c3c33bb5::af_lp::AF_LP",
      rewardCoins: [
        {
          coinType: "0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP",
          symbol: "DEEP"
        }
      ]
    }
  },
  {
    pool: {
      objectId: "0x24e36f68a85fb0ed114879fc683fcf8e108ce11c31db9a2ba3ae200bbb29be26",
      name: "superSUI/mUSD",
      lpCoinType: "0x797abd920c222fef740fddf865e94c1f8198d67e18d395ee4445a7f263677e62::af_lp::AF_LP",
      coins: [
        {
          coinType: "0x790f258062909e3a0ffc78b3c53ac2f62d7084c3bab95644bdeb05add7250001::super_sui::SUPER_SUI",
          weight: 80,
          symbol: "superSUI"
        },
        {
          coinType: "0xe44df51c0b21a27ab915fa1fe2ca610cd3eaa6d9666fe5e62b988bf7f0bd8722::musd::MUSD",
          weight: 20,
          symbol: "mUSD"
        }
      ]
    },
    farm: {
      objectId: "0xb77727f33bd35b8d842fa85be20cdff02a5e9faaddb5b80c72ae71d49117aa39",
      stakeCoinType: "0x797abd920c222fef740fddf865e94c1f8198d67e18d395ee4445a7f263677e62::af_lp::AF_LP",
      rewardCoins: [
        {
          coinType: "0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc::afsui::AFSUI",
          symbol: "afSUI"
        },
        {
          coinType: "0x7bae0b3b7b6c3da899fe3f4af95b7110633499c02b8c6945110d799d99deaa68::mpoints::MPOINTS",
          symbol: "MPOINTS"
        },
        {
          coinType: "0x790f258062909e3a0ffc78b3c53ac2f62d7084c3bab95644bdeb05add7250001::super_sui::SUPER_SUI",
          symbol: "SUPER_SUI"
        }
      ]
    }
  },
  {
    pool: {
      objectId: "0xb0cc4ce941a6c6ac0ca6d8e6875ae5d86edbec392c3333d008ca88f377e5e181",
      name: "SUI/USDC",
      lpCoinType: "0xd1a3eab6e9659407cb2a5a529d13b4102e498619466fc2d01cb0a6547bbdb376::af_lp::AF_LP",
      coins: [
        {
          coinType: "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
          weight: 20,
          symbol: "SUI"
        },
        {
          coinType: "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
          weight: 80,
          symbol: "USDC"
        }
      ]
    },
    farm: {
      objectId: "0x0819f52c064eef993370aea4658affd3d73d5bad03b6a44c7bf8ab47eb537d06",
      stakeCoinType: "0xd1a3eab6e9659407cb2a5a529d13b4102e498619466fc2d01cb0a6547bbdb376::af_lp::AF_LP",
      rewardCoins: [
        {
          coinType: "0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc::afsui::AFSUI",
          symbol: "afSUI"
        }
      ]
    }
  },
  {
    pool: {
      objectId: "0x08d746631e6e2aaa8d88b087be11245106497fbbaf4d7f0f2facd0acc645abf9",
      name: "mETH/mUSD",
      lpCoinType: "0x94b092e200b1a700fb3ebc1bd0f1eee4d06fd2edfd626ae6efebb2da78ce125b::af_lp::AF_LP",
      coins: [
        {
          coinType: "0xccd628c2334c5ed33e6c47d6c21bb664f8b6307b2ac32c2462a61f69a31ebcee::meth::METH",
          weight: 80,
          symbol: "mETH"
        },
        {
          coinType: "0xe44df51c0b21a27ab915fa1fe2ca610cd3eaa6d9666fe5e62b988bf7f0bd8722::musd::MUSD",
          weight: 20,
          symbol: "mUSD"
        }
      ]
    },
    farm: {
      objectId: "0xb0c0edebd12b77ab34091300030d9ffb47cfce052312dfd5a15982571ff399f2",
      stakeCoinType: "0x94b092e200b1a700fb3ebc1bd0f1eee4d06fd2edfd626ae6efebb2da78ce125b::af_lp::AF_LP",
      rewardCoins: [
        {
          coinType: "0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc::afsui::AFSUI",
          symbol: "afSUI"
        },
        {
          coinType: "0x7bae0b3b7b6c3da899fe3f4af95b7110633499c02b8c6945110d799d99deaa68::mpoints::MPOINTS",
          symbol: "MPOINTS"
        }
      ]
    }
  },
  {
    pool: {
      objectId: "0x3d5e6a3a72ea3deb2f4f5011d8f404003e145e290e7ffc209254aabba488c220",
      name: "mBTC/mUSD",
      lpCoinType: "0xc9ecb0b9d62dac89607dbe368de67a022bf07dd37273b298d7074d7cff42e39b::af_lp::AF_LP",
      coins: [
        {
          coinType: "0x0042c1db2eecdd8472aa2464cc3b25b39408ab6d3863bc0e574c7c7910daab09::mbtc::MBTC",
          weight: 80,
          symbol: "mBTC"
        },
        {
          coinType: "0xe44df51c0b21a27ab915fa1fe2ca610cd3eaa6d9666fe5e62b988bf7f0bd8722::musd::MUSD",
          weight: 20,
          symbol: "mUSD"
        }
      ]
    },
    farm: {
      objectId: "0xd6f425e2e02fd6f8f71581587f31bf32c9e8c4aa9372b9b6e09d399d88d615dc",
      stakeCoinType: "0xc9ecb0b9d62dac89607dbe368de67a022bf07dd37273b298d7074d7cff42e39b::af_lp::AF_LP",
      rewardCoins: [
        {
          coinType: "0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc::afsui::AFSUI",
          symbol: "afSUI"
        },
        {
          coinType: "0x7bae0b3b7b6c3da899fe3f4af95b7110633499c02b8c6945110d799d99deaa68::mpoints::MPOINTS",
          symbol: "MPOINTS"
        }
      ]
    }
  }
]; 