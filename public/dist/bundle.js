/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	let transactions = [];
	let myChart;

	fetch("/api/transaction")
	  .then(response => {
	    return response.json();
	  })
	  .then(data => {
	    // save db data on global variable
	    transactions = data;

	    populateTotal();
	    populateTable();
	    populateChart();
	  });

	function populateTotal() {
	  // reduce transaction amounts to a single total value
	  let total = transactions.reduce((total, t) => {
	    return total + parseInt(t.value);
	  }, 0);

	  let totalEl = document.querySelector("#total");
	  totalEl.textContent = total;
	}

	function populateTable() {
	  let tbody = document.querySelector("#tbody");
	  tbody.innerHTML = "";

	  transactions.forEach(transaction => {
	    // create and populate a table row
	    let tr = document.createElement("tr");
	    tr.innerHTML = `
	      <td>${transaction.name}</td>
	      <td>${transaction.value}</td>
	    `;

	    tbody.appendChild(tr);
	  });
	}

	function populateChart() {
	  // copy array and reverse it
	  let reversed = transactions.slice().reverse();
	  let sum = 0;

	  // create date labels for chart
	  let labels = reversed.map(t => {
	    let date = new Date(t.date);
	    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
	  });

	  // create incremental values for chart
	  let data = reversed.map(t => {
	    sum += parseInt(t.value);
	    return sum;
	  });

	  // remove old chart if it exists
	  if (myChart) {
	    myChart.destroy();
	  }

	  let ctx = document.getElementById("myChart").getContext("2d");

	  myChart = new Chart(ctx, {
	    type: 'line',
	      data: {
	        labels,
	        datasets: [{
	            label: "Total Over Time",
	            fill: true,
	            backgroundColor: "#6666ff",
	            data
	        }]
	    }
	  });
	}

	function sendTransaction(isAdding) {
	  let nameEl = document.querySelector("#t-name");
	  let amountEl = document.querySelector("#t-amount");
	  let errorEl = document.querySelector(".form .error");

	  // validate form
	  if (nameEl.value === "" || amountEl.value === "") {
	    errorEl.textContent = "Missing Information";
	    return;
	  }
	  else {
	    errorEl.textContent = "";
	  }

	  // create record
	  let transaction = {
	    name: nameEl.value,
	    value: amountEl.value,
	    date: new Date().toISOString()
	  };

	  // if subtracting funds, convert amount to negative number
	  if (!isAdding) {
	    transaction.value *= -1;
	  }

	  // add to beginning of current array of data
	  transactions.unshift(transaction);

	  // re-run logic to populate ui with new record
	  populateChart();
	  populateTable();
	  populateTotal();
	  
	  // also send to server
	  fetch("/api/transaction", {
	    method: "POST",
	    body: JSON.stringify(transaction),
	    headers: {
	      Accept: "application/json, text/plain, */*",
	      "Content-Type": "application/json"
	    }
	  })
	  .then(response => {    
	    return response.json();
	  })
	  .then(data => {
	    if (data.errors) {
	      errorEl.textContent = "Missing Information";
	    }
	    else {
	      // clear form
	      nameEl.value = "";
	      amountEl.value = "";
	    }
	  })
	  .catch(err => {
	    // fetch failed, so save in indexed db
	    saveRecord(transaction);

	    // clear form
	    nameEl.value = "";
	    amountEl.value = "";
	  });
	}

	document.querySelector("#add-btn").onclick = function() {
	  sendTransaction(true);
	};

	document.querySelector("#sub-btn").onclick = function() {
	  sendTransaction(false);
	};


/***/ }
/******/ ]);