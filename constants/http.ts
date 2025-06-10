
export const CONTINUE = 100; // Server received the request headers, client can proceed to send the body.
export const SWITCHING_PROTOCOLS = 101; // Server switching protocols, e.g., to WebSocket.
export const PROCESSING = 102; // Server has received and is processing the request but no response is available yet (WebDAV).

// 2xx Success: The action was successfully received, understood, and accepted
export const OK = 200; // Standard success response for GET, PUT, or POST.
export const CREATED = 201; // Resource has been successfully created (e.g., POST request).
export const ACCEPTED = 202; // Request accepted for processing, but processing is not complete.
export const NON_AUTHORITATIVE_INFORMATION = 203; // Metadata in response is from a third-party, not the server.
export const NO_CONTENT = 204; // Successful request, but no content to return (e.g., DELETE).
export const RESET_CONTENT = 205; // Request successful, reset the view or form (used rarely).
export const PARTIAL_CONTENT = 206; // Response contains only part of the resource (e.g., for range-based downloads).
export const MULTI_STATUS = 207; // Provides multiple response statuses for multiple operations (WebDAV).
export const ALREADY_REPORTED = 208; // Resource already reported in a previous response (WebDAV).
export const IM_USED = 226; // Response has been fulfilled and represents one or more instance manipulations.

// 3xx Redirection: Further action must be taken to complete the request
export const MULTIPLE_CHOICES = 300; // Multiple options for the resource (e.g., for content negotiation).
export const MOVED_PERMANENTLY = 301; // Resource has permanently moved to a new URI.
export const FOUND = 302; // Resource temporarily moved; use old URI for future requests.
export const SEE_OTHER = 303; // Redirect to another resource (often after a POST for a GET).
export const NOT_MODIFIED = 304; // Resource not modified; use cached version.
export const TEMPORARY_REDIRECT = 307; // Temporary redirect; HTTP method stays the same.
export const PERMANENT_REDIRECT = 308; // Permanent redirect; HTTP method stays the same.

// 4xx Client Errors: The client made an error
export const BAD_REQUEST = 400; // General client-side error (e.g., validation failure).
export const UNAUTHORIZED = 401; // Authentication is required or has failed.
export const PAYMENT_REQUIRED = 402; // Reserved for future use (e.g., payment gateways).
export const FORBIDDEN = 403; // Client is authenticated but not authorized to access the resource.
export const NOT_FOUND = 404; // Resource does not exist.
export const METHOD_NOT_ALLOWED = 405; // HTTP method not supported for this resource (e.g., POST on a GET-only route).
export const NOT_ACCEPTABLE = 406; // Resource not available in the requested format.
export const PROXY_AUTHENTICATION_REQUIRED = 407; // Client must authenticate with a proxy server.
export const REQUEST_TIMEOUT = 408; // Client took too long to send the request.
export const CONFLICT = 409; // Conflict in the request, such as duplicate data or resource state mismatch.
export const GONE = 410; // Resource no longer exists and will not be available again.
export const LENGTH_REQUIRED = 411; // Request did not specify the required `Content-Length`.
export const PRECONDITION_FAILED = 412; // Request precondition failed (e.g., `If-Match` header).
export const PAYLOAD_TOO_LARGE = 413; // Request payload exceeds the server's limits.
export const URI_TOO_LONG = 414; // Request URI is too long for the server to process.
export const UNSUPPORTED_MEDIA_TYPE = 415; // Media type of the request is not supported.
export const RANGE_NOT_SATISFIABLE = 416; // Client requested an invalid range of the resource.
export const EXPECTATION_FAILED = 417; // Server cannot meet the requirements of the `Expect` header.
export const IM_A_TEAPOT = 418; // Joke response for any nonstandard use (RFC 2324).
export const MISDIRECTED_REQUEST = 421; // Request sent to a server unable to produce a response.
export const UNPROCESSABLE_CONTENT = 422; // Validation error or semantic issues in the request (WebDAV).
export const LOCKED = 423; // Resource is locked (WebDAV).
export const FAILED_DEPENDENCY = 424; // Failure because of a dependent request (WebDAV).
export const TOO_EARLY = 425; // Prevent processing requests replayed in a replay attack.
export const UPGRADE_REQUIRED = 426; // Client must switch to a newer protocol (e.g., HTTPS).
export const PRECONDITION_REQUIRED = 428; // Origin server requires request to be conditional.
export const TOO_MANY_REQUESTS = 429; // Client sent too many requests in a short time (rate limiting).
export const REQUEST_HEADER_FIELDS_TOO_LARGE = 431; // Headers are too large for the server to process.
export const UNAVAILABLE_FOR_LEGAL_REASONS = 451; // Resource restricted for legal reasons (e.g., copyright).

