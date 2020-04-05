//jshint esversion:6
// module example
// module.exports = getdate; //this exportes the object

// Using named function
module.exports.getDate = getDate;

function getDate() {
  let today = new Date();

  let options = {
    weekday: 'long',
    // year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  // console.log(today.toLocaleDateString("en-US")); // 9/17/2016
return today.toLocaleDateString("en-US", options); // Saturday, September 17, 2016
};

// Using anonimous function way to declare a function
module.exports.getDay = function () {
  let today = new Date();

  let options = {
    weekday: 'long',
  };

  // console.log(today.toLocaleDateString("en-US")); // 9/17/2016

return today.toLocaleDateString("en-US", options); // Saturday, September 17, 2016;
};
