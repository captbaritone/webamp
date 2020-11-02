import * as React from "react";

// A Resource is an object with a read method returning the payload
interface Resource<Payload> {
  read: () => Payload;
}

type status = "pending" | "success" | "error";

// this function let us get a new function using the asyncFn we pass
// this function also receives a payload and return us a resource with
// that payload assigned as type
function createResource<Payload>(
  asyncFn: () => Promise<Payload>
): Resource<Payload> {
  // we start defining our resource is on a pending status
  let status: status = "pending";
  // and we create a variable to store the result
  let result: any;
  // then we immediately start running the `asyncFn` function
  // and we store the resulting promise
  const promise = asyncFn().then(
    (r: Payload) => {
      // once it's fulfilled we change the status to success
      // and we save the returned value as result
      status = "success";
      result = r;
    },
    (e: Error) => {
      // once it's rejected we change the status to error
      // and we save the returned error as result
      status = "error";
      result = e;
    }
  );
  // lately we return an error object with the read method
  return {
    read(): Payload {
      // here we will check the status value
      switch (status) {
        case "pending":
          // if it's still pending we throw the promise
          // throwing a promise is how Suspense know our component is not ready
          throw promise;
        case "error":
          // if it's error we throw the error
          throw result;
        case "success":
          // if it's success we return the result
          return result;
      }
    },
  };
}

// First we need a type of cache to avoid creating resources for images
// we have already fetched in the past
const cache = new Map<string, any>();

// then we create our loadImage function, this function receives the source
// of the image and returns a resource
function loadImage(source: string): Resource<string> {
  // here we start getting the resource from the cache
  let resource = cache.get(source);
  // and if it's there we return it immediately
  if (resource) return resource;
  // but if it's not we create a new resource
  resource = createResource<string>(
    () =>
      // in our async function we create a promise
      new Promise((resolve, reject) => {
        // then create a new image element
        const img = new window.Image();
        // set the src to our source
        img.src = source;
        // and start listening for the load event to resolve the promise
        img.addEventListener("load", () => resolve(source));
        // and also the error event to reject the promise
        img.addEventListener("error", () =>
          reject(new Error(`Failed to load image ${source}`))
        );
      })
  );
  // before finishing we save the new resource in the cache
  cache.set(source, resource);
  // and return return it
  return resource;
}

export default function SuspenseImage(
  props: React.ImgHTMLAttributes<HTMLImageElement>
): JSX.Element {
  if (props.src != null) {
    loadImage(props.src).read();
  }
  return <img {...props} />;
}
