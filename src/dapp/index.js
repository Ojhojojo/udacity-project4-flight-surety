
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';


(async () => {

    let flightResult = null;

    let contract = new Contract('localhost', () => {
        document.getElementById('buy-insurance').disabled = true;

        // Read transaction
        contract.isOperational((error, result) => {
            console.log(error, result);
            display('Operational Status', 'Check if contract is operational', [{ label: 'Operational Status', error: error, value: result }]);
        });

        // User-submitted flight transaction
        DOM.elid('submit-oracle').addEventListener('click', () => {
            let flight = DOM.elid('flight-number').value;
            // Write transaction
            contract.fetchFlightStatus(flight, (error, result) => {
                flightResult = result;
                display('Oracles', 'Trigger oracles', [{ label: 'Fetch Flight Status', error: error, value: result.flight + ' ' + result.timestamp }]);
                document.getElementById('buy-insurance').disabled = false;
            });
        })

        DOM.elid('buy-insurance').addEventListener('click', () => {
            let ether = DOM.elid('ether').value;
            // Write transaction
            contract.buyInsurance(flightResult.flight, flightResult.timestamp, ether, (error, result) => {
                contract.getInsurance(flightResult.flight, flightResult.timestamp, (error, result) => {
                    display('Insurance', 'Insurance Bought', [{ label: 'Insurance Status', error: error, value: result.value + ' ' + result.state }]);
                });
            });
        })

    });


})();


function display(title, description, results) {
    let displayDiv = DOM.elid("display-wrapper");
    let section = DOM.section();
    section.appendChild(DOM.h2(title));
    section.appendChild(DOM.h5(description));
    results.map((result) => {
        let row = section.appendChild(DOM.div({ className: 'row' }));
        row.appendChild(DOM.div({ className: 'col-sm-4 field' }, result.label));
        row.appendChild(DOM.div({ className: 'col-sm-8 field-value' }, result.error ? String(result.error) : String(result.value)));
        section.appendChild(row);
    })
    displayDiv.append(section);

}