// 5xx Server Errors: The server failed to process the request
export const INTERNAL_SERVER_ERROR = 500; // Generic server error.
export const NOT_IMPLEMENTED = 501; // Functionality not implemented on the server.
export const BAD_GATEWAY = 502; // Server received an invalid response from an upstream server.
export const SERVICE_UNAVAILABLE = 503; // Server is temporarily unavailable (e.g., for maintenance).
export const GATEWAY_TIMEOUT = 504; // Upstream server failed to respond in time.
export const HTTP_VERSION_NOT_SUPPORTED = 505; // HTTP version not supported by the server.
export const VARIANT_ALSO_NEGOTIATES = 506; // Server configuration issue (rare).
export const INSUFFICIENT_STORAGE = 507; // Server cannot store the representation needed (WebDAV).
export const LOOP_DETECTED = 508; // Infinite loop detected (WebDAV).
export const NOT_EXTENDED = 510; // Further extensions required for the request.
export const NETWORK_AUTHENTICATION_REQUIRED = 511; // Client must authenticate to access the network.

export type HttpStatusCode =
  | typeof CONTINUE
  | typeof SWITCHING_PROTOCOLS
  | typeof PROCESSING
  | typeof OK
  | typeof CREATED
  | typeof ACCEPTED
  | typeof NON_AUTHORITATIVE_INFORMATION
  | typeof NO_CONTENT
  | typeof RESET_CONTENT
  | typeof PARTIAL_CONTENT
  | typeof MULTI_STATUS
  | typeof ALREADY_REPORTED
  | typeof IM_USED
  | typeof MULTIPLE_CHOICES
  | typeof MOVED_PERMANENTLY
  | typeof FOUND
  | typeof SEE_OTHER
  | typeof NOT_MODIFIED
  | typeof TEMPORARY_REDIRECT
  | typeof PERMANENT_REDIRECT
  | typeof BAD_REQUEST
  | typeof UNAUTHORIZED
  | typeof PAYMENT_REQUIRED
  | typeof FORBIDDEN
  | typeof NOT_FOUND
  | typeof METHOD_NOT_ALLOWED
  | typeof NOT_ACCEPTABLE
  | typeof PROXY_AUTHENTICATION_REQUIRED
  | typeof REQUEST_TIMEOUT
  | typeof CONFLICT
  | typeof GONE
  | typeof LENGTH_REQUIRED
  | typeof PRECONDITION_FAILED
  | typeof PAYLOAD_TOO_LARGE
  | typeof URI_TOO_LONG
  | typeof UNSUPPORTED_MEDIA_TYPE
  | typeof RANGE_NOT_SATISFIABLE
  | typeof EXPECTATION_FAILED
  | typeof IM_A_TEAPOT
  | typeof MISDIRECTED_REQUEST
  | typeof UNPROCESSABLE_CONTENT
  | typeof LOCKED
  | typeof FAILED_DEPENDENCY
  | typeof TOO_EARLY
  | typeof UPGRADE_REQUIRED
  | typeof PRECONDITION_REQUIRED
  | typeof TOO_MANY_REQUESTS
  | typeof REQUEST_HEADER_FIELDS_TOO_LARGE
  | typeof UNAVAILABLE_FOR_LEGAL_REASONS
  | typeof INTERNAL_SERVER_ERROR
  | typeof NOT_IMPLEMENTED
  | typeof BAD_GATEWAY
  | typeof SERVICE_UNAVAILABLE
  | typeof GATEWAY_TIMEOUT
  | typeof HTTP_VERSION_NOT_SUPPORTED
  | typeof VARIANT_ALSO_NEGOTIATES
  | typeof INSUFFICIENT_STORAGE
  | typeof LOOP_DETECTED
  | typeof NOT_EXTENDED
  | typeof NETWORK_AUTHENTICATION_REQUIRED;

