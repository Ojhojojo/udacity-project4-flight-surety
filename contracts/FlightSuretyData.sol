pragma solidity ^0.5.16;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private contractOwner; // Account used to deploy contract
    bool private operational = true; // Blocks all state changes throughout the contract if false

    struct Airline {
        bool isExisting;
        bool isRegistered;
        bool isFunded;
        bytes32[] flightKeyList;
        Votes votes;
        uint256 numberOfInsurance;
    }
    
    mapping(address => Airline) private airlineMapping;
    mapping(address => bool) public authorizedCallerMapping;

    uint256 private airlinesCount = 0;
    uint256 private registeredAirlinesCount = 0;
    uint256 private fundedAirlinesCount = 0;

    struct Votes {
        uint256 votersCount;
        mapping(address => bool) voterMapping;
    }

    struct Insurance {
        address buyer;
        uint256 value;
        address airline;
        string flightName;
        uint256 departure;
        InsuranceState state;
    }

    enum InsuranceState {
        NotExist,
        WaitingForBuyer,
        Bought,
        Passed,
        Expired
    }

    struct FlightInsurance {
        mapping(address => Insurance) insurances;
        address[] keys;
    }
    mapping(bytes32 => FlightInsurance) private flightInsuranceMapping;

    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/

    event AuthorizeCaller(address caller);

    event AirlineExist(address airline, bool exist);

    event AirlineRegistered(address airline, bool exist, bool registered);

    event AirlineFunded(
        address airlineAddress,
        bool exist,
        bool registered,
        bool funded,
        uint256 fundedCount
    );

    event InsuranceBought(bytes32 flightKey);

    /**
     * @dev Constructor
     *      The deploying account becomes contractOwner
     */
    constructor(
        address airlineAddress
    ) public {
        contractOwner = msg.sender;

        airlineMapping[airlineAddress] = Airline({
            isExisting: true,
            isRegistered: true,
            isFunded: false,
            flightKeyList: new bytes32[](0),
            votes: Votes(0),
            numberOfInsurance: 0
        });

        airlinesCount = airlinesCount.add(1);
        registeredAirlinesCount = registeredAirlinesCount.add(1);
        emit AirlineExist(airlineAddress, airlineMapping[airlineAddress].isExisting);

        emit AirlineRegistered(
            airlineAddress,
            airlineMapping[airlineAddress].isExisting,
            airlineMapping[airlineAddress].isRegistered
        );
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
     * @dev Modifier that requires the "operational" boolean variable to be "true"
     *      This is used on all state changing functions to pause the contract in
     *      the event there is an issue that needs to be fixed
     */
    modifier requireIsOperational() {
        require(operational, "Contract is currently not operational");
        _; // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
     * @dev Modifier that requires the "ContractOwner" account to be the function caller
     */
    modifier requireContractOwner() {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    modifier requireAuthorizedCaller(address contractAddress) {
        require(authorizedCallerMapping[contractAddress], "Caller is not authorized");
        _;
    }

    modifier requireIsAirlineExisting(address airlineAddress) {
        require(airlineMapping[airlineAddress].isExisting, "Airline does not exist");
        _;
    }

    modifier requireIsAirlineRegistered(address airlineAddress) {
        require(airlineMapping[airlineAddress].isRegistered, "Airline is not registered");
        _;
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
     * @dev Get operating status of contract
     *
     * @return A bool that is the current operating status
     */
    function isOperational() public view returns (bool) {
        return operational;
    }

    /**
     * @dev Sets contract operations on/off
     *
     * When operational mode is disabled, all write transactions except for this one will fail
     */
    function setOperatingStatus(bool mode) external requireContractOwner {
        operational = mode;
    }

//        
    function authorizeCaller(address contractAddress)
        public
        requireContractOwner
        requireIsOperational
    {
        require(!authorizedCallerMapping[contractAddress], "Address is authorized");
        authorizedCallerMapping[contractAddress] = true;
        emit AuthorizeCaller(contractAddress);
    }

    function getExistAirlinesCount() public view returns (uint256) {
        return airlinesCount;
    }

    function getRegisteredAirlinesCount() public view returns (uint256) {
        return registeredAirlinesCount;
    }

    function getFundedAirlinesCount() public view returns (uint256) {
        return fundedAirlinesCount;
    }

    function getAirlineVotesCount(address airlineAddress)
        public
        view
        returns (uint256)
    {
        return airlineMapping[airlineAddress].votes.votersCount;
    }

    function airlineExists(address airlineAddress) public view returns (bool) {
        return airlineMapping[airlineAddress].isExisting;
    }

    function airlineRegistered(address airlineAddress)
        public
        view
        returns (bool)
    {
        return (
            airlineMapping[airlineAddress].isExisting
                ? airlineMapping[airlineAddress].isRegistered
                : false
        );
    }

    function isAirlineFunded(address airlineAddress) public view returns (bool) {
        return airlineMapping[airlineAddress].isFunded;
    }

    function getInsurance(
        address buyer,
        address airlineAddress,
        string memory flightName,
        uint256 departure
    ) public view returns (uint256 value, InsuranceState state) {
        bytes32 flightKey = getFlightKey(airlineAddress, flightName, departure);
        FlightInsurance storage flightInsurance = flightInsuranceMapping[flightKey];
        Insurance storage insurance = flightInsurance.insurances[buyer];
        return (insurance.value, insurance.state);
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

    /**
     * @dev Add an airline to the registration queue
     *      Can only be called from FlightSuretyApp contract
     *
     */
    function registerAirline(address airlineAddress, bool registered)
        public
        requireIsOperational
    {
        airlineMapping[airlineAddress] = Airline({
            isExisting: true,
            isRegistered: registered,
            isFunded: false,
            flightKeyList: new bytes32[](0),
            votes: Votes(0),
            numberOfInsurance: 0
        });

        airlinesCount = airlinesCount.add(1);
        if (registered == true) {
            registeredAirlinesCount = registeredAirlinesCount.add(1);
            emit AirlineRegistered(
                airlineAddress,
                airlineMapping[airlineAddress].isExisting,
                airlineMapping[airlineAddress].isRegistered
            );
        } else {
            emit AirlineExist(airlineAddress, airlineMapping[airlineAddress].isExisting);
        }
    }

    function setAirlineRegistered(address airlineAddress)
        public
        requireIsOperational
        requireIsAirlineExisting(airlineAddress)
    {
        require(airlineMapping[airlineAddress].isRegistered, "Airline is already registered");
        airlineMapping[airlineAddress].isRegistered = true;
        registeredAirlinesCount = registeredAirlinesCount.add(1);
        emit AirlineRegistered(
            airlineAddress,
            airlineMapping[airlineAddress].isExisting,
            airlineMapping[airlineAddress].isRegistered
        );
    }

    function getMinimumRequiredVotingCount() public view returns (uint256) {
        return registeredAirlinesCount.div(2);
    }

    function voteForAirline(
        address votingAirlineAddress,
        address airlineAddress
    ) public requireIsOperational {
        require(!airlineMapping[airlineAddress].votes.voterMapping[votingAirlineAddress], "Airline already voted");

        airlineMapping[airlineAddress].votes.voterMapping[votingAirlineAddress] = true;
        uint256 startingVotes = getAirlineVotesCount(airlineAddress);

        airlineMapping[airlineAddress].votes.votersCount = startingVotes.add(1);
    }

    function registerFlightKey(address airlineAddress, bytes32 flightKey)
        public
        requireAuthorizedCaller(msg.sender)
    {
        airlineMapping[airlineAddress].flightKeyList.push(flightKey);
    }

    /**
     * @dev Buy insurance for a flight
     *
     */
    function buyInsurance(
        address buyer,
        address airlineAddress,
        string memory flightName,
        uint256 departure
    ) public payable {
        bytes32 flightKey = getFlightKey(airlineAddress, flightName, departure);
        FlightInsurance storage flightInsurance = flightInsuranceMapping[flightKey];
        flightInsurance.insurances[buyer] = Insurance({
            buyer: buyer,
            value: msg.value,
            airline: airlineAddress,
            flightName: flightName,
            departure: departure,
            state: InsuranceState.Bought
        });
        flightInsurance.keys.push(buyer);
        emit InsuranceBought(flightKey);
    }

    /**
     *  @dev Credits payouts to insurees
     */
    function creditInsurees(bytes32 flightKey, uint8 creditRate)
        public
        requireAuthorizedCaller(msg.sender)
    {
        FlightInsurance storage flightInsurance = flightInsuranceMapping[flightKey];

        for (uint256 i = 0; i < flightInsurance.keys.length; i++) {
            Insurance storage insurance = flightInsurance.insurances[flightInsurance.keys[i]];

            if (insurance.state == InsuranceState.Bought && creditRate > 0) {
                insurance.value = insurance.value.mul(creditRate).div(100);
                insurance.state = InsuranceState.Passed;
            } else {
                insurance.state = InsuranceState.Expired;
            }
        }
    }

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
     */
    function pay(bytes32 flightKey) external payable {
        FlightInsurance storage flightInsurance = flightInsuranceMapping[flightKey];
        Insurance storage insurance = flightInsurance.insurances[msg.sender];

        require(
            insurance.state == InsuranceState.Passed,
            "Insuree is not eligible"
        );
        require(address(this).balance > insurance.value, "Please try again later");

        uint256 value = insurance.value;
        insurance.value = 0;
        insurance.state = InsuranceState.Expired;
        address payable insuree = address(uint160(insurance.buyer));
        insuree.transfer(value);
    }

    /**
     * @dev Initial funding for the insurance. Unless there are too many delayed flights
     *      resulting in insurance payouts, the contract should be self-sustaining
     *
     */
    function fund(address airlineAddress)
        public
        payable
        requireIsOperational
        requireIsAirlineExisting(airlineAddress)
        requireIsAirlineRegistered(airlineAddress)
    {
        airlineMapping[airlineAddress].isFunded = true;
        fundedAirlinesCount = fundedAirlinesCount.add(1);
        emit AirlineFunded(
            airlineAddress,
            airlineMapping[airlineAddress].isExisting,
            airlineMapping[airlineAddress].isRegistered,
            airlineMapping[airlineAddress].isFunded,
            fundedAirlinesCount
        );
    }

    function getFlightKey(
        address airline,
        string memory flight,
        uint256 timestamp
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    /**
     * @dev Fallback function for funding smart contract.
     *
     */
    function() external payable {
        fund(msg.sender);
    }
}
