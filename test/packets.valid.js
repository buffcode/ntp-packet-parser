module.exports = [
  {
    buffer: [
      28, 1, 48, 234, 0, 0, 0, 0, 0, 0, 0, 68, 80, 84, 66, 0, 221, 82, 40, 120, 122, 239, 46, 145, 48, 48, 48, 48, 48,
      48, 48, 10, 221, 82, 40, 124, 17, 15, 55, 20, 221, 82, 40, 124, 17, 25, 203, 213,
    ],
    expected: {
      leapIndicator: 0,
      version: 3,
      mode: 4,
      stratum: 1,
      poll: 48,
      precision: 234,
      rootDelay: new Date("1900-01-01T00:00:00.000Z"),
      rootDispersion: new Date("1900-01-01T00:00:00.001Z"),
      referenceId: "PTB",
      referenceTimestamp: new Date("2017-08-31T06:17:28.480Z"),
      originTimestamp: new Date("1925-08-15T05:27:12.188Z"),
      receiveTimestamp: new Date("2017-08-31T06:17:32.066Z"),
      transmitTimestamp: new Date("2017-08-31T06:17:32.066Z"),
    },
  },
  {
    buffer: [
      28, 1, 48, 234, 0, 0, 0, 0, 0, 0, 0, 70, 80, 84, 66, 0, 221, 81, 98, 144, 122, 240, 131, 160, 48, 48, 48, 48, 48,
      48, 48, 10, 221, 81, 98, 150, 72, 91, 119, 135, 221, 81, 98, 150, 72, 95, 235, 26,
    ],
    expected: {
      leapIndicator: 0,
      version: 3,
      mode: 4,
      stratum: 1,
      poll: 48,
      precision: 234,
      rootDelay: new Date("1900-01-01T00:00:00.000Z"),
      rootDispersion: new Date("1900-01-01T00:00:00.001Z"),
      referenceId: "PTB",
      referenceTimestamp: new Date("2017-08-30T16:13:04.480Z"),
      originTimestamp: new Date("1925-08-15T05:27:12.188Z"),
      receiveTimestamp: new Date("2017-08-30T16:13:10.282Z"),
      transmitTimestamp: new Date("2017-08-30T16:13:10.282Z"),
    },
  },
];