export type AppErrorCode =
  | typeof BAD_REQUEST
  | typeof UNAUTHORIZED
  | typeof PAYMENT_REQUIRED
  | typeof FORBIDDEN
  | typeof NOT_FOUND
  | typeof METHOD_NOT_ALLOWED
  | typeof NOT_ACCEPTABLE
  | typeof PROXY_AUTHENTICATION_REQUIRED
  | typeof REQUEST_TIMEOUT
  | typeof CONFLICT
  | typeof GONE
  | typeof LENGTH_REQUIRED
  | typeof PRECONDITION_FAILED
  | typeof PAYLOAD_TOO_LARGE
  | typeof URI_TOO_LONG
  | typeof UNSUPPORTED_MEDIA_TYPE
  | typeof RANGE_NOT_SATISFIABLE
  | typeof EXPECTATION_FAILED
  | typeof IM_A_TEAPOT
  | typeof MISDIRECTED_REQUEST
  | typeof UNPROCESSABLE_CONTENT
  | typeof LOCKED
  | typeof FAILED_DEPENDENCY
  | typeof TOO_EARLY
  | typeof UPGRADE_REQUIRED
  | typeof PRECONDITION_REQUIRED
  | typeof TOO_MANY_REQUESTS
  | typeof REQUEST_HEADER_FIELDS_TOO_LARGE
  | typeof UNAVAILABLE_FOR_LEGAL_REASONS
  | typeof INTERNAL_SERVER_ERROR
  | typeof NOT_IMPLEMENTED
  | typeof BAD_GATEWAY
  | typeof SERVICE_UNAVAILABLE
  | typeof GATEWAY_TIMEOUT
  | typeof HTTP_VERSION_NOT_SUPPORTED
  | typeof VARIANT_ALSO_NEGOTIATES
  | typeof INSUFFICIENT_STORAGE
  | typeof LOOP_DETECTED
  | typeof NOT_EXTENDED
  | typeof NETWORK_AUTHENTICATION_REQUIRED;

export const HTTP_MESSAGES: Record<number, string> = {
  // 1xx Informational
  100: "Continue",
  101: "Switching Protocols",
  102: "Processing",

  // 2xx Success
  200: "OK",
  201: "Created",
  202: "Accepted",
  203: "Non-Authoritative Information",
  204: "No Content",
  205: "Reset Content",
  206: "Partial Content",
  207: "Multi-Status",
  208: "Already Reported",
  226: "IM Used",

  // 3xx Redirection
  300: "Multiple Choices",
  301: "Moved Permanently",
  302: "Found",
  303: "See Other",
  304: "Not Modified",
  307: "Temporary Redirect",
  308: "Permanent Redirect",

  // 4xx Client Errors
  400: "Bad Request",
  401: "Unauthorized",
  402: "Payment Required",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  406: "Not Acceptable",
  407: "Proxy Authentication Required",
  408: "Request Timeout",
  409: "Conflict",
  410: "Gone",
  411: "Length Required",
  412: "Precondition Failed",
  413: "Payload Too Large",
  414: "URI Too Long",
  415: "Unsupported Media Type",
  416: "Range Not Satisfiable",
  417: "Expectation Failed",
  418: "I'm a teapot",
  421: "Misdirected Request",
  422: "Unprocessable Content",
  423: "Locked",
  424: "Failed Dependency",
  425: "Too Early",
  426: "Upgrade Required",
  428: "Precondition Required",
  429: "Too Many Requests",
  431: "Request Header Fields Too Large",
  451: "Unavailable For Legal Reasons",

  // 5xx Server Errors
  500: "Internal Server Error",
  501: "Not Implemented",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout",
  505: "HTTP Version Not Supported",
  506: "Variant Also Negotiates",
  507: "Insufficient Storage",
  508: "Loop Detected",
  510: "Not Extended",
  511: "Network Authentication Required",
};
