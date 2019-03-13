# knockout-prototype

## this project is for demostrating the implementation of knockoutjs

including two api
 - [ ] ko.observable
 - [ ] ko.computed

and its inner dependency detection record tool:
- [ ]  ko.dependencyDetect



#install and run 

```
npm install
npm run dev
```

# explain

the basic implementation idea

first the prototype module: knockout.js 

In this file, observable and computed api is implemented,
the proccess is such as below:
* when the computed variable is evaluted, then register it as an observer to its dependency(observable variable).
* when the observable variable change value, then notify all computed variable to recalcute their values.

Notice: I use a intermidate variable ko.dependency to record the current computed variable, for the sake of recording it when observable variable is called in computed variable evaluating function.

simple flow chart is below:
* defintion: 
  ko.computed --- use ---> ko.observable
* ko.computed first called: 
  ko.computed --- register self ---> ko.dependency 
  ko.observable --- register ko.dependency to its observer
* ko.observable is changed value:
  it notify all observer to recalcute their values.


```

let ko = {}

ko.say = () => console.log("hello world")

ko.dependency = (() => {
    let callerstack = []
    let currentCaller

    return {
        currentCaller,
        callerstack
    }
})();


ko.observable = (initVal) => {
    // for record caller, ie observer
    let observerCache = [];

    // store current observable value
    let currentVal = "";
    if(initVal !== undefined){
        console.log("initVal 0=", initVal)
        currentVal = initVal;
    }

    let observable = (newVal) => {
        // for read, subscribe to caller
        if( newVal === undefined ) {
            if (ko.dependency.currentCaller) {
                observerCache.push(ko.dependency.currentCaller)
            }

            return currentVal;
        // for write
        } else {
            currentVal = newVal;

            console.log("===",observerCache.length)

            for (const index in observerCache) {
                console.log("-----------3-", observerCache[index]);
                observerCache[index].callEvalWithDeps();
            }
        }
    }

    return observable
}

ko.computed = (evalFunc) => {
    // store current observable value
    let currentVal = "";

    let unValuated = true;

    let computedObservable = () => {

        if (unValuated){
            computedObservable.callEvalWithDeps();
            unValuated = false;
        }

        return currentVal;
    }

    computedObservable.callEvalWithDeps = () => {
        if (ko.dependency.currentCaller) {
            ko.dependency.callerstack.push(ko.dependency.currentCaller)
        }

        ko.dependency.currentCaller = computedObservable;

        currentVal = evalFunc();

        let parent = ko.dependency.callerstack.pop();
        ko.dependency.currentCaller = parent;
    }

    return computedObservable
}

module.exports = ko

```

usage code

```

import ko from "./knockout.js"
ko.say();

let aObservable = ko.observable("a");
console.log("aObservable=", aObservable());


let bComputed = ko.computed(() => {
  let result = aObservable() + "b";

  console.log("result=", result);

  return result;
})

// bind subscription to aObservable
let bVal = bComputed();
console.log("bVal=", bVal);

// trigger reactive effect
aObservable("c");

console.log("bComputed=", bComputed())

```

