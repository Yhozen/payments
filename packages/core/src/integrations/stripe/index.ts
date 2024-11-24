import { Effect, Layer } from "effect";
import { Readable } from "stream";
import { createIntegration, IntegrationDetail } from "../base-integration";
import { SupportedHTTPMethod } from "../../constants";
import z from "zod";
import { GetValueByName, getValueFrom } from "../../helpers/get-value-from";
import Stripe from "stripe";
import { match } from "ts-pattern";

const stripeHTML = ({
  publicKey,
  clientSecret,
}: {
  publicKey: string;
  clientSecret: string;
}) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Accept a payment</title>
    <meta name="description" content="A demo of a payment on Stripe" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>/* Variables */
* {
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-content: center;
  height: 100vh;
  width: 100vw;
}

form {
  width: 30vw;
  min-width: 500px;
  align-self: center;
  box-shadow: 0px 0px 0px 0.5px rgba(50, 50, 93, 0.1),
    0px 2px 5px 0px rgba(50, 50, 93, 0.1), 0px 1px 1.5px 0px rgba(0, 0, 0, 0.07);
  border-radius: 7px;
  padding: 40px;
  margin-top: auto;
  margin-bottom: auto;
}

.hidden {
  display: none;
}

#payment-message {
  color: rgb(105, 115, 134);
  font-size: 16px;
  line-height: 20px;
  padding-top: 12px;
  text-align: center;
}

#payment-element {
  margin-bottom: 24px;
}

/* Buttons and links */
button {
  background: #0055DE;
  font-family: Arial, sans-serif;
  color: #ffffff;
  border-radius: 4px;
  border: 0;
  padding: 12px 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: block;
  transition: all 0.2s ease;
  box-shadow: 0px 4px 5.5px 0px rgba(0, 0, 0, 0.07);
  width: 100%;
}
button:hover {
  filter: contrast(115%);
}
button:disabled {
  opacity: 0.5;
  cursor: default;
}

/* spinner/processing state, errors */
.spinner,
.spinner:before,
.spinner:after {
  border-radius: 50%;
}
.spinner {
  color: #ffffff;
  font-size: 22px;
  text-indent: -99999px;
  margin: 0px auto;
  position: relative;
  width: 20px;
  height: 20px;
  box-shadow: inset 0 0 0 2px;
  -webkit-transform: translateZ(0);
  -ms-transform: translateZ(0);
  transform: translateZ(0);
}
.spinner:before,
.spinner:after {
  position: absolute;
  content: "";
}
.spinner:before {
  width: 10.4px;
  height: 20.4px;
  background: #0055DE;
  border-radius: 20.4px 0 0 20.4px;
  top: -0.2px;
  left: -0.2px;
  -webkit-transform-origin: 10.4px 10.2px;
  transform-origin: 10.4px 10.2px;
  -webkit-animation: loading 2s infinite ease 1.5s;
  animation: loading 2s infinite ease 1.5s;
}
.spinner:after {
  width: 10.4px;
  height: 10.2px;
  background: #0055DE;
  border-radius: 0 10.2px 10.2px 0;
  top: -0.1px;
  left: 10.2px;
  -webkit-transform-origin: 0px 10.2px;
  transform-origin: 0px 10.2px;
  -webkit-animation: loading 2s infinite ease;
  animation: loading 2s infinite ease;
}

/* dynamic payment methods annotation */
#dpm-annotation {
  align-self: center;
  color: #353A44;
  width: 30vw;
  min-width: 500px;
  line-height: 20px;
  margin-bottom: 20px;
}

#dpm-integration-checker {
  display: inline;
  color: #533AFD;
}

/* Payment status page */
#payment-status {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  row-gap: 30px;
  width: 30vw;
  min-width: 500px;
  min-height: 380px;
  align-self: center;
  box-shadow: 0px 0px 0px 0.5px rgba(50, 50, 93, 0.1),
    0px 2px 5px 0px rgba(50, 50, 93, 0.1), 0px 1px 1.5px 0px rgba(0, 0, 0, 0.07);
  border-radius: 7px;
  padding: 40px;
  opacity: 0;
  animation: fadeInAnimation 1s ease forwards;
}

