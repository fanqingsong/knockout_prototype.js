
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

