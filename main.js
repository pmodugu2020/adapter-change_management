// Update this constant with your ServiceNow credentials
const options = {
  url: 'https://dev58329.service-now.com/',
  username: 'admin',
  password: '!Sprint102020!'
};

/**
 * Import the Node.js request package.
 * See https://www.npmjs.com/package/request
 */
const request = require('request');


// We'll use this regular expression to verify REST API's HTTP response status code.
const validResponseRegex = /(2\d\d)/;

// Use JSDoc to create a JSDoc data type for an IAP callback.
// Call the new type iapCallback.
// Notice iapCallback is a data-first callback.

/**
 * This is a [JSDoc comment]{@link http://usejsdoc.org/tags-description.html}.
 * See http://usejsdoc.org/tags-description.html.
 *
 * @callback iapCallback
 * @description A [callback function]{@link
 *   https://developer.mozilla.org/en-US/docs/Glossary/Callback_function}
 *   is a function passed into another function as an argument, which is
 *   then invoked inside the outer function to complete some kind of
 *   routine or action.
 *
 * @param {*} responseData - When no errors are caught, return data as a
 *   single argument to callback function.
 * @param {error} [errorMessage] - If an error is caught, return error
 *   message in optional second argument to callback function.
 */

/**
 * @function get
 * @description Call the ServiceNow GET API.
 *
 * @param {string} serviceNowTable - The table target of the ServiceNow table API.
 * @param {iapCallback} callback - Callback a function.
 * @param {*} callback.data - The API's response. Will be an object if sunnyday path.
 *   Will be HTML text if hibernating instance.
 * @param {error} callback.error - The error property of callback.
 */
function get(serviceNowTable, callback) {

  // Initialize return arguments for callback
  let callbackData = null;
  let callbackError = null;

  // Construct API call to send to ServiceNow.
  // The request constructor has an options parameter
  // that holds the HTTP request method, credentials, and the API's URL.
  // Some properties are hardcoded, like the method and part of the URI.
  // Some properties are read from global const options.
  // Some properties are passed into function get() through parameters.
  const requestOptions = {
    method: 'GET',
    auth: {
      user: options.username,
      pass: options.password,
    },
    baseUrl: options.url,
    uri: `/api/now/table/${serviceNowTable}?sysparm_limit=1`,
  };

  // Send Request to ServiceNow.
  // We are passing variable requestOptions for the first argument.
  // We are passing an anonymous function, an error-first callback,
  // for the second argument.
  request(requestOptions, (error, response, body) => {
    /**
     * Process ServiceNow error, response and body.
     * Check error and response code to make sure
     * response is good.
     */
    if (error) {
      console.error('Error present.');
      callbackError = error;
    } else if (!validResponseRegex.test(response.statusCode)) {
      console.error('Bad response code.');
      callbackError = response;
    } else if (response.body.includes('Instance Hibernating page')) {
      callbackError = 'Service Now instance is hibernating';
      console.error(callbackError);
    } else {
      callbackData = response;
    }
    return callback(callbackData, callbackError);
  });

}


// This test function calls your request and logs any errors.
function main() {
  // Call function get().
  // We are passing a static argument for parameter serviceNowTable.
  // We are passing an anonymous function argument, a data-first callback,
  // for parameter callback.
  get('change_request', (data, error) => {
    if (error) {
      console.error(`\nError returned from GET request:\n${JSON.stringify(error)}`);
    }
    var jmessage = JSON.parse(data.body);
    console.log(jmessage.result[0].number);

    var jobject = {
        number: null,
        active: null,
        priority: null,
        description: null,
        work_start: null,
        work_end: null,
        sys_id: null        
    };

    jobject.number      = jmessage.result[0].number;
    jobject.active      = jmessage.result[0].active;
    jobject.priority    = jmessage.result[0].priority;
    jobject.description = jmessage.result[0].description;
    jobject.work_start  = jmessage.result[0].work_start;
    jobject.work_end    = jmessage.result[0].work_end;
    jobject.sys_id      = jmessage.result[0].sys_id;

    var jsonstr = JSON.stringify(jobject);
    var jsonMessage = JSON.parse(jsonstr);
    console.log(jsonMessage);

    //JSON.parse(jsonstr).forEach(obj => renameKey(obj, 'number', 'change_ticket_number')); 
    //console.log(JSON.parse(jsonstr));
    
    //}
    //console.log(`\nResponse returned from GET request:\n${JSON.stringify(data.body)}`)

    console.log(jsonMessage.renameKey('number', 'change_ticket_number'));
    console.log(jsonMessage);

  });
}

// Call main to run it.
main();