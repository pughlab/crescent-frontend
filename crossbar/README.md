# CHILDdb WAMP Routing
This README describes the specifics of the web application messaging protocol (WAMP) routing for CHILDdb Portal

## Motivation
WAMP allows the application to loosely couple components and their responsibilities (e.g. web app, database connections, computationally intensive analysis) by exposing two kinds of communication via URIs (as opposed to exposing these methods as HTTP endpoints which mixes resources with functionality)

**Routed Remote Procedure Calls** (rRPC): A component may _register_ a method to some URI to be _called_ by any component connected to the router. Both positional and keyword arguments can be passed (_avoid positional wherever possible_) to the method. This way, a Python component can register a computationally intense routine that can then be called by a Javascript component. Alternatively a Javascript component can register a routine to be called by a different Javascript component.

**Publication/Subscription** (Pub/Sub): A component may _subscribe_ to some topic by a URI that another component can then _publish_ information to. This communication is done through the router: components subscribe and publish via the router and do not communicate directly. This allows for a real-time communication pattern between multiple components.


## Development workflow
Below is an approximate workflow for implementing some kind of feature that involves the entire stack. Consider the example for fetching data from multiple databases
  1. **Implement your data fetching or computation on an appropriate WAMP component.** I.e. define your MongoDB and SQL connections and the associated queries in one component (using Autobahn).
  2. **Register those methods from the component to the router.** I.e. define a method that calls both these database connections, combines the data, and returns the data structure. Then use Autobahn to register that method to some URI, e.g. '_admin.users.all_' or '_admin.users.create_'.
  3. **Call those methods from a different component via the router.** I.e. define a GraphQL data type and resolver that expects a returned structure isomorphic to the return value of your data fetching method you registered in the database component. The GraphQL resolver then connects to the router and calls the procedure that was registered, providing the appropriate arguments. The returned value of the resolver should correspond to the GraphQL query/mutation.
  4. **Use that data.** I.e. a React component can then use that GraphQL query which will communicate with the GraphQL server, call the resolver which then calls the rRPC to invoke the registered method and returns the data. Alternatively, a React component can call a rRPC to tell an analysis component to call a different rRPC that fetches data to be used.

The benefit of such a pattern is that the loosely coupled components are abstracted away from the feature: if component **A** expects data **Y** in a specific format provided by component **B**, then it doesn't matter in what way **B** procures **Y** as long as the structure is agreed upon. This introduces some developer communication overhead when starting out but once features and requirements have settled, subroutines may be reused.