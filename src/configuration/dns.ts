import { setDefaultResultOrder } from "dns";

// Force IPv4 resolution first to prevent ENETUNREACH errors on Render
// This must run before any database connections are created
setDefaultResultOrder('ipv4first');
