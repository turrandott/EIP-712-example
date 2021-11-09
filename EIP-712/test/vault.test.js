const ethSigUtil = require('eth-sig-util');
const Wallet = require('ethereumjs-wallet').default;

const { EIP712Domain, domainSeparator } = require('./helpers/eip712');

const EIP712 = artifacts.require('Vault');

contract('Vault EIP712', function (accounts) {
  const [mailTo] = accounts;

  const name = 'A Name';
  const version = '1';

  beforeEach('deploying', async function () {
    this.eip712 = await EIP712.new(name, version);

    // We get the chain id from the contract because Ganache (used for coverage) does not return the same chain id
    // from within the EVM as from the JSON RPC interface.
    // See https://github.com/trufflesuite/ganache-core/issues/515
    this.chainId = await this.eip712.getChainId();
  });

  it('domain separator', async function () {
    expect(
      await this.eip712.domainSeparator(),
    ).to.equal(
      await domainSeparator(name, version, this.chainId, this.eip712.address),
    );
  });

  it('digest', async function () {
    const chainId = this.chainId;
    const verifyingContract = this.eip712.address;
  
    const wallet = Wallet.generate()
    const alice = wallet.getAddressString()

    const Claim = [
      { name: 'alice', type: 'address' },
      { name: 'bob', type: 'address' },
      { name: 'messageForAlice', type: 'string' },
      { name: 'nonce', type: 'uint256' },
      { name: 'timestamp', type: 'uint256' },
      { name: 'cumulativeDebitAlice', type: 'uint256' },
      { name: 'cumulativeDebitBob', type: 'uint256' },
  ]

    const claim = {
      alice: alice,
      bob: "0xeA085D9698651e76750F07d0dE0464476187b3ca",
      messageForAlice: "You spend 10 RAC",
      nonce: 1,
      timestamp: 1636401354871,
      cumulativeDebitAlice: 10,
      cumulativeDebitBob: 0,
    }

    const data = {
      types: {
        EIP712Domain,
        Claim
      },
      domain: { name, version, chainId, verifyingContract },
      primaryType: 'Claim',
      message: claim,
    };

    console.log('chainId', chainId)

    const signature = ethSigUtil.signTypedMessage(wallet.getPrivateKey(), { data });
    console.log('sign generated', signature)

    claim.signatureAlice = signature
    claim.signatureBob = signature // TODO: change to the Bob's signature
    

    expect(
      await this.eip712.verify(claim),
    ).to.equal(true);
  });
});