#status-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
  width: 40px;
  border-radius: 50%;
}

h2 {
  margin: 0;
  color: #30313D;
  text-align: center;
}

a {
  text-decoration: none;
  font-size: 16px;
  font-weight: 600;
  font-family: Arial, sans-serif;
  display: block;
}
a:hover {
  filter: contrast(120%);
}

#details-table {
  overflow-x: auto;
  width: 100%;
}

table {
  width: 100%;
  font-size: 14px;
  border-collapse: collapse;
}
table tbody tr:first-child td {
  border-top: 1px solid #E6E6E6; /* Top border */
  padding-top: 10px;
}
table tbody tr:last-child td {
  border-bottom: 1px solid #E6E6E6; /* Bottom border */
}
td {
  padding-bottom: 10px;
}

.TableContent {
  text-align: right;
  color: #6D6E78;
}

.TableLabel {
  font-weight: 600;
  color: #30313D;
}

#view-details {
  color: #0055DE;
}

#retry-button {
  text-align: center;
  background: #0055DE;
  color: #ffffff;
  border-radius: 4px;
  border: 0;
  padding: 12px 16px;
  transition: all 0.2s ease;
  box-shadow: 0px 4px 5.5px 0px rgba(0, 0, 0, 0.07);
  width: 100%;
}

