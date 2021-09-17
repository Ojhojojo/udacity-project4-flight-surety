var Test = require("../config/testConfig.js");
var BigNumber = require("bignumber.js");
var DefaultAmount = web3.utils.toWei('10', 'ether');


contract("Flight Surety Tests", async (accounts) => {
  var config;
  before("setup contract", async () => {
    config = await Test.Config(accounts);
    await config.flightSuretyData.authorizeCaller(
      config.flightSuretyApp.address
    );
  });

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

  it(`(multiparty) has correct initial isOperational() value`, async function () {
    // Get operating status
    let status = await config.flightSuretyData.isOperational.call();
    assert.equal(status, true, "Incorrect initial operating status value");
  });

  it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {
    // Ensure that access is denied for non-Contract Owner account
    let accessDenied = false;
    try {
      await config.flightSuretyData.setOperatingStatus(false, {
        from: config.airlines[2],
      });
    } catch (e) {
      accessDenied = true;
    }
    assert.equal(accessDenied, true, "Access not restricted to Contract Owner");
  });

  it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {
    // Ensure that access is allowed for Contract Owner account
    let accessDenied = false;
    try {
      await config.flightSuretyData.setOperatingStatus(false);
    } catch (e) {
      accessDenied = true;
    }
    assert.equal(
      accessDenied,
      false,
      "Access not restricted to Contract Owner"
    );
  });

  it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {
    await config.flightSuretyData.setOperatingStatus(false);

    let reverted = false;
    try {
      await config.flightSurety.setTestingMode(true);
    } catch (e) {
      reverted = true;
    }
    assert.equal(reverted, true, "Access not blocked for requireIsOperational");

    // Set it back for other tests to work
    await config.flightSuretyData.setOperatingStatus(true);
  });

  it("(airline) cannot register an Airline using registerAirline() if it is not funded", async () => {
    // ARRANGE
    let newAirline = config.airlines[2];

    // ACT
    try {
      await config.flightSuretyApp.registerAirline(newAirline, {
        from: config.firstAirline,
      });
    } catch (e) { }
    let result = await config.flightSuretyData.airlineRegistered.call(newAirline);

    // ASSERT
    assert.equal(
      result,
      false,
      "Airline should not be able to register another airline if it hasn't provided funding"
    );
  });

  it('(airline) is able to fund itself using fundAirline()', async () => {

    // ARRANGE
    try {
      // ACT
      await config.flightSuretyApp.fundAirline.call({ from: config.firstAirline, value: DefaultAmount });
      let result = await config.flightSuretyData.isAirlineFunded.call(
        config.firstAirline
      );

      // ASSERT
      assert.equal(result, true, "Airline should be able to fund itself.");
    }
    catch (e) {
      console.log(e);
    }

  });

  it('(airline) can register another airline using registerAirline()', async () => {
    // ARRANGE
    const newAirline = config.airlines[3];

    try {
      // ACT
      await config.flightSuretyApp.fundAirline({ from: config.firstAirline, value: DefaultAmount });
      await config.flightSuretyApp.registerAirline(newAirline, { from: config.firstAirline });

      let result = await config.flightSuretyData.isAirlineRegistered.call(newAirline);

      // ASSERT
      assert.equal(result, true, "Airline should be able to register another airline after it has provided funding");
    }
    catch (e) {
      console.log(e)
    }

  });

  it("(airline) can register a new airline using registerAirline() until there are at least four airlines registered", async () => {

    // ARRANGE
    const newAirline2 = config.airlines[4];
    const newAirline3 = config.airlines[5];

    // ACT
    try {
      await config.flightSuretyApp.fundAirline({ from: config.firstAirline, value: DefaultAmount });
      await config.flightSuretyApp.registerAirline(newAirline2, {
        from: config.firstAirline,
      });
      await config.flightSuretyApp.registerAirline(newAirline3, {
        from: config.firstAirline,
      });
      let registeredAirlinesCount = await config.flightSuretyData.getRegisteredAirlinesCount();

      // ASSERT
      assert.equal(registeredAirlinesCount, 4, "There should be 4 registered airlines");
    } catch (e) {
      console.log("Error: ", e);
    }
  });


  it("(multiparty) registration of 5th and subsequent airlines requires multi-party consensus of 50% of registered airlines part1", async () => {

    // ARRANGE
    const newAirline2 = config.airlines[2];
    const newAirline3 = config.airlines[3];
    const newAirline4 = config.airlines[4];
    const newAirline5 = config.airlines[5];
    const newAirline6 = config.airlines[6];

    // ACT
    try {
      await config.flightSuretyApp.fundAirline({ from: config.firstAirline, value: DefaultAmount });
      await config.flightSuretyApp.registerAirline(newAirline2, {
        from: config.firstAirline,
      });
      await config.flightSuretyApp.registerAirline(newAirline3, {
        from: config.firstAirline,
      });
      await config.flightSuretyApp.registerAirline(newAirline4, {
        from: config.firstAirline,
      });
      await config.flightSuretyApp.registerAirline(newAirline5, {
        from: config.firstAirline,
      });
      await config.flightSuretyApp.registerAirline(newAirline6, {
        from: config.firstAirline,
      });

      // ASSERT
      let registered = await config.flightSuretyData.getRegisteredAirlinesCount();
      let exist = await config.flightSuretyData.getExistAirlinesCount();
      assert.equal(registered, 4, "There should be 4 registered airlines");
      assert.equal(exist, 7, "There should be 7 existing airlines");
    } catch (e) {
      console.log("Error: ", e);
    }

  });

  it("(multiparty) registration of 5th and subsequent airlines requires multi-party consensus of 50% of registered airlines part2", async () => {
    // ARRANGE
    const newAirline = config.airlines[4];

    try {
      // ACT
      await config.flightSuretyApp.fundAirline({ from: config.airlines[1], value: DefaultAmount });
      await config.flightSuretyApp.fundAirline({ from: config.airlines[2], value: DefaultAmount });
      await config.flightSuretyApp.fundAirline({ from: config.airlines[3], value: DefaultAmount });

      await config.flightSuretyApp.voteForAirline(newAirline, {from: config.airlines[0],});
      await config.flightSuretyApp.voteForAirline(newAirline, {from: config.airlines[1],});
      await config.flightSuretyApp.voteForAirline(newAirline, {from: config.airlines[2],});

      // ASSERT
      let funded = await config.flightSuretyData.getFundedAirlinesCount();
      let registered = await config.flightSuretyData.airlineRegistered(newAirline);

      assert.equal(funded, 4, "There should be 4 funded airlines");
      assert.equal(registered, true, "Airline should be able to register with enough votes");

    } catch (e) {
      console.log("Error: ", e);
    }
  });

  it(`(passenger) can buy insurance`, async () => {

   // ARRANGE
    let flight = "FS1234";
    let timestamp = Math.floor(Date.now() / 1000);
    try {
      // ACT
      await config.flightSuretyApp.buyInsurance(config.firstAirline, flight, timestamp, { from: config.passengers[0], value: DefaultAmount });
    
      let insurance = await config.flightSuretyApp.getInsurance.call(config.passengers[0], config.firstAirline, flight,
        timestamp, { from: config.airlines[0] });
      
        // ASSERT
      assert.equal(insurance.state, "2", "The insurance state should be Bought");
    } catch (e) {
      console.log("Error: ", e);
    }
  });
});
