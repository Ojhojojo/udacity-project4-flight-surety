import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';

export default class Contract {
    constructor(network, callback) {

        let config = Config[network];
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.initialize(callback);
        this.owner = null;
        this.airlines = [];
        this.passengers = [];
    }

    initialize(callback) {
        this.web3.eth.getAccounts((error, accts) => {
           
            this.owner = accts[0];

            let counter = 1;
            
            while(this.airlines.length < 5) {
                this.airlines.push(accts[counter++]);
            }

            while(this.passengers.length < 5) {
                this.passengers.push(accts[counter++]);
            }

            callback();
        });
    }

    isOperational(callback) {
       let self = this;
       self.flightSuretyApp.methods
            .isOperational()
            .call({ from: self.owner}, callback);
    }

    fetchFlightStatus(flight, callback) {
        let self = this;
        let payload = {
            airline: self.airlines[0],
            flight: flight,
            timestamp: Math.floor(Date.now() / 1000)
        } 
        self.flightSuretyApp.methods
            .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
            .send({ from: self.owner}, (error, result) => {
                callback(error, payload);
            });
    }

    buyInsurance(flightName, departure, ether, callback){
        let self = this;
        let payload = {
            airline: self.airlines[0],
            passenger: self.passengers[0],
            flightName: flightName,
            departure: departure
        };
                
        console.log('test buyInsurance');

        self.flightSuretyApp.methods.buyInsurance(
                payload.airline,
                flightName,
                departure
            )
            .send({
                from: payload.passenger,
                value: self.web3.utils.toWei(ether, "ether"),
                gas: 50000, 
            }, (err, res) => {
                callback(err, res);
            });
    }

    getInsurance(flightName, departure, callback){
        let self = this;
        let payload = {
            airline: self.airlines[0],
            passenger: self.passengers[0],
            flightName: flightName,
            departure: departure
        };
                
        self.flightSuretyApp.methods.getInsurance(
            payload.passenger,
            payload.airline,
            flightName,
            departure
            )
            .call({
                from: payload.passenger,
            }, (err, res) => {
                console.log('result: ', res); 
                console.log('error: ', err); 
                callback(err, res);
            });
    }
}