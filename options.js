/*jshint esnext: true*/
/*jslint
    es6, maxerr: 10, node
*/
/*global chrome:false, document:false, console:false,
  d3:false*/
// Saves options to chrome.storage
var PromiseWrapper = function () {
  var resolver;
  var rejecter;
  var promise = new Promise(function (resolve, reject) {
    resolver = resolve;
    rejecter = reject;
  });
  promise.resolver = resolver;
  promise.rejecter = rejecter;
  return promise;
};
var optionsPromise = new PromiseWrapper();
var Pubsub = function () {
  var ps = {};
  this.sub = function (ev, fn) {
    ps[ev] = ps[ev] || [];
    ps[ev].push(fn);
  };
  this.pub = function (ev, args) {
    var argsArr = Array.prototype.slice.apply(arguments);
    argsArr.splice(0,1);
    ps[ev].forEach(function (fn) {
      fn.apply(null, argsArr);
    });
  }
}
var ps = new Pubsub();
var defaults = {
    color: '#cc0000',
    radius: 20,
    duration: 500,
    transition: 'quad-out',
    ripplecount: 2
  };
function reset_options() {
  setOptions(defaults);
  restore_options();
}
function messageApp(opts) {
  chrome.tabs.query({}, function (tabs) {
    var i;
    for (i = 0; i < tabs.length; i += 1) {
      chrome.tabs.sendMessage(tabs[i].id, {
        op: 'options',
        value: opts
      })
    }
  });
}
function setOptions (opts) {
  chrome.storage.sync.set(
    opts,
    function() {
      // Update status to let user know options were saved.
      var status = document.getElementById('status');
      status.textContent = 'Options saved.';
      messageApp(opts);
      ps.pub('optionsChanged', opts);//also let options content script know
      setTimeout(function() {
        status.textContent = '';
      },
      750
    );
  });
}
function getInputValueFromForm() {
  var o = {};
  function getItemFromForm(item) {
    o[item] = document.getElementById(item).value;
  }
  getItemFromForm('color');
  getItemFromForm('radius');
  getItemFromForm('duration');
  getItemFromForm('transition');
  getItemFromForm('ripplecount');
  return o;
}
function save_options() {
  setOptions(getInputValueFromForm());

}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function onLoad() {
  restore_options();
  var inputs = document.querySelectorAll('input, select');
  var i;
  for (i = 0; i < inputs.length; i += 1) {
    inputs[i].addEventListener('change', function () {
      ps.pub('optionsChanged', getInputValueFromForm());
    });
  }
}
function restore_options() {
  // Use default value color = 'red'
  chrome.storage.sync.get(defaults, function(items) {
    function setInputValueToItem (item) {
      document.getElementById(item).value = items[item];
    }
    setInputValueToItem('color');
    setInputValueToItem('radius');
    setInputValueToItem('duration');
    setInputValueToItem('transition');
    setInputValueToItem('ripplecount');
    optionsPromise.resolver(items);
  });
}
document.addEventListener('DOMContentLoaded', onLoad);
document.getElementById('save').addEventListener('click',
    save_options);
document.getElementById('reset').addEventListener('click',
    reset_options);


window.RippleOptionsPage = {
  pubsub: ps,
  optionsPromise: optionsPromise
};

