const crowdFunding = artifacts.require('CrowdFunding');

module.exports = function (deployer) {
  deployer.deploy(crowdFunding);
};