@-webkit-keyframes loading {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
@keyframes loading {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
@keyframes fadeInAnimation {
  to {
      opacity: 1;
  }
}

@media only screen and (max-width: 600px) {
  form, #dpm-annotation, #payment-status{
    width: 80vw;
    min-width: initial;
  }
}</style>
    <script src="https://js.stripe.com/v3/"></script>

  </head>
  <body>
    <!-- Display a payment form -->
    <form id="payment-form">
      <div id="payment-element">
        <!--Stripe.js injects the Payment Element-->
      </div>
      <button id="submit">
        <div class="spinner hidden" id="spinner"></div>
        <span id="button-text">Pay now</span>
      </button>
      <div id="payment-message" class="hidden"></div>
    </form>
    <!-- [DEV]: For demo purposes only, display dynamic payment methods annotation and integration checker -->
    <div id="dpm-annotation">
      <p>
        Payment methods are dynamically displayed based on customer location, order amount, and currency.&nbsp;
        <a href="#" target="_blank" rel="noopener noreferrer" id="dpm-integration-checker">Preview payment methods by transaction</a>
      </p>
    </div>
        <script>// This is your test publishable API key.
const stripe = Stripe("${publicKey}");

// The items the customer wants to buy
const items = [{ id: "xl-tshirt", amount: 1000 }];

let elements;

const clientSecret = "${clientSecret}";

initialize();


document
  .querySelector("#payment-form")
  .addEventListener("submit", handleSubmit);

// Fetches a payment intent and captures the client secret
async function initialize() {

  const appearance = {
    theme: 'stripe',
  };
  elements = stripe.elements({ appearance, clientSecret });

  const paymentElementOptions = {
    layout: "accordion",
  };

  const paymentElement = elements.create("payment", paymentElementOptions);
  paymentElement.mount("#payment-element");

  // [DEV] For demo purposes only
  setDpmCheckerLink(dpmCheckerLink);
}

async function handleSubmit(e) {
  e.preventDefault();
  setLoading(true);

  const { error } = await stripe.confirmPayment({
    elements,
    confirmParams: {
      // Make sure to change this to your payment completion page
      return_url: "http://localhost:4242/complete.html",
    },
  });

  if (error.type === "card_error" || error.type === "validation_error") {
    showMessage(error.message);
  } else {
    showMessage("An unexpected error occurred.");
  }

  setLoading(false);
}

// ------- UI helpers -------

function showMessage(messageText) {
  const messageContainer = document.querySelector("#payment-message");

  messageContainer.classList.remove("hidden");
  messageContainer.textContent = messageText;

  setTimeout(function () {
    messageContainer.classList.add("hidden");
    messageContainer.textContent = "";
  }, 4000);
}

// Show a spinner on payment submission
function setLoading(isLoading) {
  if (isLoading) {
    // Disable the button and show a spinner
    document.querySelector("#submit").disabled = true;
    document.querySelector("#spinner").classList.remove("hidden");
    document.querySelector("#button-text").classList.add("hidden");
  } else {
    document.querySelector("#submit").disabled = false;
    document.querySelector("#spinner").classList.add("hidden");
    document.querySelector("#button-text").classList.remove("hidden");
  }
}

function setDpmCheckerLink(url) {
  document.querySelector("#dpm-integration-checker").href = url;
}
  </script>
  </body>
</html>
`;

type StripeConfig = {
  secretKey: string | GetValueByName<string>;
  publicKey: string | GetValueByName<string>;
};

export const createStripeIntegration = (config: StripeConfig) => {
  const name = "stripe" as const;

  const stripeLive = Layer.succeed(
    IntegrationDetail,
    IntegrationDetail.of({
      name,
      supportedCurrencies: ["USD"],
      getPaymentIntentStatus(paymentIntentId: string) {
        return Effect.gen(function* () {
          const secretKey = yield* Effect.promise(() =>
            getValueFrom(config.secretKey, [paymentIntentId])
          );

          const stripe = new Stripe(secretKey);
          const intent = yield* Effect.promise(() =>
            stripe.paymentIntents.retrieve(paymentIntentId)
          );

          intent.status === "succeeded";

          return {
            status: match(intent.status)
              .with("canceled", () => "FAILED" as const)
              .with("succeeded", () => "SUCCEEDED" as const)
              .otherwise(() => "PROCESSING" as const),
          };
        });
      },
      createPaymentIntent({ baseUnit, externalId, currency, paymentIntentId }) {
        return Effect.gen(function* () {
          console.log({ baseUnit, externalId, currency, paymentIntentId });
          const secretKey = yield* Effect.promise(() =>
            getValueFrom(config.secretKey, [paymentIntentId])
          );
          const publicKey = yield* Effect.promise(() =>
            getValueFrom(config.publicKey, [paymentIntentId])
          );
          const stripe = new Stripe(secretKey);

          const paymentIntent = yield* Effect.promise(() =>
            stripe.paymentIntents.create({
              amount: baseUnit,
              currency,
            })
          );
          const clientSecret = paymentIntent.client_secret;

          return {
            id: paymentIntent.id,
            link: `${"/api/pay"}/integration/${name}/internal/widget?clientSecret=${clientSecret}&publicKey=${publicKey}`,
          };
        });
      },
      handleWebhookRequest: (originalRequest, req) => {
        const event = req.body;

        if (!event) {
          throw new Error("No event in request body");
        }

        return match(event.type)
          .with("payment_intent.succeeded", () => {
            const paymentIntent = event.data.object;
            return Effect.succeed({ id: paymentIntent.id });
          })
          .with("payment_method.attached", () => {
            const paymentMethod = event.data.object;
            console.log({ paymentMethod });
            return Effect.succeed({ id: event.id });
          })
          .otherwise(() => {
            console.log(`Unhandled event type ${event.type}`);
            return Effect.succeed({ id: event.id });
          });
      },
      internalRoutes: [
        [
          SupportedHTTPMethod.GET,
          `/integration/${name}/internal/widget`,
          async ({ req }) => {
            const { clientSecret, publicKey } = z
              .object({
                clientSecret: z.string(),
                publicKey: z.string(),
              })
              .parse(req.query);
            console.log({ clientSecret, publicKey });
            const html = stripeHTML({
              publicKey,
              clientSecret,
            });

            const body = new Readable();
            body.push(html);
            body.push(null);

            return {
              body,
              headers: {
                "Content-Type": "text/html",
              },
            };
          },
        ],
      ],
    })
  );

  return { [name]: stripeLive.pipe(createIntegration) };
};
