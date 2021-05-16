![NPM downloads](https://img.shields.io/npm/dt/ntp-packet-parser.svg)
[![Build Status](https://github.com/buffcode/ntp-packet-parser/actions/workflows/nodejs.yml/badge.svg)](https://github.com/buffcode/ntp-packet-parser/actions)
![NPM version](https://img.shields.io/npm/v/ntp-packet-parser)

# NTP packet parser

Library to parse NTP response packets according to [RFC 5905](https://www.ietf.org/rfc/rfc5905.txt) into a easy-to-use structure.
It does not apply any validations or calculations regarding the time but solely parses the data.

See [buffcode/ntp-time-sync](https://github.com/buffcode/ntp-time-sync) for an implementation.

## Installation
```bash
yarn add ntp-packet-parser
```

## Usage
### ES6 style
```js
import { NtpPacketParser } from "ntp-packet-parser";

/** const udpPacket = new Buffer(...); **/
const result = NtpPacketParser.parse(udpPacket);
```

### Legacy style
```js
var NtpPacketParser = require("ntp-packet-parser").NtpPacketParser;

/** const udpPacket = new Buffer(...); **/
var result = NtpPacketParser.parse(udpPacket);
```

## Structure
The response from `NtpPacketParser.parse` will return the following object structure:

| Property | Type | Description |
| :--- | :--- | :--- |
| leapIndicator | `Integer` | Warning of an impending leap second to be inserted or deleted in the last minute of the current month |
| version | `Integer` | NTP version number, currently 4 |
| mode | `Integer` | Request/response mode |
| stratum | `Integer` | Stratum of the server |
| poll | `Integer` | Integer representing the maximum interval in log2 seconds between successive messages (Note: you need to apply `Math.pow(2, <value>)` to get the real value) |
| precision | `Integer` | Integer representing the precision of the system clock in log2 seconds (Note: you need to apply `Math.pow(2, <value>)` to get the real value) |
| rootDelay | `Date` | Total round-trip delay to the reference clock |
| rootDispersion | `Date` | Total dispersion to the reference clock |
| referenceId | `String` | String to identify the particular server or reference clock |
| referenceTimestamp | `Date` | Time when the system clock was last set or corrected  |
| originTimestamp | `Date` | Time at the client when the request departed for the server |
| receiveTimestamp | `Date` | Time at the server when the request arrived from the client |
| transmitTimestamp | `Date` | Time at the server when the response left for the client |

To get the relative time for any Date property, calculate the difference between "Jan 01 1900 GMT" and the given date.
 
```js
let rootDelayInMilliseconds = result.rootDelay.getTime() - new Date("Jan 01 1900 GMT").getTime(); 
``` 

For further explanations on the possible values of these properties please refer to [RFC 5909](https://www.ietf.org/rfc/rfc5905.txt), Page 19ff.

## Testing
Some tests regarding structure, response and error handling exist. To run them locally:
```js
yarn test
```

## Contributing
Please file a PR against `master`.
 
## License
[GNU General Public License Version 3](LICENSE)
