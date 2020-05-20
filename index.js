const express = require("express");
const Joi = require("@hapi/joi");
const app = express();
const logger = require("./middlewares/logger");
const morgan = require("morgan");
const config = require("config");
app.use(express.json()); // using middleware express.json() to enable json parsing in request body
app.use(express.urlencoded({ extended: true })); // middleware to parse formdata to json. Extended true parese complex data like array etc
app.use(logger); // customer middleware example
app.use(express.static("public")); // hosting static assets

console.log(`Environment via process: ${process.env.NODE_ENV}`); // environment is undefined when not set
console.log(`Environment via express: ${app.get("env")}`); // environment is development when not set
console.log("Config: ", config.get("name"));
console.log("Password: ", config.get("mail.password"));
if (app.get("env") === "development") {
  app.use(morgan("tiny")); // 3rd party middleware use to log http request
}
let customers = [
  { id: 1, name: "Customer 1" },
  { id: 2, name: "Customer 2" },
  { id: 3, name: "Customer 3" },
  { id: 4, name: "Customer 4" },
];

app.get("/", (req, res) => {
  res.send("Home!");
});

// Handling [GET] Requests -
app.get("/api/customers", (req, res) => {
  res.send(customers); // query DB and send value
});

app.get("/api/customers/:id", (req, res) => {
  /* Quick takeaways - 
      1. Accessing params - res.params[<key>]
      2. Accessing queryparams - res.query[<key>]
    */
  const customer = customers.filter((c) => c.id === +req.params.id)[0];
  if (!customer) return res.status(404).send("Customer not found!");
  return res.send(customer);
});

// Handling [POST] Requests -
app.post("/api/customers", (req, res) => {
  const { error } = validateCustomer(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const customer = {
    id: customers.length + 1, // uniquely generated identifer in DB
    ...req.body,
  };
  customers.push(customer);
  return res.send(customer);
});

// Handling [PUT] Requests -
app.put("/api/customers/:id", (req, res) => {
  const customer = customers.find((c) => c.id === +req.params.id);
  if (!customer)
    return res.status(404).send("Customer with given ID Not Found!");

  const { error } = validateCustomer(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  customer.name = req.body.name;
  return res.send(customer);
});

// Handling [DELETE] Requests -
app.delete("/api/customers/:id", (req, res) => {
  const customer = customers.find((c) => c.id === +req.params.id);
  if (!customer)
    return res.status(404).send("Customer with given ID Not Found!");

  const index = customers.indexOf(customer);
  customers.splice(index, 1);
  return res.send(customer);
});

function validateCustomer(customer) {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
  });
  return schema.validate(customer);
}

/* Quick takeaways - 
1. process is a global object containing PORT - PORT set for a current env
2. Test this by setting PORT in mac - export PORT = <port_value>
*/
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening to port : ${port}`);
});
