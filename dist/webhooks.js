"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paystackWebhookHandler = void 0;
var get_payload_1 = require("./get-payload");
var paystack_1 = require("./lib/paystack");
var crypto_1 = __importDefault(require("crypto"));
var resend_1 = require("resend");
var ReceiptEmail_1 = require("./components/Email/ReceiptEmail");
var resend = new resend_1.Resend(process.env.RESEND_API_KEY);
// Paystack Webhook Handler
var paystackWebhookHandler = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var webhookReq, payload, signature, reference, isValidSignature, verificationResponse, isPaymentSuccessful, payloadClient, session, users, user, orders, order, data, _a, _b, error_1, err_1, errorMessage;
    var _c;
    var _d, _e, _f;
    return __generator(this, function (_g) {
        switch (_g.label) {
            case 0:
                _g.trys.push([0, 11, , 12]);
                webhookReq = req;
                payload = JSON.parse(webhookReq.rawBody.toString('utf8')) // Parse the payload from the raw body
                ;
                signature = webhookReq.headers['x-paystack-signature'] // Ensure it's a string
                ;
                reference = (_d = payload.data) === null || _d === void 0 ? void 0 : _d.reference;
                console.log('Webhook payload:', payload); // Log incoming payload
                console.log('Received signature:', signature);
                isValidSignature = function (signature, rawBody) {
                    var secret = process.env.PAYSTACK_SECRET_KEY;
                    if (!secret) {
                        throw new Error('PAYSTACK_SECRET_KEY is not defined');
                    }
                    var hash = crypto_1.default.createHmac('sha512', secret).update(rawBody).digest('hex');
                    return signature === hash;
                };
                // Verify webhook signature
                if (!signature || !isValidSignature(signature, webhookReq.rawBody)) {
                    console.error('Invalid Paystack signature');
                    return [2 /*return*/, res.status(400).send('Invalid or missing Paystack signature')];
                }
                return [4 /*yield*/, (0, paystack_1.verifyPayment)(reference)];
            case 1:
                verificationResponse = _g.sent();
                console.log('Verification Response:', verificationResponse);
                isPaymentSuccessful = ((_e = verificationResponse.data) === null || _e === void 0 ? void 0 : _e.status) === 'success';
                if (!isPaymentSuccessful) {
                    return [2 /*return*/, res
                            .status(400)
                            .json({ error: 'Payment verification failed', details: verificationResponse })];
                }
                if (!(payload.event === 'charge.success')) return [3 /*break*/, 10];
                return [4 /*yield*/, (0, get_payload_1.getPayloadClient)()
                    // Extract userId from session or payload
                ];
            case 2:
                payloadClient = _g.sent();
                session = (_f = payload.data) === null || _f === void 0 ? void 0 : _f.metadata;
                if (!session || !session.userId) {
                    return [2 /*return*/, res.status(400).json({ error: 'UserId not found in session metadata' })];
                }
                return [4 /*yield*/, payload.find({
                        collection: 'users',
                        where: {
                            id: {
                                equals: session.metadata.userId
                            }
                        }
                    })];
            case 3:
                users = (_g.sent()).docs;
                user = users[0];
                if (!user)
                    return [2 /*return*/, res.status(404).json({ error: 'No such user exists.' })];
                return [4 /*yield*/, payloadClient.find({
                        collection: 'orders',
                        where: {
                            id: {
                                equals: reference.split('_')[1] // Extract orderId from the reference
                            }
                        }
                    })];
            case 4:
                orders = (_g.sent()).docs;
                order = orders[0];
                if (!order) {
                    return [2 /*return*/, res.status(404).json({ error: 'No matching order found.' })];
                }
                // Update the order to mark it as paid and save the payment details
                return [4 /*yield*/, payloadClient.update({
                        collection: 'orders',
                        id: order.id,
                        data: {
                            _isPaid: true,
                            paymentReference: reference,
                            paymentProvider: 'paystack'
                        }
                    })
                    // send receipt
                ];
            case 5:
                // Update the order to mark it as paid and save the payment details
                _g.sent();
                _g.label = 6;
            case 6:
                _g.trys.push([6, 9, , 10]);
                _b = (_a = resend.emails).send;
                _c = {
                    from: 'DigitalHippo <hello@joshtriedcoding.com>',
                    to: [user.email], // Use the actual user object from the order
                    subject: 'Thanks for your order! This is your receipt.'
                };
                return [4 /*yield*/, (0, ReceiptEmail_1.ReceiptEmailHtml)({
                        date: new Date(),
                        email: user.email,
                        orderId: order.id,
                        products: order.products
                    })];
            case 7: return [4 /*yield*/, _b.apply(_a, [(_c.html = _g.sent(),
                        _c)])];
            case 8:
                data = _g.sent();
                return [2 /*return*/, res.status(200).json({ data: data })];
            case 9:
                error_1 = _g.sent();
                console.error('Error sending email:', error_1);
                return [2 /*return*/, res.status(500).json({ error: 'Email sending failed', details: error_1 })];
            case 10: return [2 /*return*/, res.status(200).send('Webhook processed successfully')];
            case 11:
                err_1 = _g.sent();
                console.error('Error processing Paystack webhook:', err_1);
                errorMessage = err_1 instanceof Error ? err_1.message : 'Unknown error';
                return [2 /*return*/, res.status(500).json({ error: 'Webhook processing failed', details: errorMessage })];
            case 12: return [2 /*return*/];
        }
    });
}); };
exports.paystackWebhookHandler = paystackWebhookHandler;
