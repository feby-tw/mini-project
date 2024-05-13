import App from "./app";

import { AuthRoute } from "./routes/route";

const app = new App([new AuthRoute()]);

app.listen();